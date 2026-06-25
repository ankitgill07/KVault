// src/models/User.model.ts

import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import type { IUser } from "../interfaces/interfaces.js";
import { AuthProvider, UserRole } from "../types/type.js";

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in queries by default
    },

    // ── Profile ─────────────────────────────────────
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: null,
    },
    phoneNumber: {
      type: String,
      default: null,
    },

    // ── Role & Status ───────────────────────────────
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Auth Provider ───────────────────────────────
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
    },
    googleId: {
      type: String,
      default: null,
    },

    // ── LMS-Specific ────────────────────────────────
    enrolledCourses: {
      type: [String],
      default: [],
    },
    createdCourses: {
      type: [String],
      default: [],
    },
    wishlist: {
      type: [String],
      default: [],
    },
    cart: {
      type: [String],
      default: [],
    },
    courseProgress: {
      type: Map,
      of: new Schema(
        {
          progress: { type: Number, default: 0 },
          lastAccessed: { type: String, default: "" },
          completedLessons: { type: [String], default: [] },
        },
        { _id: false },
      ),
      default: {},
    },

    // ── Activity ────────────────────────────────────
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
    toJSON: {
      transform(_doc, ret) {
        delete ret.password; // Never expose password in JSON output
        delete ret.__v;
        return ret;
      },
    },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

UserSchema.index({ role: 1, isActive: 1 });

// ─── Pre-save Hook: Hash password ─────────────────────────────────────────────

UserSchema.pre<IUser>("save", async function () {
  // Only hash if password field was modified
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});
// ─── Instance Methods ─────────────────────────────────────────────────────────

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.getFullName = function (): string {
  return `${this.firstName}`;
};

// ─── Model ────────────────────────────────────────────────────────────────────

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
