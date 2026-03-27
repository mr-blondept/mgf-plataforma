"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, CircleHelp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FormState = {
  cutDown: boolean;
  annoyed: boolean;
  guilty: boolean;
  eyeOpener: boolean;
};

const questions = [
  {
    key: "cutDown",
    letter: "C",
    title: "Cut down",
    question: "Alguma vez sentiu que devia reduzir o consumo de alcool?",
  },
  {
    key: "annoyed",
    letter: "A",
    title: "Annoyed",
    question: "As criticas de outras pessoas ao seu consumo de alcool ja o incomodaram?",
  },
  {
    key: "guilty",
    letter: "G",
    title: "Guilty",
    question: "Alguma vez se sentiu mal ou culpado em relacao ao seu consumo de alcool?",
  },
  {
    key: "eyeOpener",
    letter: "E",
    title: "Eye-opener",
    question: "Alguma vez precisou de beber logo de manha para acalmar os nervos ou aliviar a ressaca?",
  },
] as const satisfies ReadonlyArray<{
  key: keyof FormState;
  letter: string;
  title: string;
  question: string;
}>;

const initialForm: FormState = {
  cutDown: false,
  annoyed: false,
  guilty: false,
  eyeOpener: false,
};

function interpretScore(score: number) {
  if (score <= 1) {
    return {
      label: "Baixa suspeita",
      description: "Um resultado de 0-1 nao sugere fortemente dependencia alcoolica pelo CAGE.",
      tone: "neutral" as const,
    };
  }

  if (score <= 3) {
    return {
      label: "Suspeita aumentada",
      description: "Um score de 2-3 sugere elevada suspeita e justifica avaliacao adicional.",
      tone: "warning" as const,
    };
  }

  return {
    label: "Muito sugestivo",
    description: "Um score de 4 e altamente sugestivo de problema relacionado com alcool.",
    tone: "high" as const,
  };
}

function calculateScore(form: FormState) {
  const positiveItems = questions.filter((item) => form[item.key]);
  const score = positiveItems.length;

  return {
    score,
    positiveItems,
    interpretation: interpretScore(score),
  };
}

export default function CagePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const result = useMemo(() => calculateScore(form), [form]);

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="absolute inset-0 hero-surface opacity-70" />
      <div className="absolute inset-0 soft-grain opacity-25" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/calculadoras"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar a Calculadoras
          </Link>
        </div>

        <section className="mt-2 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/75 shadow-sm">
                <CircleHelp className="h-5 w-5 text-foreground" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  CAGE
                </p>
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  Uso de alcool
                </h1>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Ferramenta breve de rastreio. Nao estabelece diagnostico e deve ser interpretada no
              contexto clinico.
            </div>

            <div className="mt-6 grid gap-4">
              {questions.map((item) => (
                <div
                  key={item.key}
                  className="rounded-[1.5rem] border border-border/70 bg-secondary/50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        {item.letter} · {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">
                        {item.question}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          [item.key]: !current[item.key],
                        }))
                      }
                      className={cn(
                        "shrink-0 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all",
                        form[item.key]
                          ? "border-primary bg-primary/10 text-foreground shadow-sm"
                          : "border-border/70 bg-background/80 text-muted-foreground hover:border-foreground/40",
                      )}
                    >
                      {form[item.key] ? "Sim" : "Nao"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Resultado
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                Score CAGE
              </h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-[1.5rem] border border-primary/20 bg-primary/8 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Score</p>
                  <p className="mt-2 text-4xl font-semibold text-foreground">{result.score}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {result.interpretation.label}. {result.interpretation.description}
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-[1.5rem] border px-4 py-3 text-sm",
                    result.interpretation.tone === "high"
                      ? "border-red-300/60 bg-red-50 text-red-900"
                      : result.interpretation.tone === "warning"
                        ? "border-amber-300/60 bg-amber-50 text-amber-900"
                        : "border-border/70 bg-background/60 text-foreground",
                  )}
                >
                  Cada resposta &quot;Sim&quot; vale 1 ponto. Em adultos, um score de 2 ou mais costuma ser
                  considerado positivo para rastreio.
                </div>

                <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Respostas positivas
                  </p>
                  {result.positiveItems.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {result.positiveItems.map((item) => (
                        <div key={item.key} className="text-sm text-foreground">
                          {item.letter}: {item.question}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Nenhuma resposta positiva.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Nota clinica
              </p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  O CAGE pergunta por experiencia ao longo da vida e pode falhar consumo de risco
                  atual sem consequencias aparentes.
                </p>
                <p>
                  Se o rastreio for positivo, deve seguir-se avaliacao adicional com historia
                  clinica e instrumento complementar apropriado.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
