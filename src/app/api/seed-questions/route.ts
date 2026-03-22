import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type QuestionSeed = {
  stem: string;
  explanation: string;
  topic: string;
  difficulty: number;
  options: {
    text: string;
    is_correct: boolean;
  }[];
};

const QUESTIONS: QuestionSeed[] = [
  {
    stem:
      "1) Segundo a teoria de Minuchin sobre a dinâmica familiar, qual é o papel principal das fronteiras dentro de uma família?",
    explanation:
      "Na terapia estrutural de Minuchin, as fronteiras servem para definir e proteger os subsistemas familiares (pais, filhos, casal), permitindo proximidade mas também autonomia. Fronteiras claras ajudam a manter a funcionalidade e a evitar tanto fusão excessiva como isolamento.",
    topic: "Família / Minuchin",
    difficulty: 2,
    options: [
      {
        text:
          "a) Definir regras estritas que todos os membros devem seguir",
        is_correct: false,
      },
      {
        text:
          "b) Estabelecer limites claros entre os subsistemas familiares para garantir a autonomia e funcionalidade",
        is_correct: true,
      },
      {
        text:
          "c) Permitir a intervenção de terceiros para resolver conflitos internos",
        is_correct: false,
      },
      {
        text:
          "d) Promover a fusão emocional entre todos os membros para criar coesão",
        is_correct: false,
      },
    ],
  },
  {
    stem:
      "2) Sandra, 52 anos, hipertensa, foi a consulta programada mostrar análises: HDL 52mg/dL, triglicéridos 125 mg/dL. Em consulta de enfermagem, foi feita a seguinte avaliação: Perímetro abdominal 92 cm e PA 135/85 mmHg. Qual destes valores está associado ao diagnóstico de síndrome metabólica?",
    explanation:
      "Nos critérios de síndrome metabólica, em mulheres o perímetro abdominal ≥ 88 cm define obesidade abdominal. Os triglicéridos são critérios a partir de ≥ 150 mg/dL, o HDL é protetor quando elevado e a pressão arterial limiar para o critério é ≥ 130/85 mmHg. Entre os valores apresentados, o perímetro abdominal de 92 cm cumpre claramente um critério de síndrome metabólica.",
    topic: "Síndrome metabólica",
    difficulty: 2,
    options: [
      { text: "a) HDL 52mg/dL", is_correct: false },
      { text: "b) Perímetro abdominal 92cm", is_correct: true },
      { text: "c) Pressão arterial 135/85 mmHg", is_correct: false },
      { text: "d) Triglicéridos 125mg/dL", is_correct: false },
    ],
  },
  {
    stem:
      "3) O ASSIST e o ASSIST-Y são instrumentos utilizados para identificar o consumo de substâncias psicoativas. Qual é a principal diferença entre o ASSIST e o ASSIST-Y?",
    explanation:
      "O ASSIST foi desenvolvido sobretudo para adultos, enquanto o ASSIST-Y é uma versão adaptada para adolescentes e jovens, ajustando linguagem e contexto ao grupo etário mais jovem. A diferença central entre ambos é, portanto, a população alvo em termos de faixa etária.",
    topic: "Consumo de substâncias / ASSIST",
    difficulty: 2,
    options: [
      {
        text:
          "a) O ASSIST é mais detalhado e avalia múltiplas substâncias, enquanto o ASSIST-Y se concentra em substâncias específicas",
        is_correct: false,
      },
      {
        text:
          "b) O ASSIST é utilizado exclusivamente para adultos, enquanto o ASSIST-Y é adaptado para adolescentes e jovens",
        is_correct: true,
      },
      {
        text:
          "c) O ASSIST-Y é aplicado em jovens com idades entre 10 e 24 anos, enquanto o ASSIST é aplicado em qualquer faixa etária",
        is_correct: false,
      },
      {
        text:
          "d) O ASSIST-Y é utilizado para triagem de substâncias ilícitas, enquanto o ASSIST avalia apenas o consumo de álcool e tabaco",
        is_correct: false,
      },
    ],
  },
  {
    stem:
      "4) O Sr. Manuel, 55 anos, com obesidade e HTA, medicado com perindopril 5mg, vem a consulta de vigilância, sem queixas de relevo. Traz consigo análises laboratoriais que sugerem diagnóstico de Diabetes Mellitus. Qual dos seguintes resultados analíticos poderá corresponder aos valores apresentados pelo Sr. Manuel?",
    explanation:
      "Os critérios diagnósticos de Diabetes Mellitus incluem glicemia em jejum ≥ 126 mg/dL, glicemia ≥ 200 mg/dL às 2h na PTOG, HbA1c ≥ 6,5% ou glicemia ocasional ≥ 200 mg/dL com sintomas. Entre as opções, a glicemia em jejum de 126 mg/dL é compatível com o diagnóstico.",
    topic: "Diabetes Mellitus / Diagnóstico",
    difficulty: 2,
    options: [
      { text: "a) Hemoglobina glicada (HbA1c) de 6,2%", is_correct: false },
      {
        text:
          "b) Glicemia de 190 mg/dL às 2h na prova de tolerância oral à glicose (PTOG)",
        is_correct: false,
      },
      {
        text: "c) Glicemia de jejum de 120 mg/dL e HbA1c de 6%",
        is_correct: false,
      },
      { text: "d) Glicemia em jejum de 126 mg/dL.", is_correct: true },
    ],
  },
  {
    stem:
      '5) Segundo o livro "A Família em Medicina Geral e Família", todos são fatores familiares protetores com maior associação com a saúde, EXCETO:',
    explanation:
      "Coesão, organização e relações de suporte mútuas são geralmente descritas como fatores familiares protetores associados a melhor saúde. O perfeccionismo, pelo contrário, pode estar associado a rigidez, stresse e risco acrescido, não sendo considerado um fator protetor.",
    topic: "Família / Fatores protetores",
    difficulty: 2,
    options: [
      { text: "a) Coesão familiar", is_correct: false },
      { text: "b) Organização familiar", is_correct: false },
      { text: "c) Perfeccionismo", is_correct: true },
      { text: "d) Relações de suporte mútuas", is_correct: false },
    ],
  },
];

export async function GET() {
  try {
    const supabase = await createClient();

    // Evitar duplicar perguntas se já houver pelo menos uma
    const { data: existing, error: existingError } = await supabase
      .from("questions")
      .select("id")
      .limit(1);

    if (existingError) {
      console.error("Erro ao verificar perguntas existentes:", existingError);
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        {
          message:
            "Já existem perguntas na base de dados. Seed não foi reaplicado.",
        },
        { status: 200 }
      );
    }

    for (const q of QUESTIONS) {
      const { data: inserted, error: insertError } = await supabase
        .from("questions")
        .insert({
          stem: q.stem,
          explanation: q.explanation,
          topic: q.topic,
          difficulty: q.difficulty,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        console.error("Erro a inserir pergunta:", insertError);
        return NextResponse.json(
          {
            message: "Erro ao inserir pergunta.",
            error: insertError?.message,
          },
          { status: 500 }
        );
      }

      const questionId = inserted.id;

      const { error: optionsError } = await supabase
        .from("question_options")
        .insert(
          q.options.map((o) => ({
            question_id: questionId,
            text: o.text,
            is_correct: o.is_correct,
          }))
        );

      if (optionsError) {
        console.error("Erro a inserir opções:", optionsError);
        return NextResponse.json(
          {
            message: "Erro ao inserir opções.",
            error: optionsError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "Perguntas de exemplo inseridas com sucesso." },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("Erro inesperado no seed:", err);
    return NextResponse.json(
      { message: "Erro inesperado ao fazer seed.", error: message },
      { status: 500 }
    );
  }
}
