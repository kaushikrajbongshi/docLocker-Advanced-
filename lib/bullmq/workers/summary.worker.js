import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import connectDB from "../../mongodb";
import connection from "../config/connection";
import { summaryProcessor } from "../processors/summary.processor";
import { Worker } from "bullmq";

async function startWorker() {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    const worker = new Worker("summaryQueue", summaryProcessor, {
      connection,
    });

    worker.on("completed", (job) => {
      console.log(`✅ Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
      console.error(`❌ Job ${job?.id} failed`);
      console.error(err);
    });
  } catch (error) {
    console.error("❌ Worker startup failed:", error);
    process.exit(1);
  }
}

startWorker();