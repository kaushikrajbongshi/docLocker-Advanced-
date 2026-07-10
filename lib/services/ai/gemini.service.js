import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateSummary(truncatedText) {
  console.log("Job: Gemini call");

  const response = await ai.models.generateContent({
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

  // Extract the text here, not in parseGeminiResponse
  return response.text;
}

export function parseGeminiResponse(content) {
  console.log("Job: Gemini response parse");

  try {
    const jsonMatch =
      content.match(/```json\s*([\s\S]*?)\s*```/) ||
      content.match(/```\s*([\s\S]*?)\s*```/);

    const jsonString = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON Parse Error:", err);
    return {
      summary: content,
      keyPoints: [],
    };
  }
}
