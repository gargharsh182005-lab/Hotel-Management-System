
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    checkIn: {
      type: Date,
      required: true
    },

    checkOut: {
      type: Date,
      required: true,
      validate: {
        validator: function(value) {
          return value > this.checkIn;
        },
        message: "Check-out must be after check-in"
      }
    },

    guests: {
      type: Number,
      required: true,
      min: 1
    },

    roomsBooked: {
      type: Number,
      required: true,
      min: 1
    },

    priceBreakdown: {
      basePrice: Number,
      occupancyCharge: Number,
      weekendCharge: Number,
      demandCharge: Number,
      seasonalCharge: Number,
      finalPricePerNight: Number
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "expired"],
      default: "pending"
    },

    expiresAt: {
      type: Date,
      default: null
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid"
    },

    paymentMethod: {
      type: String,
      enum: ["", "Pay at Hotel", "Simulated UPI", "Simulated Card"],
      default: ""
    },

    paymentIsSimulated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
