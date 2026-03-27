"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  FileText,
  Info,
  X,
} from "lucide-react";
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

type AgeColumn = {
  id: string;
  label: string;
  shortLabel: string;
};

type DosePlacement = {
  ageId: string;
  doseLabel: string;
  detail: string;
};

type VaccineInfo = {
  id: VaccineKey;
  shortName: string;
  disease: string;
  summary: string;
  category: "infancia" | "adolescencia" | "adultos" | "gravidez";
  colorClass: string;
  overview: string;
  scheduleSummary: string[];
  commercialNames: string[];
  administration: string[];
  sideEffects: string[];
  keyPoints: string[];
  placements: DosePlacement[];
};

const SOURCE_URL =
  "https://www.dgs.pt/normas-orientacoes-e-informacoes/normas-e-circulares-normativas/norma-n-0182020-de-27092020-pdf.aspx";

const AGE_COLUMNS: AgeColumn[] = [
  { id: "birth", label: "Nascimento", shortLabel: "Nasci-\nmento" },
  { id: "2m", label: "2 meses", shortLabel: "2\nmeses" },
  { id: "4m", label: "4 meses", shortLabel: "4\nmeses" },
  { id: "6m", label: "6 meses", shortLabel: "6\nmeses" },
  { id: "12m", label: "12 meses", shortLabel: "12\nmeses" },
  { id: "18m", label: "18 meses", shortLabel: "18\nmeses" },
  { id: "5y", label: "5 anos", shortLabel: "5\nanos" },
  { id: "10y", label: "10 anos", shortLabel: "10\nanos" },
  { id: "25y", label: "25 anos", shortLabel: "25\nanos" },
  { id: "45y", label: "45 anos", shortLabel: "45\nanos" },
  { id: "65y", label: "65 anos", shortLabel: "65\nanos" },
  { id: "65plus", label: "10/10 anos", shortLabel: "10/10\nanos" },
];

const VACCINES: VaccineInfo[] = [
  {
    id: "VHB",
    shortName: "VHB",
    disease: "Hepatite B",
    summary: "Proteção contra a infeção pelo vírus da hepatite B.",
    category: "infancia",
    colorClass: "bg-amber-100 border-amber-300 text-amber-900",
    overview:
      "Integra o esquema infantil inicial do PNV e inclui dose neonatal e doses subsequentes na primovacinação.",
    scheduleSummary: ["Nascimento", "2 meses", "6 meses"],
    commercialNames: [
      "Exemplos usuais: Engerix B, HBVaxPro, vacinas hexavalentes com VHB",
    ],
    administration: [
      "Via intramuscular",
      "No lactente, preferencialmente na face ântero-lateral da coxa",
      "A dose neonatal deve ser administrada o mais cedo possível",
    ],
    sideEffects: [
      "Dor, rubor ou edema no local de injeção",
      "Irritabilidade ou febre baixa",
      "Mal-estar transitório",
    ],
    keyPoints: [
      "A dose ao nascimento deve ser administrada o mais precocemente possível no período neonatal.",
      "Mantém-se no esquema geral recomendado da infância no PNV 2020.",
    ],
    placements: [
      { ageId: "birth", doseLabel: "VHB 1", detail: "1.ª dose ao nascimento." },
      { ageId: "2m", doseLabel: "VHB 2", detail: "2.ª dose aos 2 meses." },
      { ageId: "6m", doseLabel: "VHB 3", detail: "3.ª dose aos 6 meses." },
    ],
  },
  {
    id: "Hib",
    shortName: "Hib",
    disease: "Haemophilus influenzae b",
    summary: "Previne doença invasiva por Hib, incluindo meningite e sépsis.",
    category: "infancia",
    colorClass: "bg-yellow-100 border-yellow-300 text-yellow-900",
    overview:
      "Vacina da primovacinação com reforço posterior na primeira infância, de acordo com o esquema recomendado da DGS.",
    scheduleSummary: ["2 meses", "4 meses", "6 meses", "18 meses"],
    commercialNames: [
      "Exemplos usuais: Act-HIB, Hiberix, vacinas combinadas hexavalentes",
    ],
    administration: [
      "Via intramuscular",
      "Habitualmente administrada em combinação com outras vacinas do PNV",
      "No lactente, preferencialmente na coxa",
    ],
    sideEffects: [
      "Dor e vermelhidão no local",
      "Febre",
      "Irritabilidade ou sonolência transitória",
    ],
    keyPoints: [
      "Nos esquemas em atraso, o número de doses depende da idade de início.",
      "É particularmente relevante na prevenção de doença invasiva em idade pediátrica.",
    ],
    placements: [
      { ageId: "2m", doseLabel: "Hib 1", detail: "1.ª dose aos 2 meses." },
      { ageId: "4m", doseLabel: "Hib 2", detail: "2.ª dose aos 4 meses." },
      { ageId: "6m", doseLabel: "Hib 3", detail: "3.ª dose aos 6 meses." },
      { ageId: "18m", doseLabel: "Hib 4", detail: "Reforço aos 18 meses." },
    ],
  },
  {
    id: "DTPa",
    shortName: "DTPa",
    disease: "Difteria, tétano, tosse convulsa",
    summary: "Vacina combinada da infância com primovacinação e reforços.",
    category: "infancia",
    colorClass: "bg-orange-100 border-orange-300 text-orange-900",
    overview:
      "Protege contra três doenças preveníveis relevantes e mantém reforços na infância conforme a norma da DGS.",
    scheduleSummary: ["2 meses", "4 meses", "6 meses", "18 meses", "5 anos"],
    commercialNames: [
      "Exemplos usuais: Infanrix hexa, Hexyon, Vaxelis, Infanrix-IPV",
    ],
    administration: [
      "Via intramuscular",
      "Na infância, geralmente em formulações combinadas",
      "Coxa no lactente; deltoide em crianças maiores, conforme idade e massa muscular",
    ],
    sideEffects: [
      "Dor, edema e rubor local",
      "Febre",
      "Irritabilidade, choro persistente ou diminuição do apetite",
    ],
    keyPoints: [
      "Após doença por tosse convulsa, a criança deve iniciar ou completar a vacinação depois da cura.",
      "No PNV 2020, a DTPa também surge como referência na gravidez através da Tdpa.",
    ],
    placements: [
      { ageId: "2m", doseLabel: "DTPa 1", detail: "1.ª dose aos 2 meses." },
      { ageId: "4m", doseLabel: "DTPa 2", detail: "2.ª dose aos 4 meses." },
      { ageId: "6m", doseLabel: "DTPa 3", detail: "3.ª dose aos 6 meses." },
      { ageId: "18m", doseLabel: "DTPa 4", detail: "Reforço aos 18 meses." },
      { ageId: "5y", doseLabel: "DTPa 5", detail: "Reforço aos 5 anos." },
    ],
  },
  {
    id: "VIP",
    shortName: "VIP",
    disease: "Poliomielite",
    summary:
      "Vacina inativada contra a poliomielite com esquema completo na infância.",
    category: "infancia",
    colorClass: "bg-rose-100 border-rose-300 text-rose-900",
    overview:
      "Mantém proteção estruturada durante a infância com primovacinação e reforço antes da idade escolar.",
    scheduleSummary: ["2 meses", "4 meses", "6 meses", "18 meses", "5 anos"],
    commercialNames: [
      "Exemplos usuais: Imovax Polio, vacinas combinadas hexavalentes ou tetravalentes com VIP",
    ],
    administration: [
      "Via intramuscular",
      "Frequentemente administrada em vacinas combinadas do PNV",
      "Coxa no lactente; deltoide em crianças maiores, conforme idade e massa muscular",
    ],
    sideEffects: [
      "Dor, edema ou rubor local",
      "Febre baixa",
      "Irritabilidade ou mal-estar transitório",
    ],
    keyPoints: [
      "Faz parte do esquema geral recomendado para a população infantil.",
      "Os esquemas tardios devem ser avaliados segundo idade e histórico vacinal prévio.",
    ],
    placements: [
      { ageId: "2m", doseLabel: "VIP 1", detail: "1.ª dose aos 2 meses." },
      { ageId: "4m", doseLabel: "VIP 2", detail: "2.ª dose aos 4 meses." },
      { ageId: "6m", doseLabel: "VIP 3", detail: "3.ª dose aos 6 meses." },
      { ageId: "18m", doseLabel: "VIP 4", detail: "Reforço aos 18 meses." },
      { ageId: "5y", doseLabel: "VIP 5", detail: "Reforço aos 5 anos." },
    ],
  },
  {
    id: "Pn13",
    shortName: "Pn13",
    disease: "Streptococcus pneumoniae",
    summary: "Protege contra doença invasiva pneumocócica.",
    category: "infancia",
    colorClass: "bg-lime-100 border-lime-300 text-lime-900",
    overview:
      "A vacina pneumocócica conjugada integra o esquema pediátrico recomendado no PNV 2020.",
    scheduleSummary: ["2 meses", "4 meses", "12 meses"],
    commercialNames: ["Exemplo usual: Prevenar 13"],
    administration: [
      "Via intramuscular",
      "Administração preferencial na coxa em lactentes",
      "Pode ser coadministrada com outras vacinas do PNV em locais anatómicos distintos",
    ],
    sideEffects: [
      "Dor, edema e rubor local",
      "Febre",
      "Irritabilidade ou sonolência",
    ],
    keyPoints: [
      "Se a 1.ª dose for antes dos 6 meses, a 3.ª dose pode ser administrada a partir dos 11 meses.",
      "Após doença invasiva pneumocócica, pode ser necessário iniciar ou completar o esquema consoante a idade.",
    ],
    placements: [
      { ageId: "2m", doseLabel: "Pn13 1", detail: "1.ª dose aos 2 meses." },
      { ageId: "4m", doseLabel: "Pn13 2", detail: "2.ª dose aos 4 meses." },
      { ageId: "12m", doseLabel: "Pn13 3", detail: "Reforço aos 12 meses." },
    ],
  },
  {
    id: "MenB",
    shortName: "MenB",
    disease: "Neisseria meningitidis B",
    summary: "Proteção contra doença invasiva meningocócica por serogrupo B.",
    category: "infancia",
    colorClass: "bg-sky-100 border-sky-300 text-sky-900",
    overview:
      "No PNV 2020 a vacinação MenB passou a abranger universalmente as crianças nas idades recomendadas.",
    scheduleSummary: ["2 meses", "4 meses", "12 meses"],
    commercialNames: ["Exemplo usual: Bexsero"],
    administration: [
      "Via intramuscular",
      "No lactente, geralmente na coxa",
      "Pode ser administrada com outras vacinas, idealmente em local diferente",
    ],
    sideEffects: [
      "Dor e sensibilidade local",
      "Febre",
      "Irritabilidade, sonolência ou recusa alimentar transitória",
    ],
    keyPoints: [
      "Crianças nascidas a partir de 2019 podem completar o esquema no PNV antes dos 5 anos, de acordo com a idade.",
      "A norma descreve ainda esquemas de recuperação dependentes da idade de início.",
    ],
    placements: [
      { ageId: "2m", doseLabel: "MenB 1", detail: "1.ª dose aos 2 meses." },
      { ageId: "4m", doseLabel: "MenB 2", detail: "2.ª dose aos 4 meses." },
      { ageId: "12m", doseLabel: "MenB 3", detail: "Reforço aos 12 meses." },
    ],
  },
  {
    id: "MenC",
    shortName: "MenC",
    disease: "Neisseria meningitidis C",
    summary: "Vacina meningocócica do serogrupo C no esquema infantil.",
    category: "infancia",
    colorClass: "bg-cyan-100 border-cyan-300 text-cyan-900",
    overview:
      "É administrada como dose única no esquema geral recomendado da infância, conforme o PNV 2020.",
    scheduleSummary: ["12 meses"],
    commercialNames: ["Exemplos usuais: NeisVac-C, Menjugate"],
    administration: [
      "Via intramuscular",
      "Habitualmente administrada na coxa ou deltoide, conforme idade",
      "Pode ser coadministrada com outras vacinas em locais distintos",
    ],
    sideEffects: [
      "Dor ou rubor local",
      "Febre baixa",
      "Cefaleia ou irritabilidade",
    ],
    keyPoints: [
      "A necessidade de recuperação depende da idade e do histórico vacinal prévio.",
      "Mantém relevância na prevenção de doença invasiva meningocócica.",
    ],
    placements: [
      { ageId: "12m", doseLabel: "MenC", detail: "Dose única aos 12 meses." },
    ],
  },
  {
    id: "VASPR",
    shortName: "VASPR",
    disease: "Sarampo, parotidite epidémica, rubéola",
    summary:
      "Vacina tripla vírica da infância e de esquemas específicos em adultos.",
    category: "adolescencia",
    colorClass: "bg-lime-100 border-lime-300 text-lime-950",
    overview:
      "No esquema infantil surgem duas doses; em adultos a indicação depende do ano de nascimento e do risco ocupacional.",
    scheduleSummary: ["12 meses", "5 anos"],
    commercialNames: ["Exemplos usuais: Priorix, M-M-RVAXPRO"],
    administration: [
      "Via subcutânea ou intramuscular, conforme RCM e contexto clínico",
      "Habitualmente no braço ou coxa, segundo idade",
      "Evitar em situações de contraindicação a vacinas vivas atenuadas",
    ],
    sideEffects: [
      "Dor ou vermelhidão local",
      "Febre",
      "Exantema transitório ou tumefação parotídea rara",
    ],
    keyPoints: [
      "Adultos nascidos a partir de 1970 sem história credível de sarampo devem receber 1 dose.",
      "Profissionais de saúde com contacto próximo com doentes devem ter 2 doses, independentemente do ano de nascimento.",
    ],
    placements: [
      { ageId: "12m", doseLabel: "VASPR 1", detail: "1.ª dose aos 12 meses." },
      { ageId: "5y", doseLabel: "VASPR 2", detail: "2.ª dose aos 5 anos." },
    ],
  },
  {
    id: "HPV",
    shortName: "HPV",
    disease: "Vírus do papiloma humano",
    summary:
      "Protege contra genótipos oncogénicos e causadores de condilomas ano-genitais.",
    category: "adolescencia",
    colorClass: "bg-violet-100 border-violet-300 text-violet-900",
    overview:
      "Em 2020 o PNV passou a contemplar também o sexo masculino elegível, com esquema em 2 doses aos 10 anos.",
    scheduleSummary: ["10 anos", "2 doses: 0 e 6 meses"],
    commercialNames: ["Exemplo usual: Gardasil 9"],
    administration: [
      "Via intramuscular",
      "Preferencialmente no deltoide",
      "Seguir o intervalo recomendado entre as 2 doses",
    ],
    sideEffects: [
      "Dor e edema no local",
      "Cefaleia",
      "Tonturas ou mal-estar breve após a administração",
    ],
    keyPoints: [
      "Abrange rapazes e raparigas elegíveis no PNV 2020, segundo o ano de nascimento definido na norma.",
      "Quem iniciou vacinação por prescrição médica pode completar o esquema no PNV até antes dos 27 anos, em situações previstas.",
    ],
    placements: [
      {
        ageId: "10y",
        doseLabel: "HPV 1,2",
        detail: "Esquema em 2 doses: 0 e 6 meses, iniciado aos 10 anos.",
      },
    ],
  },
  {
    id: "Td",
    shortName: "Td",
    disease: "Tétano e difteria",
    summary: "Reforços vacinais ao longo da vida adulta.",
    category: "adultos",
    colorClass: "bg-orange-100 border-orange-300 text-orange-900",
    overview:
      "Mantém reforços programados na idade adulta, com cadência diferente após os 65 anos.",
    scheduleSummary: [
      "25 anos",
      "45 anos",
      "65 anos",
      "Depois dos 65 anos: de 10 em 10 anos",
    ],
    commercialNames: [
      "A marca comercial pode variar consoante disponibilidade institucional",
    ],
    administration: [
      "Via intramuscular",
      "Preferencialmente no deltoide em adolescentes e adultos",
      "Usada para reforços programados ao longo da vida",
    ],
    sideEffects: [
      "Dor no local de injeção",
      "Rubor ou edema local",
      "Febre baixa, mal-estar ou mialgias transitórias",
    ],
    keyPoints: [
      "Se a última dose tiver ocorrido entre os 18 e os 44 anos, a seguinte é recomendada 20 anos depois.",
      "A partir dos 65 anos, os reforços passam a ser recomendados de 10 em 10 anos.",
    ],
    placements: [
      { ageId: "25y", doseLabel: "Td", detail: "Reforço aos 25 anos." },
      { ageId: "45y", doseLabel: "Td", detail: "Reforço aos 45 anos." },
      { ageId: "65y", doseLabel: "Td", detail: "Reforço aos 65 anos." },
      {
        ageId: "65plus",
        doseLabel: "Td",
        detail: "Após os 65 anos, reforço de 10 em 10 anos.",
      },
    ],
  },
];

const CATEGORY_LABELS: Record<VaccineInfo["category"], string> = {
  infancia: "Infância",
  adolescencia: "Adolescência",
  adultos: "Adultos",
  gravidez: "Gravidez",
};

function getCell(vaccine: VaccineInfo, ageId: string) {
  return (
    vaccine.placements.find((placement) => placement.ageId === ageId) ?? null
  );
}

export default function VacinacaoPage() {
  const [selectedVaccineId, setSelectedVaccineId] = useState<VaccineKey | null>(
    null,
  );
  const [selectedAgeId, setSelectedAgeId] = useState<string | null>(null);

  const selectedVaccine = selectedVaccineId
    ? VACCINES.find((vaccine) => vaccine.id === selectedVaccineId) ?? null
    : null;

  const selectedPlacement =
    selectedVaccine && selectedAgeId
      ? getCell(selectedVaccine, selectedAgeId) ?? selectedVaccine.placements[0]
      : selectedVaccine?.placements[0] ?? null;

  const vaccineRows = useMemo(() => VACCINES, []);
  const isOverlayOpen = Boolean(selectedVaccine);

  useEffect(() => {
    if (!isOverlayOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedVaccineId(null);
        setSelectedAgeId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOverlayOpen]);

  function openVaccine(vaccine: VaccineInfo, ageId?: string) {
    setSelectedVaccineId(vaccine.id);
    setSelectedAgeId(ageId ?? vaccine.placements[0]?.ageId ?? null);
  }

  function closeOverlay() {
    setSelectedVaccineId(null);
    setSelectedAgeId(null);
  }

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
      <div className="absolute inset-0 hero-surface" />
      <div className="absolute inset-0 soft-grain opacity-30" />

      <div className="relative flex h-full flex-col px-4 py-4 xl:px-6">
        <section className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-card/75 px-4 py-4 shadow-sm backdrop-blur sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border/70 bg-secondary/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              PNV 2020
            </span>
            <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-semibold text-foreground">
              Norma DGS 018/2020
            </span>
          </div>
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <FileText className="h-4 w-4" />
            Abrir documento oficial da DGS
          </a>
        </section>

        <section className="relative mt-4 rounded-[2rem] border border-border/70 bg-card/85 shadow-sm backdrop-blur lg:min-h-0 lg:flex-1 lg:overflow-hidden">
          <div className="border-b border-border/70 bg-secondary/35 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Mapa vacinal por idade
                  </h2>
                </div>
              </div>
          </div>

          <div className="grid gap-4 p-4 sm:p-5 lg:hidden">
            {vaccineRows.map((vaccine) => {
              const nextDose = vaccine.placements[0];
              return (
                <button
                  key={vaccine.id}
                  type="button"
                  onClick={() => openVaccine(vaccine)}
                  className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4 text-left shadow-sm transition hover:border-primary/30 hover:bg-background"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold italic text-foreground">
                        {vaccine.disease}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                        {vaccine.shortName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm",
                        vaccine.colorClass,
                      )}
                    >
                      {CATEGORY_LABELS[vaccine.category]}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {vaccine.summary}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-card/80 px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Próxima dose
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {nextDose?.doseLabel ?? "Sem dose indicada"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-card/80 px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Esquema
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {vaccine.scheduleSummary.join(" · ")}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative hidden h-[calc(100%-73px)] overflow-auto lg:block">
            <div className="min-h-full min-w-[1160px]">
              <div
                className="sticky top-0 z-10 grid border-b border-border/70 bg-secondary/20 backdrop-blur"
                style={{
                  gridTemplateColumns: "280px repeat(12, minmax(68px, 1fr))",
                }}
              >
                <div className="border-r border-border/70 px-5 py-4 text-sm font-semibold text-foreground">
                  Vacina | Doença
                </div>
                {AGE_COLUMNS.map((column) => (
                  <div
                    key={column.id}
                    className="flex min-h-[72px] items-center justify-center border-r border-border/70 px-2 py-3 text-center text-[11px] font-semibold uppercase leading-tight tracking-[0.2em] text-muted-foreground whitespace-pre-line last:border-r-0"
                  >
                    {column.shortLabel}
                  </div>
                ))}
              </div>

              {vaccineRows.map((vaccine) => (
                <div
                  key={vaccine.id}
                  className="grid border-b border-border/70 last:border-b-0"
                  style={{
                    gridTemplateColumns: "280px repeat(12, minmax(68px, 1fr))",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => openVaccine(vaccine)}
                    className={cn(
                      "border-r border-border/70 px-5 py-4 text-left transition hover:bg-secondary/20",
                      selectedVaccine?.id === vaccine.id && "bg-primary/5",
                    )}
                  >
                    <p className="text-sm font-semibold italic text-foreground">
                      {vaccine.disease}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {vaccine.shortName}
                    </p>
                  </button>

                  {AGE_COLUMNS.map((column) => {
                    const cell = getCell(vaccine, column.id);
                    const isSelected =
                      selectedVaccine?.id === vaccine.id &&
                      selectedPlacement?.ageId === column.id;

                    return (
                      <div
                        key={`${vaccine.id}-${column.id}`}
                        className="flex min-h-[78px] items-center justify-center border-r border-border/70 px-1.5 py-2 last:border-r-0"
                      >
                        {cell ? (
                          <button
                            type="button"
                            onClick={() => openVaccine(vaccine, column.id)}
                            className={cn(
                              "min-h-[46px] min-w-[58px] rounded-xl border px-2.5 py-1.5 text-center text-[11px] font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                              vaccine.colorClass,
                              isSelected &&
                                "ring-2 ring-primary ring-offset-2 ring-offset-background",
                            )}
                            title={`${vaccine.shortName} · ${column.label}`}
                          >
                            {cell.doseLabel}
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>

      {isOverlayOpen ? (
        <div className="fixed inset-0 z-[70] overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <button
            type="button"
            aria-label="Fechar detalhe da vacina"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]"
            onClick={closeOverlay}
          />

          <div className="relative mx-auto flex min-h-full max-w-5xl items-start">
            <div className="relative flex min-h-0 w-full flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-background shadow-[0_30px_80px_-30px_rgba(15,23,42,0.55)]">
            <div className="relative shrink-0 overflow-hidden border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.94))] px-5 pb-5 pt-6 sm:px-7 sm:pb-6 sm:pt-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.10),transparent_26%)]" />
              <div className="absolute inset-0 soft-grain opacity-15" />

              <button
                type="button"
                onClick={closeOverlay}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/90 text-muted-foreground shadow-sm transition hover:bg-secondary hover:text-foreground sm:right-5 sm:top-5"
                aria-label="Fechar detalhe da vacina"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative pr-12 sm:pr-16">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  Vacina selecionada
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
                      {selectedVaccine?.shortName}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {selectedVaccine?.disease}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold shadow-sm",
                      selectedVaccine?.colorClass,
                    )}
                  >
                    {selectedVaccine ? CATEGORY_LABELS[selectedVaccine.category] : ""}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/78 p-4 shadow-sm backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Dose ativa
                    </p>
                    <p className="mt-2 text-base font-semibold text-foreground">
                      {selectedPlacement?.doseLabel}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/78 p-4 shadow-sm backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Momento
                    </p>
                    <p className="mt-2 text-base font-semibold text-foreground">
                      {selectedPlacement?.ageId
                        ? AGE_COLUMNS.find((column) => column.id === selectedPlacement.ageId)?.label
                        : "Sem seleção"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section className="max-h-[calc(100vh-22rem)] min-h-0 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.55),rgba(255,255,255,0.94))] px-5 py-5 sm:max-h-[calc(100vh-20rem)] sm:px-6 sm:py-6">
              <div className="grid gap-4 sm:gap-5">
                <div className="rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Visão geral
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                    {selectedVaccine?.overview}
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-border/70 bg-secondary/35 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Esquema resumido
                    </p>
                    <ul className="mt-4 space-y-3">
                      {selectedVaccine?.scheduleSummary.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      )) ?? null}
                    </ul>
                  </div>

                  <div className="rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Como administrar
                    </p>
                    <ul className="mt-4 space-y-3">
                      {selectedVaccine?.administration.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      )) ?? null}
                    </ul>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Nomes comerciais usuais
                    </p>
                    <ul className="mt-4 space-y-3">
                      {selectedVaccine?.commercialNames.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      )) ?? null}
                    </ul>
                  </div>

                  <div className="rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Efeitos secundários
                    </p>
                    <ul className="mt-4 space-y-3">
                      {selectedVaccine?.sideEffects.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      )) ?? null}
                    </ul>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Pontos-chave da norma
                  </p>
                  <ul className="mt-4 space-y-3">
                    {selectedVaccine?.keyPoints.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                        <span>{point}</span>
                      </li>
                    )) ?? null}
                  </ul>
                </div>

                <div className="rounded-[1.75rem] border border-amber-300/70 bg-amber-50/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-900">
                    Nota clínica
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-amber-950/80">
                    Os nomes comerciais apresentados são exemplos usuais e podem variar conforme a
                    aquisição institucional, a formulação disponível e a atualização regulamentar.
                    Esta visualização resume o esquema vacinal geral e não substitui a consulta dos
                    RCM, dos esquemas de atraso, dos grupos de risco, das contraindicações, das
                    vacinas extra-PNV ou de atualizações posteriores da DGS.
                  </p>
                </div>
              </div>
            </section>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
