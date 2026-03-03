import OpenAI from "openai";

/** PDF magic bytes: %PDF */
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]);

function isValidPdfBuffer(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer.subarray(0, 4).equals(PDF_MAGIC);
}

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
  const pdfBuffer = Buffer.from(pdfBase64, "base64");

  if (!isValidPdfBuffer(pdfBuffer)) {
    throw new Error(
      "This file doesn't appear to be a valid PDF. When downloading from SharePoint, use the Download button (not Open in browser) to save the actual PDF file. If the file is correct, try pasting the content manually."
    );
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const instruction =
    extractionType === "prompt"
      ? `You are a helpful assistant extracting text from a PDF. The PDF may be text-based, scanned, image-based, or a screenshot. Use your full vision capability to read whatever you can see. Extract the complete assignment prompt. Return ONLY the extracted text, preserving structure. Do not add commentary.`
      : `You are a helpful assistant extracting text from a PDF. The PDF may be text-based, scanned, image-based, or a screenshot. Use your full vision capability to read whatever you can see. Extract the complete rubric including categories, points, and requirements. Return ONLY the extracted text, preserving structure. Do not add commentary.`;

  // 1. Try direct text extraction (works for standard text-based PDFs, including many from SharePoint)
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    await parser.destroy();
    const text = result?.text?.trim();
    if (text && text.length >= 30) {
      return text;
    }
  } catch (parseErr) {
    // pdf-parse failed (scanned PDF, protected, or unsupported structure) — fall through to LLM
    if (process.env.NODE_ENV === "development") {
      console.warn("pdf-parse extraction failed, trying LLM:", parseErr);
    }
  }

  // 2. Try OpenAI Responses API (direct PDF input)
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
  } catch (apiErr) {
    if (process.env.NODE_ENV === "development") {
      console.warn("OpenAI Responses API failed:", apiErr);
    }
  }

  // 3. Fallback: render pages to images and use vision
  try {
    return await extractViaVisionFallback(pdfBuffer, extractionType);
  } catch (fallbackErr) {
    console.error("PDF extraction failed (all methods):", fallbackErr);
    throw new Error(
      "Could not extract text from this PDF. If it's from SharePoint, try: (1) Download the file (not Open in browser), (2) Remove any password or protection, (3) Or paste the content manually."
    );
  }
}
