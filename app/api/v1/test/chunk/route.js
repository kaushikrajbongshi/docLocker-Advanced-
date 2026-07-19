import { NextResponse } from "next/server";
import { chunkText } from "@/lib/rag";

export async function POST(request) {
  try {
    const { text } = await request.json();

    const chunks = await chunkText(text);

    return NextResponse.json({
      totalChunks: chunks.length,
      chunks,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
