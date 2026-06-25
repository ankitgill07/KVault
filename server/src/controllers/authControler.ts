// src/controllers/auth.controller.ts
//
// Thin HTTP layer — every method does exactly three things:
//   1. Pull validated data from req.body  (Zod already ran via validateBody)
//   2. Call the matching auth service function
//   3. Send a success response  (or let the error flow to errorHandler)
//
// No business logic lives here.

import {type Request,type Response, type NextFunction } from 'express';
import {
  registerUserService,
  loginUserService,
  verifyEmailService,
  resendOtpService,
  loginWithGoogleService,
  refreshTokenService,
  logoutService,
  logoutAllService,
  AppError,
} from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/responseUtil.js';
import { type AuthenticatedRequest } from '../types/type.js';
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ResendOtpInput,
  GoogleLoginInput,
  RefreshTokenInput,
} from '../schemas/authSchem.js';

// ─── Meta helper (IP + User-Agent) ───────────────────────────────────────────

const getRequestMeta = (req: Request) => ({
  ipAddress: req.ip as string,
  userAgent: req.get('user-agent')  as string,
});

// ─── Error handler helper: turns AppError → HTTP, anything else → 500 ─────────

const handleError = (error: unknown, res: Response, tag: string): void => {
  if (error instanceof AppError) {
    sendError(res, error.message, error.statusCode);
    return;
  }
  console.error(`[${tag}]`, error);
  sendError(res, 'Something went wrong. Please try again later.', 500);
};

// ─── 1. POST /api/auth/register ───────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as RegisterInput;
    const result = await registerUserService(input);

    sendSuccess(
      res,
      'Registration successful! Please check your email for the OTP to verify your account.',
      result,
      201
    );
  } catch (error) {
    handleError(error, res, 'register');
  }
};

// ─── 2. POST /api/auth/login ──────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as LoginInput;
    const result = await loginUserService(input, getRequestMeta(req));

    sendSuccess(res, 'Login successful', result);
  } catch (error) {
    handleError(error, res, 'login');
  }
};

// ─── 3. POST /api/auth/verify-email ──────────────────────────────────────────

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as VerifyEmailInput;
    const result = await verifyEmailService(input, getRequestMeta(req));

    sendSuccess(res, 'Email verified successfully! Welcome to LMS.', result);
  } catch (error) {
    handleError(error, res, 'verifyEmail');
  }
};

// ─── 4. POST /api/auth/resend-otp ─────────────────────────────────────────────

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as ResendOtpInput;
    await resendOtpService(input);

    // Generic message regardless of whether the email existed — prevents enumeration
    sendSuccess(res, 'If an account exists, a new OTP has been sent to that email.');
  } catch (error) {
    handleError(error, res, 'resendOtp');
  }
};

// ─── 5. POST /api/auth/google ─────────────────────────────────────────────────

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as GoogleLoginInput;
    const result = await loginWithGoogleService(input, getRequestMeta(req));

    sendSuccess(res, 'Google login successful', result);
  } catch (error) {
    handleError(error, res, 'googleLogin');
  }
};

// ─── 6. POST /api/auth/refresh-token ─────────────────────────────────────────

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as RefreshTokenInput;
    const result = await refreshTokenService(input, getRequestMeta(req));

    sendSuccess(res, 'Tokens refreshed successfully', result);
  } catch (error) {
    // verifyRefreshToken throws a plain JWT error — treat as 401
    if (error instanceof AppError) {
      sendError(res, error.message, error.statusCode);
    } else {
      sendError(res, 'Invalid or expired refresh token.', 401);
    }
  }
};

// ─── 7. POST /api/auth/logout ────────────────────────────────────────────────

export const logout = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.sessionId && req.user?.id) {
      await logoutService(req.sessionId, req.user.id as string);
    }
    sendSuccess(res, 'Logged out successfully.');
  } catch (error) {
    handleError(error, res, 'logout');
  }
};

// ─── 8. POST /api/auth/logout-all ────────────────────────────────────────────

export const logoutAll = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.id) {
      await logoutAllService(req.user.id as string);
    }
    sendSuccess(res, 'Logged out from all devices successfully.');
  } catch (error) {
    handleError(error, res, 'logoutAll');
  }
};

// ─── 9. GET /api/auth/me ─────────────────────────────────────────────────────

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    sendSuccess(res, 'Profile fetched successfully', { user: req.user });
  } catch (error) {
    handleError(error, res, 'getMe');
  }
};