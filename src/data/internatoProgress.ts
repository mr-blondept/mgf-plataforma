export type ProgressTone = "blue" | "green" | "purple";

export type ProgressRequirement = "obrigatorio" | "recomendado" | "opcional";

export type ProgressCategoryTag =
  | "estagio"
  | "avaliacao"
  | "documento"
  | "prova"
  | "formacao"
  | "clinico"
  | "legal";

export type ProgressSectionIcon =
  | "check"
  | "bolt"
  | "book"
  | "file"
  | "award"
  | "heart"
  | "spark"
  | "flow"
  | "brain";

export type ProgressItem = {
  id: string;
  text: string;
  note?: string;
  requirement: ProgressRequirement;
  tags?: ProgressCategoryTag[];
  deadline?: string;
};

export type ProgressSection = {
  id: string;
  title: string;
  icon: ProgressSectionIcon;
  items: ProgressItem[];
};

export type ProgressStage = {
  id: "mgf1" | "mgf2" | "mgf3";
  tone: ProgressTone;
  label: string;
  summary: string;
  meta: string;
  title: string;
  subtitle: string;
  duration: string;
  year: string;
  objective: string;
  provas: string;
  legal: string;
  sections: ProgressSection[];
};

export const INTERNATO_DRE_LINK =
  "https://dre.pt/web/guest/pesquisa/-/search/122195237/details/normal?l=1";

export const INTERNATO_OLD_DRE_LINK =
  "https://dre.pt/web/guest/pesquisa/-/search/66558697/details/normal?l=1";

export const INTERNATO_OM_LINK =
  "https://ordemdosmedicos.pt/colegio-da-especialidade-de-medicina-geral-e-familiar/";

export const INTERNATO_STAGES: ProgressStage[] = [
  {
    id: "mgf1",
    tone: "blue",
    label: "MGF 1",
    summary: "Iniciacao a pratica clinica",
    meta: "11 meses · 1.º ano",
    title: "MGF 1 - Iniciacao a pratica clinica em CSP",
    subtitle: "1.º ano de formacao especializada",
    duration: "11 meses",
    year: "1.º ano",
    objective:
      "Iniciacao a pratica clinica de Medicina Geral e Familiar em Cuidados de Saude Primarios, com supervisao direta do orientador em todas as atividades clinicas e formativas.",
    provas:
      "Prova escrita nacional de avaliacao de conhecimentos (max. 120 min, 100 questoes, 2 epocas anuais).",
    legal:
      "Portaria n.º 125/2019, Anexo B, pontos 4.3, 7 e 8 | Colegio de MGF - Grelhas de Avaliacao 2020",
    sections: [
      {
        id: "mgf1-pratica",
        title: "Pratica clinica em USF / UCSP",
        icon: "check",
        items: [
          {
            id: "mgf1-c1",
            text: "Realizar consultas de MGF sob supervisao direta do orientador",
            note:
              "Observar amplo leque de motivos de consulta; foco na qualidade da anamnese e no atendimento ao utente.",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf1-c2",
            text: "Realizar avaliacao inicial completa: anamnese, diagnostico diferencial, plano diagnostico e terapeutico",
            note:
              "Todos os procedimentos sujeitos a aprovacao e supervisao direta do orientador; registar em sistema clinico.",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf1-c3",
            text: "Elaborar registos clinicos e referenciacoes",
            note:
              "Registo sistematico no sistema de informacao da unidade; referenciacoes conforme normas ACSS.",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf1-c4",
            text: "Interagir com familias e aplicar abordagem centrada na pessoa e na familia",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf1-c5",
            text: "Discutir em profundidade os casos com o orientador",
            note: "Sessoes de feedback estruturado; base do percurso formativo do 1.º ano.",
            requirement: "obrigatorio",
            tags: ["formacao"],
          },
          {
            id: "mgf1-c6",
            text: "Participar em consultas de vigilancia de doencas cronicas",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf1-c7",
            text: "Participar em consultas de saude do adulto e do idoso",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf1-c8",
            text: "Participar em visitas domiciliarias acompanhado do orientador",
            requirement: "recomendado",
            tags: ["clinico"],
          },
        ],
      },
      {
        id: "mgf1-urgencia",
        title: "FCO - Urgencia e Emergencia: Cirurgia e Ortotraumatologia (192h)",
        icon: "bolt",
        items: [
          {
            id: "mgf1-u1",
            text: "Concluir estagio em cirurgia geral - 96 horas",
            note:
              "Realizado no 2.º semestre do MGF1 em instituicao hospitalar com idoneidade.",
            requirement: "obrigatorio",
            tags: ["estagio"],
          },
          {
            id: "mgf1-u2",
            text: "Concluir estagio em ortotraumatologia - 96 horas",
            note: "Totaliza 192h conjuntas com cirurgia.",
            requirement: "obrigatorio",
            tags: ["estagio"],
          },
          {
            id: "mgf1-u3",
            text: "Elaborar relatorio das formacoes de urgencia/emergencia do MGF1",
            requirement: "obrigatorio",
            tags: ["documento"],
          },
        ],
      },
      {
        id: "mgf1-formacao",
        title: "Aprendizagem formal (160 horas)",
        icon: "book",
        items: [
          {
            id: "mgf1-f1",
            text: "Participar em cursos curriculares obrigatorios da Coordenacao de Internato",
            note: "Total de 160h de aprendizagem formal ao longo do MGF1.",
            requirement: "obrigatorio",
            tags: ["formacao"],
          },
          {
            id: "mgf1-f2",
            text: "Realizar formacoes curtas para competencias especificas",
            note: "Necessitam de parecer previo do orientador.",
            requirement: "recomendado",
            tags: ["formacao"],
          },
          {
            id: "mgf1-f3",
            text: "Participar nas reunioes da Equipa Integrada de Orientadores e Internos",
            requirement: "obrigatorio",
            tags: ["formacao"],
          },
          {
            id: "mgf1-f4",
            text: "Participar em cursos curriculares opcionais, se aplicavel",
            requirement: "opcional",
            tags: ["formacao"],
          },
        ],
      },
      {
        id: "mgf1-documentos",
        title: "Documentacao e planeamento",
        icon: "file",
        items: [
          {
            id: "mgf1-d1",
            text: "Elaborar Plano Pessoal de Formacao do 1.º ano com o orientador",
            note: "Enviado a Coordenacao em formato eletronico; sujeito a aprovacao.",
            requirement: "obrigatorio",
            tags: ["documento", "legal"],
            deadline: "30 set - 1.º ano",
          },
          {
            id: "mgf1-d2",
            text: "Registar assiduidade na folha propria ou sistema digital",
            requirement: "obrigatorio",
            tags: ["documento", "legal"],
          },
          {
            id: "mgf1-d3",
            text: "Elaborar e submeter relatorio / base de dados de MGF1",
            note: "Submetida via plataforma e-learning; plataforma abre 90 dias antes da prova.",
            requirement: "obrigatorio",
            tags: ["documento"],
          },
        ],
      },
      {
        id: "mgf1-avaliacao",
        title: "Avaliacao continua e prova de conhecimentos",
        icon: "award",
        items: [
          {
            id: "mgf1-a1",
            text: "Obter avaliacao de desempenho >= 10 valores na componente individual",
            note:
              "Avaliacao pelo orientador com base na grelha de desempenho do Colegio de MGF.",
            requirement: "obrigatorio",
            tags: ["avaliacao"],
          },
          {
            id: "mgf1-a2",
            text: "Prova escrita nacional de conhecimentos MGF1 >= 10 valores",
            note: "Max. 120 min, 100 questoes, ambito nacional, 2 epocas anuais.",
            requirement: "obrigatorio",
            tags: ["avaliacao", "prova"],
          },
          {
            id: "mgf1-a3",
            text: "Aprovacao em MGF1 com minimo de 10 valores em cada componente",
            note: "Condicao necessaria para progressao para MGF2.",
            requirement: "obrigatorio",
            tags: ["avaliacao", "legal"],
          },
        ],
      },
    ],
  },
  {
    id: "mgf2",
    tone: "green",
    label: "MGF 2",
    summary: "Desenvolvimento clinico",
    meta: "22 meses · 2.º e 3.º anos",
    title: "MGF 2 - Desenvolvimento e aprofundamento clinico em CSP",
    subtitle: "2.º e 3.º anos de formacao especializada",
    duration: "22 meses",
    year: "2.º e 3.º anos",
    objective:
      "Desenvolvimento e aprofundamento da pratica clinica em CSP com progressiva autonomia e integracao das formacoes complementares obrigatorias.",
    provas:
      "Prova oral regional (MGF2.1, fim do 2.º ano) e prova escrita nacional (MGF2.2, fim do 3.º ano).",
    legal:
      "Portaria n.º 125/2019, Anexo B, pontos 4.4, 4.5, 8 e 9 | Colegio de MGF - Bases de Dados MGF2",
    sections: [
      {
        id: "mgf2-pratica",
        title: "Pratica clinica em USF/UCSP - autonomia progressiva",
        icon: "check",
        items: [
          {
            id: "mgf2-c1",
            text: "Gerir a lista de doentes do orientador como apoio principal",
            note:
              "Pode iniciar estudos diagnosticos comuns e intervencoes terapeuticas antes do orientador consultar os doentes, se previamente autorizado.",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf2-c2",
            text: "Aprimorar proficiencia clinica com equilibrio entre qualidade e eficiencia",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf2-c3",
            text: "Discutir procedimentos invasivos e mudancas de plano com o orientador antes de os realizar",
            requirement: "obrigatorio",
            tags: ["clinico", "legal"],
          },
          {
            id: "mgf2-c4",
            text: "Manter continuidade dos registos medicos da lista do orientador",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf2-c5",
            text: "Realizar 1 mes em unidade de CSP com populacao de caracteristicas diferentes",
            note: "Unidade com idoneidade formativa reconhecida pela Ordem dos Medicos.",
            requirement: "obrigatorio",
            tags: ["estagio"],
          },
          {
            id: "mgf2-c6",
            text: "Apresentar temas selecionados a estagiarios e estudantes de medicina",
            requirement: "recomendado",
            tags: ["formacao"],
          },
        ],
      },
      {
        id: "mgf2-fco",
        title: "Formacoes complementares obrigatorias",
        icon: "heart",
        items: [
          {
            id: "mgf2-sij1",
            text: "Concluir estagio de Saude Infantil e Juvenil - 2 meses",
            requirement: "obrigatorio",
            tags: ["estagio"],
          },
          {
            id: "mgf2-sij2",
            text: "Elaborar relatorio de atividades de Saude Infantil e Juvenil",
            requirement: "obrigatorio",
            tags: ["documento"],
          },
          {
            id: "mgf2-sm1",
            text: "Concluir estagio de Saude da Mulher - 2 meses",
            requirement: "obrigatorio",
            tags: ["estagio"],
          },
          {
            id: "mgf2-sm2",
            text: "Elaborar relatorio de atividades de Saude da Mulher",
            requirement: "obrigatorio",
            tags: ["documento"],
          },
          {
            id: "mgf2-sme1",
            text: "Concluir estagio de Saude Mental - 2 meses",
            requirement: "obrigatorio",
            tags: ["estagio"],
          },
          {
            id: "mgf2-sme2",
            text: "Elaborar relatorio de atividades de Saude Mental",
            requirement: "obrigatorio",
            tags: ["documento"],
          },
        ],
      },
      {
        id: "mgf2-urgencia",
        title: "Urgencia e emergencia hospitalar",
        icon: "bolt",
        items: [
          {
            id: "mgf2-ue1",
            text: "Estagio em urgencia pediatrica",
            requirement: "obrigatorio",
            tags: ["estagio"],
          },
          {
            id: "mgf2-ue2",
            text: "Estagio em urgencia ginecologica/obstetrica",
            requirement: "obrigatorio",
            tags: ["estagio"],
          },
          {
            id: "mgf2-ue3",
            text: "Estagio em urgencia de medicina interna",
            requirement: "obrigatorio",
            tags: ["estagio"],
          },
          {
            id: "mgf2-ue4",
            text: "Estagio em urgencia psiquiatrica",
            requirement: "obrigatorio",
            tags: ["estagio"],
          },
        ],
      },
      {
        id: "mgf2-opcional",
        title: "Formacao complementar opcional",
        icon: "spark",
        items: [
          {
            id: "mgf2-o1",
            text: "Definir FCOp com o orientador e submeter proposta a Coordenacao",
            note: "Deve constar do PPF e ser avaliada pela CIMGF.",
            requirement: "obrigatorio",
            tags: ["documento"],
            deadline: "30 set - 1.º ano",
          },
          {
            id: "mgf2-o2",
            text: "Realizar a FCOp na area clinica ou nao clinica escolhida",
            note: "Duracao 2 a 7 meses; total FCO + FCOp = 10 meses.",
            requirement: "obrigatorio",
            tags: ["estagio"],
          },
          {
            id: "mgf2-o3",
            text: "Elaborar relatorio de atividades da FCOp",
            requirement: "obrigatorio",
            tags: ["documento"],
          },
        ],
      },
      {
        id: "mgf2-docs",
        title: "Documentacao, PPF e aprendizagem formal",
        icon: "file",
        items: [
          {
            id: "mgf2-d1",
            text: "Atualizar e enviar PPF do 2.º ano a Coordenacao",
            requirement: "obrigatorio",
            tags: ["documento", "legal"],
            deadline: "30 set - 2.º ano",
          },
          {
            id: "mgf2-d2",
            text: "Atualizar e enviar PPF do 3.º ano a Coordenacao",
            requirement: "obrigatorio",
            tags: ["documento", "legal"],
            deadline: "30 set - 3.º ano",
          },
          {
            id: "mgf2-d3",
            text: "Elaborar relatorio de atividades intercalar MGF2.1",
            requirement: "obrigatorio",
            tags: ["documento"],
          },
          {
            id: "mgf2-d4",
            text: "Submeter Base de Dados MGF2 completa via plataforma e-learning",
            requirement: "obrigatorio",
            tags: ["documento"],
          },
          {
            id: "mgf2-f1",
            text: "Participar em cursos curriculares obrigatorios e reunioes EIOI",
            note: "Cerca de 80h/ano ao longo dos 2 anos de MGF2.",
            requirement: "obrigatorio",
            tags: ["formacao"],
          },
        ],
      },
      {
        id: "mgf2-avaliacao",
        title: "Avaliacao MGF2.1 e MGF2.2",
        icon: "award",
        items: [
          {
            id: "mgf2-a1",
            text: "Avaliacao de desempenho intercalar >= 10 valores (MGF2.1)",
            requirement: "obrigatorio",
            tags: ["avaliacao"],
          },
          {
            id: "mgf2-a2",
            text: "Prova oral regional (MGF2.1) >= 10 valores",
            requirement: "obrigatorio",
            tags: ["avaliacao", "prova"],
          },
          {
            id: "mgf2-b1",
            text: "Avaliacao de desempenho final de MGF2 >= 10 valores (MGF2.2)",
            requirement: "obrigatorio",
            tags: ["avaliacao"],
          },
          {
            id: "mgf2-b2",
            text: "Prova escrita nacional de conhecimentos (MGF2.2) >= 10 valores",
            requirement: "obrigatorio",
            tags: ["avaliacao", "prova"],
          },
        ],
      },
    ],
  },
  {
    id: "mgf3",
    tone: "purple",
    label: "MGF 3",
    summary: "Integracao e governacao",
    meta: "11 meses · 4.º ano",
    title: "MGF 3 - Integracao, gestao e governacao clinica",
    subtitle: "4.º ano de formacao especializada",
    duration: "11 meses",
    year: "4.º ano",
    objective:
      "Integracao das competencias adquiridas em MGF1 e MGF2, acrescentando dimensoes de gestao da pratica, investigacao e governacao clinica.",
    provas:
      "Prova oral regional e Exame Final com prova curricular e prova pratica com doente simulado.",
    legal:
      "Portaria n.º 125/2019, Anexo B, pontos 4.6, 6.1.3 e 10 | Colegio de MGF - Prova Pratica Final",
    sections: [
      {
        id: "mgf3-pratica",
        title: "Pratica clinica, autonomia e lideranca",
        icon: "check",
        items: [
          {
            id: "mgf3-c1",
            text: "Gerir autonomamente casos de maior complexidade",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf3-c2",
            text: "Demonstrar proficiencia em ampla gama de procedimentos medicos em CSP",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf3-c3",
            text: "Aplicar dimensoes de gestao e governacao clinica na pratica quotidiana",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf3-c4",
            text: "Assumir atividades de ensino e supervisao de internos mais novos e estudantes",
            requirement: "obrigatorio",
            tags: ["formacao"],
          },
          {
            id: "mgf3-c5",
            text: "Participar em atividades de investigacao e consultoria clinica",
            requirement: "recomendado",
            tags: ["formacao"],
          },
          {
            id: "mgf3-c6",
            text: "Manter ativamente a qualidade dos registos medicos da unidade",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf3-c7",
            text: "Integrar cuidados ao utente carenciado e de maior vulnerabilidade social",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
        ],
      },
      {
        id: "mgf3-competencias",
        title: "Competencias do especialista MGF",
        icon: "flow",
        items: [
          {
            id: "mgf3-k1",
            text: "Demonstrar competencias clinicas e relacionais do perfil do especialista de MGF",
            requirement: "obrigatorio",
            tags: ["avaliacao"],
          },
          {
            id: "mgf3-k2",
            text: "Aplicar o modelo RMOP nas consultas",
            note: "Sistema avaliado na prova pratica final.",
            requirement: "obrigatorio",
            tags: ["clinico", "avaliacao"],
          },
          {
            id: "mgf3-k3",
            text: "Demonstrar abordagem centrada no doente e centrada na comunidade",
            requirement: "obrigatorio",
            tags: ["clinico"],
          },
          {
            id: "mgf3-k4",
            text: "Demonstrar competencias de auto e hetero-governacao nos contextos de trabalho",
            requirement: "obrigatorio",
            tags: ["avaliacao"],
          },
        ],
      },
      {
        id: "mgf3-docs",
        title: "FCC obrigatorias e documentacao",
        icon: "file",
        items: [
          {
            id: "mgf3-f1",
            text: "Planear e realizar 160 horas de formacoes curtas especificas de MGF3",
            requirement: "obrigatorio",
            tags: ["formacao"],
          },
          {
            id: "mgf3-f2",
            text: "Elaborar relatorio unico anual das formacoes curtas de MGF3",
            requirement: "obrigatorio",
            tags: ["documento"],
          },
          {
            id: "mgf3-d1",
            text: "Atualizar PPF do 4.º ano e enviar a Coordenacao",
            requirement: "obrigatorio",
            tags: ["documento", "legal"],
            deadline: "30 set - 4.º ano",
          },
          {
            id: "mgf3-d2",
            text: "Submeter Base de Dados MGF3 via plataforma e-learning",
            requirement: "obrigatorio",
            tags: ["documento"],
          },
          {
            id: "mgf3-d3",
            text: "Elaborar Curriculum Vitae para a Avaliacao Final segundo orientacoes do Colegio",
            requirement: "obrigatorio",
            tags: ["documento"],
          },
        ],
      },
      {
        id: "mgf3-avaliacao",
        title: "Avaliacao continua e Exame Final do internato",
        icon: "award",
        items: [
          {
            id: "mgf3-a1",
            text: "Avaliacao de desempenho final de MGF3 >= 10 valores",
            requirement: "obrigatorio",
            tags: ["avaliacao"],
          },
          {
            id: "mgf3-a2",
            text: "Prova oral regional (MGF3) >= 10 valores",
            requirement: "obrigatorio",
            tags: ["avaliacao", "prova"],
          },
          {
            id: "mgf3-ef1",
            text: "Prova curricular do Exame Final com discussao critica do CV",
            requirement: "obrigatorio",
            tags: ["prova", "avaliacao"],
          },
          {
            id: "mgf3-ef2",
            text: "Prova pratica do Exame Final com 3 casos clinicos e doente simulado",
            requirement: "obrigatorio",
            tags: ["prova", "avaliacao"],
          },
          {
            id: "mgf3-ef3",
            text: "Classificacao final do internato com media aritmetica de MGF1, MGF2 e MGF3",
            requirement: "obrigatorio",
            tags: ["avaliacao", "legal"],
          },
        ],
      },
    ],
  },
];
