"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {error.message}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
