import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";

// Create a review
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: "Invalid review details" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
      status: "completed"
    });

    if (!booking) {
      return res.status(403).json({
        message: "Only customers with completed bookings can review"
      });
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
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    await Hotel.findByIdAndUpdate(booking.hotel, {
      rating: Number(stats[0].averageRating.toFixed(1))
    });

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

    res.status(400).json({ message: error.message });
  }
};

// Get reviews for a hotel
export const getHotelReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ hotel: req.params.hotelId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reviews.length,
      reviews
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};