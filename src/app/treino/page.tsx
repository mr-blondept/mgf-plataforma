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

const DEFAULT_CATEGORY = "MGF 1";
const EXAM_CATEGORY = "Exame MGF1 - 2025";
const CATEGORY_DETAILS: Record<string, string> = {
  [DEFAULT_CATEGORY]: "Base oficial do Internato de Medicina Geral e Familiar.",
  [EXAM_CATEGORY]: "Simulado oficial (2025) com tempo controlado.",
};
const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Fácil",
  2: "Moderada",
  3: "Difícil",
};
const EXAM_TIME_PER_QUESTION_MIN = 2;
const AI_EXPLANATION_PREFIX = "Explicação (IA):";

function deriveCategory(topic?: string | null) {
  if (!topic) return DEFAULT_CATEGORY;
  const normalized = topic.split("/")[0].trim();
  return normalized === "" ? DEFAULT_CATEGORY : normalized;
}

export default function TreinoPage() {
  const [questions, setQuestions] = useState<QuestionDisplay[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState(DEFAULT_CATEGORY);
  const [mode, setMode] = useState<"treino" | "simulado">("treino");
  const [timeLeftSec, setTimeLeftSec] = useState<number | null>(null);
  const [simuladoFinalizado, setSimuladoFinalizado] = useState(false);
  const [simuladoResumo, setSimuladoResumo] = useState<{ total: number; corretas: number } | null>(null);
  const [simuladoRespostas, setSimuladoRespostas] = useState<Record<string, boolean>>({});
  const [focusMode, setFocusMode] = useState(false);

  const categoryNames = useMemo(
    () =>
      Array.from(
        new Set(questions.map((question) => question.category || DEFAULT_CATEGORY))
      ),
    [questions]
  );

  useEffect(() => {
    if (categoryNames.length > 0 && !categoryNames.includes(categoryFilter)) {
      setCategoryFilter(categoryNames[0]);
    }
  }, [categoryNames, categoryFilter]);

  useEffect(() => {
    async function loadQuestions() {
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
        .from("questions")
        .select(
          "id, stem, explanation, topic, difficulty, question_options(id, text, is_correct)"
        )
        .order("created_at", { ascending: true });

      if (error || !data || data.length === 0) {
        setErrorMsg("Não foi possível carregar perguntas.");
        setLoading(false);
        return;
      }

      const normalized = (data as QuestionFromDb[]).map((item) => ({
        ...item,
        category: deriveCategory(item.topic),
      }));

      setQuestions(normalized);
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setFeedback(null);
      setLoading(false);
    }

    loadQuestions();
  }, []);

  const deferredCategoryFilter = useDeferredValue(categoryFilter);
  const filteredQuestions = useMemo(
    () => questions.filter((question) => question.category === deferredCategoryFilter),
    [questions, deferredCategoryFilter]
  );

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setFeedback(null);
    setSimuladoFinalizado(false);
    setSimuladoResumo(null);
    setSimuladoRespostas({});
    setFocusMode(false);
    if (categoryFilter === EXAM_CATEGORY && mode === "simulado") {
      setTimeLeftSec(filteredQuestions.length * EXAM_TIME_PER_QUESTION_MIN * 60);
    } else {
      setTimeLeftSec(null);
    }
  }, [categoryFilter, filteredQuestions.length]);

  useEffect(() => {
    if (mode !== "simulado" || categoryFilter !== EXAM_CATEGORY) return;
    if (simuladoFinalizado) return;
    if (!timeLeftSec || timeLeftSec <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeftSec((prev) => {
        if (!prev) return prev;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [mode, categoryFilter, timeLeftSec, simuladoFinalizado]);

  useEffect(() => {
    if (mode !== "simulado" || categoryFilter !== EXAM_CATEGORY) return;
    if (simuladoFinalizado) return;
    if (timeLeftSec === 0) {
      finalizarSimulado();
    }
  }, [timeLeftSec, mode, categoryFilter, simuladoFinalizado]);

  function iniciarSimulado() {
    setMode("simulado");
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setFeedback(null);
    setSimuladoFinalizado(false);
    setSimuladoResumo(null);
    setSimuladoRespostas({});
    setTimeLeftSec(filteredQuestions.length * EXAM_TIME_PER_QUESTION_MIN * 60);
  }

  function finalizarSimulado() {
    const total = filteredQuestions.length;
    const corretas = Object.values(simuladoRespostas).filter(Boolean).length;
    setSimuladoResumo({ total, corretas });
    setSimuladoFinalizado(true);
    setSelectedOptionId(null);
    setFeedback(null);
  }

  const question = filteredQuestions[currentIndex] ?? null;
  const progress =
    filteredQuestions.length > 0
      ? ((currentIndex + 1) / filteredQuestions.length) * 100
      : 0;

  useEffect(() => {
    if (!loading && question) {
      setFocusMode(true);
    }
  }, [loading, question]);

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

    if (mode === "simulado") {
      setSimuladoRespostas((prev) => ({ ...prev, [question.id]: isCorrect }));
    }

    setFeedback(
      isCorrect
        ? "Correto! Boa!"
        : "Resposta incorreta. Revê a explicação abaixo."
    );
  }

  function goToNextQuestion() {
    if (filteredQuestions.length === 0) return;
    setSelectedOptionId(null);
    setFeedback(null);
    setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length);
  }

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] justify-center px-4 py-10">
      <div className="w-full max-w-5xl space-y-6">
        {!loading && question && focusMode ? (
          <section className="flex items-center justify-between rounded-3xl border border-border/60 bg-card/90 p-4 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                A estudar
              </p>
              <p className="text-lg font-semibold text-foreground">
                {categoryFilter}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedOptionId(null);
                setFeedback(null);
                setSimuladoFinalizado(false);
                setSimuladoResumo(null);
                setMode("treino");
                setTimeLeftSec(null);
                setFocusMode(false);
              }}
              className="rounded-full border border-border/60 bg-card/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground hover:border-primary/50"
            >
              Voltar às categorias
            </button>
          </section>
        ) : (
          <section className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span>Treino contínuo</span>
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Perguntas por categoria
            </h1>
            <p className="text-sm text-muted-foreground">
              Agrupe o estudo e percorra um conjunto compacto de questões para cada caminho do Internato.
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
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {categoryNames.map((name) => {
              const count = questions.filter((q) => q.category === name).length;
              const isActive = name === categoryFilter;
              return (
                <button
                  type="button"
                  key={name}
                  onClick={() => setCategoryFilter(name)}
                  className={cn(
                    "flex flex-col rounded-2xl border px-4 py-3 transition",
                    isActive
                      ? "border-primary bg-primary/10 text-foreground shadow-inner"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary hover:bg-secondary/60"
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
          {categoryFilter === EXAM_CATEGORY && (
            <div className="mt-5 rounded-3xl border border-border/60 bg-background/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Simulado oficial
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {filteredQuestions.length} questões · {EXAM_TIME_PER_QUESTION_MIN} min/questão
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("treino")}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-semibold transition",
                      mode === "treino"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/60 bg-card/80 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    Treino
                  </button>
                  <button
                    type="button"
                    onClick={iniciarSimulado}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-semibold transition",
                      mode === "simulado"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/60 bg-card/80 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    Simulado
                  </button>
                </div>
              </div>
              {mode === "simulado" && (
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground">
                    Tempo restante: {timeLeftSec !== null ? formatTime(timeLeftSec) : "--:--"}
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-2 text-sm text-muted-foreground">
                    Respostas dadas: {Object.keys(simuladoRespostas).length} / {filteredQuestions.length}
                  </div>
                  <button
                    type="button"
                    onClick={finalizarSimulado}
                    className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
                  >
                    Terminar simulado
                  </button>
                </div>
              )}
            </div>
          )}
          </section>
        )}

        <section className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                {categoryFilter}
              </p>
              <h2 className="text-2xl font-semibold text-foreground">Roteiro de estudo</h2>
              <p className="text-sm text-muted-foreground">
                {CATEGORY_DETAILS[categoryFilter] ?? "Caminho dedicado ao módulo seleccionado."}
              </p>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{filteredQuestions.length}</p>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">questões</p>
              </div>
              <div className="h-1 w-24 rounded-full bg-muted">
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
              <div className="space-y-4 rounded-3xl border border-border/60 bg-secondary/60 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Questão {currentIndex + 1} / {filteredQuestions.length}
                  </span>
                  <span className="rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-semibold text-foreground">
                    {question.topic ?? "Sem tópico"}
                  </span>
                  {question.difficulty && (
                    <span className="rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-semibold text-foreground">
                      {DIFFICULTY_LABELS[question.difficulty] ?? "Moderada"}
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
                      optionClass += "border-input bg-card/80 hover:bg-secondary/60";
                    } else if (isSelected && opt.is_correct) {
                      optionClass += "border-success bg-success/10 text-foreground";
                    } else if (isSelected && !opt.is_correct) {
                      optionClass += "border-destructive bg-destructive/10 text-foreground";
                    } else {
                      optionClass += "border-border/60 bg-muted/50 text-muted-foreground";
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
                  <div className="rounded-2xl border border-border/60 bg-accent/60 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">Explicação</p>
                      {question.explanation.startsWith(AI_EXPLANATION_PREFIX) && (
                        <span className="rounded-full border border-border/60 bg-card/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
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
                      className="flex-1 rounded-2xl border border-border/60 bg-card/80 px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/50"
                    >
                      Próxima pergunta →
                    </button>
                    <button
                      type="button"
                      onClick={finalizarSimulado}
                      className="rounded-2xl border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary hover:bg-primary/20"
                    >
                      Terminar simulado
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {simuladoFinalizado && simuladoResumo && (
            <div className="mt-6 rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm">
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
                  onClick={() => setMode("treino")}
                  className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                >
                  Voltar ao treino
                </button>
                <button
                  type="button"
                  onClick={iniciarSimulado}
                  className="rounded-2xl border border-border/60 bg-card/80 px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/50"
                >
                  Fazer novo simulado
                </button>
              </div>
            </div>
          )}

          {!loading && filteredQuestions.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground text-center">
              Ainda não existem perguntas nesta categoria. Escolhe outra ou adiciona novas no painel de administração.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
