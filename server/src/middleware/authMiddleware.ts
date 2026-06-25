// src/middleware/auth.middleware.ts

import { type Response, type NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwtUtil.js';
import { getSession } from '../services/redisService.js';
import User from '../models/userModel.js';
import { type AuthenticatedRequest, UserRole } from '../types/type.js';
import { sendError } from '../utils/responseUtil.js';

// ─── Authenticate: verify JWT + validate Redis session ────────────────────────

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access token is missing', 401);
      return;
    }

    const token = authHeader.split(' ')[1] as string;
    const decoded = verifyAccessToken(token);

    // Validate session still exists in Redis
    const session = await getSession(decoded.sessionId);
    if (!session) {
      sendError(res, 'Session expired. Please log in again.', 401);
      return;
    }

    // Load user from DB
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Your account has been deactivated. Contact support.', 403);
      return;
    }

    req.user = user;
    req.sessionId = decoded.sessionId;
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired access token', 401);
  }
};

// ─── Authorize: restrict to specific roles ────────────────────────────────────

export const authorize = (...roles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Required role: ${roles.join(' or ')}`,
        403
      );
      return;
    }

    next();
  };
};

// ─── Require Email Verified ───────────────────────────────────────────────────

export const requireEmailVerified = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isEmailVerified) {
    sendError(
      res,
      'Please verify your email address before proceeding.',
      403
    );
    return;
  }
  next();
};