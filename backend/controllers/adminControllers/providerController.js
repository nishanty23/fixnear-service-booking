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

            // Allow both USER and SERVICE_PROVIDER roles
            if (!["USER", "SERVICE_PROVIDER"].includes(user.role)) {
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




const rejectProviderApplication = async (req, res) => {
    let session;

    try {
        session = await mongoose.startSession();

        const { id } = req.params;
        const { rejectionReason } = req.body;

        // 1. Validate Provider Application ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid provider application ID"
            });
        }

        // 2. Validate Rejection Reason
        if (
            typeof rejectionReason !== "string" ||
            !rejectionReason.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        if (rejectionReason.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason must be at least 5 characters"
            });
        }

        let rejectedProvider;

        // 3. Start MongoDB Transaction
        await session.withTransaction(async () => {

            // Find Provider Application
            const application = await ServiceProvider.findById(id)
                .session(session);

            if (!application) {
                const error = new Error(
                    "Provider application not found"
                );
                error.statusCode = 404;
                throw error;
            }

            // 4. Check Application Status
            if (application.approvalStatus !== "PENDING") {
                const error = new Error(
                    `Application is already ${application.approvalStatus || "not pending"}`
                );
                error.statusCode = 400;
                throw error;
            }

            // 5. Find Associated User
            const user = await User.findById(application.user)
                .session(session);

            if (!user) {
                const error = new Error(
                    "Associated user not found"
                );
                error.statusCode = 404;
                throw error;
            }

            // 6. Allow both USER and SERVICE_PROVIDER roles
            if (!["USER", "SERVICE_PROVIDER"].includes(user.role)) {
                const error = new Error(
                    "User is not eligible for application rejection"
                );
                error.statusCode = 400;
                throw error;
            }

            // 7. Update Provider Application
            application.approvalStatus = "REJECTED";
            application.rejectionReason = rejectionReason.trim();

            await application.save({ session });

            // 8. Reset User Role to USER
            user.role = "USER";

            await user.save({ session });

            rejectedProvider = {
                providerId: application._id,
                userId: user._id,
                businessName: application.businessName,
                approvalStatus: application.approvalStatus,
                rejectionReason: application.rejectionReason,
                userRole: user.role
            };
        });

        // 9. Success Response
        return res.status(200).json({
            success: true,
            message: "Provider application rejected successfully",
            provider: rejectedProvider
        });

    } catch (error) {
        console.error("Reject Provider Application Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Server error while rejecting provider application"
        });

    } finally {
        if (session) {
            await session.endSession();
        }
    }
};



const getAllApprovedProviders = async (req, res) => {
    try {
        const {
            search,
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

        // 2. Fetch only approved providers
        const filter = {
            approvalStatus: "APPROVED"
        };

        // 3. Search by business name, city, area or phone
        if (search && search.trim()) {
            const escapedSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            const searchRegex = new RegExp(
                escapedSearch,
                "i"
            );

            filter.$or = [
                { businessName: searchRegex },
                { city: searchRegex },
                { area: searchRegex },
                { phone: searchRegex }
            ];
        }

        // 4. Fetch providers
        const providers = await ServiceProvider.find(filter)
            .populate("user", "name email role isActive")
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageLimit)
            .limit(pageLimit);

        // 5. Get total count
        const totalProviders =
            await ServiceProvider.countDocuments(filter);

        // 6. Send response
        return res.status(200).json({
            success: true,
            message: "Approved providers fetched successfully",
            pagination: {
                currentPage,
                pageLimit,
                totalProviders,
                totalPages: Math.ceil(
                    totalProviders / pageLimit
                )
            },
            providers
        });

    } catch (error) {
        console.error("Get Approved Providers Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching approved providers"
        });
    }
};


const getApprovedProviderById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validate Provider ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid provider ID"
            });
        }

        // 2. Find only approved provider
        const provider = await ServiceProvider.findOne({
            _id: id,
            approvalStatus: "APPROVED"
        }).populate("user", "name email role isActive");

        // 3. Check provider existence
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Approved provider not found"
            });
        }

        // 4. Send response
        return res.status(200).json({
            success: true,
            message: "Approved provider details fetched successfully",
            provider
        });

    } catch (error) {
        console.error("Get Approved Provider By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching provider details"
        });
    }
};

// ACTIVATE / DEACTIVATE APPROVED PROVIDER
const updateProviderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // 1. Validate Provider ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid provider ID"
            });
        }

        // 2. Validate isActive
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean value"
            });
        }

        // 3. Find only approved provider
        const provider = await ServiceProvider.findOne({
            _id: id,
            approvalStatus: "APPROVED"
        });

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Approved provider not found"
            });
        }

        // 4. Find associated user
        const user = await User.findById(provider.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Associated user not found"
            });
        }

        // 5. Update account status
        user.isActive = isActive;
        await user.save();

        // 6. Success response
        return res.status(200).json({
            success: true,
            message: `Provider account ${isActive ? "activated" : "deactivated"} successfully`,
            provider: {
                providerId: provider._id,
                businessName: provider.businessName,
                userId: user._id,
                userName: user.name,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error("Update Provider Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating provider status"
        });
    }
};

module.exports = {
    getAllProviderApplications,
    getProviderApplicationById,
    approveProviderApplication,
    rejectProviderApplication,
    getAllApprovedProviders,
    getApprovedProviderById,
    updateProviderStatus
};