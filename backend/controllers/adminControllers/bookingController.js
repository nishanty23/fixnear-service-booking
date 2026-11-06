const mongoose = require("mongoose");
const ServiceRequest = require("../../models/ServiceRequest");

// VALID BOOKING STATUSES
const validStatuses = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
];

// ESCAPE SPECIAL REGEX CHARACTERS
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// GET ALL BOOKINGS (ADMIN)
const getAllBookings = async (req, res) => {
  try {
    const {
      search,
      status,
      city,
      area,
      page = 1,
      limit = 10
    } = req.query;

    // Validate status
    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status"
      });
    }

    // Validate pagination
    const pageNumber = Number(page);
    const pageLimit = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      !Number.isInteger(pageLimit) ||
      pageNumber < 1 ||
      pageLimit < 1 ||
      pageLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination values"
      });
    }

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (city) {
      filter.city = {
        $regex: escapeRegex(city),
        $options: "i"
      };
    }

    if (area) {
      filter.area = {
        $regex: escapeRegex(area),
        $options: "i"
      };
    }

    // Search customer, provider and service
    if (search && search.trim()) {
      const searchRegex = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      const matchingUsers = await mongoose.model("User").find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select("_id");

      const matchingProviders = await mongoose.model("ServiceProvider").find({
        businessName: searchRegex
      }).select("_id");

      const matchingServices = await mongoose.model("Service").find({
        name: searchRegex
      }).select("_id");

      filter.$or = [
        { user: { $in: matchingUsers.map(user => user._id) } },
        { provider: { $in: matchingProviders.map(provider => provider._id) } },
        { service: { $in: matchingServices.map(service => service._id) } }
      ];
    }

    const skip = (pageNumber - 1) * pageLimit;

    const [bookings, totalBookings] = await Promise.all([
      ServiceRequest.find(filter)
        .populate("user", "name email")
        .populate({
          path: "provider",
          select: "businessName phone city area approvalStatus",
          populate: {
            path: "user",
            select: "name email isActive"
          }
        })
        .populate("service", "name price priceType")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),

      ServiceRequest.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      pagination: {
        currentPage: pageNumber,
        pageLimit,
        totalBookings,
        totalPages: Math.ceil(totalBookings / pageLimit)
      },
      bookings
    });

  } catch (error) {
    console.error("Admin booking controller error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings"
    });
  }
};

// GET BOOKING BY ID (ADMIN)
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }

    const booking = await ServiceRequest.findById(id)
      .populate("user", "name email")
      .populate({
        path: "provider",
        select: "businessName phone city area address pincode approvalStatus",
        populate: {
          path: "user",
          select: "name email isActive"
        }
      })
      .populate("service", "name description price priceType")
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking details fetched successfully",
      booking
    });

  } catch (error) {
    console.error("Admin booking controller error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching booking details"
    });
  }
};

module.exports = {
  getAllBookings,
  getBookingById
};
