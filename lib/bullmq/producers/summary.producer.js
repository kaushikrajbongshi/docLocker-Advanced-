import { summaryQueue } from "../queues/summary.queue";
import { publish } from "@/lib/socket/publisher";
import { REDIS_CHANNELS, SOCKET_EVENTS  } from "@/lib/socket/events";



export async function addSummaryJob(documentId, userId) {
  console.log("📤 Producer: Adding job", documentId);

  const job = await summaryQueue.add(
    "summary-pdf",
    { documentId },
    {
      jobId: documentId,
      attempts: 3,
      removeOnComplete: {
        age: 3600,
        count: 1000,
      },
      removeOnFail: {
        age: 86400,
        count: 500,
      },
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    },
  );

  console.log("✅ Producer: Job created", job.id);

  await publish(REDIS_CHANNELS.SUMMARY, {
  event: SOCKET_EVENTS.SUMMARY_QUEUED,
  userId,
  documentId,
  status: "queued",
  timestamp: Date.now(),
});

  return job;
}
