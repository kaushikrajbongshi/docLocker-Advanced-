// findDocument + saveSummary + updateSummaryStatus

import Document from "@/model/Document";

export async function findDocument(documentId) {
  console.log("Job: find doc in mongodb");

  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error("Document not found");
  }
  return document;
}

export async function saveSummary(document, result) {
  console.log("Job: save summary in db");

  document.summary = result.summary;
  document.keyPoints = result.keyPoints || [];
  document.summaryStatus = "done";
  document.summaryGeneratedAt = new Date();
  await document.save();
}

export async function updateSummaryStatus(document, status) {
  console.log("Job: update summary status");

  document.summaryStatus = status;
  await document.save();
}
