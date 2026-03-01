import OpenAI from "openai";

/**
 * Sends a PDF to the LLM and gets extracted text. Uses OpenAI Responses API
 * which accepts PDFs directly (no client-side text extraction).
 */
export async function extractTextFromPdfViaLlm(
  pdfBase64: string,
  extractionType: "prompt" | "rubric"
): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const instruction =
    extractionType === "prompt"
      ? "Extract the full assignment prompt text from this PDF. Return only the extracted text, nothing else."
      : "Extract the full rubric from this PDF, including all categories, point values, and requirements. Return the complete rubric text exactly as it appears.";

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
  if (!text) {
    throw new Error(`Could not extract ${extractionType} from PDF`);
  }
  return text;
}
