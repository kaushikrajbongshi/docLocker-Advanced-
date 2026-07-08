import { Queue } from "bullmq";
import connection from "../config/connection";

export const summaryQueue = new Queue("summaryQueue", { connection });
