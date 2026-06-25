import mongoose, { Document } from "mongoose";
import type { Request } from "express";
import type { AuthProvider, OtpPurpose, UserRole } from "../types/type.js";

export interface IUser extends Document {
  // ── Identity ──────────────────────────────────────
  id : Object
  firstName: string;
  lastName: string;
  email: string;
  password?: string; 


  avatar?: string | undefined;
  bio?: string;
  phoneNumber?: string;

  // ── Role & Status ─────────────────────────────────
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean; // Admin can deactivate accounts

  // ── Auth Provider ─────────────────────────────────
  authProvider: AuthProvider;
  googleId?: string; // Set when signed in via Google

  // ── LMS-Specific ──────────────────────────────────
  enrolledCourses: string[];
  createdCourses: string[]; // For instructors
  wishlist: string[];
  cart: string[];
  courseProgress: any;

  // ── Timestamps ────────────────────────────────────
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
  // ── Methods ───────────────────────────────────────
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}




export interface IOtp extends Document {
  email: string;
  otp: string;                  // Hashed OTP (never store plain text)
  purpose: OtpPurpose;
  attempts: number;             // Track failed verification attempts
  isUsed: boolean;              // Prevent OTP reuse
  expiresAt: Date;              // TTL index uses this field
  createdAt: Date;
}
