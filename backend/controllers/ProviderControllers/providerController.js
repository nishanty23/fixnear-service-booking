
const mongoose = require("mongoose");
const ServiceProvider = require("../../models/ServiceProvider");

// HELPER: ESCAPE REGULAR EXPRESSIONS
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// HELPER: VALIDATE LOCATION COORDINATES
const validateCoordinates = (latitude, longitude) => {
  if (latitude === undefined && longitude === undefined) {
    return true;
  }

  if (latitude === undefined || longitude === undefined) {
    return false;
  }

  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

// HELPER: VALIDATE PHONE NUMBER
const isValidPhone = (phone) => {
  return (
    typeof phone === "string" &&
    /^\+?[0-9]{10,15}$/.test(phone)
  );
};

// GET ALL SERVICE PROVIDERS
const getProviders = async (req, res) => {
  try {
    const { city, area, pincode, availability } = req.query;

    const filter = {};

    if (city !== undefined) {
      if (typeof city !== "string" || !city.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid city value"
        });
      }

      filter.city = {
        $regex: escapeRegex(city.trim()),
        $options: "i"
      };
    }

    if (area !== undefined) {
      if (typeof area !== "string" || !area.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid area value"
        });
      }

      filter.area = {
        $regex: escapeRegex(area.trim()),
        $options: "i"
      };
    }

    if (pincode !== undefined) {
      if (!/^[0-9]{6}$/.test(pincode)) {
        return res.status(400).json({
          success: false,
          message: "Pincode must contain exactly 6 digits"
        });
      }

      filter.pincode = pincode;
    }

    if (availability !== undefined) {
      if (!["true", "false"].includes(availability)) {
        return res.status(400).json({
          success: false,
          message: "Invalid availability value"
        });
      }

      filter.availability = availability === "true";
    }

    const providers = await ServiceProvider.find(filter)
      .populate("user", "name")
      .sort({ averageRating: -1 });

    res.status(200).json({
      success: true,
      count: providers.length,
      providers
    });

  } catch (error) {
    console.error("Get providers error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch service providers"
    });
  }
};

// GET SINGLE PROVIDER
const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID"
      });
    }

    const provider = await ServiceProvider.findById(id)
      .populate("user", "name");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found"
      });
    }

    res.status(200).json({
      success: true,
      provider
    });

  } catch (error) {
    console.error("Get provider error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch provider details"
    });
  }
};

// CREATE PROVIDER PROFILE
const createProviderProfile = async (req, res) => {
  try {
    const {
      businessName,
      description,
      phone,
      city,
      area,
      address,
      pincode,
      latitude,
      longitude,
      experience
    } = req.body;

    // Validate required string fields
    const requiredFields = [
      businessName,
      description,
      phone,
      city,
      area,
      pincode
    ];

    if (
      requiredFields.some(
        field => typeof field !== "string" || !field.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required profile fields as valid strings"
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain 10 to 15 digits"
      });
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain exactly 6 digits"
      });
    }

    if (
      address !== undefined &&
      typeof address !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Address must be a string"
      });
    }

    if (!validateCoordinates(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: "Provide valid latitude and longitude together"
      });
    }

    if (
      experience !== undefined &&
      (
        typeof experience !== "number" ||
        !Number.isFinite(experience) ||
        experience < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience must be a non-negative number"
      });
    }

    const existingProfile = await ServiceProvider.findOne({
      user: req.user._id
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Provider profile already exists"
      });
    }

    const provider = await ServiceProvider.create({
      user: req.user._id,
      businessName: businessName.trim(),
      description: description.trim(),
      phone: phone.trim(),
      city: city.trim(),
      area: area.trim(),
      address: address?.trim(),
      pincode,
      latitude,
      longitude,
      experience
    });

    res.status(201).json({
      success: true,
      message: "Provider profile created successfully",
      provider
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Provider profile already exists"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error("Create provider error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create provider profile"
    });
  }
};

// UPDATE OWN PROVIDER PROFILE
const updateProviderProfile = async (req, res) => {
  try {
    const allowedFields = [
      "businessName",
      "description",
      "phone",
      "city",
      "area",
      "address",
      "pincode",
      "latitude",
      "longitude",
      "experience",
      "availability"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    // Validate string fields
    const stringFields = [
      "businessName",
      "description",
      "phone",
      "city",
      "area",
      "address",
      "pincode"
    ];

    for (const field of stringFields) {
      if (updates[field] !== undefined) {
        if (
          typeof updates[field] !== "string" ||
          (
            field !== "address" &&
            !updates[field].trim()
          )
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field} value`
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    if (
      updates.phone !== undefined &&
      !isValidPhone(updates.phone)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number"
      });
    }

    if (
      updates.pincode !== undefined &&
      !/^[0-9]{6}$/.test(updates.pincode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain exactly 6 digits"
      });
    }

    if (
      updates.experience !== undefined &&
      (
        typeof updates.experience !== "number" ||
        !Number.isFinite(updates.experience) ||
        updates.experience < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience must be a non-negative number"
      });
    }

    if (
      updates.availability !== undefined &&
      typeof updates.availability !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Availability must be true or false"
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

    const newLatitude =
      updates.latitude !== undefined
        ? updates.latitude
        : provider.latitude;

    const newLongitude =
      updates.longitude !== undefined
        ? updates.longitude
        : provider.longitude;

    if (
      (updates.latitude !== undefined ||
       updates.longitude !== undefined) &&
      !validateCoordinates(newLatitude, newLongitude)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide valid latitude and longitude together"
      });
    }

    Object.assign(provider, updates);

    await provider.save();

    res.status(200).json({
      success: true,
      message: "Provider profile updated successfully",
      provider
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error("Update provider error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update provider profile"
    });
  }
};

module.exports = {
  getProviders,
  getProviderById,
  createProviderProfile,
  updateProviderProfile
};
