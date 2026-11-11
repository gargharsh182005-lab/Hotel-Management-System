import express from "express";
import {
  processPayment,
  getMyPayments
} from "../controllers/paymentController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/process", protect, processPayment);
router.get("/my-payments", protect, getMyPayments);

export default router;