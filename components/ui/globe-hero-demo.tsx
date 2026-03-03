"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DotGlobeHero } from "@/components/ui/globe-hero";
import { Typewriter } from "@/components/ui/typewriter";
import { GradientButton } from "@/components/ui/gradient-button";
import { ArrowRight, BookOpen } from "lucide-react";

export function GlobeHeroDemo() {
  return (
    <DotGlobeHero
      rotationSpeed={0.004}
      className="bg-gradient-to-br from-background via-background/95 to-muted/10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 text-center space-y-12 max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 backdrop-blur-xl shadow-2xl"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <span className="relative z-10 text-sm font-bold text-primary tracking-wider uppercase">
              Never Miss Points Again
            </span>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-ping"
              style={{ animationDelay: "500ms" }}
            />
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.85] select-none"
            >
              <span className="block font-light text-foreground/70 mb-3 text-4xl md:text-6xl lg:text-7xl">
                Transform
              </span>
              <span className="block relative">
                <Typewriter
                  text={[
                    "Rubrics into plans",
                    "Assignments into actions",
                    "Exams into strategy",
                    "Drafts into A+",
                  ]}
                  speed={60}
                  initialDelay={800}
                  waitTime={1800}
                  deleteSpeed={35}
                  className="bg-gradient-to-br from-primary via-primary to-primary/60 bg-clip-text text-transparent font-black block"
                  cursorChar="_"
                  cursorClassName="ml-0.5 text-primary"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                  className="absolute -bottom-2 left-0 h-3 bg-gradient-to-r from-primary via-primary/80 to-transparent rounded-full shadow-lg shadow-primary/50"
                />
              </span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-3xl mx-auto space-y-4"
          >
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
              Turn your assignment prompt, rubric, and due date into a{" "}
              <span className="text-foreground font-semibold bg-gradient-to-r from-primary/20 to-primary/10 px-2 py-1 rounded-md">
                structured battle plan
              </span>{" "}
              aligned with grading criteria.
            </p>
            <p className="text-lg text-muted-foreground/80 leading-relaxed">
              Create exam study plans, draft graded feedback, and stay on track
              with checklists that match every rubric point.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4"
        >
          <GradientButton asChild>
            <Link href="/signup" className="inline-flex items-center gap-2">
              Get started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </GradientButton>

          <GradientButton variant="alt" asChild>
            <Link href="/login" className="inline-flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Sign in
            </Link>
          </GradientButton>
        </motion.div>
      </div>
    </DotGlobeHero>
  );
}
