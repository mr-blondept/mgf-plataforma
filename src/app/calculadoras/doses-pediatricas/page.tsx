"use client";

import { useState } from "react";
import { ChevronLeft, Syringe } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  pediatricDosePresets,
  type DosePreset,
} from "@/data/pediatric-dose-presets";

type FormState = {
  weightKg: string;
  presetId: string;
  doseMinMgKg: string;
  doseMaxMgKg: string;
  regimenDivisor: DosePreset["regimenDivisor"];
  concentrationMg: string;
  concentrationMl: string;
  bottleMl: string;
  maxDoseMg: string;
};

const regimenOptions = [
  { value: 1, label: "Por toma / por dia", hint: "Toma unica" },
  { value: 2, label: "12h", hint: "2 tomas por dia" },
  { value: 3, label: "8h", hint: "3 tomas por dia" },
  { value: 4, label: "6h", hint: "4 tomas por dia" },
] as const;

const initialPreset = pediatricDosePresets[0];

function formatDecimal(value: number) {
  return value.toLocaleString("pt-PT", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatWhole(value: number) {
  return value.toLocaleString("pt-PT", { maximumFractionDigits: 0 });
}

function toConcentrationLabel(mgValue: number, mlValue: number) {
  if (!Number.isFinite(mgValue) || !Number.isFinite(mlValue) || mgValue <= 0 || mlValue <= 0) {
    return "-";
  }

  if (mgValue < mlValue) {
    return `${mgValue} mg/${mlValue} mL`;
  }

  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const factor = gcd(mgValue, mlValue);
  const simplifiedMg = mgValue / factor;
  const simplifiedMl = mlValue / factor;

  return `${simplifiedMg} mg/${simplifiedMl > 1 ? simplifiedMl : ""} mL`.replace(
    "/ mL",
    "/mL",
  );
}

function calculateDose(form: FormState) {
  const weightKg = Number(form.weightKg);
  const doseMinMgKg = Number(form.doseMinMgKg);
  const doseMaxMgKg = Number(form.doseMaxMgKg);
  const regimenDivisor = Number(form.regimenDivisor);
  const concentrationMg = Number(form.concentrationMg);
  const concentrationMl = Number(form.concentrationMl);
  const bottleMl = Number(form.bottleMl);
  const maxDoseMg = Number(form.maxDoseMg);

  if (
    !Number.isFinite(weightKg) ||
    weightKg <= 0 ||
    !Number.isFinite(doseMinMgKg) ||
    !Number.isFinite(doseMaxMgKg) ||
    doseMinMgKg < 0 ||
    doseMaxMgKg < doseMinMgKg ||
    !Number.isFinite(regimenDivisor) ||
    regimenDivisor <= 0 ||
    !Number.isFinite(concentrationMg) ||
    concentrationMg <= 0 ||
    !Number.isFinite(concentrationMl) ||
    concentrationMl <= 0 ||
    !Number.isFinite(bottleMl) ||
    bottleMl <= 0 ||
    !Number.isFinite(maxDoseMg) ||
    maxDoseMg <= 0
  ) {
    return null;
  }

  const minMgPerDose = Math.min((weightKg * doseMinMgKg) / regimenDivisor, maxDoseMg);
  const maxMgPerDose = Math.min((weightKg * doseMaxMgKg) / regimenDivisor, maxDoseMg);
  const minMlPerDose = (minMgPerDose * concentrationMl) / concentrationMg;
  const maxMlPerDose = (maxMgPerDose * concentrationMl) / concentrationMg;
  const longestBottleDuration = bottleMl / (minMlPerDose * regimenDivisor);
  const shortestBottleDuration = bottleMl / (maxMlPerDose * regimenDivisor);

  return {
    minMgPerDose,
    maxMgPerDose,
    minMlPerDose,
    maxMlPerDose,
    shortestBottleDuration,
    longestBottleDuration,
    concentrationLabel: toConcentrationLabel(concentrationMg, concentrationMl),
    durationUnit: regimenDivisor > 1 ? "dias" : "tomas",
    capped: (weightKg * doseMaxMgKg) / regimenDivisor > maxDoseMg,
  };
}

function presetToForm(preset: DosePreset): FormState {
  return {
    weightKg: "",
    presetId: preset.id,
    doseMinMgKg: String(preset.doseMinMgKg),
    doseMaxMgKg: String(preset.doseMaxMgKg),
    regimenDivisor: preset.regimenDivisor,
    concentrationMg: String(preset.concentrationMg),
    concentrationMl: String(preset.concentrationMl),
    bottleMl: String(preset.bottleMl),
    maxDoseMg: String(preset.maxDoseMg),
  };
}

export default function DosesPediatricasPage() {
  const [form, setForm] = useState<FormState>(presetToForm(initialPreset));
  const selectedPreset =
    pediatricDosePresets.find((preset) => preset.id === form.presetId) ?? initialPreset;
  const result = calculateDose(form);

  function applyPreset(presetId: string) {
    const preset =
      pediatricDosePresets.find((item) => item.id === presetId) ?? pediatricDosePresets[0];

    setForm((current) => ({
      ...presetToForm(preset),
      weightKg: current.weightKg,
    }));
  }

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
                <Syringe className="h-5 w-5 text-foreground" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Doses pediátricas
                </p>
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  Calculadora oral
                </h1>
              </div>
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
                    placeholder="Ex.: 18.5"
                  />
                  <span className="text-sm font-medium text-muted-foreground">kg</span>
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Fármaco
                </span>
                <select
                  value={form.presetId}
                  onChange={(event) => applyPreset(event.target.value)}
                  className="rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3 text-sm text-foreground outline-none"
                >
                  {pediatricDosePresets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Dose minima
                  </span>
                  <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.doseMinMgKg}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, doseMinMgKg: event.target.value }))
                      }
                      className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                    />
                    <span className="text-sm font-medium text-muted-foreground">mg/kg</span>
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Dose maxima
                  </span>
                  <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.doseMaxMgKg}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, doseMaxMgKg: event.target.value }))
                      }
                      className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                    />
                    <span className="text-sm font-medium text-muted-foreground">mg/kg</span>
                  </div>
                </label>
              </div>

              <div className="grid gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Frequencia
                </span>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {regimenOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          regimenDivisor: option.value,
                        }))
                      }
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition-all",
                        form.regimenDivisor === option.value
                          ? "border-primary bg-primary/10 text-foreground shadow-sm"
                          : "border-border/70 bg-secondary/60 text-foreground hover:border-foreground/40",
                      )}
                    >
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{option.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Concentracao
                  </span>
                  <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.concentrationMg}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          concentrationMg: event.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-base text-foreground outline-none"
                    />
                    <span className="text-sm text-muted-foreground">mg /</span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.concentrationMl}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          concentrationMl: event.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-base text-foreground outline-none"
                    />
                    <span className="text-sm text-muted-foreground">mL</span>
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Embalagem
                  </span>
                  <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.bottleMl}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, bottleMl: event.target.value }))
                      }
                      className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                    />
                    <span className="text-sm font-medium text-muted-foreground">mL</span>
                  </div>
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Dose maxima absoluta
                </span>
                <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.maxDoseMg}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, maxDoseMg: event.target.value }))
                    }
                    className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                  />
                  <span className="text-sm font-medium text-muted-foreground">mg</span>
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
                {selectedPreset.name}
              </h2>

              {result ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.5rem] border border-primary/20 bg-primary/8 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Volume por toma
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                      {formatDecimal(result.minMlPerDose)}
                      {result.minMlPerDose.toFixed(1) !== result.maxMlPerDose.toFixed(1)
                        ? ` a ${formatDecimal(result.maxMlPerDose)}`
                        : ""}
                      <span className="ml-2 text-base font-medium text-muted-foreground">mL</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      de uma solucao com {result.concentrationLabel}.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Dose em mg por toma
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {formatDecimal(result.minMgPerDose)}
                        {result.minMgPerDose.toFixed(1) !== result.maxMgPerDose.toFixed(1)
                          ? ` a ${formatDecimal(result.maxMgPerDose)}`
                          : ""}
                        <span className="ml-2 text-sm font-medium text-muted-foreground">mg</span>
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Duracao estimada do frasco
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {formatWhole(Math.floor(result.shortestBottleDuration))}
                        {Math.floor(result.shortestBottleDuration) !==
                        Math.floor(result.longestBottleDuration)
                          ? ` a ${formatWhole(Math.floor(result.longestBottleDuration))}`
                          : ""}
                        <span className="ml-2 text-sm font-medium text-muted-foreground">
                          {result.durationUnit}
                        </span>
                      </p>
                    </div>

                    {result.capped ? (
                      <div className="rounded-[1.5rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        A dose maxima configurada limitou o valor calculado por toma.
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border/70 bg-background/55 p-5 text-sm text-muted-foreground">
                  Preenche os campos da esquerda para gerar o calculo.
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
