// downloadPdf + extractText + truncateText
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export async function downloadPdf(fileUrl) {
  console.log("Job: download the pdf");

  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error("Failed to download file");
  const buffer = await response.arrayBuffer();
  return buffer;
}

export async function extractText(pdfBuffer) {
  console.log("Job: extract text from the pdf");

  const uint8Array = new Uint8Array(pdfBuffer);
  const pdf = await pdfjsLib.getDocument({
    data: uint8Array,
  }).promise;

  let text = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    const content = await page.getTextContent();

    text +=
      content.items.map((item) => ("str" in item ? item.str : "")).join(" ") +
      "\n";
  }

  return text.trim();
}

export async function truncateText(text) {
  console.log("Job: truncateText from the pdf");

  if (!text || text.trim().length < 50) {
    throw new Error("No readable text found in this PDF.");
  }

  const maxChars = 12000;
  const truncatedText =
    text.length > maxChars
      ? text.slice(0, maxChars) + "\n\n[Document truncated]"
      : text;

  return truncatedText;
}
