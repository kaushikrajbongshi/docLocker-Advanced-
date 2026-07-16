import { NextResponse } from "next/server";
import {chatWithDocument} from "@/lib/rag/chat.service"

export async function POST(req) {
  try {
    const { question } = await req.json();

    const result = await chatWithDocument({
      question,
    });

    return NextResponse.json({
      success: true,
      ...result,
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