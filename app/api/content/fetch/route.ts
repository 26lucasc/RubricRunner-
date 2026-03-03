import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .trim();
}

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2MB
const FETCH_TIMEOUT_MS = 15000;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { url: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (!isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid URL. Use http or https." }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RubricRunner/1.0; +https://github.com/rubricrunner)",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Could not fetch: ${res.status} ${res.statusText}` },
        { status: 400 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/pdf")) {
      return NextResponse.json(
        {
          error:
            "PDF links are not supported. Please upload the PDF directly or use a page that displays the content as HTML.",
        },
        { status: 400 }
      );
    }

    const blob = await res.blob();
    if (blob.size > MAX_RESPONSE_BYTES) {
      return NextResponse.json(
        { error: "Page is too large. Try a more specific link or paste the content." },
        { status: 400 }
      );
    }

    const html = await blob.text();
    const text = htmlToText(html);

    if (!text || text.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text. The page may require login (e.g., SharePoint), or the content may be in an unsupported format.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: text.slice(0, 150000),
      url,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timed out. Try again or paste the content manually." },
          { status: 408 }
        );
      }
    }
    console.error("Content fetch error:", err);
    return NextResponse.json(
      {
        error:
          "Could not fetch the link. It may require login (e.g., SharePoint) or block automated requests. Try pasting the content manually.",
      },
      { status: 500 }
    );
  }
}
