const express = require("express");
const reviewRouter = express.Router();

const {
  createReview,
  getMyReviews,
  getServiceReviews,
  deleteReview
} = require("../../controllers/UserControllers/userReviewController");

const { authenticateUser } = require("../middleware/authMiddleware");

// Public
reviewRouter.get("/service/:serviceId", getServiceReviews);

reviewRouter.post("/", authenticateUser, createReview);
reviewRouter.get("/my", authenticateUser, getMyReviews);
reviewRouter.delete("/:id", authenticateUser, deleteReview);

module.exports = reviewRouter;
