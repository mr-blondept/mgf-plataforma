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
    <header className="sticky top-0 z-50 border-b border-border bg-card/98 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground transition hover:text-primary"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">MGF Quiz</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {user && (
            <Link
              href="/dashboard"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/treino"
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            Treino
          </Link>
          {user && (
            <>
              <Link
                href="/calendario"
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                Calendário
              </Link>
              <Link
                href="/estatisticas"
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Sair
            </button>
          ) : (
            <Link
              href="/auth"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
