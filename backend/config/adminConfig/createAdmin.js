
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});
console.log("Admin name:", process.env.ADMIN_NAME);
console.log("Admin email:", process.env.ADMIN_EMAIL);
console.log("Password loaded:", !!process.env.ADMIN_PASSWORD);

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("../db");
const User = require("../../models/User");

const createAdmin = async () => {
    try {
        const {
            ADMIN_NAME,
            ADMIN_EMAIL,
            ADMIN_PASSWORD
        } = process.env;

        // Validate admin credentials
        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error("Admin credentials are missing in .env file");
        }

        if (ADMIN_PASSWORD.length < 12) {
            throw new Error("Admin password must contain at least 12 characters");
        }

        // Connect to existing MongoDB database
        await connectDB();

        const email = ADMIN_EMAIL.trim().toLowerCase();

        // Check whether email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.role === "ADMIN") {
                console.log("Admin account already exists.");
                return;
            }

            throw new Error(
                "This email already belongs to another user. Use a different email."
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        // Create Admin account
        const admin = await User.create({
            name: ADMIN_NAME.trim(),
            email: email,
            password: hashedPassword,
            role: "ADMIN"
        });

        console.log("Admin account created successfully!");
        console.log("Admin ID:", admin._id);
        console.log("Admin Email:", admin.email);

    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();
