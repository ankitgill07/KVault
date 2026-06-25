// src/utils/otp.util.ts

import bcrypt from 'bcrypt';
import crypto from 'crypto';

// ─── Generate a cryptographically secure numeric OTP ─────────────────────────

export const generateOtp = (length: number = 6): string => {
  const max = Math.pow(10, length);               // e.g. 1_000_000 for 6 digits
  const randomBytes = crypto.randomBytes(4);      // 4 bytes → 32-bit uint
  const randomInt = randomBytes.readUInt32BE(0) % max;
  return randomInt.toString().padStart(length, '0');
};

// ─── Hash OTP before storing in DB / Redis ────────────────────────────────────

export const hashOtp = async (otp: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

// ─── Verify plain OTP against stored hash ────────────────────────────────────

export const verifyOtp = async (
  plainOtp: string,
  hashedOtp: string
): Promise<boolean> => {
  return bcrypt.compare(plainOtp, hashedOtp);
};

// ─── Compute expiry date ──────────────────────────────────────────────────────

export const getOtpExpiry = (minutes: number = 10): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};