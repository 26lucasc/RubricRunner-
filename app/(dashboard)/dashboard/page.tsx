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

  const [
    { data: assignments },
    { data: exams },
  ] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, title, due_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("exams")
      .select("id, title, exam_date, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard
          </h1>
          <div className="flex gap-3">
            <Link
              href="/exams/new"
              className="rounded-lg border border-primary px-4 py-2 font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
            >
              New exam plan
            </Link>
            <Link
              href="/assignments/new"
              className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
            >
              New assignment
            </Link>
          </div>
        </div>

        {assignments && assignments.length > 0 && (
          <div className="mt-8">
            <AssignmentCalendar assignments={assignments} />
          </div>
        )}

        {assignments && assignments.length > 0 && (
          <>
            <h2 className="mt-10 text-lg font-semibold text-foreground">
              Assignments
            </h2>
            <ul className="mt-4 space-y-4">
              {assignments.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/assignments/${a.id}`}
                    className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <h2 className="font-medium text-foreground">
                      {a.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Due <FormattedDueDate iso={a.due_at} format="date" />
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {exams && exams.length > 0 && (
          <>
            <h2 className="mt-10 text-lg font-semibold text-foreground">
              Exam study plans
            </h2>
            <ul className="mt-4 space-y-4">
              {exams.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/exams/${e.id}`}
                    className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <h2 className="font-medium text-foreground">
                      {e.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Exam <FormattedDueDate iso={String(e.exam_date)} format="date" />
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {(!assignments || assignments.length === 0) && (!exams || exams.length === 0) && (
          <div className="mt-12 rounded-lg border border-dashed border-border bg-card p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-muted-foreground">
              No assignments or exams yet. Create an assignment for rubric-based planning or an exam for study strategy.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Link
                href="/assignments/new"
                className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create assignment
              </Link>
              <Link
                href="/exams/new"
                className="rounded-lg border border-primary px-4 py-2 font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Create exam plan
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}