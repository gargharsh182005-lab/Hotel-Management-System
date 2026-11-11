import { randomUUID } from "crypto";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { expirePendingBookings } from "../services/expirePendingBookings.js";

const SIMULATED_PAYMENT_METHODS = ["Simulated UPI", "Simulated Card"];
const PAYMENT_METHODS = [...SIMULATED_PAYMENT_METHODS, "Pay at Hotel"];

export const processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    await expirePendingBookings();

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: "Choose Pay at Hotel, Simulated UPI, or Simulated Card." });
    }

    const isSimulatedPayment = SIMULATED_PAYMENT_METHODS.includes(paymentMethod);
    const paymentStatus = isSimulatedPayment ? "paid" : "unpaid";
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        user: req.user._id,
        status: "pending",
        paymentStatus: "unpaid"
      },
      {
        $set: {
          status: "confirmed",
          paymentStatus,
          paymentMethod,
          paymentIsSimulated: isSimulatedPayment,
          expiresAt: null
        }
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      const existingBooking = await Booking.findOne({
        _id: bookingId,
        user: req.user._id
      });

      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      return res.status(409).json({
        message: "This booking has already been processed or is no longer payable."
      });
    }

    let payment = null;
    if (isSimulatedPayment) {
      try {
        payment = await Payment.create({
          booking: booking._id,
          user: req.user._id,
          amount: booking.totalAmount,
          paymentMethod,
          transactionId: `SIM-${randomUUID()}`,
          status: "successful",
          paidAt: new Date(),
          isSimulated: true
        });
      } catch (error) {
        const rollback = await Booking.updateOne(
          {
            _id: booking._id,
            user: req.user._id,
            status: "confirmed",
            paymentStatus: "paid",
            paymentIsSimulated: true
          },
          {
            $set: {
              status: "pending",
              paymentStatus: "unpaid",
              paymentMethod: "",
              paymentIsSimulated: false,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000)
            }
          }
        );

        if (rollback.modifiedCount !== 1) {
          console.error("Could not roll back booking after simulated payment record failed:", booking._id);
        }
        throw error;
      }
    }

    return res.status(200).json({
      message: isSimulatedPayment
        ? `${paymentMethod} marked successful for demonstration only. No money was charged.`
        : "Booking confirmed. Pay at the hotel; no payment was collected.",
      booking,
      payment,
      simulated: isSimulatedPayment
    });
  } catch (error) {
    console.error("Demo payment processing error:", error.message);
    return res.status(500).json({ message: "Unable to process this booking option. Please try again." });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("booking", "bookingReference totalAmount status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
