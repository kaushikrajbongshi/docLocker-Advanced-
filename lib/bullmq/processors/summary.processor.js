import {
  findDocument,
  saveSummary,
  updateSummaryStatus,
} from "@/lib/services/summary/document.service";
import {
  generateSummary,
  parseGeminiResponse,
} from "@/lib/services/ai/gemini.service";
import {
  downloadPdf,
  extractText,
  truncateText,
} from "@/lib/services/summary/pdf.service";

import { setSummaryCache } from "@/lib/cache/summaryCache";
import { publish } from "@/lib/socket/publisher";
import { REDIS_CHANNELS, SOCKET_EVENTS } from "@/lib/socket/events";

export async function summaryProcessor(job) {
  const document = await findDocument(job.data.documentId);
  const truncated = job.data.truncated;

  // Common Payload
  const payload = {
    userId: document.userId.toString(),
    documentId: document._id.toString(),
  };

  // Publish Status Event
  const publishStatus = async (event, status, data = {}) => {
    await publish(REDIS_CHANNELS.SUMMARY, {
      ...payload,
      event,
      status,
      timestamp: Date.now(),
      data,
    });
  };

  // Publish Progress Event
  const publishProgress = async (progress) => {
    await publish(REDIS_CHANNELS.SUMMARY, {
      ...payload,
      event: SOCKET_EVENTS.SUMMARY_PROGRESS,
      progress,
      timestamp: Date.now(),
    });
  };

  try {
    // ==========================
    // Processing Started
    // ==========================
    await updateSummaryStatus(document, "processing");

    await publishStatus(SOCKET_EVENTS.SUMMARY_PROCESSING, "processing");

    await job.updateProgress(10);
    await publishProgress(10);

    await job.updateProgress(30);
    await publishProgress(30);

    await job.updateProgress(50);
    await publishProgress(50);

    // ==========================
    // Generate AI Summary
    // ==========================

    const response = await generateSummary(truncated);

    await job.updateProgress(80);
    await publishProgress(80);

    const result = parseGeminiResponse(response);

    // ==========================
    // Save Summary
    // ==========================
    await saveSummary(document, result);

    await setSummaryCache(job.data.documentId, result);

    await publishStatus(SOCKET_EVENTS.SUMMARY_COMPLETED, "completed", {
      summary: result,
    });

    await job.updateProgress(100);
    await publishProgress(100);
  } catch (error) {
    await updateSummaryStatus(document, "failed");

    await publishStatus(SOCKET_EVENTS.SUMMARY_FAILED, "failed", {
      message: error.message,
    });

    throw error;
  }
}
