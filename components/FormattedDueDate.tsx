"use client";

import { useUserTimezone } from "@/lib/hooks/useUserTimezone";

type FormattedDueDateProps = {
  /** ISO 8601 string (e.g. from due_at) */
  iso: string;
  /** Format: "short" = "Mar 15, 2025, 2:00 PM" | "date" = "Mar 15, 2025" */
  format?: "short" | "date" | "long";
  className?: string;
};

export function FormattedDueDate({
  iso,
  format = "short",
  className,
}: FormattedDueDateProps) {
  const { timeZoneId, loading } = useUserTimezone();

  if (loading) {
    return (
      <span className={className} suppressHydrationWarning>
        …
      </span>
    );
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return <span className={className}>Invalid date</span>;
  }

  const options: Intl.DateTimeFormatOptions =
    format === "date"
      ? {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      : format === "long"
        ? {
            dateStyle: "full",
            timeStyle: "long",
          }
        : {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          };

  const formatted = timeZoneId
    ? date.toLocaleString("en-US", { ...options, timeZone: timeZoneId })
    : date.toLocaleString("en-US", options);

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {formatted}
    </time>
  );
}
