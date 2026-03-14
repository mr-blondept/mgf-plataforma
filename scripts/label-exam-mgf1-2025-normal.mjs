import path from "node:path";
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const TOPIC = "Exame MGF1 - 2025";
const EXPLANATION_PREFIX = "Explicação (IA): ";

function readEnvValue(key) {
  const envLocal = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envLocal)) return null;
  const content = fs.readFileSync(envLocal, "utf8");
  const line = content
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith(`${key}=`));
  if (!line) return null;
  return line.split("=").slice(1).join("=").trim();
}

async function main() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? readEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    readEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    throw new Error("Supabase URL/ANON key não encontrados.");
  }

  const supabase = createClient(url, anonKey);

  const { data, error } = await supabase
    .from("questions")
    .select("id, explanation")
    .eq("topic", TOPIC);

  if (error) {
    throw new Error(`Erro ao carregar perguntas: ${error.message}`);
  }

  const updated = [];

  for (const row of data ?? []) {
    if (!row.explanation) continue;
    if (row.explanation.startsWith(EXPLANATION_PREFIX)) {
      continue;
    }

    const { error: updateError } = await supabase
      .from("questions")
      .update({ explanation: `${EXPLANATION_PREFIX}${row.explanation}` })
      .eq("id", row.id);

    if (updateError) {
      throw new Error(`Erro ao atualizar pergunta ${row.id}: ${updateError.message}`);
    }

    updated.push(row.id);
  }

  console.log(JSON.stringify({ updated_count: updated.length }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
