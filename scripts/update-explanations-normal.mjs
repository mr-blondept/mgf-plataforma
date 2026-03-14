import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const EXAM_PATH = "/Users/guilherme/Downloads/Prova MGF 1 – 2025 Época Normal.txt";
const TOPIC = "Exame MGF1 - 2025";
const EXPLANATION_PREFIX = "Explicação (IA): ";

const EXPLANATIONS = new Map([
  [1, "Resposta correta: b. Fronteiras claras definem subsistemas e favorecem autonomia e funcionalidade."],
  [2, "Resposta correta: b. O perímetro abdominal de 92 cm (mulher) cumpre critério de síndrome metabólica."],
  [3, "Resposta correta: b. O ASSIST-Y é a versão adaptada para adolescentes e jovens."],
  [4, "Resposta correta: d. Glicemia em jejum >= 126 mg/dL confirma diagnóstico de DM."],
  [5, "Resposta correta: c. Perfeccionismo associa-se a rigidez/stress e não é fator protetor."],
  [6, "Resposta correta: b. Em menor com risco vital, recorre-se ao MP para limitar responsabilidade parental e tratar."],
  [7, "Resposta correta: b. De acordo com o genograma apresentado, há repetição de alcoolismo, HTA e obesidade."],
  [8, "Resposta correta: a. Prurido, lacrimejo e hiperemia conjuntival sugerem conjuntivite alérgica."],
  [9, "Resposta correta: a. Segundo o gabarito, a média da AMPA é considerada normal neste contexto."],
  [10, "Resposta correta: c. RMOP inclui base de dados, plano terapêutico, notas de seguimento e folhas de resumo."],
  [11, "Resposta correta: c. Família reconstruída = nova união com/sem descendentes de relações anteriores."],
  [12, "Resposta correta: c. PNV aos 4 meses inclui Hib + DTPa + VIP + MenB1 + Pn13 + VHB."],
  [13, "Resposta correta: b. Conforme gabarito fornecido."],
  [14, "Resposta correta: c. Conforme gabarito fornecido."],
  [15, "Resposta correta: d. Doença é objetiva; dolência é a experiência subjetiva do doente."],
  [16, "Resposta correta: d. Doente capaz pode registar DAV após esclarecimento do processo no RENTEV."],
  [17, "Resposta correta: d. A psicofigura de Mitchell descreve relações entre elementos da família."],
  [18, "Resposta correta: d. Conforme gabarito fornecido."],
  [19, "Resposta correta: d. Sem diagnóstico definido, codifica-se como sinal/sintoma do joelho na ICPC-2."],
  [20, "Resposta correta: b. Consumo de álcool no pai é fator de risco para perturbação disruptiva."],
  [21, "Resposta correta: b. A primeira abordagem é explorar impacto da audição na vida diária."],
  [22, "Resposta correta: b. A pergunta sobre fatores de alívio explora a dolência do doente."],
  [23, "Resposta correta: b. Necessidade de recuperação pós-cirúrgica aponta para Unidade de Convalescença."],
  [24, "Resposta correta: b. Mantém-se queixa do punho e limitação funcional em recuperação."],
  [25, "Resposta correta: c. RR = 10% / 5% = 2."],
  [26, "Resposta correta: d. A família é mais relevante na recuperação de doença crónica com tratamento adequado."],
  [27, "Resposta correta: b. Sensibilidade = capacidade do teste identificar quem tem a doença."],
  [28, "Resposta correta: b. Pomada com antibiótico não é medida de primeira linha."],
  [29, "Resposta correta: a. A abordagem inicial deve explorar contexto familiar/laboral."],
  [30, "Resposta correta: b. Primeira consulta justifica avaliação familiar."],
  [31, "Resposta correta: d. Conforme gabarito fornecido."],
  [32, "Resposta correta: b. Conjunto de características descritas por José Mendes Nunes."],
  [33, "Resposta correta: c. Conforme gabarito fornecido."],
  [34, "Resposta correta: b. Doenças de declaração obrigatória limitam o dever de segredo médico."],
  [35, "Resposta correta: d. Na intervenção breve, se não há motivação, pode-se oferecer encaminhamento."],
  [36, "Resposta correta: d. Primeiro passo é garantir condições de segurança."],
  [37, "Resposta correta: a. Conforme gabarito fornecido."],
  [38, "Resposta correta: b. Dor suprapúbica não é típica de colecistite aguda."],
  [39, "Resposta correta: c. Conforme gabarito fornecido."],
  [41, "Resposta correta: b. Facilitar diálogo entre adolescente e pais melhora adesão."],
  [42, "Resposta correta: b. Sutura com nylon 4/0 e reavaliação em 24h é adequada."],
  [43, "Resposta correta: b. Conforme gabarito fornecido."],
  [44, "Resposta correta: d. Conforme gabarito fornecido."],
  [45, "Resposta correta: a. Doença e dolência são conceitos complementares."],
  [46, "Resposta correta: a. Quadro sugere patologia benigna/autolimitada; probiótico é opção indicada."],
  [47, "Resposta correta: a. Relação marital tem grande influência na díada saúde-doença."],
  [48, "Resposta correta: b. A assistente social ajuda a articular apoios formais."],
  [49, "Resposta correta: d. Prevenção quinquenária foca proteção da equipa e do sistema."],
  [50, "Resposta correta: d. Em doente frágil, prioriza conforto e administração oral sem medidas invasivas."],
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
    }
  }

  flush();
  return blocks;
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
    if (item.number === 40) continue;
    const explanation = EXPLANATIONS.get(item.number);
    if (!explanation) {
      skipped.push({ number: item.number, reason: "sem explicação" });
      continue;
    }

    const { error } = await supabase
      .from("questions")
      .update({
        explanation: `${EXPLANATION_PREFIX}${explanation}`,
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
