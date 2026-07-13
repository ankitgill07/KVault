import { type Response, type NextFunction } from 'express';
import { getSession } from '../services/redisService.js';
import User from '../models/userModel.js';
import { type AuthenticatedRequest } from '../types/type.js';
import { sendError } from '../utils/responseUtil.js';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.cookies.sessionId;    
    if (!sessionId) {
      sendError(res, 'Session missing. Please log in again.', 401);
      return;
    }

    const session = await getSession(sessionId);
    if (!session) {
      sendError(res, 'Session expired. Please log in again.', 401);
      return;
    }

    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Your account has been deactivated. Contact support.', 403);
      return;
    }

    req.user = user;
    req.sessionId = sessionId;
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired session', 401);
  }
};

export const authorize = (...roles: string[]) => {
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

/**
 * Optional authentication middleware.
 * Attempts to load the user from the session cookie, but does NOT
 * reject the request if no session exists. This allows public preview
 * viewers to pass through while still populating req.user for
 * authenticated callers.
 */
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      next();
      return;
    }

    const session = await getSession(sessionId);
    if (!session) {
      next();
      return;
    }

    const user = await User.findById(session.userId).select('-password');
    if (!user || !user.isActive) {
      next();
      return;
    }

    req.user = user;
    req.sessionId = sessionId;
    next();
  } catch {
    // On any error, continue as anonymous rather than failing
    next();
  }
};
