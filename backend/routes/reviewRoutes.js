
const express = require("express");

const {
  createReview,
  getProviderReviews
} = require("../controllers/ProviderControllers/reviewController");

const {
  authenticateUser,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public route
router.get("/provider/:providerId", getProviderReviews);

// Customer-only route
router.post(
  "/",
  authenticateUser,
  authorizeRoles("USER"),
  createReview
);

module.exports = router;
