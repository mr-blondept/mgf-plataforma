import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const EXAM_PATH = "/Users/guilherme/Downloads/Prova MGF 1 - 2025 Época Especial .txt";
const TOPIC = "MGF 1 - 2025 (época especial)";
const DEFAULT_DIFFICULTY = 2;

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
        optionLines: [],
      };
      continue;
    }

    if (!current) continue;
    current.optionLines.push(line);
  }

  flush();

  return blocks.map((block) => {
    const options = [];
    let currentOption = null;

    const optionRegex = /^([a-d])\)\s*(.*)$/i;

    for (const line of block.optionLines) {
      const match = line.match(optionRegex);
      if (match) {
        if (currentOption) options.push(currentOption);
        currentOption = { key: match[1].toLowerCase(), text: match[2].trim() };
      } else if (currentOption) {
        currentOption.text = `${currentOption.text} ${line}`.trim();
      }
    }

    if (currentOption) options.push(currentOption);

    return {
      number: block.number,
      stem: block.stem,
      options,
    };
  });
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

  const existing = await supabase
    .from("questions")
    .select("id, stem")
    .eq("topic", TOPIC);

  if (existing.error) {
    throw new Error(`Erro ao carregar perguntas existentes: ${existing.error.message}`);
  }

  const existingStems = new Set(existing.data?.map((q) => q.stem) ?? []);

  const skipped = [];
  const inserted = [];

  for (const item of parsed) {
    if (existingStems.has(item.stem)) {
      skipped.push({ number: item.number, reason: "já existe" });
      continue;
    }

    const correct = ANSWER_KEY.get(item.number);
    if (!correct) {
      skipped.push({ number: item.number, reason: "sem gabarito" });
      continue;
    }

    const { data: questionRow, error: insertError } = await supabase
      .from("questions")
      .insert({
        stem: item.stem,
        explanation: null,
        topic: TOPIC,
        difficulty: DEFAULT_DIFFICULTY,
      })
      .select("id")
      .single();

    if (insertError || !questionRow) {
      throw new Error(`Erro a inserir pergunta ${item.number}: ${insertError?.message}`);
    }

    const questionId = questionRow.id;
    const optionsPayload = item.options.map((opt) => ({
      question_id: questionId,
      text: `${opt.key}) ${opt.text}`.trim(),
      is_correct: opt.key === correct,
    }));

    const { error: optionsError } = await supabase
      .from("question_options")
      .insert(optionsPayload);

    if (optionsError) {
      throw new Error(
        `Erro a inserir opções da pergunta ${item.number}: ${optionsError.message}`
      );
    }

    inserted.push(item.number);
  }

  console.log(
    JSON.stringify(
      {
        inserted_count: inserted.length,
        inserted_numbers: inserted,
        skipped,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
