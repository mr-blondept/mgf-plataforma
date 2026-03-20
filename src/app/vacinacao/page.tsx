"use client";

import { useMemo, useState } from "react";
import { CalendarClock, FileText, Info, ShieldCheck } from "lucide-react";
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
  { id: "pregnancy", label: "Gravidez", shortLabel: "Grá-\nvidas" },
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
    id: "Tdpa",
    shortName: "Tdpa",
    disease: "Tétano, difteria e tosse convulsa",
    summary:
      "Vacinação recomendada em cada gravidez para proteção materna e do recém-nascido.",
    category: "gravidez",
    colorClass: "bg-fuchsia-100 border-fuchsia-300 text-fuchsia-900",
    overview:
      "A Tdpa na gravidez tem como objetivo reforçar a proteção passiva do recém-nascido contra a tosse convulsa.",
    scheduleSummary: ["Cada gravidez", "Idealmente entre 20 e 36 semanas"],
    commercialNames: ["Exemplos usuais: Boostrix, Adacel"],
    administration: [
      "Via intramuscular",
      "Preferencialmente no deltoide",
      "Administrar em cada gravidez, idealmente após a ecografia morfológica",
    ],
    sideEffects: [
      "Dor e tumefação local",
      "Cansaço ou cefaleia",
      "Febre baixa ou mal-estar transitório",
    ],
    keyPoints: [
      "A norma refere administração após a ecografia morfológica e idealmente até às 32 semanas.",
      "Mesmo após as 36 semanas pode haver benefício indireto pela prevenção da doença na mãe.",
    ],
    placements: [
      {
        ageId: "pregnancy",
        doseLabel: "Tdpa · grávidas",
        detail:
          "Dose recomendada em cada gravidez, idealmente entre as 20 e as 36 semanas.",
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

const CATEGORY_LABELS = {
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
  const [selectedVaccineId, setSelectedVaccineId] = useState<VaccineKey>("VHB");
  const [selectedAgeId, setSelectedAgeId] = useState<string>("birth");

  const selectedVaccine =
    VACCINES.find((vaccine) => vaccine.id === selectedVaccineId) ?? VACCINES[0];

  const selectedPlacement =
    getCell(selectedVaccine, selectedAgeId) ?? selectedVaccine.placements[0];

  const vaccineRows = useMemo(() => VACCINES, []);

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="absolute inset-0 hero-surface" />
      <div className="absolute inset-0 soft-grain opacity-30" />

      <div className="relative mx-auto w-full max-w-[1800px] px-4 py-8 xl:px-6">
        <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/70 bg-card/75 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border/70 bg-secondary/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              PNV 2020
            </span>
            <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-semibold text-foreground">
              Norma DGS 018/2020
            </span>
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              Seleciona uma dose no mapa para ver detalhe imediato
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

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(420px,1fr)] 2xl:grid-cols-[minmax(0,1.95fr)_minmax(460px,0.95fr)]">
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/85 shadow-sm backdrop-blur">
            <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Mapa vacinal por idade
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1260px]">
                <div
                  className="grid border-b border-border/70 bg-secondary/20"
                  style={{
                    gridTemplateColumns: "300px repeat(13, minmax(72px, 1fr))",
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
                      gridTemplateColumns:
                        "300px repeat(13, minmax(72px, 1fr))",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVaccineId(vaccine.id);
                        setSelectedAgeId(
                          vaccine.placements[0]?.ageId ?? "birth",
                        );
                      }}
                      className={cn(
                        "border-r border-border/70 px-5 py-4 text-left transition hover:bg-secondary/20",
                        selectedVaccine.id === vaccine.id && "bg-primary/5",
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
                        selectedVaccine.id === vaccine.id &&
                        selectedPlacement?.ageId === column.id;

                      return (
                        <div
                          key={`${vaccine.id}-${column.id}`}
                          className="flex min-h-[78px] items-center justify-center border-r border-border/70 px-1.5 py-2 last:border-r-0"
                        >
                          {cell ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVaccineId(vaccine.id);
                                setSelectedAgeId(column.id);
                              }}
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
          </div>

          <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
            <section className="rounded-3xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Vacina selecionada
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">
                    {selectedVaccine.shortName}
                  </h2>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    selectedVaccine.colorClass,
                  )}
                >
                  {CATEGORY_LABELS[selectedVaccine.category]}
                </span>
              </div>

              <p className="mt-3 text-lg font-semibold text-foreground">
                {selectedVaccine.disease}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {selectedVaccine.summary}
              </p>

              <div className="mt-5 rounded-2xl border border-border/70 bg-secondary/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Dose / momento ativo
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {selectedPlacement?.doseLabel}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedPlacement?.detail}
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Informação detalhada da vacina
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {selectedVaccine.overview}
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Esquema resumido
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-foreground">
                    {selectedVaccine.scheduleSummary.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Nomes comerciais usuais
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {selectedVaccine.commercialNames.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Como administrar
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {selectedVaccine.administration.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Efeitos secundários frequentes
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {selectedVaccine.sideEffects.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Pontos-chave da norma
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {selectedVaccine.keyPoints.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-amber-300/70 bg-amber-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-900">
                    Nota clínica
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-amber-950/80">
                    Os nomes comerciais apresentados são exemplos usuais e podem
                    variar conforme aquisição institucional, formulação
                    disponível e atualização regulamentar. Esta visualização
                    resume o esquema vacinal geral e não substitui a consulta
                    dos RCM, esquemas de atraso, grupos de risco,
                    contraindicações, vacinas extra-PNV ou atualizações
                    posteriores da DGS.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
