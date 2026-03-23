"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  FileText,
  GraduationCap,
  HeartPulse,
  Library,
  RefreshCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  INTERNATO_DRE_LINK,
  INTERNATO_STAGES,
  type ProgressCategoryTag,
  type ProgressRequirement,
  type ProgressSectionIcon,
  type ProgressStage,
  type ProgressTone,
} from "@/data/internatoProgress";

type ProgressRow = {
  item_id: string;
};

const toneClasses: Record<ProgressTone, { accent: string; soft: string; strong: string; border: string }> =
  {
    blue: {
      accent: "bg-blue-600",
      soft: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200",
      strong: "text-blue-700 dark:text-blue-200",
      border: "border-blue-200/80 dark:border-blue-400/20",
    },
    green: {
      accent: "bg-emerald-600",
      soft: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
      strong: "text-emerald-700 dark:text-emerald-200",
      border: "border-emerald-200/80 dark:border-emerald-400/20",
    },
    purple: {
      accent: "bg-fuchsia-600",
      soft: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-200",
      strong: "text-fuchsia-700 dark:text-fuchsia-200",
      border: "border-fuchsia-200/80 dark:border-fuchsia-400/20",
    },
  };

const requirementClasses: Record<ProgressRequirement, string> = {
  obrigatorio:
    "border-red-300 bg-red-100 text-red-800 shadow-sm dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-100",
  recomendado:
    "border-amber-300 bg-amber-100 text-amber-800 shadow-sm dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-100",
  opcional:
    "border-slate-300 bg-slate-200 text-slate-800 shadow-sm dark:border-slate-400/30 dark:bg-slate-500/20 dark:text-slate-100",
};

const categoryTagClasses: Record<ProgressCategoryTag, string> = {
  estagio:
    "border border-teal-200 bg-teal-100 text-teal-800 shadow-sm dark:border-teal-400/30 dark:bg-teal-500/20 dark:text-teal-100",
  avaliacao:
    "border border-fuchsia-200 bg-fuchsia-100 text-fuchsia-800 shadow-sm dark:border-fuchsia-400/30 dark:bg-fuchsia-500/20 dark:text-fuchsia-100",
  documento:
    "border border-orange-200 bg-orange-100 text-orange-800 shadow-sm dark:border-orange-400/30 dark:bg-orange-500/20 dark:text-orange-100",
  prova:
    "border border-rose-200 bg-rose-100 text-rose-800 shadow-sm dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-100",
  formacao:
    "border border-blue-200 bg-blue-100 text-blue-800 shadow-sm dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-100",
  clinico:
    "border border-emerald-200 bg-emerald-100 text-emerald-800 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-100",
  legal:
    "border border-slate-200 bg-slate-200 text-slate-800 shadow-sm dark:border-slate-400/30 dark:bg-slate-500/20 dark:text-slate-100",
};

function sectionIcon(icon: ProgressSectionIcon) {
  switch (icon) {
    case "check":
      return CheckCircle2;
    case "bolt":
      return Zap;
    case "book":
      return BookOpen;
    case "file":
      return FileText;
    case "award":
      return Award;
    case "heart":
      return HeartPulse;
    case "spark":
      return Sparkles;
    case "flow":
      return Library;
    case "brain":
      return Brain;
    default:
      return CheckCircle2;
  }
}

function stageStats(stage: ProgressStage, checkedIds: Set<string>) {
  const items = stage.sections.flatMap((section) => section.items);
  const done = items.filter((item) => checkedIds.has(item.id)).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

export default function InternatoPage() {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [activeStage, setActiveStage] = useState<ProgressStage["id"]>("mgf1");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      INTERNATO_STAGES.flatMap((stage) =>
        stage.sections.map((section) => [`${stage.id}:${section.id}`, true]),
      ),
    ),
  );
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentStage = useMemo(
    () => INTERNATO_STAGES.find((stage) => stage.id === activeStage) ?? INTERNATO_STAGES[0],
    [activeStage],
  );

  const globalStats = useMemo(() => {
    const items = INTERNATO_STAGES.flatMap((stage) =>
      stage.sections.flatMap((section) => section.items),
    );
    const done = items.filter((item) => checkedIds.has(item.id)).length;
    const total = items.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [checkedIds]);

  useEffect(() => {
    async function loadProgress() {
      setLoading(true);
      setErrorMsg(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.replace("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("user_internato_progress")
        .select("item_id")
        .eq("user_id", user.id);

      if (error) {
        setErrorMsg(
          "Nao foi possivel carregar o progresso do internato. Se a tabela ainda nao existir, corre o SQL da funcionalidade.",
        );
        setLoading(false);
        return;
      }

      setCheckedIds(new Set((data as ProgressRow[] | null)?.map((row) => row.item_id) ?? []));
      setLoading(false);
    }

    void loadProgress();
  }, []);

  async function toggleItem(itemId: string) {
    setSavingId(itemId);
    setErrorMsg(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    const isChecked = checkedIds.has(itemId);

    if (isChecked) {
      const { error } = await supabase
        .from("user_internato_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", itemId);

      if (error) {
        setErrorMsg("Nao foi possivel atualizar este item.");
        setSavingId(null);
        return;
      }

      setCheckedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      setSavingId(null);
      return;
    }

    const { error } = await supabase.from("user_internato_progress").upsert(
      {
        user_id: user.id,
        item_id: itemId,
        checked_at: new Date().toISOString(),
      },
      { onConflict: "user_id,item_id" },
    );

    if (error) {
      setErrorMsg("Nao foi possivel guardar este item.");
      setSavingId(null);
      return;
    }

    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
    setSavingId(null);
  }

  async function resetProgress() {
    const confirmed = window.confirm(
      "Apagar todo o progresso do internato? Esta acao nao pode ser desfeita.",
    );
    if (!confirmed) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    const { error } = await supabase
      .from("user_internato_progress")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      setErrorMsg("Nao foi possivel reiniciar o progresso.");
      return;
    }

    setCheckedIds(new Set());
  }

  function toggleSection(sectionId: string) {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden app-surface">
      <div className="pointer-events-none absolute inset-0 hero-surface opacity-65" />
      <div className="pointer-events-none absolute inset-0 soft-grain opacity-20" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-12 top-72 h-64 w-64 rounded-full bg-fuchsia-400/10 blur-3xl" />

      <section className="relative border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm ring-4 ring-blue-500/10">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Progressao do Internato</p>
              <p className="text-xs text-muted-foreground">Portaria n.º 125/2019 · MGF 1, MGF 2 e MGF 3</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden items-center gap-3 rounded-full border border-border/70 bg-card/80 px-4 py-2 sm:flex">
              <span className="font-mono text-xs text-muted-foreground">
                {globalStats.done}/{globalStats.total}
              </span>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-slate-500 transition-all duration-500"
                  style={{ width: `${globalStats.pct}%` }}
                />
              </div>
              <span className="font-mono text-xs font-medium text-foreground">
                {globalStats.pct}%
              </span>
            </div>

            <a
              href={INTERNATO_DRE_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/80 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-foreground/20 hover:text-foreground"
            >
              DRE
            </a>
            <button
              type="button"
              onClick={() => void resetProgress()}
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/80 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-red-300 hover:text-red-600"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Reiniciar
            </button>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 py-8">
        {errorMsg ? (
          <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMsg}
          </div>
        ) : null}

        <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-blue-500/10 via-emerald-400/10 to-fuchsia-500/10" />
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="border-b border-border/60 px-6 py-7 lg:border-b-0 lg:border-r">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground shadow-sm">
                <GraduationCap className="h-3.5 w-3.5" />
                Grelha interativa
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Acompanha o internato com uma vista clara por etapa, documentos e provas.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                A grelha foi reorganizada para ficar mais visual e mais facil de usar no dia a dia.
                Cada check fica gravado apenas para ti e o progresso atualiza-se em tempo real.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-blue-200/70 bg-blue-50/80 px-4 py-3 shadow-sm dark:border-blue-400/20 dark:bg-blue-500/10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700 dark:text-blue-200">
                    Estrutura
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">MGF 1 a MGF 3</p>
                </div>
                <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-500/10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-200">
                    Conteudo
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">Estagios, provas e docs</p>
                </div>
                <div className="rounded-2xl border border-fuchsia-200/70 bg-fuchsia-50/80 px-4 py-3 shadow-sm dark:border-fuchsia-400/20 dark:bg-fuchsia-500/10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-fuchsia-700 dark:text-fuchsia-200">
                    Guarda
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">Progresso por utilizador</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                  MGF 1
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                  MGF 2
                </span>
                <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-200">
                  MGF 3
                </span>
              </div>
            </div>
            <div className="relative px-6 py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Progresso global
              </p>
              <p className="mt-3 text-5xl font-semibold tracking-tight text-foreground">
                {globalStats.pct}%
              </p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {globalStats.done}/{globalStats.total} itens concluidos
              </p>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-slate-700 transition-all duration-500 dark:bg-slate-200"
                  style={{ width: `${globalStats.pct}%` }}
                />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Estado atual
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    Visao rapida do percurso inteiro com atualizacao imediata.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Utilizacao
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    Entra numa etapa, abre uma secao e marca o que ja concluiste.
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                <p>Inclui estagios, formacao, documentos e avaliacao final.</p>
                <p>Usa os blocos abaixo para ver detalhe por etapa e marcar o que ja completaste.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {INTERNATO_STAGES.map((stage) => {
            const stats = stageStats(stage, checkedIds);
            const tone = toneClasses[stage.tone];

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStage(stage.id)}
                className={cn(
                  "group relative overflow-hidden rounded-[1.5rem] border bg-card/95 p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]",
                  activeStage === stage.id ? tone.border : "border-border/70",
                  activeStage === stage.id && `${tone.soft} shadow-[0_18px_40px_rgba(15,23,42,0.1)]`,
                )}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-80 dark:via-white/5" />
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("text-sm font-semibold uppercase tracking-[0.16em]", tone.strong)}>
                    {stage.label}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {stats.pct}%
                  </span>
                </div>
                <p className="mt-3 text-lg font-medium text-foreground">{stage.summary}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stage.meta}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", tone.accent)}
                    style={{ width: `${stats.pct}%` }}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{stats.done} concluidos</span>
                  <span className={cn("font-medium", tone.strong)}>
                    {stats.total - stats.done} por fechar
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-[1.4rem] border border-border/70 bg-card/75 p-2 shadow-sm backdrop-blur">
          {INTERNATO_STAGES.map((stage) => {
            const tone = toneClasses[stage.tone];
            return (
              <button
                key={`tab-${stage.id}`}
                type="button"
                onClick={() => setActiveStage(stage.id)}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                  activeStage === stage.id
                    ? `${tone.accent} border-transparent text-white shadow-sm`
                    : "border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-background/80 hover:text-foreground",
                )}
              >
                {stage.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Legenda
            </span>
            <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", requirementClasses.obrigatorio)}>
              obrigatorio
            </span>
            <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", requirementClasses.recomendado)}>
              recomendado
            </span>
            <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", requirementClasses.opcional)}>
              opcional
            </span>
            {(["estagio", "avaliacao", "documento", "prova", "formacao", "clinico"] as ProgressCategoryTag[]).map(
              (tag) => (
                <span
                  key={tag}
                  className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", categoryTagClasses[tag])}
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>

        <div
          className={cn(
            "mt-6 overflow-hidden rounded-[1.8rem] border p-0 shadow-[0_20px_50px_rgba(15,23,42,0.08)]",
            toneClasses[currentStage.tone].border,
          )}
        >
          <div className={cn("border-b px-6 py-6", toneClasses[currentStage.tone].soft, toneClasses[currentStage.tone].border)}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Etapa ativa
                </p>
                <h1 className={cn("mt-2 text-2xl font-semibold tracking-tight", toneClasses[currentStage.tone].strong)}>
                  {currentStage.title}
                </h1>
                <p className="mt-1 text-sm font-medium text-foreground/80">{currentStage.subtitle}</p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{currentStage.objective}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background/70 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                  {currentStage.duration}
                </span>
                <span className="rounded-full bg-background/70 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                  {currentStage.year}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="border-b border-border/60 px-6 py-5 lg:border-b-0 lg:border-r">
              <div className="rounded-[1.35rem] border border-border/50 bg-background/70 px-4 py-4 text-sm text-foreground/80 shadow-sm">
                <strong>Provas:</strong> {currentStage.provas}
              </div>
              <p className="mt-4 font-mono text-[11px] leading-5 text-muted-foreground">{currentStage.legal}</p>
            </div>

            <div className="px-6 py-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso {currentStage.label}</span>
                <span className="font-mono text-foreground">
                  {stageStats(currentStage, checkedIds).done} / {stageStats(currentStage, checkedIds).total}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", toneClasses[currentStage.tone].accent)}
                  style={{ width: `${stageStats(currentStage, checkedIds).pct}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-[1.2rem] border border-border/60 bg-background/70 px-3 py-3 shadow-sm">
                  <p className="font-mono text-lg font-semibold text-foreground">
                    {stageStats(currentStage, checkedIds).pct}%
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    total
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-border/60 bg-background/70 px-3 py-3 shadow-sm">
                  <p className="font-mono text-lg font-semibold text-foreground">
                    {stageStats(currentStage, checkedIds).done}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    feitos
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-border/60 bg-background/70 px-3 py-3 shadow-sm">
                  <p className="font-mono text-lg font-semibold text-foreground">
                    {stageStats(currentStage, checkedIds).total - stageStats(currentStage, checkedIds).done}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    falta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {currentStage.sections.map((section) => {
            const sectionKey = `${currentStage.id}:${section.id}`;
            const open = openSections[sectionKey] ?? true;
            const sectionDone = section.items.filter((item) => checkedIds.has(item.id)).length;
            const sectionPct =
              section.items.length > 0
                ? Math.round((sectionDone / section.items.length) * 100)
                : 0;
            const Icon = sectionIcon(section.icon);

            return (
              <div
                key={section.id}
                className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-card/90 shadow-sm transition hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(sectionKey)}
                  className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-secondary/30"
                >
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm", toneClasses[currentStage.tone].soft)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{section.title}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-2 w-full max-w-48 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", toneClasses[currentStage.tone].accent)}
                          style={{ width: `${sectionPct}%` }}
                        />
                      </div>
                      <span className={cn("font-mono text-xs", sectionDone === section.items.length ? "text-emerald-600" : "text-muted-foreground")}>
                        {sectionDone}/{section.items.length}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")} />
                </button>

                {open ? (
                  <div className="border-t border-border/60 bg-background/35 px-3 py-3">
                    <div className="space-y-2">
                      {section.items.map((item) => {
                        const checked = checkedIds.has(item.id);
                        const isSaving = savingId === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => void toggleItem(item.id)}
                            disabled={loading || isSaving}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-[1.2rem] border px-4 py-3.5 text-left transition",
                              checked
                                ? "border-border/70 bg-card shadow-[0_10px_24px_rgba(15,23,42,0.07)]"
                                : "border-border/20 bg-white/70 hover:border-border/70 hover:bg-card hover:shadow-sm",
                              isSaving && "opacity-70",
                            )}
                          >
                            <div
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition",
                                checked
                                  ? `${toneClasses[currentStage.tone].accent} border-transparent text-white`
                                  : "border-slate-300 bg-white dark:border-slate-600 dark:bg-transparent",
                              )}
                            >
                              {checked ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start gap-2">
                                <span
                                  className={cn(
                                    "flex-1 text-sm font-medium leading-6 text-foreground",
                                    checked && "text-foreground",
                                  )}
                                >
                                  {item.text}
                                </span>
                                <span
                                  className={cn(
                                    "rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize",
                                    requirementClasses[item.requirement],
                                  )}
                                >
                                  {item.requirement}
                                </span>
                              </div>

                              {item.note ? (
                                <p className={cn("mt-1 text-xs leading-5 text-muted-foreground", checked && "text-muted-foreground")}>
                                  {item.note}
                                </p>
                              ) : null}

                              {item.tags?.length || item.deadline ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {item.tags?.map((tag) => (
                                    <span
                                      key={tag}
                                      className={cn(
                                        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                                        categoryTagClasses[tag],
                                      )}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {item.deadline ? (
                                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-[10px] font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                                      {item.deadline}
                                    </span>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

      </section>
    </main>
  );
}
