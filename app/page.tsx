import { AppHeader } from "@/components/AppHeader";
import { GlobeHeroDemo } from "@/components/ui/globe-hero-demo";
import { FeaturesSectionWithHoverEffects } from "@/components/ui/feature-section-with-hover-effects";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />

      <main className="flex-1">
        <GlobeHeroDemo />
        <section className="relative px-4">
          <div className="max-w-7xl mx-auto pt-8 pb-16">
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">
              Everything you need to nail every rubric
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-4">
              From prompt to plan to draft feedback—RubricRunner keeps you aligned with grading criteria.
            </p>
            <FeaturesSectionWithHoverEffects />
          </div>
        </section>
      </main>
    </div>
  );
}
