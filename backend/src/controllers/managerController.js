import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const createHotelManager = async (req, res) => {
  try {
    const { name, email, password, hotelId } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8 ||
      !mongoose.isValidObjectId(hotelId)
    ) {
      return res.status(400).json({
        message: "Provide a name, valid email, password of at least 8 characters, and hotel."
      });
    }

    const hotel = await Hotel.findOne({ _id: hotelId, isActive: true }).select("_id name");
    if (!hotel) {
      return res.status(404).json({ message: "Active hotel not found." });
    }

    if (await User.exists({ managedHotel: hotel._id })) {
      return res.status(409).json({ message: "This hotel already has a manager." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const manager = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: "manager",
      managedHotel: hotel._id
    });

    return res.status(201).json({
      message: `Manager account created for ${hotel.name}.`,
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
        managedHotel: hotel._id
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "The email or hotel already has an assigned manager."
      });
    }

    console.error("Manager creation error:", error);
    return res.status(500).json({ message: "Unable to create the hotel manager." });
  }
};

export const updateHotelManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const { name, email, password } = req.body;

    if (!mongoose.isValidObjectId(managerId)) {
      return res.status(400).json({ message: "Invalid manager ID." });
    }

    const manager = await User.findOne({ _id: managerId, role: "manager" });
    if (!manager) {
      return res.status(404).json({ message: "Hotel manager not found." });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      (password !== undefined && password !== "" &&
        (typeof password !== "string" || password.length < 8))
    ) {
      return res.status(400).json({
        message: "Provide a name, valid email, and an optional password of at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail, _id: { $ne: manager._id } })) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    manager.name = name.trim();
    manager.email = normalizedEmail;
    if (password) {
      manager.password = await bcrypt.hash(password, 10);
      manager.tokenVersion += 1;
    }
    await manager.save();

    return res.status(200).json({
      message: "Hotel manager updated successfully.",
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
        managedHotel: manager.managedHotel
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    console.error("Manager update error:", error);
    return res.status(500).json({ message: "Unable to update the hotel manager." });
  }
};
