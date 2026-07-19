import {
  downloadPdf,
  extractText,
  truncateText,
} from "@/lib/services/summary/pdf.service";

//Common work

export async function processDocument(fileUrl) {
  // ==========================
  // Download PDF
  // ==========================
  const buffer = await downloadPdf(fileUrl);
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

  return {
    text,
    truncated,
  };
}
