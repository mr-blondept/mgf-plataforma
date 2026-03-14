import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const EXAM_PATH = "/Users/guilherme/Downloads/Prova MGF 1 – 2025 Época Normal.txt";
const TOPIC = "Exame MGF1 - 2025";

const ANSWER_KEY = new Map([
  [1, "b"],
  [2, "b"],
  [3, "b"],
  [4, "d"],
  [5, "c"],
  [6, "b"],
  [7, "b"],
  [8, "a"],
  [9, "a"],
  [10, "c"],
  [11, "a"],
  [12, "c"],
  [13, "b"],
  [14, "c"],
  [15, "d"],
  [16, "d"],
  [17, "d"],
  [18, "d"],
  [19, "d"],
  [20, "b"],
  [21, "b"],
  [22, "b"],
  [23, "b"],
  [24, "b"],
  [25, "c"],
  [26, "d"],
  [27, "b"],
  [28, "b"],
  [29, "a"],
  [30, "b"],
  [31, "d"],
  [32, "b"],
  [33, "c"],
  [34, "b"],
  [35, "d"],
  [36, "d"],
  [37, "a"],
  [38, "b"],
  [39, "c"],
  // 40 anulada
  [41, "b"],
  [42, "b"],
  [43, "b"],
  [44, "d"],
  [45, "a"],
  [46, "a"],
  [47, "a"],
  [48, "b"],
  [49, "d"],
  [50, "d"],
]);

const EXPLANATIONS = new Map([
  [1, "Resposta correta: b. As fronteiras definem e protegem subsistemas familiares, mantendo autonomia e funcionalidade."],
  [2, "Resposta correta: b. O perímetro abdominal em mulheres >= 88 cm é critério de síndrome metabólica."],
  [3, "Resposta correta: b. O ASSIST-Y é a versão adaptada para adolescentes e jovens."],
  [4, "Resposta correta: d. Glicemia em jejum >= 126 mg/dL confirma diagnóstico de DM."],
  [5, "Resposta correta: c. Perfeccionismo associa-se a rigidez/stress, não sendo fator protetor."],
  [6, "Resposta correta: b. Em menor com risco vital, deve-se recorrer ao Ministério Público para limitar responsabilidade parental e proceder ao tratamento."],
  [7, "Resposta correta: b. Padrão de repetição identificado: alcoolismo, HTA e obesidade."],
  [8, "Resposta correta: a. Prurido, lacrimejo e hiperemia sugerem conjuntivite alérgica."],
  [9, "Resposta correta: a. Considera-se a média da AMPA sem confirmação de HTA neste contexto."],
  [10, "Resposta correta: c. RMOP inclui base de dados, plano terapêutico, notas de seguimento e folhas de resumo."],
  [11, "Resposta correta: a. Tipologia conforme definição apresentada no enunciado."],
  [12, "Resposta correta: c. Esquema do PNV aos 4 meses inclui Hib + DTPa + VIP + MenB1 + Pn13 + VHB."],
  [13, "Resposta correta: b. Tipologia conforme definição apresentada no enunciado."],
  [14, "Resposta correta: c. A escala de Glasgow quantifica resposta motora a estímulos."],
  [15, "Resposta correta: d. Dolência é a experiência subjetiva do doente, distinta da doença objetiva."],
  [16, "Resposta correta: d. Doente capaz pode registar DAV após esclarecimento do processo no RENTEV."],
  [17, "Resposta correta: d. A psicofigura de Mitchell descreve relações entre elementos da família."],
  [18, "Resposta correta: d. Quadro compatível com fibrose quística (opção indicada)."],
  [19, "Resposta correta: d. Sem diagnóstico definido, codifica-se como sinal/sintoma do joelho."],
  [20, "Resposta correta: b. Comportamento aditivo parental é fator de risco relevante."],
  [21, "Resposta correta: b. A primeira abordagem é explorar impacto da audição na vida diária."],
  [22, "Resposta correta: b. A pergunta sobre fatores de alívio explora a dolência do doente."],
  [23, "Resposta correta: b. Pós-operatório com necessidade de recuperação aponta para Unidade de Convalescença."],
  [24, "Resposta correta: b. Mantém-se queixa do punho com limitação funcional em recuperação."],
  [25, "Resposta correta: c. RR = 10% / 5% = 2."],
  [26, "Resposta correta: d. A família é mais relevante na recuperação de doença crónica com tratamento adequado."],
  [27, "Resposta correta: b. Sensibilidade = capacidade de identificar corretamente quem tem a doença."],
  [28, "Resposta correta: b. Pomada com antibiótico não é indicação de primeira linha."],
  [29, "Resposta correta: a. A abordagem inicial deve explorar contexto familiar/laboral."],
  [30, "Resposta correta: b. Primeira consulta justifica avaliação familiar."],
  [31, "Resposta correta: d. Compressões a 100-120/min são recomendadas (opção indicada)."],
  [32, "Resposta correta: b. Conjunto de características descritas por José Mendes Nunes."],
  [33, "Resposta correta: c. Medida adequada para novos casos é incidência (opção indicada)."],
  [34, "Resposta correta: b. Doença de declaração obrigatória limita o dever de segredo."],
  [35, "Resposta correta: d. Etapa de intervenção breve: oferecer encaminhamento/apoio especializado."],
  [36, "Resposta correta: d. Primeiro passo é garantir condições de segurança."],
  [37, "Resposta correta: a. Em doença aguda autolimitada, avaliação familiar é menos relevante."],
  [38, "Resposta correta: b. Dor suprapúbica não é típica de colecistite aguda."],
  [39, "Resposta correta: c. Sexo não é causa direta de olho seco (opção indicada)."],
  [41, "Resposta correta: b. Facilitar diálogo entre adolescente e pais melhora adesão."],
  [42, "Resposta correta: b. Sutura com nylon 4/0 e reavaliação em 24h é adequada."],
  [43, "Resposta correta: b. Ecomapa é útil para avaliar redes de apoio familiares."],
  [44, "Resposta correta: d. Diligência implica prescrever com base em avaliação clínica adequada (opção indicada)."],
  [45, "Resposta correta: a. Doença e dolência são conceitos complementares."],
  [46, "Resposta correta: a. Quadro sugere patologia autolimitada; probiótico é opção indicada."],
  [47, "Resposta correta: a. Relação marital influencia fortemente a díada saúde-doença."],
  [48, "Resposta correta: b. A assistente social ajuda a articular apoios formais."],
  [49, "Resposta correta: d. Prevenção quinquenária aborda proteção da equipa e do sistema."],
  [50, "Resposta correta: d. Prioriza conforto e administração oral, evitando medidas invasivas."],
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
    const startMatch = line.match(/^(\d+)\)\s*(.*)$/);
    if (startMatch) {
      flush();
      current = {
        number: Number.parseInt(startMatch[1], 10),
        stem: `${startMatch[1]}) ${startMatch[2]}`.trim(),
      };
      continue;
    }

    if (!current) continue;
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
    if (item.number === 40) {
      skipped.push({ number: item.number, reason: "anulada" });
      continue;
    }

    const answer = ANSWER_KEY.get(item.number);
    const explanation = EXPLANATIONS.get(item.number);

    if (!answer || !explanation) {
      skipped.push({ number: item.number, reason: "sem explicação/gabarito" });
      continue;
    }

    const difficulty = getDifficulty(item.number);

    const { error } = await supabase
      .from("questions")
      .update({
        explanation,
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
