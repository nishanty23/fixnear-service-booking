const express = require("express");

const {
  createService,
  updateService,
  deleteService,
} = require("../controllers/ProviderControllers/serviceController");

const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const uploadImage = require("../middleware/uploadImage");

const router = express.Router();

// Create service with image upload
router.post(
  "/",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
  uploadImage.single("image"),
  createService,
);

// Update service with optional image upload
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
  uploadImage.single("image"),
  updateService,
);

// Soft-delete service
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
  deleteService,
);

module.exports = router;
