require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../db");
const User = require("../../models/User");

const resetAdminPassword = async () => {
    try {
        const {
            ADMIN_NAME,
            ADMIN_EMAIL,
            ADMIN_PASSWORD
        } = process.env;

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
            throw new Error("Admin credentials missing in .env");
        }

        if (ADMIN_PASSWORD.length < 12) {
            throw new Error("Admin password must contain at least 12 characters");
        }

        await connectDB();

        const email = ADMIN_EMAIL.trim().toLowerCase();

        const admin = await User.findOne({ email });

        if (!admin) {
            throw new Error("Admin account not found for " + email);
        }

        if (admin.role !== "ADMIN") {
            throw new Error("This email does not belong to an Admin account");
        }

        admin.name = ADMIN_NAME.trim();
        admin.password = await bcrypt.hash(ADMIN_PASSWORD, 12);

        await admin.save();

        console.log("Admin password updated successfully.");
        console.log("Admin email:", email);

    } catch (error) {
        console.error("Password reset failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

resetAdminPassword();