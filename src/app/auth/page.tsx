'use client';

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCanonicalSiteUrl } from "@/lib/site-url";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageFallback() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-md sm:p-8">
        <LoadingSpinner label="A carregar autenticação..." />
      </div>
    </main>
  );
}

function AuthPageContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const normalizedMode = modeParam === "signup" ? "signup" : "login";
  const lastModeRef = useRef<"login" | "signup">(normalizedMode);
  const [mode, setMode] = useState<"login" | "signup">(normalizedMode);

  useEffect(() => {
    if (normalizedMode !== lastModeRef.current) {
      lastModeRef.current = normalizedMode;
      setMode(normalizedMode);
    }
  }, [normalizedMode]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [medicalOrderNumber, setMedicalOrderNumber] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "oauth") {
      setErrorMsg("Não foi possível concluir a autenticação com Google.");
    }
  }, [searchParams]);

  async function handleGoogleAuth() {
    setGoogleLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const redirectBaseUrl =
        process.env.NODE_ENV === "development"
          ? window.location.origin
          : getCanonicalSiteUrl();
      const redirectTo = `${redirectBaseUrl}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Ocorreu um erro ao iniciar sessão com Google.");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const normalizedName = fullName.trim();
        if (normalizedName.length < 2) {
          throw new Error("Nome inválido.");
        }
        if (password.length < 4) {
          throw new Error("A palavra-passe deve ter pelo menos 4 dígitos.");
        }
        const medicalOrderValue = Number(medicalOrderNumber);
        if (
          !Number.isInteger(medicalOrderValue) ||
          medicalOrderValue < 1000 ||
          medicalOrderValue > 199999
        ) {
          throw new Error("Nº Ordem dos Médicos inválido.");
        }
        const yearValue = Number(graduationYear);
        if (
          !Number.isInteger(yearValue) ||
          yearValue < 1950 ||
          yearValue > new Date().getFullYear()
        ) {
          throw new Error("Ano de conclusão inválido.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: normalizedName,
              medical_order_number: String(medicalOrderValue),
              graduation_year: String(yearValue),
              workplace: workplace.trim() || null,
            },
          },
        });
        if (error) throw error;

        const userId = data.user?.id ?? null;
        if (userId && data.session) {
          const { error: profileError } = await supabase.from("profiles").upsert(
            {
              id: userId,
              full_name: normalizedName,
              medical_order_number: String(medicalOrderValue),
              graduation_year: yearValue,
              workplace: workplace.trim() || null,
            },
            { onConflict: "id" }
          );
          if (profileError) throw profileError;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Ocorreu um erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden app-surface">
      <div className="absolute inset-0 hero-surface opacity-80" />
      <div className="absolute inset-0 soft-grain opacity-30" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-xl items-center px-4 py-10 sm:px-6">
        <section className="relative w-full overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-xl backdrop-blur sm:p-8">
          <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_34%)]" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Stethoscope className="h-5 w-5" />
                  </span>
                  <span className="font-display text-lg tracking-[-0.03em]">MediFam</span>
                </Link>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                  {mode === "login" ? "Acesso" : "Registo"}
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                  {mode === "login" ? "Entrar" : "Criar conta"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {mode === "login"
                    ? "Usa a tua conta para continuar."
                    : "Preenche os dados abaixo para começar."}
                </p>
              </div>
              <Link
                href="/"
                className="hidden text-sm font-medium text-primary underline-offset-4 hover:underline sm:block"
              >
                Voltar
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 rounded-2xl border border-border/70 bg-muted/50 p-1.5">
              <button
                type="button"
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                  mode === "login"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode("login")}
              >
                Entrar
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                  mode === "signup"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode("signup")}
              >
                Criar conta
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => void handleGoogleAuth()}
                disabled={loading || googleLoading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-border/70 bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:bg-secondary/40 disabled:opacity-50"
              >
                {googleLoading ? (
                  <LoadingSpinner label="A redirecionar para Google..." sizeClassName="h-4 w-4" />
                ) : (
                  <>
                    <GoogleLogo />
                    <span>Continuar com Google</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span>ou com email</span>
                <span className="h-px flex-1 bg-border" />
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                className={cn(
                  "flex h-12 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm transition-colors",
                  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {mode === "signup" && (
              <div className="space-y-2">
                <label
                  htmlFor="full-name"
                  className="text-sm font-medium text-foreground"
                >
                  Nome
                </label>
                <input
                  id="full-name"
                  type="text"
                  placeholder="Ex: Ana Marques"
                  className={cn(
                    "flex h-12 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm transition-colors",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Palavra-passe
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••"
                minLength={4}
                className={cn(
                  "flex h-12 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm transition-colors",
                  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="medical-order"
                    className="text-sm font-medium text-foreground"
                  >
                    Nº Ordem dos Médicos
                  </label>
                  <input
                    id="medical-order"
                    type="number"
                    min={1000}
                    max={199999}
                    inputMode="numeric"
                    placeholder="Ex: 12345"
                    className={cn(
                      "flex h-12 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm transition-colors",
                      "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    value={medicalOrderNumber}
                    onChange={(e) => setMedicalOrderNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="graduation-year"
                    className="text-sm font-medium text-foreground"
                  >
                    Ano de conclusão do curso de Medicina
                  </label>
                  <input
                    id="graduation-year"
                    type="number"
                    min={1950}
                    max={new Date().getFullYear()}
                    placeholder="Ex: 2021"
                    className={cn(
                      "flex h-12 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm transition-colors",
                      "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="workplace"
                    className="text-sm font-medium text-foreground"
                  >
                    Local de trabalho
                  </label>
                  <input
                    id="workplace"
                    type="text"
                    placeholder="Ex: USF Viver Melhor"
                    className={cn(
                      "flex h-12 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm transition-colors",
                      "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    value={workplace}
                    onChange={(e) => setWorkplace(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {errorMsg && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
              )}
            >
              {!loading && <ArrowRight className="h-4 w-4" />}
              {loading
                ? "A processar..."
                : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}
            </button>
          </form>
            <p className="mt-6 text-center text-sm text-muted-foreground sm:hidden">
              <Link href="/" className="text-primary underline-offset-4 hover:underline">
                Voltar ao início
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
    >
      <path
        d="M21.805 12.23c0-.68-.061-1.333-.175-1.96H12v3.708h5.498a4.705 4.705 0 0 1-2.039 3.088v2.57h3.3c1.931-1.779 3.046-4.4 3.046-7.406Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.074-.915 6.765-2.48l-3.3-2.57c-.915.614-2.083.978-3.465.978-2.66 0-4.914-1.796-5.72-4.211H2.87v2.65A9.998 9.998 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.28 13.717A5.998 5.998 0 0 1 5.96 12c0-.596.103-1.174.32-1.717v-2.65H2.87A9.998 9.998 0 0 0 2 12c0 1.61.385 3.134 1.07 4.367l3.21-2.65Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.073c1.5 0 2.847.516 3.908 1.529l2.929-2.928C17.068 3.028 14.754 2 12 2A9.998 9.998 0 0 0 2.87 7.633l3.41 2.65C7.086 7.868 9.34 6.073 12 6.073Z"
        fill="#EA4335"
      />
    </svg>
  );
}
