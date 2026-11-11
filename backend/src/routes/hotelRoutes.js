import express from "express";

import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel
} from "../controllers/hotelController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getHotels);
router.get("/:id", getHotelById);

router.post("/", protect, authorize("admin", "manager"), createHotel);
router.put("/:id", protect, authorize("admin", "manager"), updateHotel);
router.delete("/:id", protect, authorize("admin", "manager"), deleteHotel);

export default router;