-- Perguntas de exemplo para a plataforma MGF

-- PERGUNTA 1
with q1 as (
  insert into public.questions (stem, explanation, topic, difficulty)
  values (
    '1) Segundo a teoria de Minuchin sobre a dinâmica familiar, qual é o papel principal das fronteiras dentro de uma família?',
    'Na terapia estrutural de Minuchin, as fronteiras servem para definir e proteger os subsistemas familiares (pais, filhos, casal), permitindo proximidade mas também autonomia. Fronteiras claras ajudam a manter a funcionalidade e a evitar tanto fusão excessiva como isolamento.',
    'Família / Minuchin',
    2
  )
  returning id
)
insert into public.question_options (question_id, text, is_correct)
select id, 'a) Definir regras estritas que todos os membros devem seguir', false from q1
union all
select id, 'b) Estabelecer limites claros entre os subsistemas familiares para garantir a autonomia e funcionalidade', true from q1
union all
select id, 'c) Permitir a intervenção de terceiros para resolver conflitos internos', false from q1
union all
select id, 'd) Promover a fusão emocional entre todos os membros para criar coesão', false from q1;


-- PERGUNTA 2
with q2 as (
  insert into public.questions (stem, explanation, topic, difficulty)
  values (
    '2) Sandra, 52 anos, hipertensa, foi a consulta programada mostrar análises: HDL 52mg/dL, triglicéridos 125 mg/dL. Em consulta de enfermagem, foi feita a seguinte avaliação: Perímetro abdominal 92 cm e PA 135/85 mmHg. Qual destes valores está associado ao diagnóstico de síndrome metabólica?',
    'Nos critérios de síndrome metabólica, em mulheres o perímetro abdominal ≥ 88 cm define obesidade abdominal. Os triglicéridos são critérios a partir de ≥ 150 mg/dL, o HDL é protetor quando elevado e a pressão arterial limiar para o critério é ≥ 130/85 mmHg. Entre os valores apresentados, o perímetro abdominal de 92 cm cumpre claramente um critério de síndrome metabólica.',
    'Síndrome metabólica',
    2
  )
  returning id
)
insert into public.question_options (question_id, text, is_correct)
select id, 'a) HDL 52mg/dL', false from q2
union all
select id, 'b) Perímetro abdominal 92cm', true from q2
union all
select id, 'c) Pressão arterial 135/85 mmHg', false from q2
union all
select id, 'd) Triglicéridos 125mg/dL', false from q2;


-- PERGUNTA 3
with q3 as (
  insert into public.questions (stem, explanation, topic, difficulty)
  values (
    '3) O ASSIST e o ASSIST-Y são instrumentos utilizados para identificar o consumo de substâncias psicoativas. Qual é a principal diferença entre o ASSIST e o ASSIST-Y?',
    'O ASSIST foi desenvolvido sobretudo para adultos, enquanto o ASSIST-Y é uma versão adaptada para adolescentes e jovens, ajustando linguagem e contexto ao grupo etário mais jovem. A diferença central entre ambos é, portanto, a população alvo em termos de faixa etária.',
    'Consumo de substâncias / ASSIST',
    2
  )
  returning id
)
insert into public.question_options (question_id, text, is_correct)
select id, 'a) O ASSIST é mais detalhado e avalia múltiplas substâncias, enquanto o ASSIST-Y se concentra em substâncias específicas', false from q3
union all
select id, 'b) O ASSIST é utilizado exclusivamente para adultos, enquanto o ASSIST-Y é adaptado para adolescentes e jovens', true from q3
union all
select id, 'c) O ASSIST-Y é aplicado em jovens com idades entre 10 e 24 anos, enquanto o ASSIST é aplicado em qualquer faixa etária', false from q3
union all
select id, 'd) O ASSIST-Y é utilizado para triagem de substâncias ilícitas, enquanto o ASSIST avalia apenas o consumo de álcool e tabaco', false from q3;


-- PERGUNTA 4
with q4 as (
  insert into public.questions (stem, explanation, topic, difficulty)
  values (
    '4) O Sr. Manuel, 55 anos, com obesidade e HTA, medicado com perindopril 5mg, vem a consulta de vigilância, sem queixas de relevo. Traz consigo análises laboratoriais que sugerem diagnóstico de Diabetes Mellitus. Qual dos seguintes resultados analíticos poderá corresponder aos valores apresentados pelo Sr. Manuel?',
    'Os critérios diagnósticos de Diabetes Mellitus incluem glicemia em jejum ≥ 126 mg/dL, glicemia ≥ 200 mg/dL às 2h na PTOG, HbA1c ≥ 6,5% ou glicemia ocasional ≥ 200 mg/dL com sintomas. Entre as opções, a glicemia em jejum de 126 mg/dL é compatível com o diagnóstico.',
    'Diabetes Mellitus / Diagnóstico',
    2
  )
  returning id
)
insert into public.question_options (question_id, text, is_correct)
select id, 'a) Hemoglobina glicada (HbA1c) de 6,2%', false from q4
union all
select id, 'b) Glicemia de 190 mg/dL às 2h na prova de tolerância oral à glicose (PTOG)', false from q4
union all
select id, 'c) Glicemia de jejum de 120 mg/dL e HbA1c de 6%', false from q4
union all
select id, 'd) Glicemia em jejum de 126 mg/dL.', true from q4;


-- PERGUNTA 5
with q5 as (
  insert into public.questions (stem, explanation, topic, difficulty)
  values (
    '5) Segundo o livro "A Família em Medicina Geral e Família", todos são fatores familiares protetores com maior associação com a saúde, EXCETO:',
    'Coesão, organização e relações de suporte mútuas são geralmente descritas como fatores familiares protetores associados a melhor saúde. O perfeccionismo, pelo contrário, pode estar associado a rigidez, stresse e risco acrescido, não sendo considerado um fator protetor.',
    'Família / Fatores protetores',
    2
  )
  returning id
)
insert into public.question_options (question_id, text, is_correct)
select id, 'a) Coesão familiar', false from q5
union all
select id, 'b) Organização familiar', false from q5
union all
select id, 'c) Perfeccionismo', true from q5
union all
select id, 'd) Relações de suporte mútuas', false from q5;

