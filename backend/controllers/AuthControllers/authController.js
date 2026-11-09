const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../models/User");
const ServiceProvider = require("../../models/ServiceProvider");
const ServiceCategory = require("../../models/ServiceCategory");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if(password.length < 8) {
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

        if (req.providerLogin) {
            const provider = await ServiceProvider.findOne({ user: user._id });

            if (!provider || provider.approvalStatus !== "APPROVED") {
                return res.status(403).json({
                    success: false,
                    message: "Your provider account is awaiting admin approval."
                });
            }
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

        if (!name || !email || !password || !businessName || !category ||
            !description || !phone || !city || !area || !pincode || !location) {
            return res.status(400).json({
                success: false,
                message: "All provider registration fields are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        if (!mongoose.isValidObjectId(category) ||
            !(await ServiceCategory.exists({ _id: category }))) {
            return res.status(400).json({
                success: false,
                message: "A valid service category is required"
            });
        }

        if (
            typeof location !== "object" ||
            location.type !== "Point" ||
            !Array.isArray(location.coordinates) ||
            location.coordinates.length !== 2 ||
            !location.coordinates.every(value => Number.isFinite(value))
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid provider location is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "SERVICE_PROVIDER"
        });

        try {
            await ServiceProvider.create({
                user: user._id,
                businessName: businessName.trim(),
                category,
                description: description.trim(),
                phone: phone.trim(),
                city: city.trim(),
                area: area.trim(),
                address: typeof address === "string" ? address.trim() : undefined,
                pincode: pincode.trim(),
                experience: experience === undefined ? 0 : Number(experience),
                location,
                approvalStatus: "PENDING",
                rejectionReason: null
            });
        } catch (profileError) {
            await User.findByIdAndDelete(user._id);
            throw profileError;
        }

        return res.status(201).json({
            success: true,
            message: "Provider registration submitted. Please wait for admin approval."
        });
    } catch (error) {
        console.error("Provider registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email or provider profile already registered"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to register provider"
        });
    }
};

const loginProvider = (req, res) => {
    req.providerLogin = true;
    return login(req, res);
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

        if(!name || typeof(name) !== "string" || !name.trim()) {
            return response.status(400).json({
                success: false,
                message: "valid name is required"
            })
        }

        const user = await User.findById(request.user._id);

        if(!user) {
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
    catch(error) {
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

        const {currentPassword, newPassword} = req.body;
        
        if(!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password cannot be empty"
            })
        }
        
        if(currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be same as old password"
            });
        }

        const user = await User.findById(req.user._id);
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if(!isMatch) {
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
    catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}

module.exports = {
    register,
    registerProvider,
    login,
    loginProvider,
    getProfile,
    updateProfile,
    changePassword
};