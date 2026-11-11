import express from "express";

import {
  checkAvailability,
  createBooking,
  getAdminBookings,
  getMyBookings,
  cancelBooking,
  completeBooking
} from "../controllers/bookingController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/availability", checkAvailability);
router.post("/", protect, createBooking);
router.get("/admin", protect, authorize("admin"), getAdminBookings);
router.get("/my-bookings", protect, getMyBookings);

router.patch("/:id/cancel", protect, cancelBooking);
router.patch("/:id/complete", protect, authorize("admin"), completeBooking);

export default router;