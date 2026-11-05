const express = require("express");
const router = express.Router();

const {
    adminLogin
} = require("../../controllers/adminControllers/adminAuthController");

// Admin Login API
router.post("/login", adminLogin);

module.exports = router;
