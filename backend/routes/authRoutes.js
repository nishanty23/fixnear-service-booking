
const express = require("express");

const {
    register,
    login,
    getProfile,
    updateProfile
} = require("../controllers/AuthControllers/authController");

const {
    authenticateUser
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticateUser, getProfile);

router.put("/update-profile", authenticateUser, updateProfile);

module.exports = router;
