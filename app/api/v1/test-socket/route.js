import { NextResponse } from "next/server";

import { publish } from "@/lib/socket/publisher";
import {
  REDIS_CHANNEL,
  SOCKET_EVENTS,
} from "@/lib/socket/events";


export async function GET() {
  await publish(REDIS_CHANNEL.SUMMARY, {
    event: SOCKET_EVENTS.SUMMARY_COMPLETED,
    userId: "123",
    message: "Hello Redis",
  });

  return NextResponse.json({
    success: true,
  });
}