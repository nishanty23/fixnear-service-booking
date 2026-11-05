const express = require("express");

const {
  getProviders,
  getProviderById,
  createProviderProfile,
  updateProviderProfile
} = require("../controllers/providerController");

const {
  authenticateUser,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getProviders);
router.get("/:id", getProviderById);

// USER can submit provider application
router.post(
  "/profile",
  authenticateUser,
  authorizeRoles("USER"),
  createProviderProfile
);

// Only approved SERVICE_PROVIDER can update profile
router.put(
  "/profile",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
  updateProviderProfile
);

module.exports = router;