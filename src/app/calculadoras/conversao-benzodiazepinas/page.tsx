"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, Waves } from "lucide-react";
import Link from "next/link";

type BenzodiazepineKey =
  | "alprazolam"
  | "bromazepam"
  | "chlordiazepoxide"
  | "clonazepam"
  | "diazepam"
  | "ethyl-loflazepate"
  | "lorazepam"
  | "mexazolam"
  | "oxazepam"
  | "temazepam";

type FormState = {
  fromDrug: BenzodiazepineKey;
  toDrug: BenzodiazepineKey;
  doseMg: string;
};

const benzodiazepines = [
  {
    id: "alprazolam",
    label: "Alprazolam",
    equivalentToDiazepam10mg: 0.5,
    halfLife: "6-12 h",
    route: "PO",
  },
  {
    id: "bromazepam",
    label: "Bromazepam",
    equivalentToDiazepam10mg: 5,
    halfLife: "10-20 h",
    route: "PO",
  },
  {
    id: "chlordiazepoxide",
    label: "Clordiazepoxido",
    equivalentToDiazepam10mg: 25,
    halfLife: "5-30 h",
    route: "PO",
  },
  {
    id: "clonazepam",
    label: "Clonazepam",
    equivalentToDiazepam10mg: 0.5,
    halfLife: "18-50 h",
    route: "PO",
  },
  {
    id: "diazepam",
    label: "Diazepam",
    equivalentToDiazepam10mg: 10,
    halfLife: "20-100 h",
    route: "PO",
  },
  {
    id: "ethyl-loflazepate",
    label: "Loflazepato de etilo",
    equivalentToDiazepam10mg: 3.3,
    halfLife: "51-103 h",
    route: "PO",
  },
  {
    id: "lorazepam",
    label: "Lorazepam",
    equivalentToDiazepam10mg: 1,
    halfLife: "10-20 h",
    route: "PO",
  },
  {
    id: "mexazolam",
    label: "Mexazolam",
    equivalentToDiazepam10mg: 3.3,
    halfLife: "Aprox. 76 h",
    route: "PO",
  },
  {
    id: "oxazepam",
    label: "Oxazepam",
    equivalentToDiazepam10mg: 20,
    halfLife: "4-15 h",
    route: "PO",
  },
  {
    id: "temazepam",
    label: "Temazepam",
    equivalentToDiazepam10mg: 20,
    halfLife: "8-22 h",
    route: "PO",
  },
] as const satisfies ReadonlyArray<{
  id: BenzodiazepineKey;
  label: string;
  equivalentToDiazepam10mg: number;
  halfLife: string;
  route: string;
}>;

const initialForm: FormState = {
  fromDrug: "lorazepam",
  toDrug: "diazepam",
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

  const fromDrug = benzodiazepines.find((item) => item.id === form.fromDrug);
  const toDrug = benzodiazepines.find((item) => item.id === form.toDrug);

  if (!fromDrug || !toDrug) {
    return null;
  }

  const diazepamEquivalentMg = (doseMg / fromDrug.equivalentToDiazepam10mg) * 10;
  const convertedDoseMg = (diazepamEquivalentMg / 10) * toDrug.equivalentToDiazepam10mg;

  return {
    fromDrug,
    toDrug,
    diazepamEquivalentMg,
    convertedDoseMg,
  };
}

export default function ConversaoBenzodiazepinasPage() {
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
                <Waves className="h-5 w-5 text-foreground" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Conversao de benzodiazepinas
                </p>
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  Equivalencia oral aproximada
                </h1>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Conversoes entre benzodiazepinas sao aproximadas. A substituicao clinica deve ser
              feita com precaucao, especialmente em idosos, insuficiencia hepatica e desmame.
            </div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Converter de
                </span>
                <select
                  value={form.fromDrug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fromDrug: event.target.value as BenzodiazepineKey,
                    }))
                  }
                  className="rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3 text-sm text-foreground outline-none"
                >
                  {benzodiazepines.map((drug) => (
                    <option key={drug.id} value={drug.id}>
                      {drug.label} ({drug.route})
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
                    placeholder="Ex.: 1"
                  />
                  <span className="text-sm font-medium text-muted-foreground">mg</span>
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Converter para
                </span>
                <select
                  value={form.toDrug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      toDrug: event.target.value as BenzodiazepineKey,
                    }))
                  }
                  className="rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3 text-sm text-foreground outline-none"
                >
                  {benzodiazepines.map((drug) => (
                    <option key={drug.id} value={drug.id}>
                      {drug.label} ({drug.route})
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
                      {result.toDrug.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                      {formatNumber(result.convertedDoseMg)}
                      <span className="ml-2 text-base font-medium text-muted-foreground">mg</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Equivalente aproximado a {formatNumber(Number(form.doseMg))} mg de{" "}
                      {result.fromDrug.label.toLowerCase()}.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Equivalente em diazepam
                    </p>
                    <p className="mt-2 text-xl font-semibold text-foreground">
                      {formatNumber(result.diazepamEquivalentMg)}
                      <span className="ml-2 text-sm font-medium text-muted-foreground">
                        mg de diazepam
                      </span>
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Equivalente padrao
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {formatNumber(result.fromDrug.equivalentToDiazepam10mg)} mg de{" "}
                        {result.fromDrug.label.toLowerCase()} = 10 mg de diazepam
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {formatNumber(result.toDrug.equivalentToDiazepam10mg)} mg de{" "}
                        {result.toDrug.label.toLowerCase()} = 10 mg de diazepam
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Semi-vida aproximada
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {result.fromDrug.label}: {result.fromDrug.halfLife}
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {result.toDrug.label}: {result.toDrug.halfLife}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border/70 bg-background/55 p-5 text-sm text-muted-foreground">
                  Escolhe as benzodiazepinas e introduz uma dose para obter a equivalencia.
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Notas
              </p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Estas equivalencias sao baseadas em tabelas de referencia e opiniao experiente;
                  diferentes fontes podem divergir ligeiramente.
                </p>
                <p>
                  Em trocas por seguranca ou desmame, costuma ser prudente arredondar por defeito e
                  monitorizar sedacao, abstinencia e funcao respiratoria.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
