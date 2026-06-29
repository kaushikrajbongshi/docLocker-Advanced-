"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function DocumentViewer() {
  const { id } = useParams();
  const router = useRouter();
  const [document, setDocument] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch(`/api/files/${id}/url`)
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
    setError(null);

    try {
      const res = await fetch(`/api/files/${id}/summarize`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Summarization failed");

      setSummaryData({
        summary: data.summary,
        keyPoints: data.keyPoints || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSummarizing(false);
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
                    "Summarize" to get a quick overview, or ask me anything
                    about it.
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
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shrink-0">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                    <div className="bg-[#2d2d2d] rounded-2xl rounded-tl-sm px-4 py-3 w-[85%] space-y-3">
                      {/* Shimmer effect header */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                          AI Generating
                        </span>
                      </div>
                      {/* Skeleton paragraphs */}
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-full" />
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-[92%]" />
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-[85%]" />
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-[78%]" />
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-[88%]" />
                      </div>
                      {/* Skeleton key points */}
                      <div className="mt-3 space-y-2">
                        <div className="h-2.5 bg-gray-700 rounded animate-pulse w-[35%]" />
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-700 rounded-full animate-pulse shrink-0" />
                          <div className="h-3 bg-gray-700 rounded animate-pulse flex-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-700 rounded-full animate-pulse shrink-0" />
                          <div className="h-3 bg-gray-700 rounded animate-pulse flex-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-700 rounded-full animate-pulse shrink-0" />
                          <div className="h-3 bg-gray-700 rounded animate-pulse flex-1" />
                        </div>
                      </div>
                      {/* Progress indicator */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-[shimmer_1.5s_infinite]"
                            style={{
                              width: "60%",
                              background:
                                "linear-gradient(90deg, #7c3aed 0%, #3b82f6 50%, #7c3aed 100%)",
                              backgroundSize: "200% 100%",
                              animation: "shimmer 1.5s infinite",
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500">
                          Analyzing...
                        </span>
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
                  <div className="bg-[#2d2d2d] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
                    <p className="text-sm text-red-400 mb-3">
                      {error || "Failed to generate summary."}
                    </p>
                    <button
                      onClick={handleTryAgain}
                      className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-md transition-colors"
                    >
                      🔄 Try Again
                    </button>
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
              {summaryData && !loadingSummary && (
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleTryAgain}
                    className="flex-1 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all border border-gray-700"
                  >
                    🔄 Try Again
                  </button>
                  <button
                    className="flex-1 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all border border-gray-700"
                    onClick={() =>
                      alert("Phase 2: Ask a question about this document")
                    }
                  >
                    💬 Ask Question
                  </button>
                </div>
              )}
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
