
const express = require("express");

const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    verifyOTP,
    resetPassword
} = require("../controllers/AuthControllers/authController");

const {
    authenticateUser
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticateUser, getProfile);

router.put("/profile", authenticateUser, updateProfile);

router.put("/change-password", authenticateUser, changePassword);

// Forgot Password Routes
router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOTP);

router.post("/reset-password", resetPassword);

module.exports = router;
