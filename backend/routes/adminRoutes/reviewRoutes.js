
const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../../middleware/adminMiddleware/adminAuthMiddleware");

const {
    getAllReviews,
    getReviewById,
    deleteReview
} = require("../../controllers/adminControllers/reviewController");

// GET ALL REVIEWS
router.get("/", authenticateAdmin, getAllReviews);

// GET SINGLE REVIEW
router.get("/:id", authenticateAdmin, getReviewById);

// DELETE REVIEW
router.delete("/:id", authenticateAdmin, deleteReview);

module.exports = router;
