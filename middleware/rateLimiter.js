import redis from "@/lib/redis";
import { RateLimiterRedis } from "rate-limiter-flexible";

export const otpLimiter = new RateLimiterRedis({
  storeClient: redis,
  key: "otp",
  points: 3,
  duration: 600,
});

export const summarizeLimiter = new RateLimiterRedis({
  storeClient: redis,
  key: "summarize",
  points: 5,
  duration: 3600,
});

export const test = new RateLimiterRedis({
  storeClient: redis,
  key: "test",
  points: 5,
  duration: 3600,
});
