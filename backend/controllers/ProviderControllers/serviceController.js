
const mongoose = require("mongoose");

const Service = require("../../models/Service");
const ServiceProvider = require("../../models/ServiceProvider");
const ServiceCategory = require("../../models/ServiceCategory");

// HELPER FUNCTIONS

const escapeRegex = value =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validPriceTypes = ["FIXED", "HOURLY", "STARTING_FROM"];

const handleError = (res, error) => {
  console.error("Service controller error:", error.message);

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid service data"
    });
  }

  return res.status(500).json({
    success: false,
    message: "Server error while processing service request"
  });
};

// GET ALL SERVICES

const getServices = async (req, res) => {
  try {
    const { category, city, area, minPrice, maxPrice } = req.query;

    const filter = {
      isActive: true
    };

    if (category !== undefined) {
      if (
        typeof category !== "string" ||
        !mongoose.isValidObjectId(category)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID"
        });
      }

      filter.category = category;
    }

    if (city !== undefined && (typeof city !== "string" || !city.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid city"
      });
    }

    if (area !== undefined && (typeof area !== "string" || !area.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid area"
      });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      if (
        (minPrice !== undefined && minPrice.trim() === "") ||
        (maxPrice !== undefined && maxPrice.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Price values cannot be empty"
        });
      }

      const min = minPrice === undefined ? 0 : Number(minPrice);
      const max = maxPrice === undefined ? Infinity : Number(maxPrice);

      if (
        !Number.isFinite(min) ||
        min < 0 ||
        (maxPrice !== undefined &&
          (!Number.isFinite(max) || max < min))
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price range"
        });
      }

      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = min;
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = max;
      }
    }

    const services = await Service.find(filter)
      .populate("category", "name")
      .populate({
        path: "provider",
        match: {
          availability: true,
          ...(city
            ? { city: { $regex: escapeRegex(city.trim()), $options: "i" } }
            : {}),
          ...(area
            ? { area: { $regex: escapeRegex(area.trim()), $options: "i" } }
            : {})
        },
        populate: {
          path: "user",
          select: "name"
        }
      })
      .sort({ price: 1 });

    const availableServices = services.filter(
      service => service.provider !== null
    );

    res.status(200).json({
      success: true,
      count: availableServices.length,
      services: availableServices
    });
  } catch (error) {
    handleError(res, error);
  }
};

// GET SINGLE SERVICE

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID"
      });
    }

    const service = await Service.findOne({
      _id: id,
      isActive: true
    })
      .populate("category", "name")
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name"
        }
      });

    if (!service || !service.provider || !service.provider.availability) {
      return res.status(404).json({
        success: false,
        message: "Service not found or provider unavailable"
      });
    }

    res.status(200).json({
      success: true,
      service
    });
  } catch (error) {
    handleError(res, error);
  }
};

// CREATE SERVICE

const createService = async (req, res) => {
  try {
    const {
      category,
      name,
      description,
      price,
      priceType
    } = req.body;

    if (
      !category ||
      name === undefined ||
      description === undefined ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required service fields"
      });
    }

    if (
      typeof category !== "string" ||
      !mongoose.isValidObjectId(category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Service name and description cannot be empty"
      });
    }

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number"
      });
    }

    if (
      priceType !== undefined &&
      !validPriceTypes.includes(priceType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid price type"
      });
    }

    const provider = await ServiceProvider.findOne({
      user: req.user._id
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Please create your provider profile first"
      });
    }

    const existingCategory = await ServiceCategory.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Service category not found"
      });
    }

    const service = await Service.create({
      provider: provider._id,
      category,
      name: name.trim(),
      description: description.trim(),
      price,
      priceType
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service
    });
  } catch (error) {
    handleError(res, error);
  }
};

// UPDATE OWN SERVICE

const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID"
      });
    }

    const allowedFields = [
      "category",
      "name",
      "description",
      "price",
      "priceType",
      "isActive"
    ];

    const updates = Object.keys(req.body);

    if (
      updates.length === 0 ||
      updates.some(field => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or empty update fields"
      });
    }

    if (
      req.body.name !== undefined &&
      (typeof req.body.name !== "string" || !req.body.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Service name cannot be empty"
      });
    }

    if (
      req.body.description !== undefined &&
      (typeof req.body.description !== "string" ||
        !req.body.description.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Service description cannot be empty"
      });
    }

    if (
      req.body.price !== undefined &&
      (typeof req.body.price !== "number" ||
        !Number.isFinite(req.body.price) ||
        req.body.price < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid price"
      });
    }

    if (
      req.body.priceType !== undefined &&
      !validPriceTypes.includes(req.body.priceType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid price type"
      });
    }

    if (
      req.body.isActive !== undefined &&
      typeof req.body.isActive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value"
      });
    }

    if (req.body.category !== undefined) {
      if (
        typeof req.body.category !== "string" ||
        !mongoose.isValidObjectId(req.body.category)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID"
        });
      }

      const categoryExists = await ServiceCategory.findById(
        req.body.category
      );

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }
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

    const service = await Service.findOne({
      _id: id,
      provider: provider._id
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or unauthorized"
      });
    }

    for (const field of updates) {
      if (field === "name" || field === "description") {
        service[field] = req.body[field].trim();
      } else {
        service[field] = req.body[field];
      }
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service
    });
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE OWN SERVICE

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID"
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

    const service = await Service.findOne({
      _id: id,
      provider: provider._id
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or unauthorized"
      });
    }

    // Soft delete: preserve existing booking references.
    service.isActive = false;
    await service.save();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully"
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};