// src/services/auth.service.ts
//
// Pure business logic — zero Express (Request / Response) imports here.
// Every function receives plain data and returns plain data or throws an
// AppError that the controller turns into an HTTP response.
//
// Functions exported:
//   registerUserService
//   loginUserService
//   verifyEmailService
//   resendOtpService
//   loginWithGoogleService
//   refreshTokenService
//   logoutService
//   logoutAllService

import { OAuth2Client } from 'google-auth-library';
import User from '../models/userModel.js';
import Otp from '../models/otpModel.js';
import { OtpPurpose } from '../types/type.js';
import { sendOtpEmail, sendWelcomeEmail } from './emailService.js';
import {
  createSession,
  deleteSession,
  deleteAllUserSessions,
} from './redisService.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwtUtil.js';

import { generateOtp, hashOtp, verifyOtp, getOtpExpiry } from '../utils/optUtil.js';
import { AuthProvider, UserRole } from '../types/type.js';
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ResendOtpInput,
  GoogleLoginInput,
  RefreshTokenInput,
} from '../schemas/authSchem.js';

// ─── Typed Error for business-rule violations ─────────────────────────────────

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ─── Return types ─────────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends TokenPair {
  user: {
    id: string;
    email: string;
    firstName: string;
    role: UserRole;
    avatar: string  | undefined;
    isEmailVerified: boolean;
  };
}

export interface RegisterResult {
  userId: string;
  email: string;
}

// ─── Request meta (IP / UA) passed in from the controller ────────────────────

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

// ─── Shared: create Redis session + sign JWT pair ─────────────────────────────

const issueTokens = async (
  userId: string,
  email: string,
  role: UserRole,
  meta: RequestMeta
): Promise<TokenPair & { sessionId: string }> => {
  const sessionId = await createSession(userId, email, role, meta);
  const accessToken = signAccessToken(userId, email, role, sessionId);
  const refreshToken = signRefreshToken(userId, sessionId);
  return { accessToken, refreshToken, sessionId };
};

// ─── Shared: create OTP record in MongoDB + send email ───────────────────────

const dispatchEmailVerificationOtp = async (
  email: string,
  fullName: string
): Promise<void> => {
  const otpLength = Number(process.env.OTP_LENGTH) || 6;
  const otpExpiry = Number(process.env.OTP_EXPIRES_MINUTES) || 10;

  const plainOtp = generateOtp(otpLength);
  const hashedOtp = await hashOtp(plainOtp);

  await Otp.create({
    email,
    otp: hashedOtp,
    purpose: OtpPurpose.EMAIL_VERIFICATION,
    expiresAt: getOtpExpiry(otpExpiry),
  });

  await sendOtpEmail(email, fullName, plainOtp, otpExpiry);
};

// ─── 1. Register ──────────────────────────────────────────────────────────────

export const registerUserService = async (
  input: RegisterInput
): Promise<RegisterResult> => {
  const { firstName, email, password, role } = input;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Password is hashed by the Mongoose pre-save hook on User model
  const user = await User.create({
    firstName,

    email,
    password,
    role:  UserRole.STUDENT,
    authProvider: AuthProvider.LOCAL,
    isEmailVerified: false,
  });

  await dispatchEmailVerificationOtp(email, `${firstName}`);

  return { userId: user.id as string, email: user.email };
};

// ─── 2. Login ─────────────────────────────────────────────────────────────────

export const loginUserService = async (
  input: LoginInput,
  meta: RequestMeta
): Promise<AuthResult> => {
  const { email, password } = input;

  // Explicitly select password (field has select: false in schema)
  const user = await User.findOne({ email }).select('+password');

  // Use identical error message for wrong email & wrong password
  // to prevent user-enumeration attacks
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.authProvider === AuthProvider.GOOGLE) {
    throw new AppError(
      'This account uses Google Sign-In. Please log in with Google.',
      400
    );
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact support.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Gate login until email is verified; re-send OTP as a convenience
  if (!user.isEmailVerified) {
    await dispatchEmailVerificationOtp(email, user.getFullName());
    throw new AppError(
      'Email not verified. A new OTP has been sent to your email address.',
      403
    );
  }

  const { accessToken, refreshToken } = await issueTokens(
    user.id as string,
    user.email,
    user.role,
    meta
  );

  await User.findByIdAndUpdate(user.id, { lastLoginAt: new Date() });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id as string,
      email: user.email,
      firstName: user.firstName,

      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
    },
  };
};

// ─── 3. Verify Email OTP ──────────────────────────────────────────────────────

export const verifyEmailService = async (
  input: VerifyEmailInput,
  meta: RequestMeta
): Promise<TokenPair> => {
  const { email, otp } = input;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('No account found with this email.', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified.', 400);
  }

  // Fetch the most recent active OTP
  const otpDoc = await Otp.findOne({
    email,
    purpose: OtpPurpose.EMAIL_VERIFICATION,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    throw new AppError(
      'OTP has expired or does not exist. Please request a new one.',
      400
    );
  }

  // Block brute-force: delete OTP after 5 failed attempts
  if (otpDoc.attempts >= 5) {
    await Otp.findByIdAndDelete(otpDoc.id);
    throw new AppError(
      'Too many failed attempts. Please request a new OTP.',
      429
    );
  }

  const isValid = await verifyOtp(otp, otpDoc.otp);
  if (!isValid) {
    await Otp.findByIdAndUpdate(otpDoc.id, { $inc: { attempts: 1 } });
    const remaining = 5 - (otpDoc.attempts + 1);
    throw new AppError(`Invalid OTP. ${remaining} attempt(s) remaining.`, 400);
  }

  // Mark OTP consumed
  await Otp.findByIdAndUpdate(otpDoc.id, { isUsed: true });

  // Activate account
  await User.findByIdAndUpdate(user.id, { isEmailVerified: true });

  // Fire-and-forget welcome email
  sendWelcomeEmail(email, user.getFullName()).catch(console.error);

  // Auto-login after verification
  const { accessToken, refreshToken } = await issueTokens(
    user.id as string,
    user.email,
    user.role,
    meta
  );

  return { accessToken, refreshToken };
};

// ─── 4. Resend OTP ────────────────────────────────────────────────────────────

export const resendOtpService = async (
  input: ResendOtpInput
): Promise<void> => {
  const { email } = input;

  const user = await User.findOne({ email });

  // Return silently if user not found — prevents email enumeration
  if (!user) return;

  if (user.isEmailVerified) {
    throw new AppError('This email is already verified.', 400);
  }

  // Rate limit: 1 OTP per 60 seconds
  const recentOtp = await Otp.findOne({
    email,
    purpose: OtpPurpose.EMAIL_VERIFICATION,
    createdAt: { $gt: new Date(Date.now() - 60_000) },
  });

  if (recentOtp) {
    throw new AppError(
      'Please wait 60 seconds before requesting another OTP.',
      429
    );
  }

  // Invalidate all previous unused OTPs for this email
  await Otp.updateMany(
    { email, purpose: OtpPurpose.EMAIL_VERIFICATION, isUsed: false },
    { isUsed: true }
  );

  await dispatchEmailVerificationOtp(email, user.getFullName());
};

// ─── 5. Login with Google ─────────────────────────────────────────────────────

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginWithGoogleService = async (
  input: GoogleLoginInput,
  meta: RequestMeta
): Promise<AuthResult> => {
  const { idToken } = input;

  // Verify the token Google issued to our client
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID as string,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new AppError('Invalid Google token.', 400);
  }

  const {
    sub: googleId,
    email,
    given_name: firstName = 'Google',
    picture: avatar,
    email_verified,
  } = payload;

  if (!email_verified) {
    throw new AppError('Google account email is not verified.', 400);
  }

  // Upsert: find by googleId first, fall back to email (account linking)
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({
      firstName,
      email,
      googleId,
      avatar: avatar ?? undefined,
      authProvider: AuthProvider.GOOGLE,
      isEmailVerified: true,
      role: UserRole.STUDENT,
    });
  } else if (!user.googleId) {
    // Local account — link Google to it
    await User.findByIdAndUpdate(user.id, {
      googleId,
      isEmailVerified: true,
      ...(avatar && !user.avatar ? { avatar } : {}),
    });
    user = (await User.findById(user.id))!;
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact support.', 403);
  }

  const { accessToken, refreshToken } = await issueTokens(
    user.id as string,
    user.email,
    user.role,
    meta
  );

  await User.findByIdAndUpdate(user.id, { lastLoginAt: new Date() });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id as string,
      email: user.email,
      firstName: user.firstName,

      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
    },
  };
};

// ─── 6. Refresh Token ────────────────────────────────────────────────────────

export const refreshTokenService = async (
  input: RefreshTokenInput,
  meta: RequestMeta
): Promise<TokenPair> => {
  const decoded = verifyRefreshToken(input.refreshToken);

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    throw new AppError('User not found or account is inactive.', 401);
  }

  // Rotate: delete old session, mint a fresh one
  await deleteSession(decoded.sessionId, decoded.userId);

  const { accessToken, refreshToken } = await issueTokens(
    user.id as string,
    user.email,
    user.role,
    meta
  );

  return { accessToken, refreshToken };
};

// ─── 7. Logout (single session) ──────────────────────────────────────────────

export const logoutService = async (
  sessionId: string,
  userId: string
): Promise<void> => {
  await deleteSession(sessionId, userId);
};

// ─── 8. Logout all sessions ──────────────────────────────────────────────────

export const logoutAllService = async (userId: string): Promise<void> => {
  await deleteAllUserSessions(userId);
};