"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, Pill } from "lucide-react";
import Link from "next/link";

type SteroidKey =
  | "betamethasone"
  | "cortisone"
  | "dexamethasone"
  | "deflazacort"
  | "hydrocortisone"
  | "methylprednisolone"
  | "prednisolone"
  | "prednisone"
  | "triamcinolone";

type FormState = {
  fromSteroid: SteroidKey;
  toSteroid: SteroidKey;
  doseMg: string;
};

const steroids = [
  {
    id: "betamethasone",
    label: "Betametasona",
    route: "IV",
    equivalentDoseMg: 0.6,
    duration: "Longa (36-72 h)",
  },
  {
    id: "cortisone",
    label: "Cortisona",
    route: "PO",
    equivalentDoseMg: 25,
    duration: "Curta (8-12 h)",
  },
  {
    id: "dexamethasone",
    label: "Dexametasona",
    route: "PO / IV",
    equivalentDoseMg: 0.75,
    duration: "Longa (36-72 h)",
  },
  {
    id: "deflazacort",
    label: "Deflazacorte",
    route: "PO",
    equivalentDoseMg: 7.5,
    duration: "Intermedia (12-24 h)",
  },
  {
    id: "hydrocortisone",
    label: "Hidrocortisona",
    route: "PO / IV",
    equivalentDoseMg: 20,
    duration: "Curta (8-12 h)",
  },
  {
    id: "methylprednisolone",
    label: "Metilprednisolona",
    route: "PO / IV",
    equivalentDoseMg: 4,
    duration: "Intermedia (12-36 h)",
  },
  {
    id: "prednisolone",
    label: "Prednisolona",
    route: "PO",
    equivalentDoseMg: 5,
    duration: "Intermedia (12-36 h)",
  },
  {
    id: "prednisone",
    label: "Prednisona",
    route: "PO",
    equivalentDoseMg: 5,
    duration: "Intermedia (12-36 h)",
  },
  {
    id: "triamcinolone",
    label: "Triamcinolona",
    route: "IV",
    equivalentDoseMg: 4,
    duration: "Intermedia (12-36 h)",
  },
] as const satisfies ReadonlyArray<{
  id: SteroidKey;
  label: string;
  route: string;
  equivalentDoseMg: number;
  duration: string;
}>;

const initialForm: FormState = {
  fromSteroid: "prednisone",
  toSteroid: "dexamethasone",
  doseMg: "",
};

function formatNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString("pt-PT", {
    minimumFractionDigits: 1,
    maximumFractionDigits,
  });
}

function buildResults(form: FormState) {
  const doseMg = Number(form.doseMg);

  if (!Number.isFinite(doseMg) || doseMg <= 0) {
    return null;
  }

  const fromSteroid = steroids.find((item) => item.id === form.fromSteroid);
  const toSteroid = steroids.find((item) => item.id === form.toSteroid);

  if (!fromSteroid || !toSteroid) {
    return null;
  }

  const antiInflammatoryUnits = doseMg / fromSteroid.equivalentDoseMg;
  const convertedDoseMg = antiInflammatoryUnits * toSteroid.equivalentDoseMg;

  return {
    fromSteroid,
    toSteroid,
    convertedDoseMg,
    antiInflammatoryUnits,
  };
}

export default function ConversaoCorticoidesPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const result = useMemo(() => buildResults(form), [form]);

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
                <Pill className="h-5 w-5 text-foreground" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Conversão de corticoides
                </p>
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  Glucocorticoides sistémicos
                </h1>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Conversão baseada na potência anti-inflamatória equivalente. Não aplicar a
              formulações tópicas, inaladas, intra-articulares ou intramusculares.
            </div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Converter de
                </span>
                <select
                  value={form.fromSteroid}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fromSteroid: event.target.value as SteroidKey,
                    }))
                  }
                  className="rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3 text-sm text-foreground outline-none"
                >
                  {steroids.map((steroid) => (
                    <option key={steroid.id} value={steroid.id}>
                      {steroid.label} ({steroid.route})
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Dose
                </span>
                <div className="flex items-center rounded-2xl border border-border/70 bg-secondary/60 px-4">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.doseMg}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, doseMg: event.target.value }))
                    }
                    className="w-full bg-transparent py-3 text-base text-foreground outline-none"
                    placeholder="Ex.: 40"
                  />
                  <span className="text-sm font-medium text-muted-foreground">mg</span>
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Converter para
                </span>
                <select
                  value={form.toSteroid}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      toSteroid: event.target.value as SteroidKey,
                    }))
                  }
                  className="rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3 text-sm text-foreground outline-none"
                >
                  {steroids.map((steroid) => (
                    <option key={steroid.id} value={steroid.id}>
                      {steroid.label} ({steroid.route})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Resultado
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                Dose equivalente
              </h2>

              {result ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.5rem] border border-primary/20 bg-primary/8 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {result.toSteroid.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                      {formatNumber(result.convertedDoseMg)}
                      <span className="ml-2 text-base font-medium text-muted-foreground">mg</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Equivalente a {formatNumber(Number(form.doseMg))} mg de{" "}
                      {result.fromSteroid.label.toLowerCase()}.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Equivalente padrao
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {formatNumber(result.fromSteroid.equivalentDoseMg)}
                        <span className="mx-2 text-sm font-medium text-muted-foreground">mg</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {result.fromSteroid.label.toLowerCase()}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        = {formatNumber(result.toSteroid.equivalentDoseMg)}
                        <span className="mx-2 text-sm font-medium text-muted-foreground">mg</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {result.toSteroid.label.toLowerCase()}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Duracao esperada
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {result.fromSteroid.label}: {result.fromSteroid.duration}
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {result.toSteroid.label}: {result.toSteroid.duration}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border/70 bg-background/55 p-5 text-sm text-muted-foreground">
                  Escolhe os corticoides e introduz uma dose para obter a equivalência.
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Notas
              </p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  A equivalência usada reflete a potência glucocorticoide anti-inflamatória, não
                  a atividade mineralocorticoide.
                </p>
                <p>
                  Em doentes com uso crónico, doença aguda ou necessidade de desmame, a dose final
                  deve ser ajustada ao contexto clínico.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
