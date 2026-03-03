"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUserTimezone } from "@/lib/hooks/useUserTimezone";

type Assignment = {
  id: string;
  title: string;
  due_at: string;
};

type AssignmentCalendarProps = {
  assignments: Assignment[];
};

type ViewMode = "day" | "week" | "month";

function formatTime(iso: string, timeZoneId: string | null): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    ...(timeZoneId ? { timeZone: timeZoneId } : {}),
  });
}

function getDateKey(date: Date, timeZoneId: string | null): string {
  return date.toLocaleDateString("en-CA", {
    ...(timeZoneId ? { timeZone: timeZoneId } : {}),
  });
}

function formatDateHeader(
  date: Date,
  timeZoneId: string | null,
  options: Intl.DateTimeFormatOptions
): string {
  return date.toLocaleDateString("en-US", {
    ...options,
    ...(timeZoneId ? { timeZone: timeZoneId } : {}),
  });
}

function AssignmentLink({
  assignment,
  timeZoneId,
  variant = "default",
}: {
  assignment: Assignment;
  timeZoneId: string | null;
  variant?: "default" | "chip";
}) {
  if (variant === "chip") {
    return (
      <Link
        href={`/assignments/${assignment.id}`}
        className="group flex flex-col gap-0.5 rounded-md bg-slate-100 px-1.5 py-1 text-left transition-colors hover:bg-primary/10 dark:bg-slate-800 dark:hover:bg-primary/20"
        title={assignment.title}
      >
        <span className="line-clamp-2 text-[11px] font-medium leading-tight text-slate-800 dark:text-slate-200">
          {assignment.title}
        </span>
        <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">
          {formatTime(assignment.due_at, timeZoneId)}
        </span>
      </Link>
    );
  }
  return (
    <Link
      href={`/assignments/${assignment.id}`}
      className="block rounded-md border border-slate-100 px-2.5 py-1.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 dark:border-slate-800 dark:hover:border-primary/30 dark:hover:bg-primary/10"
    >
      <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
        {assignment.title}
      </span>
      <span className="block text-xs text-primary">
        {formatTime(assignment.due_at, timeZoneId)}
      </span>
    </Link>
  );
}

export function AssignmentCalendar({ assignments }: AssignmentCalendarProps) {
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [focusDate, setFocusDate] = useState<Date>(today);
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const { timeZoneId, loading } = useUserTimezone();

  const datesWithAssignments = useMemo(() => {
    return new Set(
      assignments.map((a) => getDateKey(new Date(a.due_at), timeZoneId))
    );
  }, [assignments, timeZoneId]);

  const assignmentsForDate = useMemo(
    () => (date: Date) => {
      const key = getDateKey(date, timeZoneId);
      return assignments
        .filter((a) => getDateKey(new Date(a.due_at), timeZoneId) === key)
        .sort(
          (a, b) =>
            new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
        );
    },
    [assignments, timeZoneId]
  );

  const assignmentsForSelectedDate = useMemo(() => {
    if (!selected) return [];
    return assignmentsForDate(selected);
  }, [assignmentsForDate, selected]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(focusDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [focusDate]);

  const modifiers = useMemo(
    () => ({
      hasAssignment: (date: Date) =>
        datesWithAssignments.has(getDateKey(date, timeZoneId)),
    }),
    [datesWithAssignments, timeZoneId]
  );

  const modifiersClassNames = useMemo(
    () => ({
      hasAssignment:
        "ring-2 ring-primary ring-offset-2 ring-offset-background",
    }),
    []
  );

  const goPrev = () => {
    if (viewMode === "day") setFocusDate((d) => subDays(d, 1));
    else if (viewMode === "week") setFocusDate((d) => subWeeks(d, 1));
    else setFocusDate((d) => subMonths(d, 1));
  };

  const goNext = () => {
    if (viewMode === "day") setFocusDate((d) => addDays(d, 1));
    else if (viewMode === "week") setFocusDate((d) => addWeeks(d, 1));
    else setFocusDate((d) => addMonths(d, 1));
  };

  const goToday = () => {
    setFocusDate(today);
    setSelected(today);
  };

  const viewTitle =
    viewMode === "day"
      ? formatDateHeader(focusDate, timeZoneId, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : viewMode === "week"
        ? `${format(startOfWeek(focusDate, { weekStartsOn: 0 }), "MMM d")} – ${format(endOfWeek(focusDate, { weekStartsOn: 0 }), "MMM d, yyyy")}`
        : format(focusDate, "MMMM yyyy");

  const displayDate =
    viewMode === "day" ? focusDate : selected ?? focusDate;

  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex w-full flex-col rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 lg:col-span-8 sm:p-4">
        {/* Single toolbar row */}
        <div className="mb-3 flex flex-1 flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
          <div className="flex items-center gap-4">
            <div
              role="group"
              aria-label="View mode"
              className="inline-flex rounded-md border border-slate-200 bg-slate-50/80 p-0.5 dark:border-slate-700 dark:bg-slate-800/40"
            >
              {(["day", "week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-sm px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors ${
                    viewMode === mode
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {viewTitle}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-7 shrink-0"
              onClick={goPrev}
              aria-label="Previous"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7 shrink-0"
              onClick={goNext}
              aria-label="Next"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <button
              type="button"
              onClick={goToday}
              className="ml-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              Today
            </button>
          </div>
        </div>

        {viewMode === "month" && (
          <>
            <Calendar
              mode="single"
              month={focusDate}
              onMonthChange={setFocusDate}
              selected={selected}
              onSelect={setSelected}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="w-full rounded-lg border-0 [--cell-size:1.75rem] lg:[--cell-size:2.5rem]"
              captionLayout="dropdown"
              showOutsideDays
              classNames={{ root: "w-full" }}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Ringed dates have due assignments
            </p>
          </>
        )}

        {viewMode === "week" && (
          <div className="flex overflow-x-auto rounded-md border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/50 sm:grid sm:grid-cols-7">
            {weekDays.map((day) => {
              const dayAssignments = assignmentsForDate(day);
              const isToday =
                getDateKey(day, timeZoneId) === getDateKey(today, timeZoneId);
              const isSelected =
                selected &&
                getDateKey(day, timeZoneId) === getDateKey(selected, timeZoneId);
              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  onClick={() => setSelected(day)}
                  className={`flex min-w-[4.5rem] flex-1 flex-col border-l border-slate-100 py-1.5 px-1.5 text-left transition-colors first:min-w-[4.5rem] first:border-l-0 dark:border-slate-800 ${
                    isSelected
                      ? "bg-primary/10 ring-1 ring-inset ring-primary/40 dark:bg-primary/20 dark:ring-primary/50"
                      : isToday
                        ? "bg-slate-50/80 dark:bg-slate-800/30"
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                  }`}
                >
                  <p className="mb-0.5 truncate text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {format(day, "EEE d")}
                  </p>
                  <div className="flex min-h-0 flex-col gap-0.5">
                    {dayAssignments.map((a) => (
                      <AssignmentLink
                        key={a.id}
                        assignment={a}
                        timeZoneId={timeZoneId}
                        variant="chip"
                      />
                    ))}
                    {dayAssignments.length === 0 && (
                      <span className="py-0.5 text-center text-[10px] text-slate-300 dark:text-slate-600">
                        —
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {viewMode === "day" && (
          <div className="rounded-md border border-slate-100 p-3 dark:border-slate-800">
            <div className="flex flex-col gap-1.5">
              {assignmentsForDate(focusDate).map((a) => (
                <AssignmentLink
                  key={a.id}
                  assignment={a}
                  timeZoneId={timeZoneId}
                />
              ))}
              {assignmentsForDate(focusDate).length === 0 && (
                <p className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                  No assignments due this day
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 lg:col-span-4 sm:p-4">
        <h2 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          {displayDate ? (
            <>
              Assignments due{" "}
              {loading ? (
                "…"
              ) : (
                formatDateHeader(displayDate, timeZoneId, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              )}
            </>
          ) : (
            "Select a date"
          )}
        </h2>

        {!displayDate ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Click a date on the calendar to see assignments due that day.
          </p>
        ) : assignmentsForSelectedDate.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No assignments due on this date.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {assignmentsForSelectedDate.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/assignments/${a.id}`}
                  className="block rounded-md border border-slate-100 px-2.5 py-2 transition-colors hover:border-primary/40 hover:bg-primary/5 dark:border-slate-800 dark:hover:border-primary/30 dark:hover:bg-primary/10"
                >
                  <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                    {a.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-primary">
                    Due at {formatTime(a.due_at, timeZoneId)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
