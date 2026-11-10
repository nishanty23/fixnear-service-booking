const mongoose = require("mongoose");

const Service = require("../../models/Service");
const ServiceProvider = require("../../models/ServiceProvider");
const ServiceCategory = require("../../models/ServiceCategory");

const cloudinary = require("../../config/cloudinary");
const uploadToCloudinary = require("../../utils/uploadToCloudinary");

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validPriceTypes = ["FIXED", "HOURLY", "STARTING_FROM"];

const handleError = (res, error) => {
  console.error("Service controller error:", error.message);

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid service data",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Server error while processing service request",
  });
};

// ==========================================
// GET ALL SERVICES
// ==========================================

const getServices = async (req, res) => {
  try {
    const { category, city, area, minPrice, maxPrice } = req.query;

    const filter = {
      isActive: true,
    };

    // Category filter
    if (category !== undefined) {
      if (typeof category !== "string" || !mongoose.isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      filter.category = category;
    }

    // City filter
    if (city !== undefined && (typeof city !== "string" || !city.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid city",
      });
    }

    // Area filter
    if (area !== undefined && (typeof area !== "string" || !area.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid area",
      });
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      if (
        (minPrice !== undefined && minPrice.trim() === "") ||
        (maxPrice !== undefined && maxPrice.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Price values cannot be empty",
        });
      }

      const min = minPrice === undefined ? 0 : Number(minPrice);
      const max = maxPrice === undefined ? Infinity : Number(maxPrice);

      if (
        !Number.isFinite(min) ||
        min < 0 ||
        (maxPrice !== undefined && (!Number.isFinite(max) || max < min))
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price range",
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
      .populate({
        path: "provider",
        match: {
          approvalStatus: "APPROVED",
          availability: true,

          ...(city
            ? {
                city: {
                  $regex: escapeRegex(city.trim()),
                  $options: "i",
                },
              }
            : {}),

          ...(area
            ? {
                area: {
                  $regex: escapeRegex(area.trim()),
                  $options: "i",
                },
              }
            : {}),
        },

        populate: {
          path: "user",
          match: {
            isActive: { $ne: false },
          },
          select: "name",
        },
      })
      .sort({ price: 1 });

    const availableServices = services.filter(
      (service) => service.provider !== null && service.provider.user !== null,
    );

    return res.status(200).json({
      success: true,
      count: availableServices.length,
      services: availableServices,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==========================================
// GET SINGLE SERVICE
// ==========================================

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const service = await Service.findOne({
      _id: id,
      isActive: true,
    })
      .populate("category", "name")
      .populate({
        path: "provider",
        match: {
          approvalStatus: "APPROVED",
          availability: true,
        },
        populate: {
          path: "user",
          match: {
            isActive: { $ne: false },
          },
          select: "name",
        },
      });

    if (
      !service ||
      !service.provider ||
      service.provider.approvalStatus !== "APPROVED" ||
      service.provider.availability !== true ||
      !service.provider.user
    ) {
      return res.status(404).json({
        success: false,
        message: "Service not found or provider unavailable",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==========================================
// CREATE SERVICE
// ==========================================

const createService = async (req, res) => {
  let uploadedImage;

  try {
    const { category, name, description, price, priceType } = req.body;

    // Validate required fields
    if (
      !category ||
      name === undefined ||
      description === undefined ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required service fields",
      });
    }

    // Validate image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Service image is required",
      });
    }

    // Validate category ID
    if (typeof category !== "string" || !mongoose.isValidObjectId(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Validate name and description
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Service name and description cannot be empty",
      });
    }

    // Validate price
    const numericPrice = Number(price);

    if (price === "" || !Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    // Validate price type
    if (priceType !== undefined && !validPriceTypes.includes(priceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid price type",
      });
    }

    // Find provider profile
    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Please create your provider profile first",
      });
    }

    // Check provider approval
    if (provider.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Your provider account is not approved yet",
      });
    }

    // Check provider availability
    if (provider.availability !== true) {
      return res.status(403).json({
        success: false,
        message: "Your provider account is currently unavailable",
      });
    }

    // Check category existence
    const existingCategory = await ServiceCategory.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    // Upload image to Cloudinary
    uploadedImage = await uploadToCloudinary(
      req.file.buffer,
      "fixnear/services",
    );

    // Create service
    const service = await Service.create({
      provider: provider._id,
      category,
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      priceType,
      image: uploadedImage.secure_url,
      imagePublicId: uploadedImage.public_id,
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    // Remove uploaded image if database operation fails
    if (uploadedImage?.public_id) {
      await cloudinary.uploader
        .destroy(uploadedImage.public_id)
        .catch(() => {});
    }

    handleError(res, error);
  }
};

// ==========================================
// UPDATE OWN SERVICE
// ==========================================

const updateService = async (req, res) => {
  let replacementImage;

  try {
    const { id } = req.params;

    // Validate service ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const allowedFields = [
      "category",
      "name",
      "description",
      "price",
      "priceType",
      "isActive",
    ];

    const updates = Object.keys(req.body);

    // Allow image-only updates
    if (
      (updates.length === 0 && !req.file) ||
      updates.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or empty update fields",
      });
    }

    const { category, name, description, price, priceType, isActive } =
      req.body;

    // Validate name
    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({
        success: false,
        message: "Service name cannot be empty",
      });
    }

    // Validate description
    if (
      description !== undefined &&
      (typeof description !== "string" || !description.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Service description cannot be empty",
      });
    }

    // Validate and convert price
    if (price !== undefined) {
      const numericPrice = Number(price);

      if (price === "" || !Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }

      req.body.price = numericPrice;
    }

    // Validate price type
    if (priceType !== undefined && !validPriceTypes.includes(priceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid price type",
      });
    }

    // Validate and convert isActive
    if (isActive !== undefined) {
      if (typeof isActive === "string") {
        if (isActive !== "true" && isActive !== "false") {
          return res.status(400).json({
            success: false,
            message: "Invalid isActive value",
          });
        }

        req.body.isActive = isActive === "true";
      } else if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be a boolean value",
        });
      }
    }

    // Validate category if provided
    if (category !== undefined) {
      if (typeof category !== "string" || !mongoose.isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const categoryExists = await ServiceCategory.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Find provider
    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    // Check provider approval
    if (provider.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Your provider account is not approved yet",
      });
    }

    // Check provider availability
    if (provider.availability !== true) {
      return res.status(403).json({
        success: false,
        message: "Your provider account is currently unavailable",
      });
    }

    // Find service belonging to this provider
    const service = await Service.findOne({
      _id: id,
      provider: provider._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or unauthorized",
      });
    }

    // Update normal fields
    for (const field of updates) {
      if (field === "name" || field === "description") {
        service[field] = req.body[field].trim();
      } else {
        service[field] = req.body[field];
      }
    }

    const oldImagePublicId = service.imagePublicId;

    // Upload replacement image if provided
    if (req.file) {
      replacementImage = await uploadToCloudinary(
        req.file.buffer,
        "fixnear/services",
      );

      service.image = replacementImage.secure_url;
      service.imagePublicId = replacementImage.public_id;
    }

    // Save database changes
    try {
      await service.save();
    } catch (saveError) {
      // Remove replacement image if saving fails
      if (replacementImage?.public_id) {
        await cloudinary.uploader
          .destroy(replacementImage.public_id)
          .catch(() => {});
      }

      throw saveError;
    }

    // Delete old image after successful update
    if (replacementImage && oldImagePublicId) {
      await cloudinary.uploader.destroy(oldImagePublicId).catch((error) => {
        console.error("Old service image cleanup failed:", error.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    // Cleanup replacement image if an unexpected error occurs
    if (replacementImage?.public_id) {
      await cloudinary.uploader
        .destroy(replacementImage.public_id)
        .catch(() => {});
    }

    handleError(res, error);
  }
};

// ==========================================
// DELETE OWN SERVICE
// ==========================================

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate service ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    // Find provider
    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    // Check provider approval
    if (provider.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Your provider account is not approved yet",
      });
    }

    // Check provider availability
    if (provider.availability !== true) {
      return res.status(403).json({
        success: false,
        message: "Your provider account is currently unavailable",
      });
    }

    // Find service belonging to this provider
    const service = await Service.findOne({
      _id: id,
      provider: provider._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or unauthorized",
      });
    }

    // Soft delete to preserve existing booking references
    service.isActive = false;

    await service.save();

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
