
const express = require("express");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

const {
  authenticateUser,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public route
router.get("/", getCategories);

// Admin-only routes
router.post(
  "/",
  authenticateUser,
  authorizeRoles("ADMIN"),
  createCategory
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("ADMIN"),
  updateCategory
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("ADMIN"),
  deleteCategory
);

module.exports = router;
