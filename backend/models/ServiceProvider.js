const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    businessName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    area: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },

    // Replaced flat lat/lng with MongoDB GeoJSON Point structure
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point"
      },
      coordinates: {
        type: [Number], // Must always be [longitude, latitude]
        required: true
      }
    },

    experience: {
      type: Number,
      default: 0
    },
    availability: {
      type: Boolean,
      default: true
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null
    }
  },
  {
    timestamps: true
  }
);


serviceProviderSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);