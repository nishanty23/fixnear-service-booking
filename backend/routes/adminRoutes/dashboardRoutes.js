const express = require("express");
const router = express.Router();

const {
    getDashboardStats
} = require("../../controllers/adminControllers/dashboardController");

const authenticateAdmin = require("../../middleware/adminMiddleware/adminAuthMiddleware");

// GET ADMIN DASHBOARD STATISTICS
router.get("/", authenticateAdmin, getDashboardStats);

module.exports = router;
