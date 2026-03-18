import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { count: beforeAnswersCount, error: beforeAnswersError } = await supabase
    .from("user_answers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (beforeAnswersError) {
    return NextResponse.json(
      {
        message: "Erro ao contar respostas antes do reset",
        error: beforeAnswersError.message,
      },
      { status: 500 }
    );
  }

  const { count: beforeSessionsCount, error: beforeSessionsError } = await supabase
    .from("question_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (beforeSessionsError) {
    return NextResponse.json(
      {
        message: "Erro ao contar sessões antes do reset",
        error: beforeSessionsError.message,
      },
      { status: 500 }
    );
  }

  const { error: answersDeleteError, count: deletedAnswersCount } = await supabase
    .from("user_answers")
    .delete({ count: "exact" })
    .eq("user_id", user.id);

  if (answersDeleteError) {
    return NextResponse.json(
      { message: "Erro ao apagar estatísticas", error: answersDeleteError.message },
      { status: 500 }
    );
  }

  const { error: sessionsDeleteError, count: deletedSessionsCount } = await supabase
    .from("question_sessions")
    .delete({ count: "exact" })
    .eq("user_id", user.id);

  if (sessionsDeleteError) {
    return NextResponse.json(
      {
        message: "Erro ao apagar o histórico de sessões",
        error: sessionsDeleteError.message,
        deletedAnswers: deletedAnswersCount ?? 0,
      },
      { status: 500 }
    );
  }

  const { count: remainingAnswersCount, error: remainingAnswersError } = await supabase
    .from("user_answers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (remainingAnswersError) {
    return NextResponse.json(
      {
        message: "Erro ao confirmar o reset das estatísticas",
        error: remainingAnswersError.message,
        deletedAnswers: deletedAnswersCount ?? 0,
        deletedSessions: deletedSessionsCount ?? 0,
      },
      { status: 500 }
    );
  }

  const { count: remainingSessionsCount, error: remainingSessionsError } = await supabase
    .from("question_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (remainingSessionsError) {
    return NextResponse.json(
      {
        message: "Erro ao confirmar a limpeza das sessões",
        error: remainingSessionsError.message,
        deletedAnswers: deletedAnswersCount ?? 0,
        deletedSessions: deletedSessionsCount ?? 0,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      userId: user.id,
      beforeAnswers: beforeAnswersCount ?? 0,
      deletedAnswers: deletedAnswersCount ?? 0,
      remainingAnswers: remainingAnswersCount ?? 0,
      beforeSessions: beforeSessionsCount ?? 0,
      deletedSessions: deletedSessionsCount ?? 0,
      remainingSessions: remainingSessionsCount ?? 0,
    },
    { status: 200 }
  );
}
