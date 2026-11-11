
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Payment from "../models/Payment.js";
import DynamicPricingEngine from "../services/DynamicPricingEngine.js";
import jwt from "jsonwebtoken";
import {
  expirePendingBookings,
  PENDING_BOOKING_HOLD_MINUTES
} from "../services/expirePendingBookings.js";

const pricingEngine = new DynamicPricingEngine();
const PRICE_QUOTE_MINUTES = 10;

const getPriceBreakdown = (room, dailyPrices) => {
  const average = key =>
    Number(
      (
        dailyPrices.reduce((sum, item) => sum + item.breakdown[key], 0) /
        dailyPrices.length
      ).toFixed(2)
    );

  return {
    basePrice: room.basePrice,
    occupancyCharge: average("occupancyCharge"),
    weekendCharge: average("weekendCharge"),
    seasonalCharge: average("seasonalCharge"),
    demandCharge: average("demandCharge"),
    finalPricePerNight: Number(
      (
        dailyPrices.reduce((sum, item) => sum + item.finalPrice, 0) /
        dailyPrices.length
      ).toFixed(2)
    )
  };
};

// Calculate occupancy and dynamic price separately for every night
const calculateStayPricing = async (
  room,
  start,
  end,
  roomsBooked
) => {
  await expirePendingBookings();

  const dailyPrices = [];
  let totalAmount = 0;
  let minimumAvailableRooms = room.totalRooms;

  const currentDate = new Date(start);

  while (currentDate < end) {
    const nextDate = new Date(currentDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    // Find bookings overlapping this particular night
    const bookings = await Booking.find({
      room: room._id,
      status: { $in: ["pending", "confirmed"] },
      checkIn: { $lt: nextDate },
      checkOut: { $gt: currentDate }
    });

    const bookedCount = bookings.reduce(
      (total, booking) => total + booking.roomsBooked,
      0
    );

    const nightAvailableRooms = room.totalRooms - bookedCount;

    if (nightAvailableRooms < roomsBooked) {
      return {
        available: false,
        availableRooms: nightAvailableRooms,
        dailyPrices: [],
        totalAmount: 0
      };
    }
    minimumAvailableRooms = Math.min(minimumAvailableRooms, nightAvailableRooms);

    const occupancy =
      (bookedCount / room.totalRooms) * 100;

    const day = currentDate.getUTCDay();
    const isWeekend = day === 0 || day === 6;

    const month = currentDate.getUTCMonth();
    const isPeakSeason = [3, 4, 11].includes(month);

    const demandLevel =
      occupancy > 80
        ? "high"
        : occupancy > 60
          ? "medium"
          : "low";

    // Calculate dynamic price
    const result = pricingEngine.calculateFinalPrice(
      room.basePrice,
      {
        occupancy,
        isWeekend,
        isPeakSeason,
        demandLevel
      }
    );

    dailyPrices.push({
      date: new Date(currentDate),
      occupancy,
      availableRooms: nightAvailableRooms,
      isWeekend,
      isPeakSeason,
      demandLevel,
      ...result
    });

    totalAmount += result.finalPrice * roomsBooked;

    currentDate.setUTCDate(
      currentDate.getUTCDate() + 1
    );
  }

  return {
    available: true,
    dailyPrices,
    availableRooms: minimumAvailableRooms,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
};

// Check room availability and dynamic pricing
export const checkAvailability = async (req, res) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      roomsBooked = 1,
      guests = 1
    } = req.body;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const count = Number(roomsBooked);
    const guestCount = Number(guests);

    if (
      !mongoose.isValidObjectId(roomId) ||
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      start >= end ||
      !Number.isInteger(count) ||
      count < 1 ||
      !Number.isInteger(guestCount) ||
      guestCount < 1
    ) {
      return res.status(400).json({
        message: "Invalid booking details"
      });
    }

    const room = await Room.findOne({
      _id: roomId,
      isActive: true
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    if (guestCount > room.capacity * count) {
      return res.status(400).json({
        message: "Guest limit exceeded"
      });
    }

    const pricing = await calculateStayPricing(
      room,
      start,
      end,
      count
    );

    if (!pricing.available) {
      return res.status(409).json({
        available: false,
        availableRooms: pricing.availableRooms,
        message: "Not enough rooms available"
      });
    }

    const priceBreakdown = getPriceBreakdown(room, pricing.dailyPrices);
    const priceQuote = jwt.sign(
      {
        roomId: room._id.toString(),
        checkIn: start.toISOString(),
        checkOut: end.toISOString(),
        roomsBooked: count,
        guests: guestCount,
        totalAmount: pricing.totalAmount,
        priceBreakdown
      },
      process.env.JWT_SECRET,
      {
        audience: "booking-price-quote",
        expiresIn: `${PRICE_QUOTE_MINUTES}m`
      }
    );

    res.status(200).json({
      available: true,
      nights: pricing.dailyPrices.length,
      roomsBooked: count,
      guests: guestCount,
      availableRooms: pricing.availableRooms,
      dailyPrices: pricing.dailyPrices,
      totalAmount: pricing.totalAmount,
      priceQuote,
      expiresAt: new Date(Date.now() + PRICE_QUOTE_MINUTES * 60 * 1000)
    });

  } catch (error) {
    console.error("Availability error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};

// Create a booking using dynamic pricing
export const createBooking = async (req, res) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      guests,
      roomsBooked = 1,
      priceQuote
    } = req.body;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const count = Number(roomsBooked);
    const guestCount = Number(guests);

    if (
      !mongoose.isValidObjectId(roomId) ||
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      start >= end ||
      !Number.isInteger(count) ||
      count < 1 ||
      !Number.isInteger(guestCount) ||
      guestCount < 1
    ) {
      return res.status(400).json({
        message: "Invalid booking details"
      });
    }

    let quotedPrice;
    try {
      quotedPrice = jwt.verify(priceQuote, process.env.JWT_SECRET, {
        audience: "booking-price-quote"
      });
    } catch {
      return res.status(409).json({
        message: "Your price quote expired. Please check availability again to confirm the current total."
      });
    }

    if (
      quotedPrice.roomId !== roomId ||
      quotedPrice.checkIn !== start.toISOString() ||
      quotedPrice.checkOut !== end.toISOString() ||
      quotedPrice.roomsBooked !== count ||
      quotedPrice.guests !== guestCount
    ) {
      return res.status(409).json({
        message: "Booking details changed. Please check availability again to receive an updated total."
      });
    }

    const room = await Room.findOne({
      _id: roomId,
      isActive: true
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    if (guestCount > room.capacity * count) {
      return res.status(400).json({
        message: "Guest limit exceeded"
      });
    }

    // Recheck inventory, but honor the signed price shown to the guest.
    const availability = await calculateStayPricing(
      room,
      start,
      end,
      count
    );

    if (!availability.available) {
      return res.status(409).json({
        message: "Rooms are no longer available"
      });
    }

    const bookingReference =
      `STAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const booking = await Booking.create({
      bookingReference,
      user: req.user._id,
      hotel: room.hotel,
      room: room._id,
      checkIn: start,
      checkOut: end,
      guests: guestCount,
      roomsBooked: count,
      expiresAt: new Date(Date.now() + PENDING_BOOKING_HOLD_MINUTES * 60 * 1000),
      priceBreakdown: quotedPrice.priceBreakdown,
      totalAmount: quotedPrice.totalAmount
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
      totalAmount: quotedPrice.totalAmount
    });

  } catch (error) {
    console.error("Booking creation error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};

// Get logged-in user's bookings
export const getMyBookings = async (req, res) => {
  try {
    await expirePendingBookings();
    const bookings = await Booking.find({
      user: req.user._id
    })
      .populate("hotel", "name city")
      .populate("room", "roomType basePrice")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: bookings.length,
      bookings
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getAdminBookings = async (req, res) => {
  try {
    await expirePendingBookings();
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const { status, search } = req.query;
    const filter = {};

    if (status && ["pending", "confirmed", "cancelled", "completed", "expired"].includes(status)) {
      filter.status = status;
    } else if (status) {
      return res.status(400).json({ message: "Invalid booking status filter." });
    }

    if (typeof search === "string" && search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.bookingReference = { $regex: escapedSearch, $options: "i" };
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("user", "name email")
        .populate("hotel", "name city")
        .populate("room", "roomType")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Booking.countDocuments(filter)
    ]);

    return res.status(200).json({
      count: bookings.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      bookings
    });
  } catch (error) {
    console.error("Admin booking list error:", error);
    return res.status(500).json({ message: "Unable to load bookings." });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (
      !["pending", "confirmed"].includes(booking.status)
    ) {
      return res.status(400).json({
        message: "Booking cannot be cancelled"
      });
    }

    if (booking.checkIn <= new Date()) {
      return res.status(400).json({
        message: "Booking cannot be cancelled after check-in time"
      });
    }

    if (booking.paymentStatus === "paid" && !booking.paymentIsSimulated) {
      return res.status(503).json({
        message: "Paid bookings cannot be cancelled until a refund can be processed."
      });
    }

    booking.status = "cancelled";
    booking.expiresAt = null;
    if (booking.paymentIsSimulated) {
      booking.paymentStatus = "refunded";
    }

    await booking.save();

    if (booking.paymentIsSimulated) {
      await Payment.updateMany(
        { booking: booking._id, isSimulated: true, status: "successful" },
        { status: "refunded" }
      );
    }

    res.status(200).json({
      message: booking.paymentIsSimulated
        ? "Booking cancelled. Simulated payment status updated; no money was charged."
        : "Booking cancelled successfully.",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Complete a booking (Admin only)
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be completed"
      });
    }

    if (booking.checkOut > new Date()) {
      return res.status(400).json({
        message: "Booking cannot be completed before checkout"
      });
    }

    booking.status = "completed";
    booking.expiresAt = null;

    await booking.save();

    res.status(200).json({
      message: "Booking completed successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
