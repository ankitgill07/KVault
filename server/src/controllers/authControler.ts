import {type Request, type Response } from 'express';
import User from '../models/userModel.js';
import {
  registerUserService, loginUserService, logoutService, logoutAllService,
  sendOtpService, verifyOtpService, resendOtpService,
} from '../services/authService.js';
import { createSession } from '../services/redisService.js';
import { sendSuccess, sendError } from '../utils/responseUtil.js';
import { type AuthenticatedRequest } from '../types/type.js';
import type { RegisterInput, LoginInput, VerifyOtpInput, ResendOtpInput } from '../schemas/authSchem.js';
import { AppError } from '../utils/appError.js';

const getRequestMeta = (req: Request) => ({
  ipAddress: req.ip as string,
  userAgent: req.get('user-agent') as string,
});

const handleError = (error: unknown, res: Response, tag: string): void => {
  if (error instanceof AppError) {
    sendError(res, error.message, error.statusCode);
    return;
  }
  console.error(`[${tag}]`, error);
  sendError(res, 'Something went wrong. Please try again later.', 500);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as RegisterInput;
    const result = await registerUserService(input);
    sendSuccess(res, 'Registration successful! Your account is ready.', result, 201);
  } catch (error) { handleError(error, res, 'register'); }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as LoginInput;
    const result = await loginUserService(input, getRequestMeta(req));
    sendSuccess(res, 'Login successful', { sessionId: result.sessionId, user: result.user });
  } catch (error) { handleError(error, res, 'login'); }
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email: string };
    await sendOtpService(email, 'email_verification');
    sendSuccess(res, 'OTP sent successfully to your email.');
  } catch (error) { handleError(error, res, 'sendOtp'); }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as VerifyOtpInput;
    const result = await verifyOtpService(input, 'email_verification');

    // After email verification, create session and log user in automatically
    const user = await User.findOne({ email: result.email });
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const sessionId = await createSession(
      user.id as string,
      { ipAddress: req.ip as string, userAgent: req.get('user-agent') as string }
    );

    await User.findByIdAndUpdate(user.id, { lastLoginAt: new Date() });

    // Set session cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 14 * 1000, // 14 days
    });

    sendSuccess(res, 'Email verified successfully!', {
      sessionId,
      user: {
        id: user.id as string,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      }
    });
  } catch (error) { handleError(error, res, 'verifyOtp'); }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as ResendOtpInput;
    await resendOtpService({ email }, 'email_verification');
    sendSuccess(res, 'OTP resent successfully to your email.');
  } catch (error) { handleError(error, res, 'resendOtp'); }
};

export const googleLogin = async (_req: Request, res: Response): Promise<void> => {
  sendError(res, 'Google login is not available.', 400);
};

export const refreshToken = async (_req: Request, res: Response): Promise<void> => {
  sendError(res, 'Token refresh is not available.', 400);
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.sessionId && req.user?.id) await logoutService(req.sessionId, req.user.id as string);
    res.clearCookie('sessionId');
    sendSuccess(res, 'Logged out successfully.');
  } catch (error) { handleError(error, res, 'logout'); }
};

export const logoutAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.id) await logoutAllService(req.user.id as string);
    res.clearCookie('sessionId');
    sendSuccess(res, 'Logged out from all devices.');
  } catch (error) { handleError(error, res, 'logoutAll'); }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try { sendSuccess(res, 'Profile fetched', { user: req.user }); }
  catch (error) { handleError(error, res, 'getMe'); }
};
