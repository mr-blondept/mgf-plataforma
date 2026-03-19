"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  Clock3,
  Target,
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { pt } from "date-fns/locale";

type AnswerWithQuestion = {
  is_correct: boolean;
  questions: {
    topic: string | null;
  } | null;
};

type UserEvent = {
  id: string;
  title: string;
  start_at: string;
};

type QuestionSession = {
  id: string;
  mode: "treino" | "simulado";
  status: "active" | "paused" | "completed";
  category: string;
  categories: string[] | null;
  total_questions: number | null;
  updated_at: string | null;
};

type DashboardStats = {
  total: number;
  correct: number;
  topTopic: string | null;
};

function computeStats(rows: AnswerWithQuestion[]): DashboardStats {
  const byTopic = new Map<string, { total: number; correct: number }>();
  let total = 0;
  let correct = 0;

  for (const row of rows) {
    total += 1;
    if (row.is_correct) correct += 1;

    const topic = row.questions?.topic ?? "Sem tópico";
    const current = byTopic.get(topic) ?? { total: 0, correct: 0 };
    current.total += 1;
    if (row.is_correct) current.correct += 1;
    byTopic.set(topic, current);
  }

  let topTopic: string | null = null;
  let topTopicTotal = -1;
  for (const [topic, values] of byTopic.entries()) {
    if (values.total > topTopicTotal) {
      topTopic = topic;
      topTopicTotal = values.total;
    }
  }

  return { total, correct, topTopic };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, correct: 0, topTopic: null });
  const [monthEvents, setMonthEvents] = useState<UserEvent[]>([]);
  const [sessions, setSessions] = useState<QuestionSession[]>([]);

  useEffect(() => {
    async function loadDashboard() {
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

      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();

      const [answersResult, eventsResult, sessionsResult] = await Promise.all([
        supabase
          .from("user_answers")
          .select("is_correct, questions(topic)")
          .eq("user_id", user.id),
        supabase
          .from("user_events")
          .select("id, title, start_at")
          .eq("user_id", user.id)
          .gte("start_at", monthStart)
          .lte("start_at", monthEnd)
          .order("start_at", { ascending: true }),
        supabase
          .from("question_sessions")
          .select("id, mode, status, category, categories, total_questions, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
      ]);

      if (answersResult.error || eventsResult.error || sessionsResult.error) {
        setErrorMsg("Não foi possível carregar o dashboard.");
        setLoading(false);
        return;
      }

      setStats(computeStats((answersResult.data ?? []) as unknown as AnswerWithQuestion[]));
      setMonthEvents((eventsResult.data ?? []) as UserEvent[]);
      setSessions((sessionsResult.data ?? []) as QuestionSession[]);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const currentMonthLabel = format(new Date(), "MMMM", { locale: pt });
  const activeSessions = sessions.filter((session) => session.status !== "completed");
  const completedSessions = sessions.filter((session) => session.status === "completed");
  const nextEvents = monthEvents.slice(0, 4);

  const headline = useMemo(() => {
    if (stats.total === 0 && monthEvents.length === 0) {
      return "Ainda sem atividade registada";
    }
    if (activeSessions.length > 0) {
      return `${activeSessions.length} sessão${activeSessions.length > 1 ? "ões" : ""} pronta${activeSessions.length > 1 ? "s" : ""} para retomar`;
    }
    if (monthEvents.length > 0) {
      return `${monthEvents.length} evento${monthEvents.length > 1 ? "s" : ""} este mês`;
    }
    return `${stats.total} respostas registadas`;
  }, [activeSessions.length, monthEvents.length, stats.total]);

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-md backdrop-blur sm:p-8">
          <div className="absolute inset-0 hero-surface opacity-80" />
          <div className="absolute inset-0 soft-grain opacity-20" />
          <div className="relative grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Painel principal
              </p>
              <h1 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
                {headline}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Tens aqui uma leitura rápida do progresso, do calendário deste mês e do que ficou pendente.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-border/70 bg-background/65 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Precisão</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{accuracy}%</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stats.correct} certas em {stats.total} respostas</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/65 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sessões ativas</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{activeSessions.length}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Exames ou treinos em curso e em pausa</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/65 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Mês atual</p>
                  <p className="mt-2 text-3xl font-semibold capitalize text-foreground">{currentMonthLabel}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{monthEvents.length} evento{monthEvents.length === 1 ? "" : "s"} planeado{monthEvents.length === 1 ? "" : "s"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/70 bg-background/65 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Acesso rápido</p>
              <div className="mt-4 grid gap-3">
                <Link
                  href="/treino"
                  className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card/80 px-4 py-4 transition hover:border-foreground/40 hover:bg-secondary/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-secondary/80">
                      <Target className="h-5 w-5 text-foreground" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">Banco de perguntas</p>
                      <p className="text-sm text-muted-foreground">Criar exame e retomar sessões</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                </Link>
                <Link
                  href="/calendario"
                  className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card/80 px-4 py-4 transition hover:border-foreground/40 hover:bg-secondary/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-secondary/80">
                      <CalendarDays className="h-5 w-5 text-foreground" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">Calendário</p>
                      <p className="text-sm text-muted-foreground">Ver eventos e planeamento do mês</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                </Link>
                <Link
                  href="/estatisticas"
                  className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card/80 px-4 py-4 transition hover:border-foreground/40 hover:bg-secondary/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-secondary/80">
                      <BarChart3 className="h-5 w-5 text-foreground" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">Estatísticas</p>
                      <p className="text-sm text-muted-foreground">Analisar resultados por respostas</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {errorMsg && (
          <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMsg}
          </div>
        )}

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Pré-visualização</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">Estatísticas rápidas</h2>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-2xl bg-secondary/50" />
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Rendimento global</p>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-secondary/70">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.max(accuracy, stats.total > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {stats.total > 0
                      ? `${accuracy}% de acerto nas respostas registadas.`
                      : "Ainda não tens respostas suficientes para calcular desempenho."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border/70 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Tema mais praticado</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {stats.topTopic ?? "Sem dados"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">Baseado nas respostas já registadas.</p>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sessões concluídas</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{completedSessions.length}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Histórico disponível para revisão.</p>
                  </div>
                </div>

                <Link
                  href="/estatisticas"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Abrir estatísticas completas
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Pré-visualização</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">Calendário do mês</h2>
              </div>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-2xl bg-secondary/50" />
                ))}
              </div>
            ) : nextEvents.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-border/70 bg-background/50 p-6 text-sm text-muted-foreground">
                Ainda não tens eventos marcados para este mês.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {nextEvents.map((event) => {
                  const eventDate = parseISO(event.start_at);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between gap-4 rounded-3xl border border-border/70 bg-background/60 px-4 py-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-center">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            {format(eventDate, "MMM", { locale: pt })}
                          </p>
                          <p className="text-xl font-semibold text-foreground">{format(eventDate, "d")}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(eventDate, "EEEE, HH:mm", { locale: pt })}
                          </p>
                        </div>
                      </div>
                      <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  );
                })}

                <Link
                  href="/calendario"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Abrir calendário completo
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sessões</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">Por retomar</h2>
              </div>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                [0, 1, 2].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-2xl bg-secondary/50" />
                ))
              ) : activeSessions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/70 bg-background/50 p-6 text-sm text-muted-foreground">
                  Não tens sessões ativas ou em pausa neste momento.
                </div>
              ) : (
                activeSessions.slice(0, 3).map((session) => {
                  const label = session.categories?.length
                    ? session.categories.join(" · ")
                    : session.category;
                  return (
                    <div
                      key={session.id}
                      className="rounded-3xl border border-border/70 bg-background/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                            {session.mode === "simulado" ? "Exame" : "Treino"} · {session.status}
                          </p>
                          <p className="mt-1 font-semibold text-foreground">{label}</p>
                        </div>
                        <BookOpenCheck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {session.total_questions ?? 0} questões · última atualização{" "}
                        {session.updated_at
                          ? format(parseISO(session.updated_at), "d MMM, HH:mm", { locale: pt })
                          : "sem registo"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <Link
              href="/treino"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Abrir banco de perguntas
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Visão geral</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">Este mês</h2>
              </div>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-border/70 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Eventos do mês</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{monthEvents.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Compromissos registados no calendário.</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Respostas recentes</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {sessions.filter((session) => session.updated_at && isSameMonth(parseISO(session.updated_at), new Date())).length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Sessões atualizadas durante este mês.</p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Leitura rápida</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {stats.total > 0
                  ? `Já tens ${stats.total} respostas registadas e ${completedSessions.length} sessões concluídas. ${
                      monthEvents.length > 0
                        ? `Há ${monthEvents.length} evento${monthEvents.length > 1 ? "s" : ""} planeado${monthEvents.length > 1 ? "s" : ""} para ${currentMonthLabel}.`
                        : `Ainda não tens eventos marcados para ${currentMonthLabel}.`
                    }`
                  : `Ainda estás no início. O próximo passo natural é criar um exame no banco de perguntas e marcar os momentos de estudo no calendário.`}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
