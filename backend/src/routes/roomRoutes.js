import express from "express";

import {
  createRoom,
  getRoomsByHotel,
  updateRoom,
  deleteRoom
} from "../controllers/roomController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Get rooms belonging to a hotel
router.get("/hotel/:hotelId", getRoomsByHotel);

// Admin/Manager: Create, update and delete rooms
router.post("/", protect, authorize("admin", "manager"), createRoom);
router.put("/:id", protect, authorize("admin", "manager"), updateRoom);
router.delete("/:id", protect, authorize("admin", "manager"), deleteRoom);

export default router;