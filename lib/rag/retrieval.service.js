import { prisma } from "@/lib/prisma/prisma";
import { generateEmbedding } from "./embedding.service";

/**
 * Search for similar document chunks using cosine similarity.
 *
 * @param {Object} options
 * @param {string} options.query
 * @param {number} [options.limit=5]
 * @returns {Promise<Array>}
 */

export async function searchSimilarChunks({ query, limit = 5 }) {
  if (!query?.trim()) {
    throw new Error("Query is required.");
  }

  // Generate embedding for the user's question
  const embeddingResult = await generateEmbedding(query);

  // Convert JS array → PostgreSQL vector
  const vector = `[${embeddingResult.vector.join(",")}]`;

  // Perform cosine similarity search
  const rows = await prisma.$queryRaw`
    SELECT
      id,
      "documentId",
      
      "chunkIndex",
      text,
      model,
      dimensions,
      embedding <=> ${vector}::vector AS distance
    FROM "DocumentChunk"
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${limit};
  `;

  return rows;
}