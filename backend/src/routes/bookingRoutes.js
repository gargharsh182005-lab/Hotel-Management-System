import express from "express";

import {
  checkAvailability,
  createBooking,
  getAdminBookings,
  getMyBookings,
  cancelBooking,
  completeBooking,
  checkInBooking,
  checkOutBooking
} from "../controllers/bookingController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/availability", checkAvailability);
router.post("/", protect, createBooking);
router.get("/admin", protect, authorize("admin"), getAdminBookings);
router.get("/management", protect, authorize("admin", "manager"), getAdminBookings);
router.get("/my-bookings", protect, getMyBookings);

router.patch("/:id/cancel", protect, cancelBooking);
router.patch("/:id/complete", protect, authorize("admin"), completeBooking);
router.patch("/:id/check-in", protect, authorize("admin", "manager"), checkInBooking);
router.patch("/:id/check-out", protect, authorize("admin", "manager"), checkOutBooking);

export default router;