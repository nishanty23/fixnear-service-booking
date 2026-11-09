const mongoose = require("mongoose");
const Review = require("../../models/Review");
const ServiceRequest = require("../../models/ServiceRequest");
const ServiceProvider = require("../../models/ServiceProvider");

// CREATE A REVIEW 

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "A valid booking ID is required"
      });
    }

    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5"
      });
    }

    if (typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment cannot be empty"
      });
    }

    const booking = await ServiceRequest.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own bookings"
      });
    }

    if (booking.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Only completed bookings can be reviewed"
      });
    }

    const existingReview = await Review.findOne({
      serviceRequest: booking._id
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this booking"
      });
    }

    const review = await Review.create({
      user: req.user._id,
      provider: booking.provider,
      serviceRequest: booking._id,
      rating: numericRating,
      comment: comment.trim()
    });

    const stats = await Review.aggregate([
      {
        $match: {
          provider: booking.provider
        }
      },
      {
        $group: {
          _id: "$provider",
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    const averageRating = stats.length
      ? Math.round(stats[0].averageRating * 10) / 10
      : 0;

    await ServiceProvider.findByIdAndUpdate(
      booking.provider,
      { averageRating }
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
      averageRating
    });

  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET USER'S OWN REVIEWS 
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("service", "name price priceType")
      .populate({
        path: "provider",
        select: "businessName phone city area"
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error("Get my reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET REVIEWS FOR A SPECIFIC SERVICE 
const getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!mongoose.isValidObjectId(serviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID format"
      });
    }

    const reviews = await Review.find({ service: serviceId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error("Get service reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// DELETE USER REVIEW (Protected - User Only)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format"
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own review"
      });
    }

    const providerId = review.provider;
    await review.deleteOne();

    // Recalculate provider average rating after deletion
    const stats = await Review.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: "$provider",
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    const newRating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
    await ServiceProvider.findByIdAndUpdate(providerId, { averageRating: newRating });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getServiceReviews,
  deleteReview
};