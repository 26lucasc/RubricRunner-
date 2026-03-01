import OpenAI from "openai";

const REFUSAL_PHRASES = [
  "i'm unable to help",
  "i cannot help",
  "i can't assist",
  "i'm sorry, i can't",
  "cannot assist with this",
];

function isRefusal(text: string): boolean {
  const lower = text.toLowerCase();
  return REFUSAL_PHRASES.some((p) => lower.includes(p));
}

/**
 * Fallback: convert PDF pages to images and use GPT-4o vision to read each.
 * Handles PDFs the Responses API cannot process (e.g. some scanned docs).
 */
async function extractViaVisionFallback(
  pdfBuffer: Buffer,
  extractionType: "prompt" | "rubric"
): Promise<string> {
  const { pdf } = await import("pdf-to-img");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const instruction =
    extractionType === "prompt"
      ? "Extract all readable text from this PDF page (assignment prompt). Return only the extracted text, preserving structure."
      : "Extract all readable text from this PDF page (rubric). Return only the extracted text, preserving structure.";

  const doc = await pdf(pdfBuffer, { scale: 2 });
  const pages: string[] = [];

  for await (const pageBuffer of doc) {
    const base64 = pageBuffer.toString("base64");
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: instruction },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (text && !isRefusal(text)) {
      pages.push(text);
    }
  }

  const combined = pages.filter(Boolean).join("\n\n");
  if (!combined.trim()) {
    throw new Error(
      `Could not extract ${extractionType} from PDF. Try pasting the content manually.`
    );
  }
  return combined;
}

/**
 * Sends a PDF to the LLM and gets extracted text. Tries the Responses API
 * first (direct PDF input). On refusal or failure, falls back to page-by-page
 * vision extraction. Handles text-based, scanned, and image-based PDFs.
 */
export async function extractTextFromPdfViaLlm(
  pdfBase64: string,
  extractionType: "prompt" | "rubric"
): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const pdfBuffer = Buffer.from(pdfBase64, "base64");

  const instruction =
    extractionType === "prompt"
      ? `You are a helpful assistant extracting text from a PDF. The PDF may be text-based, scanned, image-based, or a screenshot. Use your full vision capability to read whatever you can see. Extract the complete assignment prompt. Return ONLY the extracted text, preserving structure. Do not add commentary.`
      : `You are a helpful assistant extracting text from a PDF. The PDF may be text-based, scanned, image-based, or a screenshot. Use your full vision capability to read whatever you can see. Extract the complete rubric including categories, points, and requirements. Return ONLY the extracted text, preserving structure. Do not add commentary.`;

  try {
    const response = await client.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: instruction },
            {
              type: "input_file",
              filename: "document.pdf",
              file_data: `data:application/pdf;base64,${pdfBase64}`,
            },
          ],
        },
      ],
    });

    const text = response.output_text?.trim();
    if (text && !isRefusal(text)) {
      return text;
    }
  } catch {
    // Responses API failed
  }

  try {
    return await extractViaVisionFallback(pdfBuffer, extractionType);
  } catch (fallbackErr) {
    console.error("PDF vision fallback failed:", fallbackErr);
    throw new Error(
      "Could not extract text from this PDF. Try pasting the content manually."
    );
  }
}
