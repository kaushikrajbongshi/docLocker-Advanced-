import { NextResponse } from "next/server";
import { generateEmbedding, saveChunk } from "@/lib/rag";

export async function POST(req) {
  try {
    const { text } = await req.json();

    const embeddingResult = await generateEmbedding(text);

    const chunk = await saveChunk({
      documentId: "test-document-zubeen",
      chunkIndex: 0,
      text,
      embedding: embeddingResult.vector,
      model: embeddingResult.model,
      dimensions: embeddingResult.dimensions,
    });

    return NextResponse.json({
      success: true,
      chunk,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}