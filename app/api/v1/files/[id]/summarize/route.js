import { NextResponse } from "next/server";
import { parse } from "cookie";
import { getSummaryCache, setSummaryCache } from "@/lib/cache/summaryCache";
import { addSummaryJob } from "@/lib/bullmq/producers/summary.producer";
import Document from "@/model/Document";
import jwt from "jsonwebtoken";
import {
  generateSummarySync,
  summarizeDocument,
} from "@/lib/services/summary/summary.service";

export async function POST(req, { params }) {
  const SECRET = process.env.JWT_SECRET;

  if (!SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const Params = await params;
  const id = Params.id;

  try {
    // ==========================
    // Verify Authentication
    // ==========================
    const cookieHeader = req.headers.get("cookie") || "";
    const cookiesObj = parse(cookieHeader);
    const token = cookiesObj.authToken;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }
    const user = await jwt.verify(token, SECRET);
    const userId = await user.id;
    // ==========================
    // Check Redis Cache
    // ==========================
    console.log("1. Request received");
    const cacheSummary = await getSummaryCache(id);
    console.log("2. Cache checked");
    if (cacheSummary) {
      return NextResponse.json(cacheSummary);
    }

    // ==========================
    // Find Document
    // ==========================
    const document = await Document.findById(id);
    console.log("3. Document found", document.summaryStatus);

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ==========================
    // Validate File Type
    // ==========================
    if (document.type !== "pdf") {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF documents can be summarized.",
        },
        {
          status: 400,
        },
      );
    }

    // ==========================
    // Already Summarized
    // ==========================
    if (document.summaryStatus === "done" && document.summary) {
      const response = {
        summary: document.summary,
        keyPoints: document.keyPoints,
        status: "done",
      };

      await setSummaryCache(id, response);

      return NextResponse.json(response);
    }

    if (process.env.USE_BULLMQ === "false") {
      console.log("synchronus");
      const result = await generateSummarySync(document);
      return NextResponse.json({
        success: true,
        status: "done",
        summary: result.summary,
        keyPoints: result.keyPoints,
      });
    }

    // ==========================
    // Already Queued / Processing
    // ==========================
    if (
      document.summaryStatus === "queued" ||
      document.summaryStatus === "processing"
    ) {
      console.log("4. Already queued");
      return NextResponse.json({
        success: true,
        status: document.summaryStatus,
        message: "Summary generation is already in progress.",
      });
    }

    // ==========================
    // Queue Summary Job
    // ==========================
    console.log("5. Going to queue");
    document.summaryStatus = "queued";
    await document.save();

    console.log("6. Saved queued");

    //check for localhost or render

    await addSummaryJob(id, userId);
    console.log("7. Job added");

    return NextResponse.json({
      success: true,
      status: "queued",
      message: "Summary job queued successfully.",
    });
  } catch (error) {
    console.error("Summary Queue Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to queue summary job.",
      },
      {
        status: 500,
      },
    );
  }
}
