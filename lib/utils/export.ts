export function buildExportMarkdown(
  title: string,
  dueAt: string,
  planMd: string,
  outlineMd: string,
  checklist: { text: string; category?: string; completed: boolean }[],
  risks: { type: string; severity: string; description: string; suggestion?: string }[]
): string {
  const sections: string[] = [
    `# ${title}`,
    "",
    `Due: ${dueAt}`,
    "",
    "---",
    "",
    "## Battle Plan",
    "",
    planMd,
    "",
    "---",
    "",
    "## Outline",
    "",
    outlineMd,
    "",
    "---",
    "",
    "## Checklist",
    "",
    ...checklist.map((i) => `- [${i.completed ? "x" : " "}] ${i.text}`),
    "",
    "---",
    "",
    "## Risk Scanner",
    "",
    ...risks.map(
      (r) =>
        `- **${r.severity}** (${r.type}): ${r.description}${r.suggestion ? ` — ${r.suggestion}` : ""}`
    ),
  ];

  return sections.join("\n");
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
