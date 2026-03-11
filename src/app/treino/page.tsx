'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type QuestionOption = {
  id: string;
  text: string;
  is_correct: boolean;
};

type Question = {
  id: string;
  stem: string;
  explanation: string | null;
  question_options: QuestionOption[];
};

export default function TreinoPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const question = questions[currentIndex] ?? null;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

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
          "id, stem, explanation, question_options(id, text, is_correct)"
        )
        .order("created_at", { ascending: true });

      if (error || !data || data.length === 0) {
        setErrorMsg("Não foi possível carregar perguntas.");
        setLoading(false);
        return;
      }

      setQuestions(data as Question[]);
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setFeedback(null);
      setLoading(false);
    }

    loadQuestions();
  }, []);

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

    setFeedback(
      isCorrect
        ? "Correto! Boa!"
        : "Resposta incorreta. Revê a explicação abaixo."
    );
  }

  function goToNextQuestion() {
    if (questions.length === 0) return;
    setSelectedOptionId(null);
    setFeedback(null);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Treino MGF
              </h1>
              {questions.length > 0 && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Pergunta {currentIndex + 1} de {questions.length}
                </p>
              )}
            </div>
            <Link
              href="/estatisticas"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Ver estatísticas →
            </Link>
          </div>

          {questions.length > 0 && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
              A carregar perguntas...
            </div>
          )}

          {errorMsg && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMsg}
            </div>
          )}

          {question && !loading && (
            <div className="space-y-5">
              <p className="font-medium text-foreground whitespace-pre-line leading-relaxed">
                {question.stem}
              </p>

              <div className="space-y-2">
                {question.question_options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const showResult = !!selectedOptionId;

                  let optionClass =
                    "w-full text-left rounded-xl border px-4 py-3 text-sm transition-all ";
                  if (!showResult) {
                    optionClass += "border-input bg-background hover:bg-muted";
                  } else if (isSelected && opt.is_correct) {
                    optionClass += "border-success bg-success/10 text-foreground";
                  } else if (isSelected && !opt.is_correct) {
                    optionClass += "border-destructive bg-destructive/10 text-foreground";
                  } else {
                    optionClass += "border-border bg-muted/50 text-muted-foreground";
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleAnswer(opt)}
                      className={optionClass + (selectedOptionId ? " pointer-events-none" : "")}
                      disabled={!!selectedOptionId}
                    >
                      <span className="flex items-start gap-3">
                        {showResult && isSelected && (
                          <span className="shrink-0 mt-0.5">
                            {opt.is_correct ? (
                              <span className="text-success">✓</span>
                            ) : (
                              <span className="text-destructive">✕</span>
                            )}
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
                  className={`text-sm font-medium ${
                    feedback.startsWith("Correto")
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {feedback}
                </p>
              )}

              {question.explanation && selectedOptionId && (
                <div className="rounded-xl border border-border bg-accent/50 p-4 space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    Explicação
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              )}

              {selectedOptionId && (
                <button
                  type="button"
                  onClick={goToNextQuestion}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg w-full sm:w-auto sm:min-w-[180px]"
                >
                  Próxima pergunta →
                </button>
              )}
            </div>
          )}

          {!loading && !question && !errorMsg && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Não há perguntas disponíveis. Cria uma conta e corre o seed para
              carregar exemplos.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
