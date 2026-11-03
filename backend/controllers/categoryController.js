
const mongoose = require("mongoose");
const ServiceCategory = require("../models/ServiceCategory");
const Service = require("../models/Service");

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
};

// CREATE CATEGORY (ADMIN)
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Valid category name is required"
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string"
      });
    }

    const categoryName = name.trim();

    const existingCategory = await ServiceCategory.findOne({
      name: { $regex: `^${categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await ServiceCategory.create({
      name: categoryName,
      description: description?.trim()
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create category"
    });
  }
};

// UPDATE CATEGORY (ADMIN)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    if (name === undefined && description === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update"
      });
    }

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Category name must be a non-empty string"
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string"
      });
    }

    const category = await ServiceCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    if (name !== undefined) {
      const categoryName = name.trim();

      const existingCategory = await ServiceCategory.findOne({
        _id: { $ne: id },
        name: {
          $regex: `^${categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i"
        }
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Category name already exists"
        });
      }

      category.name = categoryName;
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category name already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update category"
    });
  }
};

// DELETE CATEGORY (ADMIN)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    const category = await ServiceCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const existingService = await Service.exists({
      category: id
    });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete category because services are associated with it"
      });
    }

    await ServiceCategory.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete category"
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
