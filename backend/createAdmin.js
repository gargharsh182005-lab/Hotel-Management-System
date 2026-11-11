import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI must be set.");
    }

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_INITIAL_PASSWORD;

    if (!email || !password) {
      throw new Error("Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD in the environment.");
    }

    if (password.length < 16) {
      throw new Error("ADMIN_INITIAL_PASSWORD must contain at least 16 characters.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existingUser = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingUser) {
      if (existingUser.role !== "admin") {
        throw new Error("The configured email belongs to a non-admin account; refusing to change its role.");
      }

      existingUser.password = hashedPassword;
      existingUser.tokenVersion = (existingUser.tokenVersion || 0) + 1;
      await existingUser.save();
      console.log("Admin password rotated and existing sessions invalidated.");
      return;
    }

    await User.create({
      name: "StaySmart Administrator",
      email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Admin provisioning failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();
