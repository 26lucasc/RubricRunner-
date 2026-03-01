import { describe, it, expect } from "vitest";
import { buildExportMarkdown } from "./export";

describe("buildExportMarkdown", () => {
  it("builds markdown with all sections", () => {
    const result = buildExportMarkdown(
      "Test Assignment",
      "Jan 15, 2025",
      "## Plan\nStep 1",
      "## Outline\n- Point A",
      [
        { text: "Do X", category: "Content", completed: false },
        { text: "Do Y", completed: true },
      ],
      [
        {
          type: "word_count",
          severity: "high",
          description: "Too short",
          suggestion: "Add more",
        },
      ]
    );

    expect(result).toContain("# Test Assignment");
    expect(result).toContain("Due: Jan 15, 2025");
    expect(result).toContain("## Battle Plan");
    expect(result).toContain("Step 1");
    expect(result).toContain("## Outline");
    expect(result).toContain("Point A");
    expect(result).toContain("- [ ] Do X");
    expect(result).toContain("- [x] Do Y");
    expect(result).toContain("## Risk Scanner");
    expect(result).toContain("**high** (word_count): Too short — Add more");
  });

  it("handles empty checklist and risks", () => {
    const result = buildExportMarkdown(
      "Empty",
      "Today",
      "Plan",
      "Outline",
      [],
      []
    );

    expect(result).toContain("# Empty");
    expect(result).toContain("Plan");
    expect(result).toContain("Outline");
  });
});
