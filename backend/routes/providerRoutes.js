
const express = require("express");

const {
  getProviders,
  getProviderById,
  createProviderProfile,
  updateProviderProfile
} = require("../controllers/ProviderControllers/providerController");

const {
  authenticateUser,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getProviders);
router.get("/:id", getProviderById);

// Service provider-only routes
router.post(
  "/profile",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
  createProviderProfile
);

router.put(
  "/profile",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
  updateProviderProfile
);

module.exports = router;
