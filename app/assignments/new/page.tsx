import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
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
      <AppHeader />

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
