export default function AssignmentLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="h-7 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-9 w-9 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-8 space-y-6">
          <div className="h-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="h-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
      </main>
    </div>
  );
}
