// downloadPdf + extractText + truncateText

import pdfParse from "pdf-parse";

export async function downloadPdf(fileUrl) {
  console.log("Job: download the pdf");

  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error("Failed to download file");
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function extractText(pdfBuffer) {
  console.log("Job: extract text from the pdf");

  try {
    const parsed = await pdfParse(pdfBuffer);

    return parsed.text.trim();
  } catch (error) {
    throw new Error(
      "Could not extract text. The PDF may be scanned or corrupted."
    );
  }
}

export async function truncateText(text) {
  console.log("Job: truncateText from the pdf");

  if (!text || text.trim().length < 50) {
    throw new Error("No readable text found in this PDF.");
  }

  const maxChars = 12000;

  return text.length > maxChars
    ? text.slice(0, maxChars) + "\n\n[Document truncated]"
    : text;
}