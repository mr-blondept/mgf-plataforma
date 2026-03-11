'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setErrorMsg(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const { data, error } = await supabase
        .from("user_answers")
        .select("is_correct, questions(topic, difficulty)")
        .eq("user_id", user.id);

      if (error) {
        setErrorMsg("Erro a carregar estatísticas.");
        setLoading(false);
        return;
      }

      const computed = computeStats((data ?? []) as unknown as AnswerWithQuestion[]);
      setStats(computed);
      setLoading(false);
    }

    loadStats();
  }, []);

  const accuracy =
    stats && stats.total > 0
      ? Math.round((100 * stats.correct) / stats.total)
      : 0;

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-foreground">
              Estatísticas do treino
            </h1>
            <Link
              href="/treino"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              ← Voltar ao treino
            </Link>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              A carregar...
            </div>
          )}

          {errorMsg && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMsg}
            </div>
          )}

          {stats && !loading && (
            <div className="space-y-6">
              <section className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-xl border border-border bg-secondary p-4 text-center shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Respondidas
                  </p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {stats.total}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-success/15 p-4 text-center shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Corretas
                  </p>
                  <p className="mt-1 text-2xl font-bold text-success">
                    {stats.correct}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-accent p-4 text-center shadow-sm">
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
                    <div className="absolute inset-1.5 rounded-full bg-card flex items-center justify-center">
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
                            className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 shadow-sm"
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
