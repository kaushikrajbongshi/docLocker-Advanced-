import { parse } from "cookie";
import { verifyToken } from "@/lib/auth/jwt";

export function registerSocketMiddleware(io) {
  io.use((socket, next) => {
    try {
      // 1. Read cookies from handshake
      const cookieHeader = socket.handshake.headers.cookie;

      if (!cookieHeader) {
        return next(new Error("Authentication required"));
      }

      // 2. Parse cookies
      const cookies = parse(cookieHeader);

      // 3. Extract auth token
      const token = cookies.authToken;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      // 4. Verify token
      const user = verifyToken(token);

      // 5. Attach user
      socket.data.user = user;

      next();
    } catch (error) {
      console.error("Socket Middleware Error:", error);

      next(new Error("Unauthorized"));
    }
  });
}
