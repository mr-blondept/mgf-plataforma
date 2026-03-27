"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ShieldPlus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Sex = "female" | "male";

type FormState = {
  age: string;
  sex: Sex;
  heartFailure: boolean;
  hypertension: boolean;
  diabetes: boolean;
  priorStrokeOrTia: boolean;
  vascularDisease: boolean;
};

const sexOptions = [
  { value: "female", label: "Feminino" },
  { value: "male", label: "Masculino" },
] as const satisfies ReadonlyArray<{
  value: Sex;
  label: string;
}>;

const factorDefinitions = [
  {
    key: "heartFailure",
    label: "Insuficiencia cardiaca",
    description: "Ou disfuncao ventricular esquerda",
  },
  {
    key: "hypertension",
    label: "Hipertensao",
    description: "Tratada ou não tratada",
  },
  {
    key: "diabetes",
    label: "Diabetes mellitus",
    description: "Qualquer tipo",
  },
  {
    key: "priorStrokeOrTia",
    label: "AVC, AIT ou embolia previa",
    description: "Vale 2 pontos",
  },
  {
    key: "vascularDisease",
    label: "Doenca vascular",
    description: "EAM previo, DAP ou placa aortica",
  },
] as const satisfies ReadonlyArray<{
  key: keyof Omit<FormState, "age" | "sex">;
  label: string;
  description: string;
}>;

const initialForm: FormState = {
  age: "",
  sex: "female",
  heartFailure: false,
  hypertension: false,
  diabetes: false,
  priorStrokeOrTia: false,
  vascularDisease: false,
};

function calculateScore(form: FormState) {
  const age = Number(form.age);

  if (!Number.isFinite(age) || age < 0) {
    return null;
  }

  let score = 0;
  const breakdown: Array<{ label: string; points: number }> = [];

  if (form.heartFailure) {
    score += 1;
    breakdown.push({ label: "Insuficiencia cardiaca", points: 1 });
  }

  if (form.hypertension) {
    score += 1;
    breakdown.push({ label: "Hipertensao", points: 1 });
  }

  if (age >= 75) {
    score += 2;
    breakdown.push({ label: "Idade >= 75 anos", points: 2 });
  } else if (age >= 65) {
    score += 1;
    breakdown.push({ label: "Idade 65-74 anos", points: 1 });
  }

  if (form.diabetes) {
    score += 1;
    breakdown.push({ label: "Diabetes mellitus", points: 1 });
  }

  if (form.priorStrokeOrTia) {
    score += 2;
    breakdown.push({ label: "AVC/AIT/embolia previa", points: 2 });
  }

  if (form.vascularDisease) {
    score += 1;
    breakdown.push({ label: "Doenca vascular", points: 1 });
  }

  if (form.sex === "female") {
    score += 1;
    breakdown.push({ label: "Sexo feminino", points: 1 });
  }

  const recommendation = getRecommendation(score, form.sex);

  return {
    score,
    breakdown,
    recommendation,
  };
}

function getRecommendation(score: number, sex: Sex) {
  if ((sex === "male" && score === 0) || (sex === "female" && score === 1)) {
    return {
      band: "Baixo risco",
      summary: "Anticoagulação oral geralmente não indicada apenas com base no score.",
      tone: "neutral" as const,
    };
  }

  if ((sex === "male" && score === 1) || (sex === "female" && score === 2)) {
    return {
      band: "Risco intermédio",
      summary: "Anticoagulação oral pode ser considerada após avaliação individual.",
      tone: "warning" as const,
    };
  }

  return {
    band: "Risco elevado",
    summary: "Anticoagulação oral geralmente recomendada se não houver contraindicações.",
    tone: "high" as const,
  };
}

export default function Cha2ds2VascPage() {
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
                <ShieldPlus className="h-5 w-5 text-foreground" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  CHA2DS2-VASc
                </p>
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  Fibrilhacao auricular
                </h1>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Para fibrilhação auricular não valvular. O score estima risco tromboembólico, mas não
              substitui a avaliação do risco hemorrágico e o contexto clínico.
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
                      min="0"
                      step="1"
                      value={form.age}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, age: event.target.value }))
                      }
                      className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                      placeholder="Ex.: 78"
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

              <div className="grid gap-3">
                {factorDefinitions.map((factor) => (
                  <button
                    key={factor.key}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        [factor.key]: !current[factor.key],
                      }))
                    }
                    className={cn(
                      "rounded-[1.5rem] border px-4 py-4 text-left transition-all",
                      form[factor.key]
                        ? "border-primary bg-primary/10 text-foreground shadow-sm"
                        : "border-border/70 bg-secondary/60 text-foreground hover:border-foreground/40",
                    )}
                  >
                    <p className="text-sm font-semibold">{factor.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{factor.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Resultado
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                Score total
              </h2>

              {result ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.5rem] border border-primary/20 bg-primary/8 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      CHA2DS2-VASc
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-foreground">{result.score}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {result.recommendation.band}. {result.recommendation.summary}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "rounded-[1.5rem] border px-4 py-3 text-sm",
                      result.recommendation.tone === "high"
                        ? "border-red-300/60 bg-red-50 text-red-900"
                        : result.recommendation.tone === "warning"
                          ? "border-amber-300/60 bg-amber-50 text-amber-900"
                          : "border-border/70 bg-background/60 text-foreground",
                    )}
                  >
                    Em homens, a anticoagulação é geralmente recomendada a partir de 2 pontos. Em
                    mulheres, a partir de 3 pontos; 1 ponto isolado por sexo feminino não conta
                    como indicação autónoma.
                  </div>

                  <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Componentes pontuados
                    </p>
                    {result.breakdown.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {result.breakdown.map((item) => (
                          <div key={item.label} className="flex items-center justify-between gap-3">
                            <span className="text-sm text-foreground">{item.label}</span>
                            <span className="text-sm font-semibold text-foreground">
                              +{item.points}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Sem fatores adicionais identificados.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border/70 bg-background/55 p-5 text-sm text-muted-foreground">
                  Introduz pelo menos a idade para calcular o score.
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Componentes
              </p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>C: insuficiência cardíaca, H: hipertensão, D: diabetes, V: doença vascular.</p>
                <p>A idade vale 2 pontos se for 75 ou mais, e 1 ponto entre 65 e 74 anos.</p>
                <p>S2 corresponde a AVC, AIT ou embolia prévia e vale 2 pontos.</p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
