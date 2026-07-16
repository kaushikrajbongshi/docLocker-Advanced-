import { prisma } from "@/lib/prisma/prisma";

export async function saveChunk({ documentId, chunkIndex, text, embedding }) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }
  if (!Number.isInteger(chunkIndex)) {
    throw new Error("Invalid chunk index.");
  }
  if (!text?.trim()) {
    throw new Error("Chunk text is required.");
  }
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("Embedding is required.");
  }

  const vector = `[${embedding.join(",")}]`;

  const rows = await prisma.$queryRaw`
    INSERT INTO "DocumentChunk" (
      id, "documentId", "chunkIndex", text, embedding, model, dimensions, "createdAt", "updatedAt"
    )
    VALUES (
      gen_random_uuid(), ${documentId}, ${chunkIndex}, ${text}, ${vector}::vector,
      'gemini-embedding-2', ${embedding.length}, now(), now()
    )
    ON CONFLICT ("documentId", "chunkIndex")
    DO UPDATE SET text = EXCLUDED.text, embedding = EXCLUDED.embedding, "updatedAt" = now()
    RETURNING id, "documentId", "chunkIndex", text, model, dimensions, "createdAt", "updatedAt"
  `;

  return rows[0];
}

export async function saveChunks(documentId, chunks) {
  const savedChunks = [];
  for (const chunk of chunks) {
    const saved = await saveChunk({
      documentId,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      embedding: chunk.embedding,
    });
    savedChunks.push(saved);
  }
  return savedChunks;
}
