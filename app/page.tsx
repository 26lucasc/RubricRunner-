import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            RubricRunner
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

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
