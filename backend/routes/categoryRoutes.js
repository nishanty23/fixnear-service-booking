const express = require("express");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/ProviderControllers/categoryController");

const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const uploadImage = require("../middleware/uploadImage");

const router = express.Router();

// Public route
router.get("/", getCategories);

// Admin-only routes

// Create category with image
router.post(
  "/",
  authenticateUser,
  authorizeRoles("ADMIN"),
  uploadImage.single("image"),
  createCategory,
);

// Update category with optional image
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("ADMIN"),
  uploadImage.single("image"),
  updateCategory,
);

// Delete category
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("ADMIN"),
  deleteCategory,
);

module.exports = router;
