import redis from "@/lib/redis";
import { REDIS_CHANNEL } from "./events";

export async function publish(channel, payload) {
  try {
    await redis.publish(channel, JSON.stringify(payload));
    console.log(`📤 Published -> ${channel}`);
  } catch (error) {
    console.error("Redis Publish Error:", error);
  }
}
