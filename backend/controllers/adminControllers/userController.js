const mongoose = require("mongoose");
const User = require("../../models/User");

// GET ALL USERS WITH SEARCH AND PAGINATION
const getAllUsers = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(page, 10));
        const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

        const skip = (currentPage - 1) * pageLimit;

        // Exclude Admin accounts
        const query = {
            role: "USER"
        };

        // Search by name or email
        if (search.trim()) {
            query.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { email: { $regex: search.trim(), $options: "i" } }
            ];
        }

        // Fetch users and total count
        const [users, totalUsers] = await Promise.all([
            User.find(query)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit),

            User.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",

            pagination: {
                totalUsers,
                currentPage,
                totalPages: Math.ceil(totalUsers / pageLimit),
                pageLimit
            },

            users
        });

    } catch (error) {
        console.error("Get users error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};


// GET SINGLE USER BY ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findOne({
            _id: id,
            role: "USER"
        }).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            user
        });

    } catch (error) {
        console.error("Get user details error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user details"
        });
    }
};

// ACTIVATE / DEACTIVATE USER
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate User ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // Validate isActive value
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false"
      });
    }

    // Find only normal USER account
    const user = await User.findOne({
      _id: id,
      role: "USER"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update status
    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User account activated successfully"
        : "User account deactivated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error("Update user status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update user status"
    });
  }
};


module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus
};