import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const DEFAULT_OPTIONS = {
  chunkSize: 1000,
  chunkOverlap: 200,
};

export async function chunkText(text, options = {}) {
  if (!text || typeof text !== "string") {
    throw new Error("Document text is required.");
  }

  if (text.trim().length === 0) {
    throw new Error("Document text is empty.");
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options.chunkSize ?? DEFAULT_OPTIONS.chunkSize,
    chunkOverlap: options.chunkOverlap ?? DEFAULT_OPTIONS.chunkOverlap,
    addStartIndex: true,
    separators: ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " ", ""],
  });

  const chunks = await splitter.createDocuments([text]);

  return chunks.map((chunk, index) => ({
    chunkIndex: index,
    text: chunk.pageContent,
    metadata: {
      length: chunk.pageContent.length,
    },
  }));
}
