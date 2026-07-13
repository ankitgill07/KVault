import { v4 as uuidv4 } from "uuid";
import connectRedis from "../db/redisdb.js";

const redis = connectRedis();

const SESSION_PREFIX = "session:";
const SESSION_TTL = 60 * 60 * 24 * 14; // 14 days

const OTP_PREFIX = "otp:";
const OTP_RATE_PREFIX = "otp_rate:";

// ─── Internal Helper ──────────────────────────────────────────────────────────

const sessionKey = (sessionId: string) => `${SESSION_PREFIX}${sessionId}`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionEntry {
  userId: string;
  ipAddress: string | undefined;
  userAgent: string | undefined;
  lastActive: string | number;
}

// ─── Create Session ───────────────────────────────────────────────────────────

export const createSession = async (
  userId: string,
  meta?: { ipAddress?: string; userAgent?: string },
): Promise<string> => {
  const sessionId = uuidv4();

  await redis.hset(sessionKey(sessionId), {
    userId,
    ipAddress: meta?.ipAddress ?? "",
    userAgent: meta?.userAgent ?? "",
    lastActive: Date.now().toString(),
  });

  await redis.expire(sessionKey(sessionId), SESSION_TTL);

  return sessionId;
};

// ─── Get Session ──────────────────────────────────────────────────────────────

export const getSession = async (
  sessionId: string,
): Promise<SessionEntry | null> => {
  const key = sessionKey(sessionId);

  const entry = await redis.hgetall(key);

  if (Object.keys(entry).length === 0) {
    return null;
  }

  const lastActive = Date.now();

  await redis.hset(key, "lastActive", lastActive.toString());
  await redis.expire(key, SESSION_TTL);

  return {
    userId: entry.userId as string,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
    lastActive,
  };
};

// ─── Delete Session (logout) ──────────────────────────────────────────────────

export const deleteSession = async (sessionId: string): Promise<void> => {
  await redis.del(sessionKey(sessionId));
};

export const deleteAllUserSessions = async (userId: string): Promise<void> => {
  const matchedKeys: string[] = [];
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      `${SESSION_PREFIX}*`,
      "COUNT",
      "100",
    );

    cursor = nextCursor;

    for (const key of keys) {
      const storedUserId = await redis.hget(key, "userId");

      if (storedUserId === userId) {
        matchedKeys.push(key);
      }
    }
  } while (cursor !== "0");

  if (matchedKeys.length > 0) {
    await redis.del(matchedKeys);
  }
};

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

// ─── Active Video Stream Tracking ─────────────────────────────────────────────

const STREAM_PREFIX = "active_stream:";
const STREAM_TTL = 45; // seconds — heartbeat renews this

export type ConcurrentPolicy = "evict" | "reject";

interface StreamInfo {
  lessonId: string;
  startedAt: string;
}

/**
 * Returns all active stream session IDs for a user.
 */
export const getActiveStreamsForUser = async (
  userId: string,
): Promise<{ streamSessionId: string; info: StreamInfo }[]> => {
  const pattern = `${STREAM_PREFIX}${userId}:*`;
  const streams: { streamSessionId: string; info: StreamInfo }[] = [];
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      "50",
    );
    cursor = nextCursor;

    for (const key of keys) {
      const data = await redis.hgetall(key);
      if (data && data.lessonId) {
        const streamSessionId = key.replace(`${STREAM_PREFIX}${userId}:`, "");
        streams.push({
          streamSessionId,
          info: {
            lessonId: data.lessonId,
            startedAt: data.startedAt || "",
          },
        });
      }
    }
  } while (cursor !== "0");

  return streams;
};

/**
 * Registers a new active stream. Enforces the concurrent stream limit.
 * Throws an error with message "CONCURRENT_LIMIT_EXCEEDED" if the policy
 * is "reject" and the limit is exceeded.
 */
export const registerActiveStream = async (
  userId: string,
  streamSessionId: string,
  lessonId: string,
  limit: number = 2,
  policy: ConcurrentPolicy = "evict",
): Promise<void> => {
  const active = await getActiveStreamsForUser(userId);

  if (active.length >= limit) {
    if (policy === "reject") {
      throw new Error("CONCURRENT_LIMIT_EXCEEDED");
    }

    // Evict oldest stream(s) until we're under the limit
    const sorted = active.sort(
      (a, b) => Number(a.info.startedAt) - Number(b.info.startedAt),
    );
    const toEvict = sorted.slice(0, active.length - limit + 1);
    for (const stream of toEvict) {
      await redis.del(`${STREAM_PREFIX}${userId}:${stream.streamSessionId}`);
    }
  }

  const key = `${STREAM_PREFIX}${userId}:${streamSessionId}`;
  await redis.hset(key, {
    lessonId,
    startedAt: Date.now().toString(),
  });
  await redis.expire(key, STREAM_TTL);
};

/**
 * Refreshes the TTL of an active stream (heartbeat).
 * Returns true if the stream still exists, false if it was evicted/expired.
 */
export const refreshStreamHeartbeat = async (
  userId: string,
  streamSessionId: string,
): Promise<boolean> => {
  const key = `${STREAM_PREFIX}${userId}:${streamSessionId}`;
  const exists = await redis.exists(key);
  if (!exists) return false;

  await redis.expire(key, STREAM_TTL);
  return true;
};

/**
 * Explicitly removes an active stream session.
 */
export const deleteStreamSession = async (
  userId: string,
  streamSessionId: string,
): Promise<void> => {
  await redis.del(`${STREAM_PREFIX}${userId}:${streamSessionId}`);
};
