"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, Scale } from "lucide-react";
import Link from "next/link";

type FormState = {
  weightKg: string;
  heightCm: string;
};

const initialForm: FormState = {
  weightKg: "",
  heightCm: "",
};

function formatNumber(value: number, maximumFractionDigits = 1) {
  return value.toLocaleString("pt-PT", {
    minimumFractionDigits: 1,
    maximumFractionDigits,
  });
}

function classifyBmi(bmi: number) {
  if (bmi < 18.5) {
    return {
      label: "Baixo peso",
      description: "Abaixo de 18,5 kg/m²",
      tone: "neutral" as const,
    };
  }

  if (bmi < 25) {
    return {
      label: "Peso saudavel",
      description: "Entre 18,5 e 24,9 kg/m²",
      tone: "good" as const,
    };
  }

  if (bmi < 30) {
    return {
      label: "Excesso de peso",
      description: "Entre 25,0 e 29,9 kg/m²",
      tone: "warning" as const,
    };
  }

  if (bmi < 35) {
    return {
      label: "Obesidade classe 1",
      description: "Entre 30,0 e 34,9 kg/m²",
      tone: "high" as const,
    };
  }

  if (bmi < 40) {
    return {
      label: "Obesidade classe 2",
      description: "Entre 35,0 e 39,9 kg/m²",
      tone: "high" as const,
    };
  }

  return {
    label: "Obesidade classe 3",
    description: "40,0 kg/m² ou mais",
    tone: "high" as const,
  };
}

function buildResults(form: FormState) {
  const weightKg = Number(form.weightKg);
  const heightCm = Number(form.heightCm);

  const validInputs =
    Number.isFinite(weightKg) &&
    weightKg > 0 &&
    Number.isFinite(heightCm) &&
    heightCm > 0;

  if (!validInputs) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  return {
    bmi,
    classification: classifyBmi(bmi),
  };
}

export default function ImcPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const results = useMemo(() => buildResults(form), [form]);

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
                <Scale className="h-5 w-5 text-foreground" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  IMC
                </p>
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  Indice de massa corporal
                </h1>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Calculadora para adultos com peso em quilogramas e altura em centimetros.
            </div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Peso
                </span>
                <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.weightKg}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, weightKg: event.target.value }))
                    }
                    className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                    placeholder="Ex.: 72"
                  />
                  <span className="text-sm font-medium text-muted-foreground">kg</span>
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Altura
                </span>
                <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.heightCm}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, heightCm: event.target.value }))
                    }
                    className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                    placeholder="Ex.: 175"
                  />
                  <span className="text-sm font-medium text-muted-foreground">cm</span>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Resultado
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">IMC</h2>

              {results ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.5rem] border border-primary/20 bg-primary/8 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Indice de massa corporal
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                      {formatNumber(results.bmi)}
                      <span className="ml-2 text-base font-medium text-muted-foreground">
                        kg/m²
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Classificacao: {results.classification.label}.
                    </p>
                  </div>

                  <div
                    className={`rounded-[1.5rem] border px-4 py-3 text-sm ${
                      results.classification.tone === "good"
                        ? "border-emerald-300/60 bg-emerald-50 text-emerald-900"
                        : results.classification.tone === "warning"
                          ? "border-amber-300/60 bg-amber-50 text-amber-900"
                          : results.classification.tone === "high"
                            ? "border-red-300/60 bg-red-50 text-red-900"
                            : "border-border/70 bg-background/60 text-foreground"
                    }`}
                  >
                    {results.classification.description}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border/70 bg-background/55 p-5 text-sm text-muted-foreground">
                  Introduz peso e altura para calcular o IMC.
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Formula
              </p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>IMC = peso em kg / (altura em metros × altura em metros).</p>
                <p>
                  O IMC e uma medida de rastreio e deve ser interpretado em conjunto com o contexto
                  clinico.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
