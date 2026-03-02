import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { AssignmentCalendar } from "@/components/AssignmentCalendar";
import { FormattedDueDate } from "@/components/FormattedDueDate";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, due_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Your assignments
          </h1>
          <Link
            href="/assignments/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            New assignment
          </Link>
        </div>

        {assignments && assignments.length > 0 && (
          <div className="mt-8">
            <AssignmentCalendar assignments={assignments} />
          </div>
        )}

        {assignments && assignments.length > 0 ? (
          <>
            <h2 className="mt-10 text-lg font-semibold text-slate-900 dark:text-white">
              All assignments
            </h2>
            <ul className="mt-4 space-y-4">
            {assignments.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/assignments/${a.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20"
                >
                  <h2 className="font-medium text-slate-900 dark:text-white">
                    {a.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Due{" "}
                    <FormattedDueDate iso={a.due_at} format="date" />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          </>
        ) : (
          <div className="mt-12 rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-400">
              No assignments yet. Create your first one to get a structured plan
              aligned with your rubric.
            </p>
            <Link
              href="/assignments/new"
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              Create assignment
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}