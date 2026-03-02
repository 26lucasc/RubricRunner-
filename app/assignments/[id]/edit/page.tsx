import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href={`/assignments/${id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          ← Back to assignment
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
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
          initialDueAtIso={assignment.due_at}
        />
      </main>
    </div>
  );
}
