"use client";

import { cn } from "@/lib/utils";
import { Scale, Zap } from "lucide-react";

type StudyMode = "balanced" | "cram";

interface StudyModeCardProps {
  mode: StudyMode;
  label: string;
  description: string;
  selected: boolean;
  recommended?: boolean;
  onSelect: () => void;
}

export function StudyModeCard({
  mode,
  label,
  description,
  selected,
  recommended,
  onSelect,
}: StudyModeCardProps) {
  const Icon = mode === "balanced" ? Scale : Zap;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex w-full flex-col items-start rounded-xl border-2 p-5 text-left transition-all duration-200",
        "hover:border-border hover:bg-accent/80",
        selected
          ? mode === "balanced"
            ? "border-balanced bg-balanced-muted shadow-sm ring-2 ring-balanced/20"
            : "border-cram bg-cram-muted shadow-sm ring-2 ring-cram/20"
          : "border-border bg-card"
      )}
    >
      {recommended && (
        <span className="absolute -top-2 right-4 rounded-full bg-warning-muted px-2.5 py-0.5 text-xs font-medium text-warning">
          Recommended
        </span>
      )}
      <span
        className={cn(
          "mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
          selected
            ? mode === "balanced"
              ? "bg-balanced text-white"
              : "bg-cram text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="text-sm font-semibold text-foreground">
        {label}
      </span>
      <span className="mt-1 text-xs text-muted-foreground">
        {description}
      </span>
    </button>
  );
}
