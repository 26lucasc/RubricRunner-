import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <AppHeader />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Transform rubrics into execution plans
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
            RubricRunner turns your assignment prompt, rubric, and due date into
            a structured battle plan aligned with grading criteria. Never miss
            points again.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 sm:w-auto"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
