import {Redis} from "ioredis";

let redisClient: ReturnType<typeof createRedis> | null = null;

function createRedis() {
  return new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    retryStrategy(times) {
      return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: 3,
  });
}

export function connectRedis() {
  if (redisClient) return redisClient;

  redisClient = createRedis();

  redisClient.on("connect", () => {
    console.log("✅ Redis Connected");
  });

  redisClient.on("error", (err: Error) => {
    console.error("❌ Redis Error:", err.message);
  });

  redisClient.on("reconnecting", () => {
    console.log("⚠️ Redis reconnecting...");
  });

  return redisClient;
}

export default connectRedis;