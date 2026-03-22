'use client';

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

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
        A carregar autenticação...
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
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div
          className={cn(
            "rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8"
          )}
        >
          <div className="mb-6 flex flex-col items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold text-foreground"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Stethoscope className="h-5 w-5" />
                </span>
                MediFam
              </Link>
            <p className="text-sm text-muted-foreground">
              Internato de Medicina Geral e Familiar
            </p>
          </div>

          <div className="mb-6 flex rounded-xl bg-muted p-1">
            <button
              type="button"
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
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
                "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
                mode === "signup"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setMode("signup")}
            >
              Criar conta
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                  "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
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
                    "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
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
                  "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
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
                      "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
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
                      "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
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
                      "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
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
                "flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
              )}
            >
              {loading
                ? "A processar..."
                : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary underline-offset-4 hover:underline">
              ← Voltar ao início
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
