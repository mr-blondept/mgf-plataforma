'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Menu,
  Stethoscope,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppHeader() {
  const [user, setUser] = useState<{
    id: string;
    user_metadata?: {
      avatar_url?: string | null;
      picture?: string | null;
      full_name?: string | null;
      name?: string | null;
    };
    identities?: Array<{
      identity_data?: {
        avatar_url?: string | null;
        picture?: string | null;
        full_name?: string | null;
        name?: string | null;
      } | null;
    }> | null;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const accountLinks = [
    {
      href: "/dashboard",
      label: "Painel",
      icon: LayoutDashboard,
      hint: "Visão geral",
    },
  ];
  const createAccountHref = "/auth?mode=signup";
  const loginHref = "/auth";

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

  function isActive(path: string) {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const avatarUrl =
    user?.user_metadata?.avatar_url ??
    user?.user_metadata?.picture ??
    user?.identities?.[0]?.identity_data?.avatar_url ??
    user?.identities?.[0]?.identity_data?.picture ??
    null;
  const avatarLabel =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.identities?.[0]?.identity_data?.full_name ??
    user?.identities?.[0]?.identity_data?.name ??
    "Perfil";
  const avatarInitials = getInitials(avatarLabel);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="group flex items-center gap-3 text-base font-semibold tracking-tight text-foreground transition"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-gradient-to-br from-card via-secondary/90 to-secondary text-foreground shadow-sm transition group-hover:border-primary/30 group-hover:text-primary">
            <Stethoscope className="h-4 w-4" />
          </span>
          <span className="hidden sm:block">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground transition group-hover:text-primary/70">
              Plataforma MGF
            </span>
            <span className="mt-0.5 block font-display text-lg font-semibold leading-none tracking-[-0.03em] text-foreground transition group-hover:text-primary">
              MediFam
            </span>
          </span>
          <span className="font-display text-lg font-semibold tracking-[-0.03em] text-foreground transition group-hover:text-primary sm:hidden">
            MediFam
          </span>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/65 px-2 py-2 shadow-sm md:flex">
          {user ? (
            <>
              {accountLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors",
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/90 hover:bg-secondary/80",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/perfil"
                aria-label={avatarLabel}
                className={cn(
                  "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-background shadow-sm transition hover:border-primary/40",
                  isActive("/perfil") && "ring-2 ring-primary/20",
                )}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={avatarLabel}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/90">
                    {avatarInitials}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-border/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/90 transition-colors hover:bg-secondary/80"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href={loginHref}
                className="rounded-full bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-all hover:bg-primary/90"
              >
                Entrar
              </Link>
              <Link
                href={createAccountHref}
                className="rounded-full border border-border/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/90 transition hover:bg-secondary/80"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-secondary/70 text-foreground shadow-sm md:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-3 top-3 animate-fade-in rounded-[2rem] border border-border/70 bg-background/95 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-secondary/80 text-foreground shadow-sm">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Navegação</p>
                  <p className="text-xs text-muted-foreground">
                    Acede rapidamente às áreas principais
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/70"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3"
                  >
                    <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-background shadow-sm">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={avatarLabel}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/90">
                          {avatarInitials}
                        </span>
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{avatarLabel}</p>
                      <p className="text-xs text-muted-foreground">Abrir perfil</p>
                    </div>
                  </Link>
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Conta
                  </p>
                  {accountLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                        isActive(link.href)
                          ? "border-primary/40 bg-primary/10 text-foreground"
                          : "border-border/70 bg-card/70 text-foreground",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <link.icon className="h-4 w-4" />
                        <span>
                          <span className="block">{link.label}</span>
                          <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                            {link.hint}
                          </span>
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">Abrir</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Conta
                  </p>
                  <Link
                    href={createAccountHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary/70"
                  >
                    <span>Criar conta</span>
                    <span className="text-xs text-muted-foreground">Abrir</span>
                  </Link>
                </div>
              )}

              <div className="border-t border-border/70 pt-4">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full rounded-2xl border border-border/70 bg-secondary/80 px-4 py-3 text-sm font-semibold text-foreground"
                  >
                    Sair
                  </button>
                ) : (
                  <Link
                    href={loginHref}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Entrar
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "PF";

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
