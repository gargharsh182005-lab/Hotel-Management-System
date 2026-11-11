import Booking from "../models/Booking.js";

export const PENDING_BOOKING_HOLD_MINUTES = 15;

const getExpirationCutoff = () =>
  new Date(Date.now() - PENDING_BOOKING_HOLD_MINUTES * 60 * 1000);

export const expirePendingBookings = async () => {
  const now = new Date();

  return Booking.updateMany(
    {
      status: "pending",
      paymentStatus: "unpaid",
      $or: [
        { expiresAt: { $lte: now } },
        {
          expiresAt: null,
          createdAt: { $lte: getExpirationCutoff() }
        }
      ]
    },
    { $set: { status: "expired" } }
  );
};
