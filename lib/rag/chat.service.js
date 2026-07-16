import { ai } from "@/lib/ai/gemini";
import { searchSimilarChunks } from "./retrieval.service";

export async function chatWithDocument({ question, topK = 5 }) {
  if (!question?.trim()) {
    throw new Error("Question is required.");
  }

  // Retrieve relevant chunks
  const chunks = await searchSimilarChunks({
    query: question,
    limit: topK,
  });

  if (!chunks.length) {
    return {
      answer: "I couldn't find relevant information in the uploaded documents.",
      sources: [],
    };
  }

  const context = chunks
    .map((chunk, index) => `[Chunk ${index + 1}]\n${chunk.text}`)
    .join("\n\n");

  const prompt = `
                    You are DocLocker AI.

                    Answer ONLY from the provided document context.

                    If the answer is not contained in the context,
                    reply exactly:

                    "I couldn't find that information in the uploaded documents."

                    ------------------------

                    Context

                    ${context}

                    ------------------------

                    Question

                    ${question}
                    `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return {
    answer: response.text,
    sources: chunks.map((chunk) => ({
      documentId: chunk.documentId,
      chunkIndex: chunk.chunkIndex,
      distance: chunk.distance,
    })),
  };
}
