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

  const { count: beforeCount, error: beforeError } = await supabase
    .from("user_answers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (beforeError) {
    return NextResponse.json(
      {
        message: "Erro ao contar respostas antes do reset",
        error: beforeError.message,
      },
      { status: 500 }
    );
  }

  const { error, count } = await supabase
    .from("user_answers")
    .delete({ count: "exact" })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { message: "Erro ao apagar estatísticas", error: error.message },
      { status: 500 }
    );
  }

  const { count: remaining, error: remainingError } = await supabase
    .from("user_answers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (remainingError) {
    return NextResponse.json(
      {
        message: "Erro ao confirmar o reset das estatísticas",
        error: remainingError.message,
        deleted: count ?? 0,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      userId: user.id,
      before: beforeCount ?? 0,
      deleted: count ?? 0,
      remaining: remaining ?? 0,
    },
    { status: 200 }
  );
}
