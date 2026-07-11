import redis from "../redis.js";
import { REDIS_CHANNELS } from "./events.js";

const subscriber = redis.duplicate();

export async function initializeSubscriber(io) {
  console.log("🚀 Subscriber Initializing...");

  await subscriber.subscribe(REDIS_CHANNELS.SUMMARY);

  console.log(`📡 Subscribed to: ${REDIS_CHANNELS.SUMMARY}`);

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
