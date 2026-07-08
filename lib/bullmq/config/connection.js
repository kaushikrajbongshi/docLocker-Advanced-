import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("BullMQ Redis Connecting...");
});

connection.on("ready", () => {
  console.log("BullMQ Redis Ready.");
});

connection.on("error", (err) => {
  console.error("BullMQ Redis Error:", err);
});

connection.on("close", () => {
  console.warn("BullMQ Redis Connection Closed");
});

connection.on("reconnecting", () => {
  console.warn("BullMQ Redis Reconnecting...");
});

export default connection;
