'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import LoadingSpinner from "@/components/LoadingSpinner";

type AnswerWithQuestion = {
  is_correct: boolean;
  questions: {
    topic: string | null;
    difficulty: number | null;
  } | null;
};

type AggregatedStats = {
  total: number;
  correct: number;
  byTopic: Record<
    string,
    {
      total: number;
      correct: number;
    }
  >;
};

function computeStats(rows: AnswerWithQuestion[]): AggregatedStats {
  const stats: AggregatedStats = {
    total: 0,
    correct: 0,
    byTopic: {},
  };

  for (const row of rows) {
    stats.total += 1;
    if (row.is_correct) stats.correct += 1;

    const topic = row.questions?.topic ?? "Sem tópico";
    if (!stats.byTopic[topic]) {
      stats.byTopic[topic] = { total: 0, correct: 0 };
    }
    stats.byTopic[topic].total += 1;
    if (row.is_correct) stats.byTopic[topic].correct += 1;
  }

  return stats;
}

export default function EstatisticasPage() {
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const loadStats = useCallback(async (options?: { preserveSuccess?: boolean }) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return null;
    }

    const { data, error } = await supabase
      .from("user_answers")
      .select("is_correct, questions(topic, difficulty)")
      .eq("user_id", user.id);

    if (error) {
      setStats(null);
      setErrorMsg("Erro a carregar estatísticas.");
      return null;
    }

    const computed = computeStats((data ?? []) as unknown as AnswerWithQuestion[]);
    setStats(computed);
    setErrorMsg(null);
    if (!options?.preserveSuccess) {
      setSuccessMsg(null);
    }
    return computed;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      setLoading(true);
      const result = await loadStats();
      if (mounted) {
        setLoading(false);
        if (!result) {
          return;
        }
      }
    }

    void initialize();

    return () => {
      mounted = false;
    };
  }, [loadStats]);

  async function handleReset() {
    const confirmed = window.confirm(
      "Tens a certeza que queres apagar todas as tuas estatísticas e o histórico de sessões de perguntas? Esta ação também remove treinos e simulados em pausa e não pode ser desfeita."
    );
    if (!confirmed) return;

    setResetting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const response = await fetch("/api/reset-stats", { method: "POST" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const apiMsg = payload?.message ? ` (${payload.message})` : "";
      setErrorMsg(`Erro ao apagar estatísticas.${apiMsg}`);
      setResetting(false);
      return;
    }

    const payload = await response.json().catch(() => null);
    const remainingAnswers =
      typeof payload?.remainingAnswers === "number" ? payload.remainingAnswers : null;
    const remainingSessions =
      typeof payload?.remainingSessions === "number" ? payload.remainingSessions : null;

    const refreshed = await loadStats({ preserveSuccess: true });
    const localRemaining = refreshed?.total ?? null;

    if (
      (remainingAnswers !== null && remainingAnswers > 0) ||
      (remainingSessions !== null && remainingSessions > 0) ||
      (localRemaining !== null && localRemaining > 0)
    ) {
      const detailParts = [];
      if (typeof payload?.beforeAnswers === "number") detailParts.push(`respostas antes: ${payload.beforeAnswers}`);
      if (typeof payload?.deletedAnswers === "number") detailParts.push(`respostas apagadas: ${payload.deletedAnswers}`);
      if (typeof payload?.remainingAnswers === "number") detailParts.push(`respostas restantes: ${payload.remainingAnswers}`);
      if (typeof payload?.beforeSessions === "number") detailParts.push(`sessoes antes: ${payload.beforeSessions}`);
      if (typeof payload?.deletedSessions === "number") detailParts.push(`sessoes apagadas: ${payload.deletedSessions}`);
      if (typeof payload?.remainingSessions === "number") detailParts.push(`sessoes restantes: ${payload.remainingSessions}`);
      if (payload?.userId) detailParts.push(`user: ${payload.userId}`);
      const detail = detailParts.length > 0 ? ` (${detailParts.join(", ")})` : "";
      setErrorMsg(`A limpeza não ficou completa. Tenta novamente.${detail}`);
      setResetting(false);
      return;
    }

    setSuccessMsg("Estatísticas e histórico de sessões apagados com sucesso.");
    setResetting(false);
  }

  useEffect(() => {
    if (!successMsg) return;

    const timer = window.setTimeout(() => {
      setSuccessMsg(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [successMsg]);

  const accuracy =
    stats && stats.total > 0
      ? Math.round((100 * stats.correct) / stats.total)
      : 0;

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="relative mx-auto w-full max-w-2xl px-4 py-8">
        {successMsg && (
          <div className="fixed right-4 top-24 z-40 rounded-2xl border border-success/40 bg-success/10 px-4 py-2 text-sm text-success shadow-lg transition-all backdrop-blur">
            Estatísticas redefinidas
          </div>
        )}
        <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-md backdrop-blur sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Estatísticas do treino
              </h1>
              <p className="text-xs text-muted-foreground">
                Estatísticas pessoais para a tua conta.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="rounded-full border border-destructive/40 bg-destructive/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-destructive transition hover:bg-destructive/20 disabled:opacity-60"
              >
                {resetting ? "A apagar..." : "Reset estatísticas"}
              </button>
              <Link
                href="/treino"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                ← Voltar ao treino
              </Link>
            </div>
          </div>

          {loading && (
            <div className="space-y-4 py-4">
              <LoadingSpinner label="A carregar estatísticas..." />
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <LoadingSkeleton className="h-24" />
                <LoadingSkeleton className="h-24" />
                <LoadingSkeleton className="h-24" />
              </div>
              <LoadingSkeleton className="mx-auto h-24 w-24 rounded-full" />
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMsg}
            </div>
          )}

          {stats && !loading && (
            <div className="space-y-6">
              <section className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-border/70 bg-secondary/70 p-4 text-center shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Respondidas
                  </p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {stats.total}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-success/10 p-4 text-center shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Corretas
                  </p>
                  <p className="mt-1 text-2xl font-bold text-success">
                    {stats.correct}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-secondary/80 p-4 text-center shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Taxa de acerto
                  </p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    {accuracy}%
                  </p>
                </div>
              </section>

              {/* Circular progress for accuracy (visual only when we have data) */}
              {stats.total > 0 && (
                <div className="flex justify-center py-2">
                  <div
                    className="relative h-24 w-24 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(var(--primary) 0% ${accuracy}%, var(--muted) ${accuracy}% 100%)`,
                    }}
                  >
                    <div className="absolute inset-1.5 rounded-full bg-card/90 flex items-center justify-center">
                      <span className="text-lg font-bold text-foreground">
                        {accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <section>
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  Por tópico (área clínica)
                </h2>
                <div className="space-y-2">
                  {Object.entries(stats.byTopic).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      Ainda não há respostas por tópico. Responde a perguntas no
                      treino para ver estatísticas por área.
                    </p>
                  ) : (
                    Object.entries(stats.byTopic).map(
                      ([topic, { total, correct }]) => {
                        const pct =
                          total > 0
                            ? Math.round((100 * correct) / total)
                            : 0;
                        return (
                          <div
                            key={topic}
                            className="rounded-2xl border border-border/70 bg-card/80 p-3 flex items-center gap-3 shadow-sm backdrop-blur"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {topic}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {correct}/{total} corretas
                              </p>
                            </div>
                            <div className="shrink-0 w-16">
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-foreground w-10 text-right">
                              {pct}%
                            </span>
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
