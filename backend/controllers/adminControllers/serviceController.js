const mongoose = require("mongoose");

const Service = require("../../models/Service");
const ServiceProvider = require("../../models/ServiceProvider");
const ServiceCategory = require("../../models/ServiceCategory");

// GET ALL SERVICES
const getAllServices = async (req, res) => {
    try {
        const {
            search,
            status,
            page = 1,
            limit = 10
        } = req.query;

        // 1. Pagination validation
        const currentPage = Math.max(
            parseInt(page, 10) || 1,
            1
        );

        const pageLimit = Math.min(
            Math.max(parseInt(limit, 10) || 10, 1),
            100
        );

        // 2. Build filter
        const filter = {};

        // 3. Filter by active/inactive status
        if (status) {
            const allowedStatuses = ["ACTIVE", "INACTIVE"];

            if (!allowedStatuses.includes(status.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid service status"
                });
            }

            filter.isActive = status.toUpperCase() === "ACTIVE";
        }

        // 4. Search by service name
        if (search && search.trim()) {
            const escapedSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.name = new RegExp(escapedSearch, "i");
        }

        // 5. Fetch services
        const services = await Service.find(filter)
            .populate({
                path: "provider",
                select: "businessName city area approvalStatus",
                populate: {
                    path: "user",
                    select: "name email isActive"
                }
            })
            .populate("category", "name description")
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageLimit)
            .limit(pageLimit);

        // 6. Total count
        const totalServices = await Service.countDocuments(filter);

        // 7. Send response
        return res.status(200).json({
            success: true,
            message: "Services fetched successfully",
            pagination: {
                currentPage,
                pageLimit,
                totalServices,
                totalPages: Math.ceil(totalServices / pageLimit)
            },
            services
        });

    } catch (error) {
        console.error("Get All Services Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching services"
        });
    }
};

// GET SERVICE BY ID
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validate Service ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID"
            });
        }

        // 2. Find service and populate details
        const service = await Service.findById(id)
            .populate({
                path: "provider",
                select: "businessName city area phone approvalStatus",
                populate: {
                    path: "user",
                    select: "name email isActive"
                }
            })
            .populate("category", "name description");

        // 3. Check service existence
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // 4. Send response
        return res.status(200).json({
            success: true,
            message: "Service details fetched successfully",
            service
        });

    } catch (error) {
        console.error("Get Service By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching service details"
        });
    }
};

// ACTIVATE / DEACTIVATE SERVICE
const updateServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // 1. Validate Service ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID"
            });
        }

        // 2. Validate isActive
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean value"
            });
        }

        // 3. Find service
        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // 4. Update service status
        service.isActive = isActive;
        await service.save();

        // 5. Send success response
        return res.status(200).json({
            success: true,
            message: `Service ${isActive ? "activated" : "deactivated"} successfully`,
            service: {
                serviceId: service._id,
                name: service.name,
                isActive: service.isActive
            }
        });

    } catch (error) {
        console.error("Update Service Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating service status"
        });
    }
};

module.exports = {
    getAllServices,
    getServiceById,
    updateServiceStatus
};