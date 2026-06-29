import mongoose, { Document, Schema, Model } from "mongoose";
import type { IOtp } from "../interfaces/interfaces.js";

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
    },
    purpose: {
      type: String,
      enum: ["email_verification", "password_reset"],
      default: "email_verification",
    },
    attempts: {
      type: Number,
      default: 0,
      max: [5, "Maximum OTP attempts exceeded"],
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
      index: { expireAfterSeconds: 0, partialFilterExpression: { isUsed: false } },
    },
  },
  { timestamps: true }
);

// Compound index for fast purpose-based lookups
OtpSchema.index({ email: 1, purpose: 1 });

const Otp: Model<IOtp> = mongoose.model<IOtp>("Otp", OtpSchema);

export default Otp;