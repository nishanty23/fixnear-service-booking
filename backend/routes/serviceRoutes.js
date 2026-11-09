
const express = require("express");

const {
  createService,
  updateService,
  deleteService
} = require("../controllers/ProviderControllers/serviceController");

const {
  authenticateUser,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// Service provider-only routes
router.post(
  "/",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
  createService
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
  updateService
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
  deleteService
);

module.exports = router;
