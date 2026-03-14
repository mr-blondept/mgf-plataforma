'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppHeader() {
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground transition hover:text-primary"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">MGF Quiz</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user && (
            <Link
              href="/dashboard"
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] transition-colors",
                "text-foreground hover:bg-secondary"
              )}
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/treino"
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] transition-colors",
              "text-foreground hover:bg-secondary"
            )}
          >
            Treino
          </Link>
          <Link
            href="/icpc2"
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] transition-colors",
              "text-foreground hover:bg-secondary"
            )}
          >
            ICPC-2
          </Link>
          {user && (
            <>
              <Link
                href="/calendario"
                className={cn(
                  "rounded-full border border-border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] transition-colors",
                  "text-foreground hover:bg-secondary"
                )}
              >
                Calendário
              </Link>
              <Link
                href="/estatisticas"
                className={cn(
                  "rounded-full border border-border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] transition-colors",
                  "text-foreground hover:bg-secondary"
                )}
              >
                Estatísticas
              </Link>
            </>
          )}
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] transition-colors",
                "text-foreground hover:bg-secondary"
              )}
            >
              Sair
            </button>
          ) : (
            <Link
              href="/auth"
              className="rounded-full border border-border bg-primary px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-primary-foreground transition-all hover:bg-primary/90"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
