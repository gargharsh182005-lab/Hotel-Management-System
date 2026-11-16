import express from "express";
import { createHotelManager, updateHotelManager } from "../controllers/managerController.js";
import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/managers", protect, authorize("admin"), createHotelManager);
router.patch("/managers/:managerId", protect, authorize("admin"), updateHotelManager);

export default router;
