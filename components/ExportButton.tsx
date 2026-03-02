"use client";

import { useUserTimezone } from "@/lib/hooks/useUserTimezone";
import { buildExportMarkdown, downloadMarkdown } from "@/lib/utils/export";

interface ExportButtonProps {
  title: string;
  /** ISO 8601 string for due_at */
  dueAt: string;
  planMd: string;
  outlineMd: string;
  checklist: { text: string; category?: string; completed: boolean }[];
  risks: { type: string; severity: string; description: string; suggestion?: string }[];
}

export function ExportButton({
  title,
  dueAt,
  planMd,
  outlineMd,
  checklist,
  risks,
}: ExportButtonProps) {
  const { timeZoneId } = useUserTimezone();

  function handleExport() {
    const date = new Date(dueAt);
    const formattedDue = timeZoneId
      ? date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: timeZoneId,
        })
      : date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });

    const content = buildExportMarkdown(
      title,
      formattedDue,
      planMd,
      outlineMd,
      checklist,
      risks
    );
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    downloadMarkdown(content, `${slug}-plan.md`);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      Export as Markdown
    </button>
  );
}
