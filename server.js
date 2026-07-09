import { createServer } from "http";
import next from "next";

import { initIO } from "./lib/socket/index.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (error) {
      console.error("Request Error:", error);

      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  initIO(httpServer);

  httpServer.listen(port, () => {
    console.log(`🚀 Server running at http://${hostname}:${port}`);
  });

  const shutdown = () => {
    console.log("Shutting down...");

    httpServer.close(() => {
      console.log("HTTP Server Closed");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
});