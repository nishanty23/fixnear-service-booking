const express = require("express");

const {
    getAllProviderApplications,
    getProviderApplicationById,
    approveProviderApplication,
    rejectProviderApplication,
    getAllApprovedProviders,
    getApprovedProviderById,
    updateProviderStatus
} = require("../../controllers/adminControllers/providerController");

const authenticateAdmin = require("../../middleware/adminMiddleware/adminAuthMiddleware");

const router = express.Router();

// Get all provider applications
router.get(
    "/",
    authenticateAdmin,
    getAllProviderApplications
);

// Get all approved providers
router.get(
    "/approved",
    authenticateAdmin,
    getAllApprovedProviders
);

// Get approved provider by ID
router.get(
    "/approved/:id",
    authenticateAdmin,
    getApprovedProviderById
);

// Get provider application by ID
router.get(
    "/:id",
    authenticateAdmin,
    getProviderApplicationById
);

// Approve provider application
router.put(
    "/:id/approve",
    authenticateAdmin,
    approveProviderApplication
);

// Reject provider application
router.put(
    "/:id/reject",
    authenticateAdmin,
    rejectProviderApplication
);

// ACTIVATE / DEACTIVATE PROVIDER
router.put("/:id/status", authenticateAdmin, updateProviderStatus);

module.exports = router;
