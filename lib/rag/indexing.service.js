import { chunkText } from "./chunk.service";
import { generateEmbedding } from "./embedding.service";
import { saveChunk } from "./vector.service";

export async function indexDocument({ documentId, text }) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  if (!text?.trim()) {
    throw new Error("Document text is required.");
  }

  console.log("Chunking document...");

  const chunks = await chunkText(text);

  console.log(`Generated ${chunks.length} chunks.`);

  for (const chunk of chunks) {
    const embeddingResult = await generateEmbedding(chunk.text);

    await saveChunk({
      documentId,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      embedding: embeddingResult.vector,
      model: embeddingResult.model,
      dimensions: embeddingResult.dimensions,
    });
  }

  console.log("Rag Done");

  // return {
  //   totalChunks: chunks.length,
  // };
}
