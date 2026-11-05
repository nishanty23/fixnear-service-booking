const express = require("express");

const {
  createRequest,
  getMyRequests,
  getProviderRequests,
  updateRequestStatus,
  cancelRequest,
  hideRequestFromHistory
} = require("../controllers/ProviderControllers/requestController");

const {
  authenticateUser,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// Customer routes
router.post(
  "/",
  authenticateUser,
  authorizeRoles("USER"),
  createRequest
);

router.get(
  "/my",
  authenticateUser,
  authorizeRoles("USER"),
  getMyRequests
);

router.put(
  "/:id/hide",
  authenticateUser,
  authorizeRoles("USER"),
  hideRequestFromHistory
);

router.put(
  "/:id/cancel",
  authenticateUser,
  authorizeRoles("USER"),
  cancelRequest
);

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