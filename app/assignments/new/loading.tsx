export default function NewAssignmentLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="h-7 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-9 w-9 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-5 w-96 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-8 space-y-6">
          <div className="h-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </main>
    </div>
  );
}
