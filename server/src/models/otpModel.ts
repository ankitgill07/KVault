
import mongoose, { Document, Schema, Model } from 'mongoose';
import { OtpPurpose } from '../types/type.js';
import type { IOtp } from '../interfaces/interfaces.js';


const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      // Stored as bcrypt hash — never plain text
    },
    purpose: {
      type: String,
      enum: Object.values(OtpPurpose),
      default: OtpPurpose.EMAIL_VERIFICATION,
    },
    attempts: {
      type: Number,
      default: 0,
      max: [5, 'Maximum verification attempts exceeded'],
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL: MongoDB auto-deletes the document when this date passes
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound Index: one active OTP per email+purpose ─────────────────────────

OtpSchema.index({ email: 1, purpose: 1, isUsed: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const Otp: Model<IOtp> = mongoose.model<IOtp>('Otp', OtpSchema);

export default Otp;