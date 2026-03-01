import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AssignmentResults } from "@/components/AssignmentResults";
import { PlanDisplay } from "@/components/PlanDisplay";
import { OutlineDisplay } from "@/components/OutlineDisplay";
import { RiskScanner } from "@/components/RiskScanner";
import { Checklist } from "@/components/Checklist";
import { ExportButton } from "@/components/ExportButton";
import { DraftGrader } from "@/components/DraftGrader";
import { DeleteAssignmentButton } from "@/components/DeleteAssignmentButton";

export default async function AssignmentPage({
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
    .select("id, title, due_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!assignment) {
    notFound();
  }

  const { data: output } = await supabase
    .from("outputs")
    .select("plan_md, outline_md, checklist_json, risks_json")
    .eq("assignment_id", id)
    .single();

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
          <div className="flex items-center gap-4">
            <Link
              href={`/assignments/${id}/edit`}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Edit
            </Link>
            <DeleteAssignmentButton
              assignmentId={id}
              assignmentTitle={assignment.title}
            />
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {assignment.title}
        </h1>
        <div className="mt-1 flex items-center gap-4">
          <p className="text-slate-600 dark:text-slate-400">
            Due{" "}
            {new Date(assignment.due_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {output && (
            <ExportButton
              title={assignment.title}
              dueAt={new Date(assignment.due_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              planMd={output.plan_md ?? ""}
              outlineMd={output.outline_md ?? ""}
              checklist={(output.checklist_json as { text: string; category?: string; completed: boolean }[]) ?? []}
              risks={(output.risks_json as { type: string; severity: string; description: string; suggestion?: string }[]) ?? []}
            />
          )}
        </div>

        {output ? (
          <div className="mt-8 space-y-10">
            <PlanDisplay planMd={output.plan_md ?? ""} />
            <OutlineDisplay outlineMd={output.outline_md ?? ""} />
            <Checklist
              items={(output.checklist_json as { id: string; text: string; category?: string; completed: boolean }[]) ?? []}
            />
            <RiskScanner
              risks={(output.risks_json as { type: string; severity: string; description: string; suggestion?: string }[]) ?? []}
            />
            <DraftGrader assignmentId={id} />
          </div>
        ) : (
          <AssignmentResults assignmentId={id} />
        )}
      </main>
    </div>
  );
}
