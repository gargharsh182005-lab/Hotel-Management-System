
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true
    },

    roomType: {
      type: String,
      required: true,
      enum: ["Standard", "Deluxe", "Suite", "Premium"]
    },

    description: {
      type: String,
      required: true
    },

    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0
    },

    totalRooms: {
      type: Number,
      required: true,
      min: 1
    },

    amenities: {
      type: [String],
      default: []
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: images => images.length <= 4,
        message: "A room can have at most 4 images"
      }
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
