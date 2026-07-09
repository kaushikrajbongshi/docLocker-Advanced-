export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  SUMMARY_QUEUED: "summary:queued",
  SUMMARY_PROCESSING: "summary:processing",
  SUMMARY_COMPLETED: "summary:completed",
  SUMMARY_FAILED: "summary:failed",
};

export const REDIS_CHANNEL = {
  SUMMARY : "summary-events",
}