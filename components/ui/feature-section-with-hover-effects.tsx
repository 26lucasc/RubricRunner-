"use client";

import { cn } from "@/lib/utils";
import {
  Terminal,
  Zap,
  FileText,
  Cloud,
  HelpCircle,
  ListChecks,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    title: "Rubric extraction",
    description:
      "Upload PDFs or paste rubrics. We parse categories, points, and requirements into structured checklists.",
    icon: <FileText className="size-8" />,
  },
  {
    title: "Structured battle plans",
    description:
      "Turn prompts and rubrics into step-by-step plans aligned with every grading criterion.",
    icon: <Terminal className="size-8" />,
  },
  {
    title: "Exam study strategies",
    description:
      "Create cram or balanced study plans with timed simulations and sleep protection.",
    icon: <Zap className="size-8" />,
  },
  {
    title: "Draft grading",
    description:
      "Get rubric-aligned feedback on your drafts before you submit.",
    icon: <CheckCircle2 className="size-8" />,
  },
  {
    title: "PDF & link support",
    description:
      "Extract text from assignment PDFs or fetch content from URLs for study materials.",
    icon: <Cloud className="size-8" />,
  },
  {
    title: "Risk scanning",
    description:
      "Spot potential deduction triggers like missing sections or citation issues early.",
    icon: <HelpCircle className="size-8" />,
  },
  {
    title: "AI-powered planning",
    description:
      "LLM-generated plans tailored to your specific assignment and rubric.",
    icon: <Sparkles className="size-8" />,
  },
  {
    title: "Export & track",
    description:
      "Export plans, track progress with checklists, and never miss a rubric point.",
    icon: <ListChecks className="size-8" />,
  },
];

export function FeaturesSectionWithHoverEffects() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

function Feature({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-border",
        (index === 0 || index === 4) && "lg:border-l",
        index < 4 && "lg:border-b"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-muted/50 to-transparent pointer-events-none rounded-lg" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-muted/50 to-transparent pointer-events-none rounded-lg" />
      )}
      <div className="mb-4 relative z-10 px-10 text-muted-foreground">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-muted-foreground/30 group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
}
