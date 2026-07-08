// utils/db.js

import mongoose from "mongoose";
import dns from "dns";

// Fix: Use public DNS servers to resolve MongoDB Atlas SRV records
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const MONGODB_URI = process.env.MONGODB_URI_ATLAS;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI_ATLAS environment variable"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function db() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Connecting to MongoDB Atlas...");

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((mongoose) => {
        console.log("✅ MongoDB Atlas Connected");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB Connection Error:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default db;