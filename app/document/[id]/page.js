"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../../component/providers/SocketProvider";
import { SOCKET_EVENTS } from "../../../lib/socket/events";

export default function DocumentViewer() {
  const { id } = useParams();
  const router = useRouter();
  const [document, setDocument] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch(`/api/v1/files/${id}/url`)
      .then((res) => res.json())
      .then((data) => {
        setDocument(data.document);
        // If summary exists, fetch it with a loader effect
        if (data.document.summary && data.document.summaryStatus === "done") {
          setLoadingSummary(true);
          setTimeout(() => {
            setSummaryData({
              summary: data.document.summary,
              keyPoints: data.document.keyPoints || [],
            });
            setLoadingSummary(false);
          }, 800); // Fake loading for UX
        }
      });
  }, [id]);

  const handleSummarize = async () => {
    setSummarizing(true);
    setProgress(0);
    setError(null);

    try {
      const res = await fetch(`/api/v1/files/${id}/summarize`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Summarization failed");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setSummaryData(null);
    handleSummarize();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [summaryData, loadingSummary, error]);

  //for summarize status update
  useEffect(() => {
    const handleQueued = (payload) => {
      if (payload.documentId !== id) return;
      setSummarizing(true);
      setDocument((prev) => ({
        ...prev,
        summaryStatus: "queued",
      }));
    };

    const handleProcessing = (payload) => {
      if (payload.documentId !== id) return;

      setSummarizing(true);

      setDocument((prev) => ({
        ...prev,
        summaryStatus: "processing",
      }));
    };

    const handleCompleted = (payload) => {
      console.log("🎉 COMPLETED EVENT:", payload);

      if (payload.documentId !== id) return;

      setSummarizing(false);

      setDocument((prev) => ({
        ...prev,
        summaryStatus: "done",
        summary: payload.data.summary.summary,
        keyPoints: payload.data.summary.keyPoints,
      }));

      setSummaryData(payload.data.summary);
    };

    const handleProgress = (payload) => {
      if (payload.documentId !== id) return;
      setProgress(payload.progress);
    };

    const handleFailed = (payload) => {
      if (payload.documentId !== id) return;

      setSummarizing(false);

      setError(payload.data.message);

      setDocument((prev) => ({
        ...prev,
        summaryStatus: "failed",
      }));
    };

    socket.on(SOCKET_EVENTS.SUMMARY_QUEUED, handleQueued);
    socket.on(SOCKET_EVENTS.SUMMARY_PROCESSING, handleProcessing);
    socket.on(SOCKET_EVENTS.SUMMARY_PROGRESS, handleProgress);
    socket.on(SOCKET_EVENTS.SUMMARY_COMPLETED, handleCompleted);
    return () => {
      socket.off(SOCKET_EVENTS.SUMMARY_QUEUED, handleQueued);
      socket.off(SOCKET_EVENTS.SUMMARY_PROCESSING, handleProcessing);
      socket.off(SOCKET_EVENTS.SUMMARY_PROGRESS, handleProgress);
      socket.off(SOCKET_EVENTS.SUMMARY_COMPLETED, handleCompleted);
    };
  }, [socket, id]);

  if (!document) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
          Loading document...
        </div>
      </div>
    );
  }

  const getFileIcon = () => {
    switch (document.type) {
      case "pdf":
        return "📄";
      case "image":
        return "🖼️";
      case "video":
        return "🎬";
      case "audio":
        return "🎵";
      default:
        return "📎";
    }
  };

  return (
    <div className="h-screen bg-[#1a1a1a] flex flex-col overflow-hidden">
      {/* ===== TOP NAV BAR (Google Drive style) ===== */}
      <div className="h-12 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <span className="text-lg">{getFileIcon()}</span>
          <h1 className="text-sm text-gray-200 font-medium max-w-xs truncate">
            {document.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
              sidebarOpen
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            AI Summary
          </button>
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open
          </a>
          <a
            href={document.fileUrl}
            download={document.name}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white text-gray-900 hover:bg-gray-200 rounded-md transition-all font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </a>
        </div>
      </div>

      {/* ===== PDF VIEWER NAV BAR (Dark, minimal) ===== */}

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: PDF Viewer (70%) */}
        <div
          className={`${sidebarOpen ? "w-[70%]" : "w-full"} transition-all duration-300 bg-[#1a1a1a] relative`}
        >
          {document.type === "pdf" && (
            <iframe
              src={document.fileUrl}
              className="w-full h-full bg-[#1a1a1a]"
              title={document.name}
            />
          )}
          {document.type === "image" && (
            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
              <img
                src={document.fileUrl}
                alt={document.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          {document.type === "video" && (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <video
                controls
                className="max-w-full max-h-full"
                src={document.fileUrl}
              >
                Your browser does not support video.
              </video>
            </div>
          )}
          {document.type === "audio" && (
            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">🎵</span>
                </div>
                <p className="text-gray-300 mb-4 text-lg">{document.name}</p>
                <audio controls src={document.fileUrl} className="w-80" />
              </div>
            </div>
          )}
          {!["pdf", "image", "video", "audio"].includes(document.type) && (
            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📎</span>
                </div>
                <p className="text-gray-400 mb-2">Preview not available</p>
                <p className="text-sm text-gray-600 mb-6">
                  This file type cannot be previewed
                </p>
                <a
                  href={document.fileUrl}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                >
                  Download File
                </a>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: AI Chat Sidebar (30%) */}
        {sidebarOpen && (
          <div className="w-[30%] bg-[#1e1e1e] border-l border-gray-800 flex flex-col">
            {/* Sidebar Header */}
            <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-200">
                  AI Assistant
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Chat Messages Area */}
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome Message */}
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="bg-[#2d2d2d] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
                  <p className="text-sm text-gray-300">
                    Hi! I can help you understand this document. Click
                    &quot;Summarize&quot; to get a quick overview, or ask me
                    anything about it.
                  </p>
                </div>
              </div>

              {/* ===== SKELETON: Fetching existing summary ===== */}
              {loadingSummary && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                  <div className="bg-[#2d2d2d] rounded-2xl rounded-tl-sm px-4 py-3 w-[85%] space-y-3">
                    {/* Skeleton lines */}
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-full" />
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-[90%]" />
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-[75%]" />
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-[60%]" />
                    <div className="mt-4 space-y-2">
                      <div className="h-2.5 bg-gray-700 rounded animate-pulse w-[40%]" />
                      <div className="h-3 bg-gray-700 rounded animate-pulse w-full" />
                      <div className="h-3 bg-gray-700 rounded animate-pulse w-[85%]" />
                      <div className="h-3 bg-gray-700 rounded animate-pulse w-[70%]" />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== SKELETON: Generating new summary ===== */}
              {(summarizing || document.summaryStatus === "processing") &&
                !summaryData &&
                !loadingSummary && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>

                    <div className="bg-[#2d2d2d] rounded-2xl rounded-tl-sm px-4 py-4 w-[85%]">
                      {/* Step indicator */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">
                          {progress < 30
                            ? "Starting up"
                            : progress < 50
                              ? "Downloading PDF"
                              : progress < 80
                                ? "Reading content"
                                : "Generating summary"}
                        </span>
                      </div>

                      {/* Progress bar — prominent */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[11px] text-gray-500">
                            Progress
                          </span>
                          <span className="text-[11px] text-purple-400 font-medium">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${progress}%`,
                              background:
                                "linear-gradient(90deg, #7c3aed, #3b82f6)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Steps checklist */}
                      <div className="space-y-2">
                        {[
                          { label: "Job queued", done: progress >= 10 },
                          { label: "PDF downloaded", done: progress >= 30 },
                          { label: "Text extracted", done: progress >= 50 },
                          { label: "AI processing", done: progress >= 80 },
                          { label: "Summary ready", done: progress >= 100 },
                        ].map((step) => (
                          <div
                            key={step.label}
                            className="flex items-center gap-2.5"
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                                step.done
                                  ? "bg-purple-500"
                                  : "border border-gray-600"
                              }`}
                            >
                              {step.done && (
                                <svg
                                  className="w-2.5 h-2.5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <span
                              className={`text-xs transition-colors duration-300 ${
                                step.done ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {/* ===== RESULT: Summary ===== */}
              {summaryData && !loadingSummary && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-3 max-w-[90%]">
                    {/* Summary Bubble */}
                    <div className="bg-[#2d2d2d] rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                          Summary
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed">
                        {summaryData.summary}
                      </p>
                    </div>

                    {/* Key Points Bubble */}
                    {summaryData.keyPoints?.length > 0 && (
                      <div className="bg-[#2d2d2d] rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                            Key Points
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {summaryData.keyPoints.map((point, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-gray-300"
                            >
                              <span className="text-purple-500 mt-0.5">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== ERROR: Failed ===== */}
              {(error || document.summaryStatus === "failed") && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-red-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-3.5 h-3.5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* ===== PROMPT: Summarize button ===== */}
              {!summaryData &&
                !summarizing &&
                !loadingSummary &&
                document.summaryStatus !== "processing" &&
                document.summaryStatus !== "failed" &&
                document.type === "pdf" && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="bg-[#2d2d2d] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
                      <p className="text-sm text-gray-400 mb-3">
                        I can summarize this PDF for you. Would you like to
                        proceed?
                      </p>
                      <button
                        onClick={handleSummarize}
                        className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                      >
                        <span>✨</span>
                        Summarize Document
                      </button>
                    </div>
                  </div>
                )}

              {/* Non-PDF Message */}
              {document.type !== "pdf" && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="bg-[#2d2d2d] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
                    <p className="text-sm text-gray-400">
                      AI summarization is only available for PDF documents.
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div className="border-t border-gray-800 p-4 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask anything about this document..."
                  className="w-full bg-[#2d2d2d] border border-gray-700 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={!summaryData}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && summaryData) {
                      alert("Phase 2: Q&A feature coming soon!");
                    }
                  }}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 disabled:text-gray-700 transition-colors"
                  disabled={!summaryData}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
