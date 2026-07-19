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

const SIMILARITY_THRESHOLD = 0.45;

export async function searchSimilarChunks({ documentId, query, limit = 5 }) {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  if (!query?.trim()) {
    throw new Error("Query is required.");
  }

  const embeddingResult = await generateEmbedding(query);

  const vector = `[${embeddingResult.vector.join(",")}]`;

  const rows = await prisma.$queryRaw`
                                        WITH ranked_chunks AS (
                                            SELECT
                                            id,
                                            "documentId",
                                            "chunkIndex",
                                            text,
                                            model,
                                            dimensions,
                                            embedding <=> ${vector}::vector AS distance
                                            FROM "DocumentChunk"
                                            WHERE "documentId" = ${documentId}
                                        )
                                        SELECT *
                                        FROM ranked_chunks
                                        WHERE distance <= ${SIMILARITY_THRESHOLD}
                                        ORDER BY distance
                                        LIMIT ${limit};
                                        `;

  return rows;
}
