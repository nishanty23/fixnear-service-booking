const express = require("express");

const {
    getAllProviderApplications,
    getProviderApplicationById,
    approveProviderApplication
} = require("../../controllers/adminControllers/providerController");

const authenticateAdmin = require("../../middleware/adminMiddleware/adminAuthMiddleware");

const router = express.Router();

// Get all provider applications
router.get(
    "/",
    authenticateAdmin,
    getAllProviderApplications
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

module.exports = router;
