export const runtime = "nodejs";
import { NextResponse } from "next/server";
import Document from "@/model/Document";
import pdfParse from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import { parse } from "cookie";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req, { params }) {
  const Params = await params;
  const id = Params.id;
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookiesObj = parse(cookieHeader);
    const token = cookiesObj.authToken;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const document = await Document.findById(id);
    console.log(document);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    if (document.type !== "pdf") {
      return NextResponse.json(
        { error: "Only PDFs can be summarized" },
        { status: 400 },
      );
    }

    // Already done?
    if (document.summaryStatus === "done" && document.summary) {
      return NextResponse.json({
        summary: document.summary,
        keyPoints: document.keyPoints,
        status: "done",
      });
    }

    // Mark as processing
    document.summaryStatus = "processing";
    await document.save();

    // Download PDF
    const response = await fetch(document.fileUrl);
    console.log("Content-Type:", response.headers.get("content-type"));
    if (!response.ok) throw new Error("Failed to download file");
    const buffer = await response.arrayBuffer();
    console.log("Buffer size:", buffer.byteLength);

    // Extract text
    let text;
    try {
      const pdfBuffer = Buffer.from(buffer);

      const parsed = await pdfParse(pdfBuffer);
      text = parsed.text;

      console.log("Extracted length:", text.length);
      console.log(text.slice(0, 200));
    } catch (err) {
      console.error("Summarize error:", err);

      document.summaryStatus = "failed";
      await document.save();

      return NextResponse.json(
        {
          error: "Could not extract text. The PDF may be scanned or corrupted.",
        },
        { status: 400 },
      );
    }

    if (!text || text.trim().length < 50) {
      document.summaryStatus = "failed";
      await document.save();
      return NextResponse.json(
        { error: "No readable text found in this PDF." },
        { status: 400 },
      );
    }

    // Truncate if too long
    const maxChars = 12000;
    const truncatedText =
      text.length > maxChars
        ? text.slice(0, maxChars) + "\n\n[Document truncated]"
        : text;

    // Call OpenAI
    const gemini_response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
                You are a document summarizer.

                Return ONLY valid JSON in this format:

                {
                  "summary": "2-3 sentence summary",
                  "keyPoints": [
                    "point 1",
                    "point 2",
                    "point 3"
                  ]
                }

                Document:

              ${truncatedText}
              `,
    });

    // Gemini response text
    let content = gemini_response.text;

    // Some versions of the SDK return text as a function
    if (typeof content === "function") {
      content = content();
    }

    console.log(content);

    // Parse response
    let result;

    try {
      // Remove ```json ... ``` if Gemini adds it
      const jsonMatch =
        content.match(/```json\s*([\s\S]*?)\s*```/) ||
        content.match(/```\s*([\s\S]*?)\s*```/);

      const jsonString = jsonMatch ? jsonMatch[1] : content;

      result = JSON.parse(jsonString);
    } catch (err) {
      console.error("JSON Parse Error:", err);

      result = {
        summary: content,
        keyPoints: [],
      };
    }
    // Save to MongoDB
    document.summary = result.summary;
    document.keyPoints = result.keyPoints || [];
    document.summaryStatus = "done";
    document.summaryGeneratedAt = new Date();
    await document.save();

    return NextResponse.json({
      summary: result.summary,
      keyPoints: result.keyPoints,
      status: "done",
    });
  } catch (error) {
    console.error("Summarize error:", error);
    await Document.findByIdAndUpdate(id, { summaryStatus: "failed" });
    return NextResponse.json(
      { error: "Summarization failed. Please try again." },
      { status: 500 },
    );
  }
}
