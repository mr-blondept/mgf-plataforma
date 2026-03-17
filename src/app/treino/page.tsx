"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type QuestionOption = {
  id: string;
  text: string;
  is_correct: boolean;
};

type QuestionFromDb = {
  id: string;
  stem: string;
  explanation: string | null;
  topic: string | null;
  difficulty: number | null;
  question_options: QuestionOption[];
};

type QuestionDisplay = QuestionFromDb & {
  category: string;
};

type QuestionMeta = {
  id: string;
  topic: string | null;
  category: string;
};

type SessionAnswer = {
  option_id: string;
  is_correct: boolean;
};

type QuestionSession = {
  id: string;
  category: string;
  categories: string[] | null;
  question_ids: string[] | null;
  mode: "treino" | "simulado";
  status: "active" | "paused" | "completed";
  time_left_sec: number | null;
  current_index: number | null;
  total_questions: number | null;
  answers: Record<string, SessionAnswer | boolean> | null;
  updated_at: string | null;
};

const DEFAULT_CATEGORY = "MGF 1";
const EXAM_TIME_PER_QUESTION_MIN = 2;
const AI_EXPLANATION_PREFIX = "Explicação (IA):";
const MAX_SIMULADO_QUESTIONS = 50;

const CATEGORY_DETAILS: Record<string, string> = {
  [DEFAULT_CATEGORY]: "Base oficial do Internato de Medicina Geral e Familiar.",
};
const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Fácil",
  2: "Moderada",
  3: "Difícil",
};

function deriveCategory(topic?: string | null) {
  if (!topic) return DEFAULT_CATEGORY;
  const normalized = topic.split("/")[0].trim();
  return normalized === "" ? DEFAULT_CATEGORY : normalized;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function getSessionScore(session: QuestionSession) {
  const answers = session.answers ?? {};
  const corretas = Object.values(answers).filter((entry) =>
    typeof entry === "boolean" ? entry : entry.is_correct
  ).length;
  const respondidas = Object.keys(answers).length;
  const total = session.total_questions ?? respondidas;
  return { corretas, total, respondidas };
}

function normalizeAnswers(raw: QuestionSession["answers"]) {
  if (!raw) return {};
  const entries = Object.entries(raw);
  if (entries.length === 0) return {};
  const [, first] = entries[0];
  if (typeof first === "boolean") {
    return Object.fromEntries(
      entries.map(([key, value]) => [
        key,
        { option_id: "", is_correct: Boolean(value) },
      ])
    );
  }
  return raw as Record<string, SessionAnswer>;
}

function pickRandomIds(items: QuestionMeta[], count: number) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count).map((item) => item.id);
}

export default function TreinoPage() {
  const [questionIndex, setQuestionIndex] = useState<QuestionMeta[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<QuestionDisplay[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState(DEFAULT_CATEGORY);
  const [mode, setMode] = useState<"treino" | "simulado">("treino");
  const [timeLeftSec, setTimeLeftSec] = useState<number | null>(null);
  const [simuladoFinalizado, setSimuladoFinalizado] = useState(false);
  const [simuladoResumo, setSimuladoResumo] = useState<{ total: number; corretas: number } | null>(null);
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, SessionAnswer>>({});
  const [view, setView] = useState<"categories" | "session">("categories");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<QuestionSession[]>([]);
  const [sessionQuestionIds, setSessionQuestionIds] = useState<string[] | null>(null);
  const [simuladoCategories, setSimuladoCategories] = useState<string[]>([]);
  const [simuladoCount, setSimuladoCount] = useState(MAX_SIMULADO_QUESTIONS);
  const [createMode, setCreateMode] = useState<"treino" | "simulado">("treino");

  const categoryNames = useMemo(
    () => Array.from(new Set(questionIndex.map((question) => question.category))),
    [questionIndex]
  );

  useEffect(() => {
    if (categoryNames.length > 0 && !categoryNames.includes(categoryFilter)) {
      setCategoryFilter(categoryNames[0]);
    }
  }, [categoryNames, categoryFilter]);

  useEffect(() => {
    if (categoryNames.length > 0 && simuladoCategories.length === 0) {
      setSimuladoCategories(categoryNames.slice(0, 3));
    }
  }, [categoryNames, simuladoCategories.length]);

  useEffect(() => {
    async function loadQuestionIndex() {
      setLoadingIndex(true);
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
        .from("questions")
        .select("id, topic")
        .order("created_at", { ascending: true });

      if (error || !data || data.length === 0) {
        setErrorMsg("Não foi possível carregar perguntas.");
        setLoadingIndex(false);
        return;
      }

      const normalized = (data as { id: string; topic: string | null }[]).map((item) => ({
        ...item,
        category: deriveCategory(item.topic),
      }));

      setQuestionIndex(normalized);
      setLoadingIndex(false);
    }

    loadQuestionIndex();
  }, []);

  useEffect(() => {
    async function loadSessions() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("question_sessions")
        .select(
          "id, category, categories, question_ids, mode, status, time_left_sec, current_index, total_questions, answers, updated_at"
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      setSessions((data as QuestionSession[]) ?? []);
    }

    loadSessions();
  }, []);

  const deferredCategoryFilter = useDeferredValue(categoryFilter);
  const categoryQuestions = useMemo(
    () => questionIndex.filter((question) => question.category === deferredCategoryFilter),
    [questionIndex, deferredCategoryFilter]
  );

  const activeQuestions = useMemo(() => {
    if (view === "session" && sessionQuestions.length > 0) return sessionQuestions;
    return [];
  }, [view, sessionQuestions]);

  async function loadSessionQuestions(questionIds: string[]) {
    setLoadingSession(true);
    setErrorMsg(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("questions")
      .select(
        "id, stem, explanation, topic, difficulty, question_options(id, text, is_correct)"
      )
      .in("id", questionIds);

    if (error || !data) {
      setErrorMsg("Não foi possível carregar as perguntas da sessão.");
      setLoadingSession(false);
      return;
    }

    const byId = new Map(
      (data as QuestionFromDb[]).map((item) => [
        item.id,
        { ...item, category: deriveCategory(item.topic) },
      ])
    );

    const ordered = questionIds
      .map((id) => byId.get(id))
      .filter((item): item is QuestionDisplay => Boolean(item));

    setSessionQuestions(ordered);
    setLoadingSession(false);
  }

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setFeedback(null);
    setSimuladoFinalizado(false);
    setSimuladoResumo(null);
    setSessionAnswers({});
    if (mode === "simulado" && activeSessionId) {
      setTimeLeftSec(activeQuestions.length * EXAM_TIME_PER_QUESTION_MIN * 60);
    } else if (mode === "treino") {
      setTimeLeftSec(null);
    }
  }, [categoryFilter, activeQuestions.length]);

  useEffect(() => {
    if (mode !== "simulado" || view !== "session") return;
    if (simuladoFinalizado) return;
    if (timeLeftSec === null || timeLeftSec <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [mode, view, timeLeftSec, simuladoFinalizado]);

  useEffect(() => {
    if (mode !== "simulado" || view !== "session") return;
    if (simuladoFinalizado) return;
    if (timeLeftSec === 0) {
      finalizarSimulado();
    }
  }, [timeLeftSec, mode, view, simuladoFinalizado]);

  useEffect(() => {
    if (view !== "session" || !activeSessionId) return;

    const interval = window.setInterval(() => {
      persistSessionProgress("active");
    }, 15000);

    return () => window.clearInterval(interval);
  }, [view, activeSessionId, timeLeftSec, currentIndex, sessionAnswers]);

  useEffect(() => {
    if (view !== "session" || !activeSessionId) return;
    const existing = sessionAnswers[activeQuestions[currentIndex]?.id ?? ""];
    if (existing) {
      setSelectedOptionId(existing.option_id || null);
      setFeedback(
        existing.is_correct
          ? "Correto! Boa!"
          : "Resposta incorreta. Revê a explicação abaixo."
      );
    } else {
      setSelectedOptionId(null);
      setFeedback(null);
    }
  }, [view, activeSessionId, currentIndex, activeQuestions, sessionAnswers]);

  async function persistSessionProgress(status: QuestionSession["status"]) {
    if (!activeSessionId) return;
    const supabase = createClient();
    await supabase
      .from("question_sessions")
      .update({
        status,
        time_left_sec: timeLeftSec,
        current_index: currentIndex,
        answers: sessionAnswers,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeSessionId);
  }

  async function iniciarTreino() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const questionIds = categoryQuestions.map((q) => q.id);

    const { data, error } = await supabase
      .from("question_sessions")
      .insert({
        user_id: user.id,
        category: categoryFilter,
        categories: [categoryFilter],
        question_ids: questionIds,
        mode: "treino",
        status: "active",
        duration_sec: null,
        time_left_sec: null,
        current_index: 0,
        total_questions: questionIds.length,
        answers: {},
      })
      .select(
        "id, category, categories, question_ids, mode, status, time_left_sec, current_index, total_questions, answers, updated_at"
      )
      .single();

    if (error || !data) {
      setErrorMsg("Não foi possível iniciar a sessão.");
      return;
    }

    setMode("treino");
    setView("session");
    setActiveSessionId(data.id);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setFeedback(null);
    setSimuladoFinalizado(false);
    setSimuladoResumo(null);
    setSessionAnswers({});
    setTimeLeftSec(null);
    setSessionQuestionIds(questionIds);
    setSessionQuestions([]);

    await loadSessionQuestions(questionIds);

    setSessions((prev) => [data as QuestionSession, ...prev]);
  }

  async function iniciarSimulado() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const categories = simuladoCategories.length > 0 ? simuladoCategories : [categoryFilter];
    const pool = questionIndex.filter((q) => categories.includes(q.category));

    if (pool.length === 0) {
      setErrorMsg("Seleciona categorias com perguntas disponíveis.");
      return;
    }

    const desiredCount = Math.min(
      Math.max(1, simuladoCount),
      MAX_SIMULADO_QUESTIONS,
      pool.length
    );

    const questionIds = pickRandomIds(pool, desiredCount);
    const durationSec = questionIds.length * EXAM_TIME_PER_QUESTION_MIN * 60;

    const { data, error } = await supabase
      .from("question_sessions")
      .insert({
        user_id: user.id,
        category: "Simulado personalizado",
        categories,
        question_ids: questionIds,
        mode: "simulado",
        status: "active",
        duration_sec: durationSec,
        time_left_sec: durationSec,
        current_index: 0,
        total_questions: questionIds.length,
        answers: {},
      })
      .select(
        "id, category, categories, question_ids, mode, status, time_left_sec, current_index, total_questions, answers, updated_at"
      )
      .single();

    if (error || !data) {
      setErrorMsg("Não foi possível iniciar a sessão.");
      return;
    }

    setMode("simulado");
    setView("session");
    setActiveSessionId(data.id);
    setTimeLeftSec(data.time_left_sec ?? durationSec);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setFeedback(null);
    setSimuladoFinalizado(false);
    setSimuladoResumo(null);
    setSessionAnswers({});
    setSessionQuestionIds(questionIds);
    setSessionQuestions([]);

    await loadSessionQuestions(questionIds);

    setSessions((prev) => [data as QuestionSession, ...prev]);
  }

  async function retomarSessao(session: QuestionSession) {
    const normalizedAnswers = normalizeAnswers(session.answers);
    setMode(session.mode);
    setView("session");
    setActiveSessionId(session.id);
    setTimeLeftSec(session.time_left_sec ?? null);
    setCurrentIndex(session.current_index ?? 0);
    setSelectedOptionId(null);
    setFeedback(null);
    setSimuladoFinalizado(false);
    setSimuladoResumo(null);
    setSessionAnswers(normalizedAnswers);
    setSessionQuestionIds(session.question_ids ?? null);
    setSessionQuestions([]);

    if (session.question_ids && session.question_ids.length > 0) {
      await loadSessionQuestions(session.question_ids);
    }

    await persistSessionProgress("active");
  }

  async function pausarSessao() {
    if (activeSessionId) {
      await persistSessionProgress("paused");
    }
    setView("categories");
  }

  async function finalizarSimulado() {
    const total = activeQuestions.length;
    const corretas = Object.values(sessionAnswers).filter((entry) => entry.is_correct).length;
    setSimuladoResumo({ total, corretas });
    setSimuladoFinalizado(true);
    setSelectedOptionId(null);
    setFeedback(null);

    if (activeSessionId) {
      await persistSessionProgress("completed");
    }
  }

  const question = activeQuestions[currentIndex] ?? null;
  const progress =
    activeQuestions.length > 0
      ? ((currentIndex + 1) / activeQuestions.length) * 100
      : 0;

  async function handleAnswer(option: QuestionOption) {
    if (!question) return;

    setSelectedOptionId(option.id);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setFeedback("Precisas de iniciar sessão.");
      return;
    }

    const isCorrect = option.is_correct;

    const { error } = await supabase.from("user_answers").insert({
      user_id: user.id,
      question_id: question.id,
      option_id: option.id,
      is_correct: isCorrect,
    });

    if (error) {
      setFeedback("Erro ao guardar resposta.");
      return;
    }

    if (activeSessionId) {
      const entry = { option_id: option.id, is_correct: isCorrect };
      setSessionAnswers((prev) => ({ ...prev, [question.id]: entry }));
      await supabase.from("question_session_answers").upsert(
        {
          session_id: activeSessionId,
          user_id: user.id,
          question_id: question.id,
          option_id: option.id,
          is_correct: isCorrect,
          answered_at: new Date().toISOString(),
        },
        { onConflict: "session_id,question_id" }
      );
    }

    setFeedback(
      isCorrect
        ? "Correto! Boa!"
        : "Resposta incorreta. Revê a explicação abaixo."
    );
  }

  function goToNextQuestion() {
    if (activeQuestions.length === 0) return;
    setSelectedOptionId(null);
    setFeedback(null);

    if (mode === "simulado") {
      if (currentIndex + 1 >= activeQuestions.length) {
        finalizarSimulado();
        return;
      }
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    setCurrentIndex((prev) => (prev + 1) % activeQuestions.length);
  }

  const activeSessions = sessions.filter((session) => session.status !== "completed");
  const completedSessions = sessions.filter((session) => session.status === "completed");

  const loading = loadingIndex || loadingSession;

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="relative mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
        {view === "session" && question ? (
          <section className="flex items-center justify-between rounded-3xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {mode === "simulado" ? "Sessão de exame" : "Sessão de treino"}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {sessionQuestionIds ? "Sessão personalizada" : categoryFilter}
              </p>
            </div>
            <button
              type="button"
              onClick={pausarSessao}
              className="rounded-full border border-border/70 bg-secondary/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground hover:border-foreground/40"
            >
              Guardar e sair
            </button>
          </section>
        ) : (
          <section className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span>Banco de Perguntas</span>
              </div>
              <h1 className="font-display text-3xl font-semibold text-foreground">
                Criar sessão
              </h1>
              <p className="text-sm text-muted-foreground">
                Define se queres treino rápido por categoria ou montar um simulado completo.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  href="/estatisticas"
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Ver estatísticas →
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Voltar ao dashboard
                </Link>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-full border border-border/70 bg-secondary/40 p-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <button
                type="button"
                onClick={() => setCreateMode("treino")}
                className={cn(
                  "rounded-full px-4 py-2 font-semibold transition",
                  createMode === "treino"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Treino por categoria
              </button>
              <button
                type="button"
                onClick={() => setCreateMode("simulado")}
                className={cn(
                  "rounded-full px-4 py-2 font-semibold transition",
                  createMode === "simulado"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Simulado personalizado
              </button>
            </div>

            {createMode === "treino" ? (
              <>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {categoryNames.map((name) => {
                    const count = questionIndex.filter((q) => q.category === name).length;
                    const isActive = name === categoryFilter;
                    return (
                      <button
                        type="button"
                        key={name}
                        onClick={() => setCategoryFilter(name)}
                        className={cn(
                          "flex flex-col rounded-2xl border px-4 py-3 transition",
                          isActive
                            ? "border-foreground/40 bg-secondary/80 text-foreground shadow-inner"
                            : "border-border/70 bg-card/60 text-muted-foreground hover:border-foreground/40 hover:bg-secondary/70"
                        )}
                      >
                        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          {name}
                        </span>
                        <p className="text-lg font-semibold text-foreground">{count} questões</p>
                        <p className="text-xs leading-tight text-muted-foreground mt-1">
                          {CATEGORY_DETAILS[name] ?? "Conteúdo organizado e preparado."}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={iniciarTreino}
                    className="rounded-full bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground"
                  >
                    Iniciar sessão de treino
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Simulado personalizado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Seleciona categorias e escolhe ate {MAX_SIMULADO_QUESTIONS} perguntas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={iniciarSimulado}
                    className="rounded-full border border-border/70 bg-secondary/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground hover:border-foreground/40"
                  >
                    Iniciar simulado
                  </button>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="flex flex-wrap gap-2">
                    {categoryNames.map((category) => {
                      const isSelected = simuladoCategories.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setSimuladoCategories((prev) =>
                              prev.includes(category)
                                ? prev.filter((item) => item !== category)
                                : [...prev, category]
                            );
                          }}
                          className={cn(
                            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "border border-border/70 bg-secondary/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                          )}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3">
                    <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Numero de perguntas
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={MAX_SIMULADO_QUESTIONS}
                      value={simuladoCount}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setSimuladoCount(Number.isFinite(value) ? value : 1);
                      }}
                      className="mt-2 w-full rounded-xl border border-border/70 bg-background/70 px-4 py-2 text-sm text-foreground"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSessions.length > 0 && (
              <div className="mt-6 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Sessões em curso
                </p>
                <div className="mt-3 grid gap-3">
                  {activeSessions.map((session) => {
                    const score = getSessionScore(session);
                    const sessionLabel = session.categories?.length
                      ? session.categories.join(" · ")
                      : session.category;
                    return (
                      <div
                        key={session.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                            {session.mode === "simulado" ? "Simulado" : "Treino"} · {session.status}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {sessionLabel}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {score.respondidas}/{score.total} respondidas
                            {session.time_left_sec != null &&
                              ` · Tempo: ${formatTime(session.time_left_sec)}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => retomarSessao(session)}
                          className="rounded-full border border-border/70 bg-card/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground hover:border-foreground/40"
                        >
                          Retomar sessão
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completedSessions.length > 0 && (
              <div className="mt-6 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Sessões concluídas
                </p>
                <div className="mt-3 grid gap-3">
                  {completedSessions.map((session) => {
                    const score = getSessionScore(session);
                    const sessionLabel = session.categories?.length
                      ? session.categories.join(" · ")
                      : session.category;
                    return (
                      <div
                        key={session.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                            {session.mode === "simulado" ? "Simulado" : "Treino"} · concluída
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {sessionLabel}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Resultado: {score.corretas}/{score.total}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {session.updated_at ? new Date(session.updated_at).toLocaleDateString("pt-PT") : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {view === "session" && (
          <section className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  {sessionQuestionIds ? "Sessão personalizada" : categoryFilter}
                </p>
                <h2 className="text-2xl font-semibold text-foreground">Roteiro de estudo</h2>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_DETAILS[categoryFilter] ?? "Caminho dedicado ao módulo seleccionado."}
                </p>
              </div>
              <div className="flex items-end gap-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{activeQuestions.length}</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">questões</p>
                </div>
                <div className="h-1 w-24 rounded-full bg-border/70">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {loading && (
              <div className="mt-6 flex items-center gap-2 text-muted-foreground text-sm">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                A carregar perguntas...
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMsg}
              </div>
            )}

            {!loading && question && !simuladoFinalizado && (
              <div className="mt-6 grid gap-6">
                <div className="space-y-4 rounded-3xl border border-border/70 bg-secondary/60 p-6 backdrop-blur">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Questão {currentIndex + 1} / {activeQuestions.length}
                    </span>
                    <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-semibold text-foreground">
                      {question.topic ?? "Sem tópico"}
                    </span>
                    {question.difficulty && (
                      <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-semibold text-foreground">
                        {DIFFICULTY_LABELS[question.difficulty] ?? "Moderada"}
                      </span>
                    )}
                    {mode === "simulado" && (
                      <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-semibold text-foreground">
                        Tempo: {timeLeftSec !== null ? formatTime(timeLeftSec) : "--:--"}
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-medium text-foreground leading-relaxed whitespace-pre-line">
                    {question.stem}
                  </p>
                  <div className="space-y-3">
                    {question.question_options.map((opt) => {
                      const isSelected = selectedOptionId === opt.id;
                      const showResult = !!selectedOptionId;

                      let optionClass =
                        "w-full flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition-all ";
                      if (!showResult) {
                        optionClass += "border-border/70 bg-card/70 hover:bg-secondary/70";
                      } else if (isSelected && opt.is_correct) {
                        optionClass += "border-success bg-success/10 text-foreground";
                      } else if (isSelected && !opt.is_correct) {
                        optionClass += "border-destructive bg-destructive/10 text-foreground";
                      } else {
                        optionClass += "border-border/60 bg-muted/60 text-muted-foreground";
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleAnswer(opt)}
                          className={cn(
                            optionClass,
                            selectedOptionId && "pointer-events-none"
                          )}
                          disabled={!!selectedOptionId}
                        >
                          <span className="flex items-start gap-3">
                            {showResult && isSelected && (
                              <span className="mt-0.5 text-base font-semibold">
                                {opt.is_correct ? "✅" : "✖️"}
                              </span>
                            )}
                            <span>{opt.text}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {feedback && (
                    <p
                      className={cn(
                        "text-sm font-medium",
                        feedback.startsWith("Correto")
                          ? "text-success"
                          : "text-destructive"
                      )}
                    >
                      {feedback}
                    </p>
                  )}

                  {question.explanation && selectedOptionId && mode === "treino" && (
                    <div className="rounded-2xl border border-border/70 bg-muted/60 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">Explicação</p>
                        {question.explanation.startsWith(AI_EXPLANATION_PREFIX) && (
                          <span className="rounded-full border border-border/70 bg-card/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            IA
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  {selectedOptionId && mode === "treino" && (
                    <button
                      type="button"
                      onClick={goToNextQuestion}
                      className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                    >
                      Próxima pergunta →
                    </button>
                  )}
                  {mode === "simulado" && (
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={goToNextQuestion}
                        className="flex-1 rounded-2xl border border-border/70 bg-card/70 px-5 py-3 text-sm font-semibold text-foreground hover:border-foreground/40"
                      >
                        Próxima pergunta →
                      </button>
                      <button
                        type="button"
                        onClick={finalizarSimulado}
                        className="rounded-2xl border border-foreground/30 bg-secondary/80 px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
                      >
                        Terminar simulado
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {simuladoFinalizado && simuladoResumo && (
              <div className="mt-6 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Simulado concluído
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">
                  Resultado: {simuladoResumo.corretas} / {simuladoResumo.total}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Revê as questões no modo treino para ver explicações detalhadas.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setView("categories")}
                    className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                  >
                    Voltar às categorias
                  </button>
                  <button
                    type="button"
                    onClick={iniciarSimulado}
                    className="rounded-2xl border border-border/70 bg-card/70 px-5 py-3 text-sm font-semibold text-foreground hover:border-foreground/40"
                  >
                    Fazer novo simulado
                  </button>
                </div>
              </div>
            )}

            {!loading && activeQuestions.length === 0 && (
              <p className="mt-6 text-sm text-muted-foreground text-center">
                Ainda não existem perguntas nesta categoria. Escolhe outra ou adiciona novas no painel de administração.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
