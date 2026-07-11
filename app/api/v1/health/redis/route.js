import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // prevent Next from caching this route

export async function GET() {
  try {
    const pong = await redis.ping();
    return NextResponse.json({
      success: true,
      redis: pong,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}