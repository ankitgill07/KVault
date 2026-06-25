// src/services/session.service.ts
//
// All Redis session operations are here.
// Sessions are stored as hashes: session:{sessionId}

import { v4 as uuidv4 } from "uuid";
import connectRedis from "../db/redisdb.js";
import { type SessionData, UserRole } from "../types/type.js";

const redis = connectRedis();

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_PREFIX = "session:";
const USER_SESSIONS_PREFIX = "user_sessions:"; // Set of session IDs per user
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sessionKey = (id: string) => `${SESSION_PREFIX}${id}`;
const userSessionsKey = (userId: string) => `${USER_SESSIONS_PREFIX}${userId}`;

// ─── Create Session ───────────────────────────────────────────────────────────

export const createSession = async (
  userId: string,
  email: string,
  role: UserRole,
  meta?: { ipAddress?: string; userAgent?: string },
): Promise<string> => {
  const sessionId = uuidv4();
  const now = Date.now();

  const sessionData: SessionData = {
    userId,
    email,
    role,
    createdAt: now,
    lastActive: now,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  };

  // Store session as a flat hash in Redis
  await redis.hset(
    sessionKey(sessionId),
    sessionData as unknown as Record<string, string>,
  );
  await redis.expire(sessionKey(sessionId), SESSION_TTL);

  // Track all sessions for this user (so we can revoke them all on logout-all)
  await redis.sadd(userSessionsKey(userId), sessionId);
  await redis.expire(userSessionsKey(userId), SESSION_TTL);

  return sessionId;
};

// ─── Get Session ─────────────────────────────────────────────────────────────

export const getSession = async (
  sessionId: string,
): Promise<SessionData | null> => {
  const data = await redis.hgetall(sessionKey(sessionId));

  if (!data || Object.keys(data).length === 0) return null;

  // Touch last-active timestamp
  await redis.hset(sessionKey(sessionId), "lastActive", Date.now());

  return {
    userId: data.userId,
    email: data.email,
    role: data.role as UserRole,
    createdAt: Number(data.createdAt),
    lastActive: Number(data.lastActive),
    ipAddress: data.ipAddress || undefined,
    userAgent: data.userAgent || undefined,
  };
};

// ─── Delete Session (single logout) ──────────────────────────────────────────

export const deleteSession = async (
  sessionId: string,
  userId?: string,
): Promise<void> => {
  await redis.del(sessionKey(sessionId));

  if (userId) {
    await redis.srem(userSessionsKey(userId), sessionId);
  }
};

// ─── Delete All Sessions for a User (logout-all / account deactivation) ──────

export const deleteAllUserSessions = async (userId: string): Promise<void> => {
  const sessionIds = await redis.smembers(userSessionsKey(userId));

  if (sessionIds.length > 0) {
    const pipeline = redis.pipeline();
    sessionIds.forEach((id: string) => pipeline.del(sessionKey(id)));
    pipeline.del(userSessionsKey(userId));
    await pipeline.exec();
  }
};

// ─── List User's Active Sessions ─────────────────────────────────────────────

export const getUserSessions = async (userId: string): Promise<string[]> => {
  return redis.smembers(userSessionsKey(userId));
};

// ─── OTP: Store in Redis (temporary, with short TTL) ─────────────────────────
// NOTE: We also store OTPs in MongoDB (Otp.model.ts) as the source of truth.
// Redis provides fast lookups and rate-limiting.

const OTP_PREFIX = "otp:";
const OTP_RATE_PREFIX = "otp_rate:";

export const setOtpRateLimit = async (
  email: string,
  windowSeconds: number = 60,
): Promise<void> => {
  const key = `${OTP_RATE_PREFIX}${email}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
};

export const getOtpRateLimit = async (email: string): Promise<number> => {
  const val = await redis.get(`${OTP_RATE_PREFIX}${email}`);
  return val ? parseInt(val, 10) : 0;
};

export const cacheOtp = async (
  email: string,
  hashedOtp: string,
  ttlSeconds: number,
): Promise<void> => {
  await redis.setex(`${OTP_PREFIX}${email}`, ttlSeconds, hashedOtp);
};

export const getCachedOtp = async (email: string): Promise<string | null> => {
  return redis.get(`${OTP_PREFIX}${email}`);
};

export const deleteCachedOtp = async (email: string): Promise<void> => {
  await redis.del(`${OTP_PREFIX}${email}`);
};
