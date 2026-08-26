// src/utils/otp.util.ts

import bcryptjs from 'bcryptjs';

// Generate a random numeric OTP using Math.random
export const generateOtp = (length = 6): string => {
  const max = Math.pow(10, length);
  const randomInt = Math.floor(Math.random() * max);
  return randomInt.toString().padStart(length, '0');
};

export const hashOtp = async (otp: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(otp, salt);
};

export const verifyOtp = async (
  plainOtp: string,
  hashedOtp: string
): Promise<boolean> => {
  return bcryptjs.compare(plainOtp, hashedOtp);
};

export const getOtpExpiry = (minutes = 10): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};
