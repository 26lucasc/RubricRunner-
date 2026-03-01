"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {error.message}
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
