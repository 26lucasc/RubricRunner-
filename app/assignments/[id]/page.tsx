import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { FormattedDueDate } from "@/components/FormattedDueDate";
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
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            {assignment.title}
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href={`/assignments/${id}/edit`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Edit
            </Link>
            <DeleteAssignmentButton
              assignmentId={id}
              assignmentTitle={assignment.title}
            />
          </div>
        </div>
        <div className="mt-1 flex items-center gap-4">
          <p className="text-muted-foreground">
            Due{" "}
            <FormattedDueDate iso={assignment.due_at} format="short" />
          </p>
          {output && (
            <ExportButton
              title={assignment.title}
              dueAt={assignment.due_at}
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
