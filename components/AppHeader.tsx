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

  const navLinkClass =
    "block rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-muted";

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          RubricRunner
        </Link>

        {mounted ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              <Link
                href="/"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/assignments/new"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    New assignment
                  </Link>
                  <Link
                    href="/exams/new"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    New exam study plan
                  </Link>
                  <div className="mt-4 border-t border-border" />
                  <form action="/auth/signout" method="POST" className="mt-2">
                    <button
                      type="submit"
                      className={`w-full text-left ${navLinkClass}`}
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
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className={`${navLinkClass} bg-primary text-primary-foreground hover:bg-primary/90`}
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
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="size-6" />
          </Button>
        )}
      </div>
    </header>
  );
}
