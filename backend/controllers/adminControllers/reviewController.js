
const mongoose = require("mongoose");
const Review = require("../../models/Review");

// GET ALL REVIEWS - ADMIN
const getAllReviews = async (req, res) => {
    try {
        const {
            search,
            rating,
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Number(page);
        const pageLimit = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            !Number.isInteger(pageLimit) ||
            pageNumber < 1 ||
            pageLimit < 1 ||
            pageLimit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination values"
            });
        }

        const filter = {};

        if (rating) {
            const numericRating = Number(rating);

            if (
                !Number.isInteger(numericRating) ||
                numericRating < 1 ||
                numericRating > 5
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid rating filter"
                });
            }

            filter.rating = numericRating;
        }

        if (search && search.trim()) {
            const searchRegex = new RegExp(
                search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );

            const matchingUsers = await mongoose.model("User").find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex }
                ]
            }).select("_id");

            const matchingProviders = await mongoose.model("ServiceProvider").find({
                businessName: searchRegex
            }).select("_id");

            filter.$or = [
                { user: { $in: matchingUsers.map(user => user._id) } },
                { provider: { $in: matchingProviders.map(provider => provider._id) } },
                { comment: searchRegex }
            ];
        }

        const skip = (pageNumber - 1) * pageLimit;

        const [reviews, totalReviews] = await Promise.all([
            Review.find(filter)
                .populate("user", "name email")
                .populate({
                    path: "provider",
                    select: "businessName user",
                    populate: {
                        path: "user",
                        select: "name email"
                    }
                })
                .populate({
                    path: "serviceRequest",
                    select: "service scheduledDate status totalPrice",
                    populate: {
                        path: "service",
                        select: "name"
                    }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit)
                .lean(),

            Review.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            pagination: {
                currentPage: pageNumber,
                pageLimit,
                totalReviews,
                totalPages: Math.ceil(totalReviews / pageLimit)
            },
            reviews
        });

    } catch (error) {
        console.error("Admin review controller error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching reviews"
        });
    }
};

// GET SINGLE REVIEW - ADMIN
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const review = await Review.findById(id)
            .populate("user", "name email")
            .populate({
                path: "provider",
                select: "businessName user",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate({
                path: "serviceRequest",
                populate: {
                    path: "service",
                    select: "name"
                }
            })
            .lean();

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        return res.status(200).json({
            success: true,
            review
        });

    } catch (error) {
        console.error("Get review details error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching review"
        });
    }
};

// DELETE REVIEW - ADMIN
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        const providerId = review.provider;

        await review.deleteOne();

        const stats = await Review.aggregate([
            { $match: { provider: providerId } },
            {
                $group: {
                    _id: "$provider",
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);

        const newRating = stats.length
            ? Math.round(stats[0].averageRating * 10) / 10
            : 0;

        await mongoose.model("ServiceProvider").findByIdAndUpdate(
            providerId,
            { averageRating: newRating }
        );

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Delete review error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting review"
        });
    }
};

module.exports = {
    getAllReviews,
    getReviewById,
    deleteReview
};
