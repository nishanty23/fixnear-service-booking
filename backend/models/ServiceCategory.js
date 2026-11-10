const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // Category image URL from Cloudinary
    image: {
      type: String,
      required: true,
    },

    // Cloudinary public ID for image management
    imagePublicId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ServiceCategory", serviceCategorySchema);
