const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../../middleware/adminMiddleware/adminAuthMiddleware");

const {
    getAllServices,
    getServiceById,
    updateServiceStatus
} = require("../../controllers/adminControllers/serviceController");

// GET ALL SERVICES
router.get("/", authenticateAdmin, getAllServices);

// GET SERVICE BY ID
router.get("/:id", authenticateAdmin, getServiceById);

// ACTIVATE / DEACTIVATE SERVICE
router.put("/:id/status", authenticateAdmin, updateServiceStatus);

module.exports = router;