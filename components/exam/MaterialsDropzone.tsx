"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FileText, Upload, X, ChevronDown, ChevronUp, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaterialsDropzoneProps {
  materialsText: string;
  onMaterialsChange: (text: string) => void;
  pdfFileName: string | null;
  onPdfUpload: (file: File) => Promise<void>;
  onPdfRemove: () => void;
  pdfLoading: boolean;
  disabled?: boolean;
  error: string | null;
  onClearError: () => void;
  onError?: (message: string) => void;
}

export function MaterialsDropzone({
  materialsText,
  onMaterialsChange,
  pdfFileName,
  onPdfUpload,
  onPdfRemove,
  pdfLoading,
  disabled = false,
  error,
  onClearError,
  onError,
}: MaterialsDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pasteExpanded, setPasteExpanded] = useState(() => !!materialsText);
  const [linkExpanded, setLinkExpanded] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [fetchedUrls, setFetchedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled || pdfLoading) return;
      const file = e.dataTransfer.files?.[0];
      if (file?.type === "application/pdf") {
        onPdfUpload(file);
        onClearError?.();
      } else if (file) {
        onClearError?.();
        // Could show "PDF only" toast
      }
    },
    [disabled, pdfLoading, onPdfUpload, onClearError]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type === "application/pdf") {
      onPdfUpload(file);
      onClearError?.();
    }
    e.target.value = "";
  };

  const handleFetchUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setUrlLoading(true);
    onClearError?.();
    try {
      const res = await fetch("/api/content/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to fetch");
      }
      const separator = materialsText.trim() ? "\n\n---\n\n" : "";
      onMaterialsChange(materialsText + separator + (data.text ?? ""));
      setFetchedUrls((prev) => [...prev, url]);
      setUrlInput("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch link";
      onError?.(msg);
    } finally {
      setUrlLoading(false);
    }
  };

  const removeFetchedUrl = (url: string) => {
    setFetchedUrls((prev) => prev.filter((u) => u !== url));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || pdfLoading}
        />

        {pdfLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Extracting text…</span>
          </div>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">
              Drop PDF here or
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Upload className="size-4" />
              Upload PDF
            </Button>
          </>
        )}
      </div>

      {pdfFileName && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm text-foreground">
            {pdfFileName}
          </span>
          <button
            type="button"
            onClick={onPdfRemove}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {fetchedUrls.length > 0 && (
        <div className="space-y-2">
          {fetchedUrls.map((url) => (
            <div
              key={url}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
            >
              <Link2 className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {url}
              </span>
              <button
                type="button"
                onClick={() => removeFetchedUrl(url)}
                className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Remove"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-border">
        <button
          type="button"
          onClick={() => setLinkExpanded((x) => !x)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50"
        >
          Or paste a link
          {linkExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>
        {linkExpanded && (
          <div className="border-t border-border p-3">
            <p className="mb-2 text-xs text-muted-foreground">
              Paste a URL to slides, SharePoint, docs, or any public page. Content will be fetched automatically.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                disabled={urlLoading || disabled}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFetchUrl}
                disabled={!urlInput.trim() || urlLoading || disabled}
              >
                {urlLoading ? "Fetching…" : "Fetch"}
              </Button>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setPasteExpanded((x) => !x)}
          className="flex w-full items-center justify-between border-t border-border px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50"
        >
          Or paste content
          {pasteExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>
        {pasteExpanded && (
          <div className="border-t border-border p-3">
            <textarea
              value={materialsText}
              onChange={(e) => onMaterialsChange(e.target.value)}
              placeholder="Paste slides, syllabus, review notes, practice problems..."
              rows={6}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
