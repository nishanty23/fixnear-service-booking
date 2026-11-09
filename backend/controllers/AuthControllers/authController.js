const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const ServiceProvider = require("../../models/ServiceProvider");
const mongoose = require("mongoose");

// forgot password imports

const crypto = require("crypto");
const PasswordResetOTP = require("../../models/PasswordResetOTP");
const { sendOTPEmail } = require("../../services/emailService");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be atleast 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: req.providerRegistration ? "SERVICE_PROVIDER" : "USER"
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (req.providerLogin && user.role !== "SERVICE_PROVIDER") {
            return res.status(403).json({
                success: false,
                message: "This account is not registered as a service provider"
            });
        }

        // CHECK USER ACCOUNT STATUS
        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Please contact Admin."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const registerProvider = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            businessName,
            category,
            description,
            phone,
            city,
            area,
            address,
            pincode,
            experience,
            location
        } = req.body;

        // Validate required fields
        if (
            !name || !email || !password ||
            !businessName || !category ||
            !description || !phone ||
            !city || !area || !pincode || !location
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required registration details."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        if (!mongoose.isValidObjectId(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service category."
            });
        }

        if (
            location.type !== "Point" ||
            !Array.isArray(location.coordinates) ||
            location.coordinates.length !== 2
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid service location is required."
            });
        }

        const [longitude, latitude] = location.coordinates;

        if (
            typeof longitude !== "number" ||
            typeof latitude !== "number" ||
            !Number.isFinite(longitude) ||
            !Number.isFinite(latitude) ||
            longitude < -180 || longitude > 180 ||
            latitude < -90 || latitude > 90
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid location coordinates."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });
        }

        const ServiceCategory = require("../../models/ServiceCategory");

        const categoryExists = await ServiceCategory.exists({
            _id: category
        });

        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Selected service category does not exist."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User account
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "SERVICE_PROVIDER"
        });

        try {
            // Create Provider Profile with PENDING status
            const provider = await ServiceProvider.create({
                user: user._id,
                businessName: businessName.trim(),
                category,
                description: description.trim(),
                phone: phone.trim(),
                city: city.trim(),
                area: area.trim(),
                address: address?.trim(),
                pincode: pincode.trim(),
                location,
                experience: Number(experience || 0),
                approvalStatus: "PENDING",
                rejectionReason: null
            });

            return res.status(201).json({
                success: true,
                message: "Registration Successful! Please wait for Admin approval before logging in.",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                provider: {
                    id: provider._id,
                    businessName: provider.businessName,
                    approvalStatus: provider.approvalStatus
                }
            });

        } catch (profileError) {
            // Roll back User if Provider Profile creation fails
            await User.findByIdAndDelete(user._id);
            throw profileError;
        }

    } catch (error) {
        console.error("Provider registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email or provider profile already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to complete provider registration."
        });
    }
};


const loginProvider = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user || user.role !== "SERVICE_PROVIDER") {
            return res.status(403).json({
                success: false,
                message: "This account is not registered as a service provider."
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Please contact Admin."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Check Admin Approval Status
        const provider = await ServiceProvider.findOne({
            user: user._id
        });

        if (!provider) {
            return res.status(403).json({
                success: false,
                message: "Provider profile not found. Please contact Admin."
            });
        }

        if (provider.approvalStatus === "PENDING") {
            return res.status(403).json({
                success: false,
                message: "Your registration is pending Admin approval. Please contact Admin."
            });
        }

        if (provider.approvalStatus === "REJECTED") {
            return res.status(403).json({
                success: false,
                message: provider.rejectionReason
                    ? `Your registration was rejected. Reason: ${provider.rejectionReason}`
                    : "Your registration was rejected by Admin. Please contact Admin."
            });
        }

        if (provider.approvalStatus !== "APPROVED") {
            return res.status(403).json({
                success: false,
                message: "Your registration has not been approved by Admin."
            });
        }

        // Generate token only for approved providers
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Provider login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
};


const getProfile = async (req, res) => {
    res.status(200).json({
        message: "Profile fetched successfully",
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
};

// Update profile
const updateProfile = async (request, response) => {
    try {
        const { name } = request.body;

        if (!name || typeof (name) !== "string" || !name.trim()) {
            return response.status(400).json({
                success: false,
                message: "valid name is required"
            })
        }

        const user = await User.findById(request.user._id);

        if (!user) {
            return response.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        user.name = name.trim();
        await user.save();

        response.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error("An error occured", error);
        response.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
};

// Change password
const changePassword = async (req, res) => {
    try {

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password cannot be empty"
            })
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be same as old password"
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "current password does not match"
            })
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })

    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        // Generic response to avoid revealing whether an account exists
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, an OTP will be sent."
            });
        }

        // Prevent repeated OTP requests within 60 seconds
        const existingOTP = await PasswordResetOTP.findOne({
            email: normalizedEmail
        });

        if (
            existingOTP &&
            Date.now() - existingOTP.createdAt.getTime() < 60000
        ) {
            return res.status(429).json({
                success: false,
                message: "Please wait 60 seconds before requesting another OTP."
            });
        }

        await PasswordResetOTP.deleteMany({
            email: normalizedEmail
        });

        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpHash = await bcrypt.hash(otp, 10);

        await PasswordResetOTP.create({
            email: normalizedEmail,
            otpHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        try {
            await sendOTPEmail(normalizedEmail, otp);
        } catch (emailError) {
            await PasswordResetOTP.deleteMany({
                email: normalizedEmail
            });

            throw emailError;
        }

        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, an OTP will be sent."
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to process password reset request."
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const resetRecord = await PasswordResetOTP.findOne({
            email: normalizedEmail
        });

        if (!resetRecord || resetRecord.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP is invalid or expired"
            });
        }

        if (resetRecord.attempts >= 5) {
            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Request a new OTP."
            });
        }

        const isOTPValid = await bcrypt.compare(
            otp.toString(),
            resetRecord.otpHash
        );

        if (!isOTPValid) {
            resetRecord.attempts += 1;
            await resetRecord.save();

            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        resetRecord.verified = true;
        resetRecord.resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        resetRecord.resetTokenExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        resetRecord.expiresAt = resetRecord.resetTokenExpiresAt;

        await resetRecord.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            resetToken
        });

    } catch (error) {
        console.error("OTP verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify OTP"
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, reset token and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const tokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const resetRecord = await PasswordResetOTP.findOne({
            email: normalizedEmail,
            verified: true,
            resetTokenHash: tokenHash,
            resetTokenExpiresAt: { $gt: new Date() }
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token. Verify OTP again."
            });
        }

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        await PasswordResetOTP.deleteMany({
            email: normalizedEmail
        });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. Please login with your new password."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reset password"
        });
    }
};

module.exports = {
    register,
    registerProvider,
    login,
    loginProvider,
    getProfile,
    updateProfile,
    changePassword,

    // Forgot Password
    forgotPassword,
    verifyOTP,
    resetPassword
};