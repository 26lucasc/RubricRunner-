import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssignmentForm } from "@/components/AssignmentForm";

export default async function NewAssignmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            RubricRunner
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create assignment
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Enter your assignment details. We&apos;ll generate a structured plan
          aligned with your rubric.
        </p>

        <AssignmentForm />
      </main>
    </div>
  );
}
