import {
  saveSummary,
  updateSummaryStatus,
} from "@/lib/services/summary/document.service";

import {
  downloadPdf,
  extractText,
  truncateText,
} from "@/lib/services/summary/pdf.service";

import {
  generateSummary,
  parseGeminiResponse,
} from "@/lib/services/ai/gemini.service";

import { setSummaryCache } from "@/lib/cache/summaryCache";

export async function generateSummarySync(document) {
  console.log("Synchronus function");

  try {
    // ==========================
    // Processing
    // ==========================
    await updateSummaryStatus(document, "processing");

    // ==========================
    // Download PDF
    // ==========================
    const buffer = await downloadPdf(document.fileUrl);
    console.log("download done");

    // ==========================
    // Extract Text
    // ==========================
    const text = await extractText(buffer);
    console.log("extract text done");

    // ==========================
    // Truncate
    // ==========================
    const truncated = await truncateText(text);
    console.log("truncated text done");

    // ==========================
    // Gemini
    // ==========================
    const response = await generateSummary(truncated);
    console.log("gemini response done");

    const result = parseGeminiResponse(response);
    console.log("result done");

    // ==========================
    // Save Summary
    // ==========================
    await saveSummary(document, result);
    console.log("save summary in db done");

    // ==========================
    // Cache
    // ==========================
    await setSummaryCache(document._id.toString(), {
      summary: result.summary,
      keyPoints: result.keyPoints,
      status: "done",
    });

    console.log("cache done");

    return result;
  } catch (error) {
    await updateSummaryStatus(document, "failed");
    throw error;
  }
}
