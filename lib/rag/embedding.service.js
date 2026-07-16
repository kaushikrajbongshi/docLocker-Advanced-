import { ai } from "@/lib/ai/gemini";

/**
 * Generate embedding for a piece of text.
 *
 * @param {string} text
 * @returns {Promise<number[]>}
 */

export async function generateEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Text is required.");
  }

  const normalizedText = text.trim();

  if (!normalizedText.length) {
    throw new Error("Text cannot be empty.");
  }

  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: normalizedText,
      config: {
        outputDimensionality: 768,
      },
    });

    if (
      !response.embeddings ||
      response.embeddings.length === 0 ||
      !response.embeddings[0].values
    ) {
      throw new Error("No embedding returned from Gemini.");
    }

    const embedding = response.embeddings[0].values;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("Embedding generation failed.");
    }

    console.log(`✅ Generated embedding (${embedding.length} dimensions)`);

    return {
      vector: embedding,
      dimensions: embedding.length,
      model: "gemini-embedding-2",
    };
  } catch (error) {
    console.error("Embedding Error:", error);

    throw new Error("Failed to generate embedding.");
  }
}
