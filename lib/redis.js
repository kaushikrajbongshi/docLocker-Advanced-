import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

try {
  redis.on("connect", () => {
    console.log("Redis Connected sucessfully");
  });

  redis.on("ready", () => {
    console.log("Redis Ready");
  });

  redis.on("error", (err) => {
    console.log("Redis Connection failed!", err);
  });
} catch (error) {
  console.error("Redis:", error);
}

export default redis;
