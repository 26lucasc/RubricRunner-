"use client";

import { useState } from "react";

interface ChecklistItem {
  id: string;
  text: string;
  category?: string;
  completed: boolean;
}

interface ChecklistProps {
  items: ChecklistItem[];
}

export function Checklist({ items }: ChecklistProps) {
  const [localItems, setLocalItems] = useState(items);

  function toggle(id: string) {
    setLocalItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  }

  const byCategory = localItems.reduce<Record<string, ChecklistItem[]>>(
    (acc, item) => {
      const cat = item.category ?? "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {}
  );

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Checklist
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Track requirements as you complete them
      </p>
      <div className="mt-4 space-y-4">
        {Object.entries(byCategory).map(([category, catItems]) => (
          <div
            key={category}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <h3 className="font-medium text-slate-900 dark:text-white">
              {category}
            </h3>
            <ul className="mt-3 space-y-2">
              {catItems.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="mt-0.5 shrink-0 rounded border border-input p-0.5 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600"
                    aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {item.completed ? (
                      <svg
                        className="h-4 w-4 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="block h-4 w-4" />
                    )}
                  </button>
                  <span
                    className={
                      item.completed
                        ? "text-slate-500 line-through dark:text-slate-400"
                        : "text-slate-900 dark:text-white"
                    }
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
