import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { FileText, ClipboardList, ShieldAlert, CheckSquare } from "lucide-react";

const features = [
  {
    Icon: FileText,
    title: "Rubric extraction",
    description:
      "Upload your rubric as a PDF or paste the text. Every category, point value, and requirement is parsed automatically.",
  },
  {
    Icon: ClipboardList,
    title: "Step-by-step plans",
    description:
      "Get a prioritized execution plan with time estimates, ordered by rubric weight and your due date.",
  },
  {
    Icon: ShieldAlert,
    title: "Risk scanning",
    description:
      "Catch potential deduction triggers — missing sections, citation issues, word count gaps — before you submit.",
  },
  {
    Icon: CheckSquare,
    title: "Draft grading",
    description:
      "Paste your draft and get rubric-aligned feedback so you know exactly where you stand before submitting.",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload your materials",
    description:
      "Add your assignment prompt and rubric — paste text or upload a PDF.",
  },
  {
    number: "02",
    title: "AI builds your plan",
    description:
      "RubricRunner analyzes every criterion and generates a prioritized action plan with time estimates.",
  },
  {
    number: "03",
    title: "Execute with confidence",
    description:
      "Follow your checklist, scan for risks, and grade your draft before you submit.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.45]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #4338CA18 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative mx-auto max-w-4xl px-4 py-28 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              AI-powered assignment planning
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
              Turn any rubric into
              <br />
              <span className="text-primary">an execution plan</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your assignment prompt and rubric. RubricRunner tells you
              exactly what to do, in what order, how long each part takes, and
              where you&apos;re most at risk of losing points.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get started free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold text-foreground mb-12">
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="text-5xl font-black text-primary/15 mb-3 tabular-nums">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold text-foreground mb-3">
              Everything you need to nail the rubric
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              From prompt to plan to draft feedback — RubricRunner keeps you
              aligned with grading criteria at every step.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <Icon className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to stop guessing?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join students who use RubricRunner to execute assignments with
              precision.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} RubricRunner
        </p>
      </footer>
    </div>
  );
}
