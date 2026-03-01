import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AssignmentForm } from "@/components/AssignmentForm";

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, title, prompt_text, rubric_text, due_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!assignment) {
    notFound();
  }

  const dueAtLocal = new Date(assignment.due_at);
  const offset = dueAtLocal.getTimezoneOffset() * 60000;
  const localDate = new Date(dueAtLocal.getTime() - offset);
  const initialDueAt = localDate.toISOString().slice(0, 16);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            RubricRunner
          </Link>
          <Link
            href={`/assignments/${id}`}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Back to assignment
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Edit assignment
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Update your assignment details. If you change the prompt or rubric,
          regenerate the plan from the assignment page.
        </p>

        <AssignmentForm
          assignmentId={id}
          initialTitle={assignment.title}
          initialPromptText={assignment.prompt_text}
          initialRubricText={assignment.rubric_text}
          initialDueAt={initialDueAt}
        />
      </main>
    </div>
  );
}
