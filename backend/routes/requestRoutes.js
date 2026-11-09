
const express = require("express");

const {
  getProviderRequests,
  updateRequestStatus
} = require("../controllers/ProviderControllers/requestController");

const {
  authenticateUser,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// Service provider routes
router.get(
  "/provider",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
  getProviderRequests
);

router.put(
  "/:id/status",
  authenticateUser,
  authorizeRoles("SERVICE_PROVIDER"),
  updateRequestStatus
);

module.exports = router;
