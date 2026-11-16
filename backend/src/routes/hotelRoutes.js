import express from "express";

import {
  createHotel,
  getHotels,
  getManagedHotels,
  getHotelById,
  updateHotel,
  deleteHotel
} from "../controllers/hotelController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getHotels);
router.get("/management", protect, authorize("admin", "manager"), getManagedHotels);
router.get("/:id", getHotelById);

router.post("/", protect, authorize("admin"), createHotel);
router.put("/:id", protect, authorize("admin", "manager"), updateHotel);
router.delete("/:id", protect, authorize("admin", "manager"), deleteHotel);

export default router;