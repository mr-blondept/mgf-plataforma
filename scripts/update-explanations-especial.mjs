import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const EXAM_PATH = "/Users/guilherme/Downloads/Prova MGF 1 - 2025 Época Especial .txt";
const TOPIC = "MGF 1 - 2025 (época especial)";
const EXPLANATION_PREFIX = "Explicação (IA): ";

const EXPLANATIONS = new Map([
  [1, "Resposta correta: a. A adoção é informação estrutural relevante no genograma."],
  [2, "Resposta correta: c. RR=3 indica três vezes mais probabilidade de doença nos fumadores."],
  [3, "Resposta correta: d. Arco doloroso e teste de Jobe positivo sugerem tendinopatia do supraespinhoso."],
  [4, "Resposta correta: d. O rastreio populacional abrange 30-69 anos."],
  [5, "Resposta correta: d. A pergunta avalia sentimentos e medos associados ao problema."],
  [6, "Resposta correta: a. AMPA média 138/85 é compatível com hipertensão arterial (gabarito)."],
  [7, "Resposta correta: d. Dor pós-prandial, perda de peso e alívio com antiácidos sugerem úlcera gástrica."],
  [8, "Resposta correta: b. Vive apenas com a mãe: família monoparental."],
  [9, "Resposta correta: b. A frustração face à incompreensão é expressão da dolência."],
  [10, "Resposta correta: d. Procura excessiva de consulta aberta é critério forte para avaliação familiar."],
  [11, "Resposta correta: b. Verborreia, desinibição, sudorese e HTA sugerem consumo de cocaína."],
  [12, "Resposta correta: a. A diretiva antecipada de vontade deve ser consultada."],
  [13, "Resposta correta: b. Presença de acompanhante regista-se no O do SOAP."],
  [14, "Resposta correta: c. Vigilância baseada em incidência/prevalência da condição."],
  [15, "Resposta correta: b. Informação clínica trazida pelo utente regista-se no O."],
  [16, "Resposta correta: d. Recusa de exame não indicado é prevenção quaternária."],
  [17, "Resposta correta: b. O Círculo Familiar de Thrower explora sentimentos e emoções na família."],
  [18, "Resposta correta: b. Reação adversa a medicamento deve ser notificada como RAM."],
  [19, "Resposta correta: c. A lista por equipa promove continuidade de cuidados para o utente."],
  [20, "Resposta correta: b. Para excluir doença, privilegia-se alta sensibilidade."],
  [21, "Resposta correta: b. Em prevenção, é recomendada ecografia abdominal (AAA) em fumadores idosos."],
  [22, "Resposta correta: d. Idade é red flag em lombalgia, mesmo sem sinais neurológicos."],
  [23, "Resposta correta: a. Adaptabilidade muito elevada = família caótica."],
  [24, "Resposta correta: c. Cadeia: ligar 112, iniciar reanimação, desfibrilhar, estabilizar."],
  [25, "Resposta correta: b. O S regista as queixas do doente: " +
    "almareios e agonias."],
  [26, "Resposta correta: a. Especificidade = probabilidade de teste negativo em pessoas sem doença."],
  [27, "Resposta correta: c. Dor medial com manobra sugere lesão do menisco interno."],
  [28, "Resposta correta: a. Cuidados paliativos focam controlo sintomático e suporte biopsicossocial."],
  [29, "Resposta correta: b. Critério de Ottawa: dor no maléolo externo justifica radiografia."],
  [30, "Resposta correta: d. Genograma identifica padrões de repetição familiar."],
  [31, "Resposta correta: d. IRC com albuminúria aumenta risco cardiovascular para muito alto."],
  [32, "Resposta correta: a. Comunicação de má notícia deve antecipar necessidades e manter esperança realista."],
  [33, "Resposta correta: d. O princípio da vulnerabilidade justifica proteção do idoso."],
  [34, "Resposta correta: d. Perguntar por outros motivos faz-se nos primeiros minutos."],
  [35, "Resposta correta: a. Abordagem abrangente inclui promoção de saúde e prevenção."],
  [36, "Resposta correta: d. A escala de Zarit avalia sobrecarga do cuidador."],
  [37, "Resposta correta: c. A dimensão doença relaciona-se com cronologia/duração dos sintomas."],
  [38, "Resposta correta: a. Respeitar confidencialidade evidencia autonomia."],
  [39, "Resposta correta: a. Concreção = confirmar que a mensagem foi clara e compreendida."],
  [40, "Resposta correta: c. ABCDE: via aérea, ventilação, circulação, neurologia, exposição."],
  [41, "Resposta correta: b. Comunicação clara, direta e respeitosa é assertiva."],
  [42, "Resposta correta: b. Vibrações vocais aumentadas sugerem consolidação (vs derrame)."],
  [43, "Resposta correta: d. Encerramento confirma dúvidas e agenda do doente."],
  [44, "Resposta correta: c. Sobrecarga parental diária é típica de família monoparental."],
  [45, "Resposta correta: c. Sem reconhecimento do problema, a intervenção é fornecer informação pertinente."],
  [46, "Resposta correta: a. Mordedura na mão: limpeza + penso + antibioterapia."],
  [47, "Resposta correta: c. Nódulo violáceo doloroso pós-parto sugere hemorroida trombosada."],
  [48, "Resposta correta: c. Em idosa com IRC/IC, paracetamol é antitérmico de escolha."],
  [49, "Resposta correta: b. Manobra de Dix-Hallpike confirma VPPB."],
  [50, "Resposta correta: a. Dor rasgante com défice de pulsos sugere dissecção aórtica."],
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
