"use client";

import { useMemo, useState } from "react";
import { Activity, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Sex = "female" | "male";
type CreatinineUnit = "mg/dL" | "umol/L";

type FormState = {
  age: string;
  sex: Sex;
  creatinine: string;
  creatinineUnit: CreatinineUnit;
};

type EquationResult = {
  label: string;
  indexedValue: number;
  stage: {
    category: string;
    label: string;
  };
};

const sexOptions = [
  { value: "female", label: "Feminino" },
  { value: "male", label: "Masculino" },
] as const satisfies ReadonlyArray<{
  value: Sex;
  label: string;
}>;

const initialForm: FormState = {
  age: "",
  sex: "female",
  creatinine: "",
  creatinineUnit: "mg/dL",
};

function formatNumber(value: number, maximumFractionDigits = 1) {
  return value.toLocaleString("pt-PT", {
    minimumFractionDigits: 1,
    maximumFractionDigits,
  });
}

function toCreatinineMgDl(value: number, unit: CreatinineUnit) {
  if (unit === "mg/dL") {
    return value;
  }

  return value / 88.4;
}

function classifyGfr(value: number) {
  if (value >= 90) {
    return { category: "G1", label: "Normal ou elevada" };
  }

  if (value >= 60) {
    return { category: "G2", label: "Ligeiramente diminuida" };
  }

  if (value >= 45) {
    return { category: "G3a", label: "Ligeira a moderadamente diminuida" };
  }

  if (value >= 30) {
    return { category: "G3b", label: "Moderada a gravemente diminuida" };
  }

  if (value >= 15) {
    return { category: "G4", label: "Gravemente diminuida" };
  }

  return { category: "G5", label: "Falencia renal" };
}

function calculateCreatinineEgfr(age: number, sex: Sex, creatinineMgDl: number) {
  const kappa = sex === "female" ? 0.7 : 0.9;
  const alpha = sex === "female" ? -0.241 : -0.302;
  const sexFactor = sex === "female" ? 1.012 : 1;
  const ratio = creatinineMgDl / kappa;

  return (
    142 *
    Math.min(ratio, 1) ** alpha *
    Math.max(ratio, 1) ** -1.2 *
    0.9938 ** age *
    sexFactor
  );
}

function buildResults(form: FormState) {
  const age = Number(form.age);
  const creatinineValue = Number(form.creatinine);

  const validAge = Number.isFinite(age) && age >= 18;
  const hasCreatinine = Number.isFinite(creatinineValue) && creatinineValue > 0;

  if (!validAge || !hasCreatinine) {
    return null;
  }

  const creatinineMgDl = toCreatinineMgDl(creatinineValue, form.creatinineUnit);
  const indexedValue = calculateCreatinineEgfr(age, form.sex, creatinineMgDl);
  const equation: EquationResult = {
    label: "CKD-EPI creatinina 2021",
    indexedValue,
    stage: classifyGfr(indexedValue),
  };

  return {
    equation,
    creatinineMgDl,
  };
}

export default function TfgePage() {
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
                <Activity className="h-5 w-5 text-foreground" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  TFGe
                </p>
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  CKD-EPI adulto
                </h1>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Uso em adultos com 18 ou mais anos. Esta equacao requer creatinina padronizada
              para IDMS.
            </div>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Idade
                  </span>
                  <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                    <input
                      type="number"
                      min="18"
                      step="1"
                      value={form.age}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, age: event.target.value }))
                      }
                      className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                      placeholder="Ex.: 67"
                    />
                    <span className="text-sm font-medium text-muted-foreground">anos</span>
                  </div>
                </label>

                <div className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Sexo
                  </span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {sexOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            sex: option.value,
                          }))
                        }
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all",
                          form.sex === option.value
                            ? "border-primary bg-primary/10 text-foreground shadow-sm"
                            : "border-border/70 bg-secondary/60 text-foreground hover:border-foreground/40",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.35fr_0.65fr]">
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Creatinina serica
                  </span>
                  <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.creatinine}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, creatinine: event.target.value }))
                      }
                      className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                      placeholder="Ex.: 1.14"
                    />
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Unidade
                  </span>
                  <select
                    value={form.creatinineUnit}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        creatinineUnit: event.target.value as CreatinineUnit,
                      }))
                    }
                    className="rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3 text-sm text-foreground outline-none"
                  >
                    <option value="mg/dL">mg/dL</option>
                    <option value="umol/L">umol/L</option>
                  </select>
                </label>
              </div>

            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Resultado
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                Estimativa da filtracao glomerular
              </h2>

              {results ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {results.equation.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                      {formatNumber(results.equation.indexedValue)}
                      <span className="ml-2 text-base font-medium text-muted-foreground">
                        mL/min/1,73 m²
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Categoria {results.equation.stage.category}: {results.equation.stage.label}.
                    </p>

                  </div>

                  {results.creatinineMgDl ? (
                    <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Creatinina convertida
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {formatNumber(results.creatinineMgDl, 2)}
                        <span className="ml-2 text-sm font-medium text-muted-foreground">
                          mg/dL
                        </span>
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border/70 bg-background/55 p-5 text-sm text-muted-foreground">
                  Introduz idade, sexo e creatinina para gerar a TFGe.
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Notas de interpretacao
              </p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  G1 e G2, isoladamente, nao confirmam DRC sem outros marcadores de lesao renal
                  persistentes por pelo menos 3 meses.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
