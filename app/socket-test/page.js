"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket/client";
import { SOCKET_EVENTS } from "@/lib/socket/events";

export default function SocketTest() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on(SOCKET_EVENTS.SUMMARY_COMPLETED, (data) => {
      console.log("🎉 Summary Completed:", data);
    });

    return () => {
      socket.off("connect");
      socket.off(SOCKET_EVENTS.SUMMARY_COMPLETED);
    };
  }, []);

  return <h1>Socket Test</h1>;
}