"use client";

import { useMemo, useState } from "react";
import { Baby, CalendarClock, HeartPulse, ShieldCheck, Syringe } from "lucide-react";
import { cn } from "@/lib/utils";

type VaccineKey =
  | "VHB"
  | "Hib"
  | "DTPa"
  | "VIP"
  | "Pn13"
  | "MenB"
  | "MenC"
  | "VASPR"
  | "HPV"
  | "Tdpa"
  | "Td";

type VaccineInfo = {
  id: VaccineKey;
  label: string;
  disease: string;
  summary: string;
  schedule: string[];
  notes: string[];
};

type AudienceSection = {
  id: string;
  label: string;
  description: string;
  highlight: string;
  vaccineIds: VaccineKey[];
};

const SOURCE_URL =
  "https://www.dgs.pt/normas-orientacoes-e-informacoes/normas-e-circulares-normativas/norma-n-0182020-de-27092020-pdf.aspx";

const VACCINES: VaccineInfo[] = [
  {
    id: "VHB",
    label: "VHB",
    disease: "Hepatite B",
    summary: "Proteção contra a infeção pelo vírus da hepatite B.",
    schedule: ["Nascimento", "2 meses", "4 meses"],
    notes: [
      "A dose ao nascimento deve ser administrada na maternidade ou o mais precocemente possível no período neonatal.",
      "É uma das vacinas estruturantes do esquema infantil inicial do PNV 2020.",
    ],
  },
  {
    id: "Hib",
    label: "Hib",
    disease: "Haemophilus influenzae b",
    summary: "Previne doença invasiva por Hib, incluindo meningite e sépsis.",
    schedule: ["2 meses", "4 meses", "12 meses", "18 meses"],
    notes: [
      "Integra a primovacinação e um reforço posterior na primeira infância.",
      "Em atraso, o número de doses varia com a idade de início do esquema.",
    ],
  },
  {
    id: "DTPa",
    label: "DTPa",
    disease: "Difteria, tétano e tosse convulsa",
    summary: "Vacina combinada usada na infância para proteção precoce e reforços.",
    schedule: ["2 meses", "4 meses", "12 meses", "18 meses", "5 anos"],
    notes: [
      "As crianças que tiveram tosse convulsa devem ainda assim iniciar ou completar a vacinação após a cura.",
      "Mantém proteção contra três doenças preveníveis com elevada relevância clínica.",
    ],
  },
  {
    id: "VIP",
    label: "VIP",
    disease: "Poliomielite",
    summary: "Vacina inativada contra a poliomielite no esquema infantil.",
    schedule: ["2 meses", "4 meses", "12 meses", "18 meses", "5 anos"],
    notes: [
      "Faz parte do esquema geral recomendado para a população infantil.",
      "Os esquemas tardios dependem da idade e do histórico vacinal prévio.",
    ],
  },
  {
    id: "Pn13",
    label: "Pn13",
    disease: "Doença invasiva pneumocócica",
    summary: "Protege contra infeções por Streptococcus pneumoniae.",
    schedule: ["2 meses", "4 meses", "12 meses"],
    notes: [
      "Se a primeira dose for dada antes dos 6 meses, a terceira pode ser administrada a partir dos 11 meses.",
      "Após doença invasiva pneumocócica, pode ser necessário iniciar ou completar o esquema, conforme a idade.",
    ],
  },
  {
    id: "MenB",
    label: "MenB",
    disease: "Neisseria meningitidis do grupo B",
    summary: "Protege contra doença invasiva meningocócica por serogrupo B.",
    schedule: ["2 meses", "4 meses", "12 meses"],
    notes: [
      "No PNV 2020 passou a abranger todas as crianças nestas idades.",
      "Crianças nascidas a partir de 2019 podem completar o esquema no âmbito do PNV até antes dos 5 anos, de acordo com a idade.",
    ],
  },
  {
    id: "MenC",
    label: "MenC",
    disease: "Neisseria meningitidis do grupo C",
    summary: "Vacina meningocócica recomendada na infância.",
    schedule: ["12 meses"],
    notes: [
      "É administrada como dose única no esquema geral recomendado.",
      "Pode ser indicada em recuperação de atraso conforme idade e contexto clínico.",
    ],
  },
  {
    id: "VASPR",
    label: "VASPR",
    disease: "Sarampo, parotidite epidémica e rubéola",
    summary: "Vacina tripla vírica usada na infância e em esquemas específicos do adulto.",
    schedule: ["12 meses", "5 anos"],
    notes: [
      "Adultos nascidos a partir de 1970 sem história credível de sarampo devem receber 1 dose.",
      "Profissionais de saúde com contacto próximo com doentes devem ter 2 doses, independentemente do ano de nascimento.",
    ],
  },
  {
    id: "HPV",
    label: "HPV",
    disease: "Infeções por vírus do papiloma humano",
    summary: "Protege contra genótipos oncogénicos e, no PNV 2020, também contra genótipos causadores de condilomas ano-genitais.",
    schedule: ["10 anos", "2 doses: 0 e 6 meses"],
    notes: [
      "Em 2020 o PNV alargou a vacinação também ao sexo masculino, se nascidos a partir de 2009.",
      "Rapazes que iniciaram vacinação por prescrição médica podem completar o esquema no PNV até antes dos 27 anos.",
    ],
  },
  {
    id: "Tdpa",
    label: "Tdpa",
    disease: "Tétano, difteria e tosse convulsa",
    summary: "Indicada na gravidez para proteção passiva do recém-nascido.",
    schedule: ["Cada gravidez", "Idealmente entre 20 e 36 semanas"],
    notes: [
      "A norma refere administração após a ecografia morfológica e idealmente até às 32 semanas.",
      "Após as 36 semanas pode ainda conferir proteção indireta através da prevenção da doença na mãe.",
    ],
  },
  {
    id: "Td",
    label: "Td",
    disease: "Tétano e difteria",
    summary: "Reforços ao longo da vida conforme idade da última dose.",
    schedule: ["25 anos", "45 anos", "65 anos", "Depois de 65 anos: de 10 em 10 anos"],
    notes: [
      "Se a última dose tiver ocorrido entre os 18 e os 44 anos, a seguinte é recomendada 20 anos depois.",
      "A partir dos 65 anos, os reforços são recomendados de 10 em 10 anos.",
    ],
  },
];

const AUDIENCES: AudienceSection[] = [
  {
    id: "infancia",
    label: "Infância",
    description: "Esquema geral recomendado do nascimento até aos 5 anos.",
    highlight: "Cobertura inicial com doses ao nascimento, 2, 4, 12 e 18 meses, com reforços aos 5 anos.",
    vaccineIds: ["VHB", "Hib", "DTPa", "VIP", "Pn13", "MenB", "MenC", "VASPR"],
  },
  {
    id: "adolescencia",
    label: "Adolescência",
    description: "Vacinação de continuidade aos 10 anos.",
    highlight: "Aos 10 anos destacam-se a VASPR 2 e o esquema HPV em 2 doses.",
    vaccineIds: ["VASPR", "HPV"],
  },
  {
    id: "adultos",
    label: "Adultos",
    description: "Reforços e esquemas específicos em idade adulta.",
    highlight: "O Td mantém reforços ao longo da vida e a VASPR depende do ano de nascimento e do histórico vacinal.",
    vaccineIds: ["Td", "VASPR"],
  },
  {
    id: "gravidez",
    label: "Gravidez",
    description: "Vacinação dirigida à proteção materna e do recém-nascido.",
    highlight: "A Tdpa é recomendada em cada gravidez; a vacina da gripe segue normas específicas em vigor.",
    vaccineIds: ["Tdpa"],
  },
];

const AGE_TIMELINE = [
  { age: "Nascimento", vaccines: ["VHB"] },
  { age: "2 meses", vaccines: ["VHB", "Hib", "DTPa", "VIP", "Pn13", "MenB"] },
  { age: "4 meses", vaccines: ["Hib", "DTPa", "VIP", "Pn13", "MenB"] },
  { age: "12 meses", vaccines: ["Hib", "DTPa", "VIP", "Pn13", "MenB", "MenC", "VASPR"] },
  { age: "18 meses", vaccines: ["Hib", "DTPa", "VIP"] },
  { age: "5 anos", vaccines: ["DTPa", "VIP", "VASPR"] },
  { age: "10 anos", vaccines: ["VASPR", "HPV"] },
  { age: "25 · 45 · 65 anos", vaccines: ["Td"] },
  { age: "Cada gravidez", vaccines: ["Tdpa"] },
];

function VaccineCard({ vaccine }: { vaccine: VaccineInfo }) {
  return (
    <article className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {vaccine.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Syringe className="h-3.5 w-3.5" />
              Vacina
            </span>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-foreground">{vaccine.disease}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{vaccine.summary}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Esquema resumido
          </p>
          <ul className="mt-3 space-y-2 text-sm text-foreground">
            {vaccine.schedule.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Pontos-chave
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {vaccine.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export default function VacinacaoPage() {
  const [activeAudience, setActiveAudience] = useState(AUDIENCES[0].id);

  const selectedAudience =
    AUDIENCES.find((audience) => audience.id === activeAudience) ?? AUDIENCES[0];

  const visibleVaccines = useMemo(() => {
    const ids = new Set(selectedAudience.vaccineIds);
    return VACCINES.filter((vaccine) => ids.has(vaccine.id));
  }, [selectedAudience]);

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="absolute inset-0 hero-surface" />
      <div className="absolute inset-0 soft-grain opacity-30" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
        <section className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-md backdrop-blur">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/20 to-transparent" />
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-border/70 bg-secondary/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  PNV 2020
                </span>
                <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-semibold text-foreground">
                  Norma DGS 018/2020
                </span>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div>
                  <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
                    Plano Nacional de Vacinação interativo
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Novo separador com resumo navegável do esquema vacinal recomendado, organizado por fase da vida e com informação essencial de cada vacina do PNV 2020.
                  </p>
                </div>

                <div className="rounded-3xl border border-border/70 bg-secondary/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Importante
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Este ecrã resume a norma oficial e não substitui avaliação clínica individual, esquemas de atraso, grupos de risco ou atualizações posteriores da DGS.
                  </p>
                  <a
                    href={SOURCE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Abrir documento oficial da DGS
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/70 bg-secondary/35 p-6 sm:p-8">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {AUDIENCES.map((audience) => {
                const isActive = audience.id === selectedAudience.id;
                const Icon =
                  audience.id === "infancia"
                    ? Baby
                    : audience.id === "gravidez"
                      ? HeartPulse
                      : CalendarClock;

                return (
                  <button
                    key={audience.id}
                    type="button"
                    onClick={() => setActiveAudience(audience.id)}
                    className={cn(
                      "rounded-3xl border p-4 text-left transition",
                      isActive
                        ? "border-primary/40 bg-primary/10 shadow-sm"
                        : "border-border/70 bg-card/70 hover:border-foreground/40 hover:bg-card"
                    )}
                  >
                    <div className="flex items-center gap-2 text-primary">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.28em]">
                        {audience.label}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-foreground">{audience.description}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{audience.highlight}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Linha temporal do esquema</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Vista rápida dos principais momentos de vacinação no esquema geral recomendado apresentado na norma.
            </p>

            <div className="mt-5 space-y-3">
              {AGE_TIMELINE.map((step) => (
                <div
                  key={step.age}
                  className="rounded-2xl border border-border/70 bg-secondary/35 p-4"
                >
                  <p className="text-sm font-semibold text-foreground">{step.age}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {step.vaccines.map((code) => (
                      <span
                        key={`${step.age}-${code}`}
                        className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-4">
            <section className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-foreground">Vacinas em destaque</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedAudience.highlight}
              </p>
            </section>

            {visibleVaccines.map((vaccine) => (
              <VaccineCard key={vaccine.id} vaccine={vaccine} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
