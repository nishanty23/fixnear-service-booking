const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserStatus
} = require("../../controllers/adminControllers/userController");

const authenticateAdmin = require("../../middleware/adminMiddleware/adminAuthMiddleware");

// GET ALL USERS
router.get("/", authenticateAdmin, getAllUsers);

// GET USER BY ID
router.get("/:id", authenticateAdmin, getUserById);

// ACTIVATE / DEACTIVATE USER
router.put("/:id/status", authenticateAdmin, updateUserStatus);

module.exports = router;