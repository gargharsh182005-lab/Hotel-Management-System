import express from "express";
import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected profile route
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed successfully!",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Admin-only route
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

export default router;