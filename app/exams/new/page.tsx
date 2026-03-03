import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { redirect } from "next/navigation";
import { ExamForm } from "@/components/ExamForm";

export default async function NewExamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Create exam study plan
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Enter exam details and materials. We&apos;ll analyze topics, prioritize by importance,
            and design active study sessions.
          </p>
        </div>

        <ExamForm />
      </main>
    </div>
  );
}
