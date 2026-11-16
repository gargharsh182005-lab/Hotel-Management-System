
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["customer", "admin", "manager"],
      default: "customer"
    },

    managedHotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    tokenVersion: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

userSchema.index(
  { managedHotel: 1 },
  {
    unique: true,
    partialFilterExpression: { managedHotel: { $type: "objectId" } }
  }
);

const User = mongoose.model("User", userSchema);

export default User;
