import redis from "@/lib/redis";
import { REDIS_CHANNEL } from "./events.js";

const subscriber = redis.duplicate();

export async function initializeSubscriber(io) {
  console.log("🚀 Subscriber Initializing...");

  await subscriber.subscribe(REDIS_CHANNEL.SUMMARY);

  console.log(`📡 Subscribed to: ${REDIS_CHANNEL.SUMMARY}`);

  subscriber.on("message", (channel, message) => {
    try {
      const payload = JSON.parse(message);

      console.log("Received:", payload);

      io.to(`user:${payload.userId}`).emit(payload.event, payload);

      console.log(`📡 Emitted ${payload.event} -> user:${payload.userId}`);
    } catch (error) {
      console.error("Subscriber Error:", error);
    }
  });
}
