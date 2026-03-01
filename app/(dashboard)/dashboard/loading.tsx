export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="h-7 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
