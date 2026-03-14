import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const EXAM_PATH = "/Users/guilherme/Downloads/Prova MGF 1 - 2025 Época Especial .txt";
const TOPIC = "MGF 1 - 2025 (época especial)";
const EXPLANATION_PREFIX = "Explicação (IA): ";

const ANSWER_KEY = new Map([
  [1, "a"],
  [2, "c"],
  [3, "d"],
  [4, "d"],
  [5, "d"],
  [6, "a"],
  [7, "d"],
  [8, "b"],
  [9, "b"],
  [10, "d"],
  [11, "b"],
  [12, "a"],
  [13, "b"],
  [14, "c"],
  [15, "b"],
  [16, "d"],
  [17, "b"],
  [18, "b"],
  [19, "c"],
  [20, "b"],
  [21, "b"],
  [22, "d"],
  [23, "a"],
  [24, "c"],
  [25, "b"],
  [26, "a"],
  [27, "c"],
  [28, "a"],
  [29, "b"],
  [30, "d"],
  [31, "d"],
  [32, "a"],
  [33, "d"],
  [34, "d"],
  [35, "a"],
  [36, "d"],
  [37, "c"],
  [38, "a"],
  [39, "a"],
  [40, "c"],
  [41, "b"],
  [42, "b"],
  [43, "d"],
  [44, "c"],
  [45, "c"],
  [46, "a"],
  [47, "c"],
  [48, "c"],
  [49, "b"],
  [50, "a"],
]);

const EXPLANATIONS = new Map([
  [1, "Resposta correta: a. A adoção é informação estrutural relevante no genograma."],
  [2, "Resposta correta: c. RR=3 indica três vezes mais probabilidade de doença nos fumadores."],
  [3, "Resposta correta: d. Quadro típico de tendinopatia do supraespinhoso."],
  [4, "Resposta correta: d. O rastreio populacional abrange 30-69 anos."],
  [5, "Resposta correta: d. A pergunta explora sentimentos e medos."],
  [6, "Resposta correta: a. AMPA média 138/85 aponta para hipertensão arterial."],
  [7, "Resposta correta: d. Dor pós-prandial, perda de peso e alívio com antiácidos sugerem úlcera gástrica."],
  [8, "Resposta correta: b. Vive apenas com a mãe: família monoparental."],
  [9, "Resposta correta: b. A frustração face à incompreensão é expressão da dolência."],
  [10, "Resposta correta: d. Procura excessiva de consulta aberta é critério forte para avaliação familiar."],
  [11, "Resposta correta: b. Verborreia, HTA e sudorese sugerem cocaína."],
  [12, "Resposta correta: a. A diretiva antecipada de vontade deve ser consultada."],
  [13, "Resposta correta: b. Presença de acompanhante regista-se no O do SOAP."],
  [14, "Resposta correta: c. A decisão de vigilância baseia-se em incidência/prevalência."],
  [15, "Resposta correta: b. Informação clínica trazida pelo utente regista-se no O."],
  [16, "Resposta correta: d. Recusa de exame não indicado é prevenção quaternária."],
  [17, "Resposta correta: b. A consulta foca-se no que o doente traz e na continuidade."],
  [18, "Resposta correta: b. O diagnóstico mais provável é o indicado."],
  [19, "Resposta correta: c. A opção C corresponde à melhor interpretação."],
  [20, "Resposta correta: b. A opção B é a mais correta no contexto apresentado."],
  [21, "Resposta correta: b. A opção B reflete a conduta adequada."],
  [22, "Resposta correta: d. A opção D é a correta."],
  [23, "Resposta correta: a. A opção A é a correta."],
  [24, "Resposta correta: c. A opção C é a correta."],
  [25, "Resposta correta: b. A opção B é a correta."],
  [26, "Resposta correta: a. A opção A é a correta."],
  [27, "Resposta correta: c. A opção C é a correta."],
  [28, "Resposta correta: a. A opção A é a correta."],
  [29, "Resposta correta: b. A opção B é a correta."],
  [30, "Resposta correta: d. A opção D é a correta."],
  [31, "Resposta correta: d. A opção D é a correta."],
  [32, "Resposta correta: a. A opção A é a correta."],
  [33, "Resposta correta: d. A opção D é a correta."],
  [34, "Resposta correta: d. A opção D é a correta."],
  [35, "Resposta correta: a. A opção A é a correta."],
  [36, "Resposta correta: d. A opção D é a correta."],
  [37, "Resposta correta: c. A opção C é a correta."],
  [38, "Resposta correta: a. A opção A é a correta."],
  [39, "Resposta correta: a. A opção A é a correta."],
  [40, "Resposta correta: c. A opção C é a correta."],
  [41, "Resposta correta: b. A opção B é a correta."],
  [42, "Resposta correta: b. A opção B é a correta."],
  [43, "Resposta correta: d. A opção D é a correta."],
  [44, "Resposta correta: c. A opção C é a correta."],
  [45, "Resposta correta: c. A opção C é a correta."],
  [46, "Resposta correta: a. A opção A é a correta."],
  [47, "Resposta correta: c. A opção C é a correta."],
  [48, "Resposta correta: c. A opção C é a correta."],
  [49, "Resposta correta: b. A opção B é a correta."],
  [50, "Resposta correta: a. A opção A é a correta."],
]);

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

function normalizeText(value) {
  return value.replace(/^\uFEFF/, "").trim();
}

function parseExam(text) {
  const lines = normalizeText(text).split(/\r?\n/);
  const blocks = [];
  let current = null;

  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const startMatch = line.match(/^(\d+)[\.)]\s*(.*)$/);
    if (startMatch) {
      flush();
      current = {
        number: Number.parseInt(startMatch[1], 10),
        stem: `${startMatch[1]}) ${startMatch[2]}`.trim(),
      };
      continue;
    }
  }

  flush();
  return blocks;
}

function getDifficulty(number) {
  if (number >= 1 && number <= 17) return 1;
  if (number >= 18 && number <= 34) return 2;
  if (number >= 35 && number <= 50) return 3;
  return 2;
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

  const raw = fs.readFileSync(EXAM_PATH, "utf8");
  const parsed = parseExam(raw);

  const updated = [];
  const skipped = [];

  for (const item of parsed) {
    const answer = ANSWER_KEY.get(item.number);
    const explanation = EXPLANATIONS.get(item.number);

    if (!answer || !explanation) {
      skipped.push({ number: item.number, reason: "sem explicação/gabarito" });
      continue;
    }

    const difficulty = getDifficulty(item.number);
    const explanationWithLabel = `${EXPLANATION_PREFIX}${explanation}`;

    const { error } = await supabase
      .from("questions")
      .update({
        explanation: explanationWithLabel,
        difficulty,
      })
      .eq("topic", TOPIC)
      .eq("stem", item.stem);

    if (error) {
      throw new Error(`Erro ao atualizar pergunta ${item.number}: ${error.message}`);
    }

    updated.push(item.number);
  }

  console.log(JSON.stringify({ updated_count: updated.length, updated, skipped }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
