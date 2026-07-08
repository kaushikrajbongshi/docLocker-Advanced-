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

export async function summaryProcessor(job) {
  const document = await findDocument(job.data.documentId);

  try {
    await updateSummaryStatus(document, "processing");
    await job.updateProgress(10); // Started

    const buffer = await downloadPdf(document.fileUrl);
    await job.updateProgress(30); // PDF Downloaded

    const text = await extractText(buffer);
    await job.updateProgress(50); // Text Extracted

    const truncated = await truncateText(text);
    const response = await generateSummary(truncated);

    await job.updateProgress(80); // Gemini Finished
    const result = parseGeminiResponse(response);
    await saveSummary(document, result);
    await setSummaryCache(job.data.documentId, result);

    await job.updateProgress(100); // Completed
  } catch (error) {
    await updateSummaryStatus(document, "failed");
    throw error;
  }
}
