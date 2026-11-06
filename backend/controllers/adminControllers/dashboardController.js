
const User = require("../../models/User");
const ServiceProvider = require("../../models/ServiceProvider");
const Service = require("../../models/Service");
const ServiceRequest = require("../../models/ServiceRequest");

// GET ADMIN DASHBOARD STATISTICS
const getDashboardStats = async (req, res) => {
    try {

        // Fetch all dashboard statistics simultaneously
        const [
            totalUsers,

            totalProviders,
            approvedProviders,
            pendingProviderApplications,
            rejectedProviderApplications,

            totalServices,
            activeServices,

            totalBookings,
            pendingBookings,
            acceptedBookings,
            rejectedBookings,
            inProgressBookings,
            completedBookings,
            cancelledBookings

        ] = await Promise.all([

            // USER STATISTICS
            User.countDocuments({ role: "USER" }),

            // PROVIDER STATISTICS
            ServiceProvider.countDocuments(),

            ServiceProvider.countDocuments({
                approvalStatus: "APPROVED"
            }),

            ServiceProvider.countDocuments({
                approvalStatus: "PENDING"
            }),

            ServiceProvider.countDocuments({
                approvalStatus: "REJECTED"
            }),

            // SERVICE STATISTICS
            Service.countDocuments(),

            Service.countDocuments({
                isActive: true
            }),

            // BOOKING STATISTICS
            ServiceRequest.countDocuments(),

            ServiceRequest.countDocuments({
                status: "PENDING"
            }),

            ServiceRequest.countDocuments({
                status: "ACCEPTED"
            }),

            ServiceRequest.countDocuments({
                status: "REJECTED"
            }),

            ServiceRequest.countDocuments({
                status: "IN_PROGRESS"
            }),

            ServiceRequest.countDocuments({
                status: "COMPLETED"
            }),

            ServiceRequest.countDocuments({
                status: "CANCELLED"
            })

        ]);

        // SEND DASHBOARD RESPONSE
        return res.status(200).json({

            success: true,

            message: "Admin dashboard statistics fetched successfully",

            statistics: {

                users: {
                    total: totalUsers
                },

                providers: {
                    total: totalProviders,
                    approved: approvedProviders,
                    pending: pendingProviderApplications,
                    rejected: rejectedProviderApplications
                },

                services: {
                    total: totalServices,
                    active: activeServices,
                    inactive: totalServices - activeServices
                },

                bookings: {
                    total: totalBookings,

                    status: {
                        pending: pendingBookings,
                        accepted: acceptedBookings,
                        rejected: rejectedBookings,
                        inProgress: inProgressBookings,
                        completed: completedBookings,
                        cancelled: cancelledBookings
                    }
                }

            }

        });

    } catch (error) {

        console.error("Dashboard statistics error:", error.message);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch dashboard statistics"

        });

    }
};

module.exports = {
    getDashboardStats
};
