
import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    country: {
      type: String,
      required: true
    },

    imageUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: value => !value || /^https?:\/\/\S+$/i.test(value),
        message: "Hotel image must be a valid HTTP or HTTPS URL"
      }
    },

    amenities: {
      type: [String],
      default: []
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
