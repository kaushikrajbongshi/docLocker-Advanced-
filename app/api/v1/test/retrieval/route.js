import { NextResponse } from "next/server";
import { searchSimilarChunks } from "@/lib/rag";

export async function POST(req) {
  try {
    const { query, limit } = await req.json();

    const results = await searchSimilarChunks({
      query,
      limit: limit || 5,
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
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