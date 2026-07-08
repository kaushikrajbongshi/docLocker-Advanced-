import { summaryQueue } from "../queues/summary.queue";

export async function addSummaryJob(documentId) {
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
    }
  );

  console.log("✅ Producer: Job created", job.id);

  return job;
}
