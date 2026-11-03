
const mongoose = require("mongoose");

const ServiceRequest = require("../models/ServiceRequest");
const Service = require("../models/Service");
const ServiceProvider = require("../models/ServiceProvider");

// HELPER FUNCTION

const handleError = (res, error) => {
  console.error("Request controller error:", error.message);

  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking data"
    });
  }

  return res.status(500).json({
    success: false,
    message: "Server error while processing service request"
  });
};

const validStatuses = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
];

// CREATE SERVICE REQUEST (USER)

const createRequest = async (req, res) => {
  try {
    const {
      service,
      description,
      address,
      city,
      area,
      pincode,
      scheduledDate
    } = req.body;

    if (
      !service ||
      description === undefined ||
      address === undefined ||
      city === undefined ||
      area === undefined ||
      pincode === undefined ||
      !scheduledDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking details"
      });
    }

    if (
      typeof service !== "string" ||
      !mongoose.isValidObjectId(service)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID"
      });
    }

    const stringFields = [
      description,
      address,
      city,
      area,
      pincode
    ];

    if (
      stringFields.some(
        field => typeof field !== "string" || !field.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Booking details must be valid non-empty text"
      });
    }

    if (!/^[0-9]{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 6-digit pincode"
      });
    }

    const serviceDetails = await Service.findOne({
      _id: service,
      isActive: true
    });

    if (!serviceDetails) {
      return res.status(404).json({
        success: false,
        message: "Service not found or unavailable"
      });
    }

    const provider = await ServiceProvider.findOne({
      _id: serviceDetails.provider,
      availability: true
    });

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: "Service provider is currently unavailable"
      });
    }

    const appointmentDate = new Date(scheduledDate);

    if (
      Number.isNaN(appointmentDate.getTime()) ||
      appointmentDate <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future appointment date"
      });
    }

    const request = await ServiceRequest.create({
      user: req.user._id,
      provider: provider._id,
      service: serviceDetails._id,
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      area: area.trim(),
      pincode: pincode.trim(),
      scheduledDate: appointmentDate,
      totalPrice: serviceDetails.price
    });

    res.status(201).json({
      success: true,
      message: "Service request created successfully",
      request
    });
  } catch (error) {
    handleError(res, error);
  }
};

// GET MY SERVICE REQUESTS (USER)

const getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      user: req.user._id
    })
      .populate("service", "name price priceType")
      .populate({
        path: "provider",
        select: "businessName phone city area averageRating"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    handleError(res, error);
  }
};

// GET INCOMING REQUESTS (SERVICE PROVIDER)

const getProviderRequests = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({
      user: req.user._id
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found"
      });
    }

    const { status } = req.query;

    const filter = {
      provider: provider._id
    };

    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        !validStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid request status"
        });
      }

      filter.status = status;
    }

    const requests = await ServiceRequest.find(filter)
      .populate("user", "name email")
      .populate("service", "name price priceType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    handleError(res, error);
  }
};

// UPDATE REQUEST STATUS (SERVICE PROVIDER)

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID"
      });
    }

    const allowedTransitions = {
      ACCEPTED: "PENDING",
      REJECTED: "PENDING",
      IN_PROGRESS: "ACCEPTED",
      COMPLETED: "IN_PROGRESS"
    };

    if (
      typeof status !== "string" ||
      !Object.prototype.hasOwnProperty.call(
        allowedTransitions,
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status update"
      });
    }

    const provider = await ServiceProvider.findOne({
      user: req.user._id
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found"
      });
    }

    const previousStatus = allowedTransitions[status];

    // Update only when the request is in the expected previous status.
    const request = await ServiceRequest.findOneAndUpdate(
      {
        _id: id,
        provider: provider._id,
        status: previousStatus
      },
      {
        $set: {
          status
        }
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate("user", "name email")
      .populate("service", "name price");

    if (!request) {
      return res.status(409).json({
        success: false,
        message: "Request not found, unauthorized, or status transition not allowed"
      });
    }

    res.status(200).json({
      success: true,
      message: `Request status updated to ${status}`,
      request
    });
  } catch (error) {
    handleError(res, error);
  }
};

// CANCEL SERVICE REQUEST (USER)

const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID"
      });
    }

    // Customers can cancel only their own pending or accepted requests.
    const request = await ServiceRequest.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
        status: {
          $in: ["PENDING", "ACCEPTED"]
        }
      },
      {
        $set: {
          status: "CANCELLED"
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!request) {
      return res.status(409).json({
        success: false,
        message: "Request not found or cannot be cancelled"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service request cancelled successfully",
      request
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getProviderRequests,
  updateRequestStatus,
  cancelRequest
};