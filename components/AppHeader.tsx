"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const mobileNavLinkClass =
    "block rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-muted";

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="28" height="28" rx="7" fill="currentColor" />
            <path
              d="M8 9.5h12M8 14h7.5M8 18.5h10"
              stroke="white"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <path
              d="M18 16l1.75 1.75L23 13.5"
              stroke="white"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          RubricRunner
        </Link>

        {/* Desktop nav */}
        {mounted && (
          <nav className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/assignments/new"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  New assignment
                </Link>
                <Link
                  href="/exams/new"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  New exam plan
                </Link>
                <div className="mx-2 h-4 w-px bg-border" />
                <form action="/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="ml-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Mobile hamburger */}
        {mounted ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                <Link
                  href="/"
                  className={mobileNavLinkClass}
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={mobileNavLinkClass}
                      onClick={() => setOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/assignments/new"
                      className={mobileNavLinkClass}
                      onClick={() => setOpen(false)}
                    >
                      New assignment
                    </Link>
                    <Link
                      href="/exams/new"
                      className={mobileNavLinkClass}
                      onClick={() => setOpen(false)}
                    >
                      New exam study plan
                    </Link>
                    <div className="mt-4 border-t border-border" />
                    <form action="/auth/signout" method="POST" className="mt-2">
                      <button
                        type="submit"
                        className={`w-full text-left ${mobileNavLinkClass}`}
                        onClick={() => setOpen(false)}
                      >
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={mobileNavLinkClass}
                      onClick={() => setOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className={`${mobileNavLinkClass} bg-primary text-primary-foreground hover:bg-primary/90`}
                      onClick={() => setOpen(false)}
                    >
                      Get started
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
            <Menu className="size-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
