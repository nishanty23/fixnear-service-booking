const mongoose = require("mongoose");
const ServiceProvider = require("../../models/ServiceProvider");
const User = require("../../models/User");

// GET ALL PROVIDER APPLICATIONS
const getAllProviderApplications = async (req, res) => {
    try {
        const {
            status,
            search,
            page = 1,
            limit = 10
        } = req.query;

        // Pagination validation
        const currentPage = Math.max(parseInt(page, 10) || 1, 1);
        const pageLimit = Math.min(
            Math.max(parseInt(limit, 10) || 10, 1),
            100
        );

        // Build filter
        const filter = {};

        if (status) {
            const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];

            if (!allowedStatuses.includes(status.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid application status"
                });
            }

            filter.approvalStatus = status.toUpperCase();
        }

        // Search by business name, city, area or phone
        if (search && search.trim()) {
            const searchRegex = new RegExp(
                search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );

            filter.$or = [
                { businessName: searchRegex },
                { city: searchRegex },
                { area: searchRegex },
                { phone: searchRegex }
            ];
        }

        // Fetch applications
        const applications = await ServiceProvider.find(filter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageLimit)
            .limit(pageLimit);

        // Total count
        const totalApplications =
            await ServiceProvider.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: "Provider applications fetched successfully",
            pagination: {
                currentPage,
                pageLimit,
                totalApplications,
                totalPages: Math.ceil(totalApplications / pageLimit)
            },
            applications
        });

    } catch (error) {
        console.error("Get Provider Applications Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching provider applications"
        });
    }
};


const getProviderApplicationById = async (req, res) => {
    try {
        // Get application ID from URL
        const { id } = req.params;

        // Check whether ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid provider application ID"
            });
        }

        // Find application and populate user details
        const application = await ServiceProvider.findById(id)
            .populate("user", "name email");

        // Check whether application exists
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Provider application not found"
            });
        }

        // Send successful response
        return res.status(200).json({
            success: true,
            message: "Provider application fetched successfully",
            application
        });

    } catch (error) {
        console.error("Get Provider Application By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching provider application"
        });
    }
};



const approveProviderApplication = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;

        // 1. Validate Provider Application ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid provider application ID"
            });
        }

        let approvedProvider;

        // 2. Start MongoDB Transaction
        await session.withTransaction(async () => {

            // Find Provider Application
            const application = await ServiceProvider.findById(id)
                .session(session);

            if (!application) {
                const error = new Error("Provider application not found");
                error.statusCode = 404;
                throw error;
            }

            // Check Application Status
            if (application.approvalStatus !== "PENDING") {
                const error = new Error(
                    `Application is already ${application.approvalStatus || "not pending"}`
                );
                error.statusCode = 400;
                throw error;
            }

            // Find Associated User
            const user = await User.findById(application.user)
                .session(session);

            if (!user) {
                const error = new Error("Associated user not found");
                error.statusCode = 404;
                throw error;
            }

            // Check User Role
            if (user.role !== "USER") {
                const error = new Error(
                    "User is not eligible for provider approval"
                );
                error.statusCode = 400;
                throw error;
            }

            // Update Provider Application
            application.approvalStatus = "APPROVED";
            application.rejectionReason = null;

            await application.save({ session });

            // Update User Role
            user.role = "SERVICE_PROVIDER";

            await user.save({ session });

            approvedProvider = {
                providerId: application._id,
                userId: user._id,
                businessName: application.businessName,
                approvalStatus: application.approvalStatus,
                userRole: user.role
            };
        });

        // 3. Send Success Response
        return res.status(200).json({
            success: true,
            message: "Provider application approved successfully",
            provider: approvedProvider
        });

    } catch (error) {
        console.error("Approve Provider Application Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Server error while approving provider application"
        });

    } finally {
        await session.endSession();
    }
};


module.exports = {
    getAllProviderApplications,
    getProviderApplicationById,
    approveProviderApplication
};
