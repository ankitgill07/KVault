// src/utils/jwt.util.ts

import jwt from 'jsonwebtoken';
import { type JwtAccessPayload, type JwtRefreshPayload, UserRole } from '../types/type.js';

// ─── Sign Access Token ────────────────────────────────────────────────────────

export const signAccessToken = (
  userId: string,
  email: string,
  role: UserRole,
  sessionId: string
): string => {
  const payload: JwtAccessPayload = { userId, email, role, sessionId };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  } as jwt.SignOptions);
};

// ─── Sign Refresh Token ───────────────────────────────────────────────────────

export const signRefreshToken = (
  userId: string,
  sessionId: string
): string => {
  const payload: JwtRefreshPayload = { userId, sessionId };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

// ─── Verify Access Token ──────────────────────────────────────────────────────

export const verifyAccessToken = (token: string): JwtAccessPayload => {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET as string
  ) as JwtAccessPayload;
};

// ─── Verify Refresh Token ─────────────────────────────────────────────────────

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET as string
  ) as JwtRefreshPayload;
};