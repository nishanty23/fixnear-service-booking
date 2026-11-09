const express = require("express");

const {
  createProviderProfile,
  updateProviderProfile
} = require("../controllers/ProviderControllers/providerController");

const {
  authenticateUser,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/profile",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
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