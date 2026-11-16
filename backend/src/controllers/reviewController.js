import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";

// Create a review
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!mongoose.isValidObjectId(bookingId) || !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: "Invalid review details" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
      $or: [
        { status: "completed" },
        { status: "confirmed", checkOut: { $lte: new Date() } }
      ]
    });

    if (!booking) {
      return res.status(403).json({
        message: "You can review this stay after checkout"
      });
    }

    if (comment !== undefined && (typeof comment !== "string" || comment.length > 500)) {
      return res.status(400).json({ message: "Review comments must be 500 characters or fewer" });
    }

    const review = await Review.create({
      user: req.user._id,
      hotel: booking.hotel,
      booking: booking._id,
      rating: Number(rating),
      comment
    });

    const stats = await Review.aggregate([
      { $match: { hotel: booking.hotel } },
      {
        $group: {
          _id: "$hotel",
          averageRating: { $avg: "$rating" },
          ratingCount: { $sum: 1 }
        }
      }
    ]);

    await Hotel.findByIdAndUpdate(booking.hotel, {
      rating: Number(stats[0].averageRating.toFixed(1)),
      ratingCount: stats[0].ratingCount
    }, { runValidators: true });

    res.status(201).json({
      message: "Review submitted successfully",
      review
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this booking"
      });
    }

    console.error("Review creation error:", error);
    res.status(500).json({ message: "Unable to submit review" });
  }
};

// Get reviews for a hotel
export const getHotelReviews = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.hotelId)) {
      return res.status(400).json({ message: "Invalid hotel ID" });
    }

    const [reviews, stats] = await Promise.all([
      Review.find({ hotel: req.params.hotelId })
        .populate("user", "name")
        .sort({ createdAt: -1 }),
      Review.aggregate([
        { $match: { hotel: new mongoose.Types.ObjectId(req.params.hotelId) } },
        {
          $group: {
            _id: "$hotel",
            averageRating: { $avg: "$rating" },
            ratingCount: { $sum: 1 }
          }
        }
      ])
    ]);

    res.status(200).json({
      count: stats[0]?.ratingCount || 0,
      averageRating: stats[0]?.averageRating
        ? Number(stats[0].averageRating.toFixed(1))
        : 0,
      reviews
    });

  } catch (error) {
    console.error("Hotel reviews error:", error);
    res.status(500).json({ message: "Unable to load hotel reviews" });
  }
};