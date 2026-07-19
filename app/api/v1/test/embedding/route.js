import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/rag";

export async function POST(req) {
  try {
    const { text } = await req.json();

    const embedding = await generateEmbedding(text);

    return NextResponse.json({
      success: true,
      dimensions: embedding.length,
      embedding,
    });
  } catch (error) {
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