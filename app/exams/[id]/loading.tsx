import { AppHeader } from "@/components/AppHeader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-8 h-96 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      </main>
    </div>
  );
}
