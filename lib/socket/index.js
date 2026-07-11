import { Server } from "socket.io";

import { registerSocketHandlers } from "./socket.js";
import { registerSocketMiddleware } from "./middleware.js";
import { initializeSubscriber } from "./subscriber.js";

let io = null;

export function initIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      credentials: true,
    },
  });

  registerSocketMiddleware(io);

  registerSocketHandlers(io);

  if (process.env.USE_BULLMQ === "true") {
    initializeSubscriber(io);
  }

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }

  return io;
}
