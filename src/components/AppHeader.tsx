'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stethoscope, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppHeader() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground transition hover:text-primary"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 bg-secondary/80 text-foreground shadow-sm">
            <Stethoscope className="h-4 w-4 text-foreground" />
          </span>
          <span className="hidden sm:inline">Internos MGF</span>
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex">
          {user && (
            <Link
              href="/dashboard"
              className={cn(
                "rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors",
                "text-foreground/90 hover:bg-secondary/80"
              )}
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/treino"
            className={cn(
              "rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors",
              "text-foreground/90 hover:bg-secondary/80"
            )}
          >
            Banco de Perguntas
          </Link>
          <Link
            href="/icpc2"
            className={cn(
              "rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors",
              "text-foreground/90 hover:bg-secondary/80"
            )}
          >
            ICPC-2
          </Link>
          {user && (
            <>
              <Link
                href="/calendario"
                className={cn(
                  "rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors",
                  "text-foreground/90 hover:bg-secondary/80"
                )}
              >
                Calendário
              </Link>
              <Link
                href="/estatisticas"
                className={cn(
                  "rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors",
                  "text-foreground/90 hover:bg-secondary/80"
                )}
              >
                Estatísticas
              </Link>
              <Link
                href="/perfil"
                className={cn(
                  "rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors",
                  "text-foreground/90 hover:bg-secondary/80"
                )}
              >
                Perfil
              </Link>
            </>
          )}
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className={cn(
                "rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors",
                "text-foreground/90 hover:bg-secondary/80"
              )}
            >
              Sair
            </button>
          ) : (
            <Link
              href="/auth"
              className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary-foreground transition-all hover:bg-primary/90"
            >
              Entrar
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-secondary/70 text-foreground"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[84%] max-w-xs border-l border-border/70 bg-background/90 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Menu
              </span>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/70"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              {user && (
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-semibold text-foreground"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/treino"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-semibold text-foreground"
              >
                Banco de Perguntas
              </Link>
              <Link
                href="/icpc2"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-semibold text-foreground"
              >
                ICPC-2
              </Link>
              {user && (
                <>
                  <Link
                    href="/calendario"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-semibold text-foreground"
                  >
                    Calendário
                  </Link>
                  <Link
                    href="/estatisticas"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-semibold text-foreground"
                  >
                    Estatísticas
                  </Link>
                  <Link
                    href="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-semibold text-foreground"
                  >
                    Perfil
                  </Link>
                </>
              )}
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                  className="rounded-xl border border-border/70 bg-secondary/80 px-4 py-3 text-sm font-semibold text-foreground"
                >
                  Sair
                </button>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
