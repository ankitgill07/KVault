import User from '../models/userModel.js';
import Otp from '../models/otpModel.js';
import { AuthProvider, UserRole } from '../types/type.js';
import { AppError } from '../utils/appError.js';
import type { RegisterInput, LoginInput, VerifyOtpInput, ResendOtpInput } from '../schemas/authSchem.js';
import {
  createSession, deleteSession, deleteAllUserSessions,
  setOtpRateLimit, getOtpRateLimit, cacheOtp, getCachedOtp, deleteCachedOtp,
} from './redisService.js';
import { generateOtp, hashOtp, verifyOtp, getOtpExpiry } from '../utils/optUtil.js';
import { sendOtpEmail, sendWelcomeEmail } from './emailService.js';

export interface AuthResult {
  sessionId: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar: string | undefined;
    isEmailVerified: boolean;
  };
}

export interface RegisterResult {
  userId: string;
  email: string;
}

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

const createUserSession = async (
  userId: string,
  _email: string,
  role: UserRole,
  meta: RequestMeta
): Promise<string> => {
  return await createSession(userId, meta);
};

// Register - auto-verify, no OTP
export const registerUserService = async (
  input: RegisterInput
): Promise<RegisterResult> => {
  const { name, email, password } = input;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: UserRole.STUDENT,
    authProvider: AuthProvider.LOCAL,
    isEmailVerified: false,
  });

  // Automatically send OTP for email verification
  await sendOtpService(email, 'email_verification').catch(console.error);

  return { userId: user.id as string, email: user.email };
};

// Login - session-based only
export const loginUserService = async (
  input: LoginInput,
  meta: RequestMeta
): Promise<AuthResult> => {
  const { email, password } = input;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact support.', 403);
  }

  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email before logging in. Check your inbox for the OTP.', 403);
  }

  const sessionId = await createUserSession(
    user.id as string,
    user.email,
    user.role,
    meta
  );

  await User.findByIdAndUpdate(user.id, { lastLoginAt: new Date() });

  return {
    sessionId,
    user: {
      id: user.id as string,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
    },
  };
};

export const logoutService = async (
  _sessionId: string,
  userId: string
): Promise<void> => {
  await deleteSession(_sessionId);
};

export const logoutAllService = async (userId: string): Promise<void> => {
  await deleteAllUserSessions(userId);
};

// ─── OTP Services ─────────────────────────────────────────────────────────────

export const sendOtpService = async (
  email: string,
  purpose: 'email_verification' | 'password_reset' = 'email_verification'
): Promise<void> => {
  // Rate limiting: max 3 OTPs per minute
  const rateCount = await getOtpRateLimit(email);
  if (rateCount >= 3) {
    throw new AppError('Too many OTP requests. Please try again after 1 minute.', 429);
  }

  // Check if user exists for email verification
  if (purpose === 'email_verification') {
    const existingUser = await User.findOne({ email });
    if (existingUser?.isEmailVerified) {
      throw new AppError('Email is already verified.', 400);
    }
  }

  // Generate and hash OTP
  const plainOtp = generateOtp(6);
  const hashedOtp = await hashOtp(plainOtp);
  const expiresAt = getOtpExpiry(10); // 10 minutes

  // Store in MongoDB
  await Otp.create({
    email,
    otp: hashedOtp,
    purpose,
    expiresAt,
  });

  // Cache in Redis for fast verification
  await cacheOtp(email, hashedOtp, 600); // 10 minutes in seconds

  // Set rate limit
  await setOtpRateLimit(email, 60); // 1 minute window

  // Fetch user name for email personalization
  const user = await User.findOne({ email }).select('name');
  const userName = user?.name || email;

  // Send email with correct parameters: (toEmail, fullName, otp, expiresInMinutes)
  await sendOtpEmail(email, userName, plainOtp, 10);
};

export const verifyOtpService = async (
  input: VerifyOtpInput,
  purpose: 'email_verification' | 'password_reset' = 'email_verification'
): Promise<{ verified: boolean; email: string }> => {
  const { email, otp } = input;

  // Get cached OTP from Redis
  const cachedHashedOtp = await getCachedOtp(email);
  if (!cachedHashedOtp) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  // Verify OTP
  const isValid = await verifyOtp(otp, cachedHashedOtp);
  if (!isValid) {
    // Increment attempts in MongoDB
    const otpRecord = await Otp.findOne({ email, purpose, isUsed: false }).sort({ createdAt: -1 });
    if (otpRecord) {
      otpRecord.attempts += 1;
      if (otpRecord.attempts >= 5) {
        throw new AppError('Maximum OTP attempts exceeded. Please request a new OTP.', 400);
      }
      await otpRecord.save();
    }
    throw new AppError('Invalid OTP. Please try again.', 400);
  }

  // Mark OTP as used in MongoDB
  await Otp.updateOne(
    { email, purpose, isUsed: false },
    { isUsed: true }
  );

  // Delete cached OTP
  await deleteCachedOtp(email);

  // If email verification, mark user as verified
  if (purpose === 'email_verification') {
    await User.findOneAndUpdate({ email }, { isEmailVerified: true });
  }

  return { verified: true, email };
};

export const resendOtpService = async (
  input: ResendOtpInput,
  purpose: 'email_verification' | 'password_reset' = 'email_verification'
): Promise<void> => {
  await sendOtpService(input.email, purpose);
};
