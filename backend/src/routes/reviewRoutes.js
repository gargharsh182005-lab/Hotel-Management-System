import express from "express";
import {
  createReview,
  getHotelReviews
} from "../controllers/reviewController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit a review (authenticated customers)
router.post("/", protect, createReview);

// View reviews of a hotel (public)
router.get("/hotel/:hotelId", getHotelReviews);

export default router;