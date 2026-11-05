
const mongoose = require("mongoose");

const Review = require("../../models/Review");
const ServiceRequest = require("../../models/ServiceRequest");
const ServiceProvider = require("../../models/ServiceProvider");

// HELPER FUNCTION

const handleError = (res, error) => {
  console.error("Review controller error:", error.message);

  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid review data"
    });
  }

  return res.status(500).json({
    success: false,
    message: "Server error while processing review"
  });
};

// SUBMIT REVIEW (USER)

const createReview = async (req, res) => {
  try {
    const { serviceRequest, rating, comment } = req.body;

    if (
      !serviceRequest ||
      rating === undefined ||
      comment === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide service request, rating and comment"
      });
    }

    if (
      typeof serviceRequest !== "string" ||
      !mongoose.isValidObjectId(serviceRequest)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID"
      });
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5"
      });
    }

    if (
      typeof comment !== "string" ||
      !comment.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Review comment cannot be empty"
      });
    }

    const request = await ServiceRequest.findOne({
      _id: serviceRequest,
      user: req.user._id,
      status: "COMPLETED"
    });

    if (!request) {
      return res.status(400).json({
        success: false,
        message: "Only customers with completed service requests can submit reviews"
      });
    }

    const review = await Review.create({
      user: req.user._id,
      provider: request.provider,
      serviceRequest: request._id,
      rating,
      comment: comment.trim()
    });

    // Calculate the provider's new average rating.
    const result = await Review.aggregate([
      {
        $match: {
          provider: request.provider
        }
      },
      {
        $group: {
          _id: "$provider",
          averageRating: {
            $avg: "$rating"
          }
        }
      }
    ]);

    const averageRating = Number(
      result[0].averageRating.toFixed(1)
    );

    // Update the provider's stored average rating.
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      request.provider,
      {
        $set: {
          averageRating
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedProvider) {
      console.error(
        "Review saved, but provider rating could not be updated:",
        request.provider
      );

      return res.status(201).json({
        success: true,
        message: "Review submitted, but provider rating update is pending",
        review
      });
    }

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
      averageRating
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This service request has already been reviewed"
      });
    }

    handleError(res, error);
  }
};

// GET PROVIDER REVIEWS

const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    if (
      typeof providerId !== "string" ||
      !mongoose.isValidObjectId(providerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID"
      });
    }

    const provider = await ServiceProvider.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found"
      });
    }

    const reviews = await Review.find({
      provider: providerId
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: provider.averageRating,
      reviews
    });

  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createReview,
  getProviderReviews
};