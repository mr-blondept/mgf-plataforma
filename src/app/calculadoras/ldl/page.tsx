"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, HeartPulse } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Unit = "mg/dL" | "mmol/L";

type FormState = {
  totalCholesterol: string;
  hdl: string;
  triglycerides: string;
  unit: Unit;
};

const unitOptions = [
  { value: "mg/dL", label: "mg/dL" },
  { value: "mmol/L", label: "mmol/L" },
] as const satisfies ReadonlyArray<{
  value: Unit;
  label: string;
}>;

const initialForm: FormState = {
  totalCholesterol: "",
  hdl: "",
  triglycerides: "",
  unit: "mg/dL",
};

function formatNumber(value: number, maximumFractionDigits = 1) {
  return value.toLocaleString("pt-PT", {
    minimumFractionDigits: 1,
    maximumFractionDigits,
  });
}

function getThreshold(unit: Unit) {
  return unit === "mg/dL" ? 400 : 4.5;
}

function calculateLdl(totalCholesterol: number, hdl: number, triglycerides: number, unit: Unit) {
  const divisor = unit === "mg/dL" ? 5 : 2.2;
  return totalCholesterol - hdl - triglycerides / divisor;
}

function classifyLdl(ldl: number, unit: Unit) {
  const valueMgDl = unit === "mg/dL" ? ldl : ldl * 38.67;

  if (valueMgDl < 100) {
    return "Ótimo";
  }

  if (valueMgDl < 130) {
    return "Quase ótimo";
  }

  if (valueMgDl < 160) {
    return "Limite elevado";
  }

  if (valueMgDl < 190) {
    return "Elevado";
  }

  return "Muito elevado";
}

function buildResults(form: FormState) {
  const totalCholesterol = Number(form.totalCholesterol);
  const hdl = Number(form.hdl);
  const triglycerides = Number(form.triglycerides);

  const validValues =
    Number.isFinite(totalCholesterol) &&
    totalCholesterol > 0 &&
    Number.isFinite(hdl) &&
    hdl >= 0 &&
    Number.isFinite(triglycerides) &&
    triglycerides >= 0;

  if (!validValues) {
    return null;
  }

  const ldl = calculateLdl(totalCholesterol, hdl, triglycerides, form.unit);
  const threshold = getThreshold(form.unit);
  const unreliable = triglycerides >= threshold;
  const nonHdl = totalCholesterol - hdl;

  return {
    ldl,
    nonHdl,
    unreliable,
    threshold,
    classification: classifyLdl(ldl, form.unit),
  };
}

export default function LdlPage() {
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
                <HeartPulse className="h-5 w-5 text-foreground" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  LDL
                </p>
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  Friedewald
                </h1>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Usa a fórmula de Friedewald. O resultado perde fiabilidade com triglicéridos altos.
            </div>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Unidade
                </span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {unitOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          unit: option.value,
                        }))
                      }
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all",
                        form.unit === option.value
                          ? "border-primary bg-primary/10 text-foreground shadow-sm"
                          : "border-border/70 bg-secondary/60 text-foreground hover:border-foreground/40",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Colesterol total
                </span>
                <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.totalCholesterol}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        totalCholesterol: event.target.value,
                      }))
                    }
                    className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                    placeholder="Ex.: 210"
                  />
                  <span className="text-sm font-medium text-muted-foreground">{form.unit}</span>
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  HDL
                </span>
                <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.hdl}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, hdl: event.target.value }))
                    }
                    className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                    placeholder="Ex.: 52"
                  />
                  <span className="text-sm font-medium text-muted-foreground">{form.unit}</span>
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Triglicéridos
                </span>
                <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.triglycerides}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        triglycerides: event.target.value,
                      }))
                    }
                    className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                    placeholder="Ex.: 140"
                  />
                  <span className="text-sm font-medium text-muted-foreground">{form.unit}</span>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Resultado
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                LDL calculado
              </h2>

              {results ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.5rem] border border-primary/20 bg-primary/8 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      LDL
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                      {formatNumber(results.ldl)}
                      <span className="ml-2 text-base font-medium text-muted-foreground">
                        {form.unit}
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Classificação: {results.classification}.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Colesterol não-HDL
                    </p>
                    <p className="mt-2 text-xl font-semibold text-foreground">
                      {formatNumber(results.nonHdl)}
                      <span className="ml-2 text-sm font-medium text-muted-foreground">
                        {form.unit}
                      </span>
                    </p>
                  </div>

                  {results.unreliable ? (
                    <div className="rounded-[1.5rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Triglicéridos em {formatNumber(Number(form.triglycerides))} {form.unit}. A
                      fórmula de Friedewald é menos fiável a partir de {results.threshold}{" "}
                      {form.unit}; considera doseamento direto de LDL.
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border/70 bg-background/55 p-5 text-sm text-muted-foreground">
                  Introduz colesterol total, HDL e triglicéridos para calcular o LDL.
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Formula
              </p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Em {form.unit}, LDL = colesterol total - HDL - triglicéridos /
                  {form.unit === "mg/dL" ? " 5" : " 2,2"}.
                </p>
                <p>
                  A estimativa é clássica e simples, mas pode subestimar o LDL quando os
                  triglicéridos estão elevados.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
