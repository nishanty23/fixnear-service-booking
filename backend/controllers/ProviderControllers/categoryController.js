const mongoose = require("mongoose");

const ServiceCategory = require("../../models/ServiceCategory");
const Service = require("../../models/Service");

const cloudinary = require("../../config/cloudinary");
const uploadToCloudinary = require("../../utils/uploadToCloudinary");

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// CREATE CATEGORY
const createCategory = async (req, res) => {
  let uploadedImage;

  try {
    const { name, description } = req.body;

    // Validate category name
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Valid category name is required",
      });
    }

    // Validate image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Category image is required",
      });
    }

    // Validate description
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
      });
    }

    const categoryName = name.trim();

    // Check duplicate category
    const escapedName = categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const existingCategory = await ServiceCategory.findOne({
      name: {
        $regex: `^${escapedName}$`,
        $options: "i",
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    // Upload image to Cloudinary
    uploadedImage = await uploadToCloudinary(
      req.file.buffer,
      "fixnear/categories",
    );

    // Save category in MongoDB
    const category = await ServiceCategory.create({
      name: categoryName,
      description: description?.trim(),
      image: uploadedImage.secure_url,
      imagePublicId: uploadedImage.public_id,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    // Delete uploaded image if database operation fails
    if (uploadedImage?.public_id) {
      await cloudinary.uploader
        .destroy(uploadedImage.public_id)
        .catch((cleanupError) => {
          console.error("Image cleanup failed:", cleanupError.message);
        });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  let uploadedImage;

  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (name === undefined && description === undefined && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({
        success: false,
        message: "Category name must be a non-empty string",
      });
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
      });
    }

    const category = await ServiceCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check duplicate name
    if (name !== undefined) {
      const categoryName = name.trim();

      const escapedName = categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const duplicate = await ServiceCategory.findOne({
        _id: { $ne: id },
        name: {
          $regex: `^${escapedName}$`,
          $options: "i",
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Category name already exists",
        });
      }

      category.name = categoryName;
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    // Keep old image public ID
    const oldPublicId = category.imagePublicId;

    // Upload new image only if provided
    if (req.file) {
      uploadedImage = await uploadToCloudinary(
        req.file.buffer,
        "fixnear/categories",
      );

      category.image = uploadedImage.secure_url;
      category.imagePublicId = uploadedImage.public_id;
    }

    // Save updated category
    await category.save();

    // Delete old image after successful database update
    if (req.file && oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId).catch((error) => {
        console.error("Old category image cleanup failed:", error.message);
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    // Delete newly uploaded image if update fails
    if (uploadedImage?.public_id) {
      await cloudinary.uploader
        .destroy(uploadedImage.public_id)
        .catch((cleanupError) => {
          console.error("Image cleanup failed:", cleanupError.message);
        });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category name already exists",
      });
    }

    console.error("Update category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await ServiceCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const existingService = await Service.exists({
      category: id,
    });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete category because services are associated with it",
      });
    }

    await ServiceCategory.findByIdAndDelete(id);

    // Delete category image from Cloudinary
    if (category.imagePublicId) {
      await cloudinary.uploader
        .destroy(category.imagePublicId)
        .catch((error) => {
          console.error("Category image cleanup failed:", error.message);
        });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
