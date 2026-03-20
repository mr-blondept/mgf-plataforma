import Link from "next/link";
import {
  Stethoscope,
  BookOpen,
  Search,
  Calculator,
  Calendar,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Syringe,
} from "lucide-react";
import { cn } from "@/lib/utils";

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur",
        "transition-all duration-200 hover:-translate-y-1 hover:border-foreground/40"
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/10 blur-3xl" />
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-secondary/80 text-primary transition-transform duration-200 group-hover:scale-105">
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function BenefitRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 p-4">
      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle className="h-4 w-4" />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col app-surface">
      {/* Hero */}
      <section className="relative flex flex-1 flex-col justify-center px-4 py-16 lg:py-20">
        <div className="absolute inset-0 hero-surface" />
        <div className="absolute inset-0 soft-grain opacity-30" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-foreground" />
              Ferramentas essenciais para internos MGF
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Uma plataforma clínica completa para o internato de Medicina Geral
              e Familiar.
            </h1>
            <p className="text-lg text-muted-foreground">
              Reúne banco de perguntas, ICPC-2, calculadoras, calendário e
              estatísticas num só lugar para apoiar a prática diária e a
              preparação do exame da especialidade.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/auth"
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                )}
              >
                Começar a usar a plataforma
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#funcionalidades"
                className={cn(
                  "inline-flex items-center justify-center rounded-full border border-border/70 bg-secondary/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] shadow-sm transition-all hover:bg-secondary"
                )}
              >
                Ver funcionalidades
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-md backdrop-blur">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary/30 to-transparent" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Visao geral
                    </p>
                    <p className="text-xl font-semibold text-foreground">
                      Painel do interno
                    </p>
                  </div>
                  <div className="rounded-full border border-border/70 bg-secondary/80 px-3 py-1 text-xs font-semibold text-foreground">
                    Atualizado
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Perguntas feitas", value: "42" },
                    { label: "ICPC-2 pesquisado", value: "Hoje" },
                    { label: "Progresso", value: "78%" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/70 px-4 py-3"
                    >
                      <span className="text-sm text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/80 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Proximo passo
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    Organizar estudo da semana e rever notas clinicas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="funcionalidades"
        className="border-t border-border/70 bg-secondary/40 px-4 py-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Funcionalidades
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-foreground">
              Ferramentas essenciais para o teu dia-a-dia clinico
            </h2>
            <p className="mt-2 text-muted-foreground">
              Tudo organizado em cartoes claros para aceder rapidamente ao que
              precisas durante o internato.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Banco de Perguntas"
              description="Treino para o exame com perguntas focadas em MGF e feedback imediato."
            />
            <FeatureCard
              icon={<Search className="h-5 w-5" />}
              title="Explorador ICPC-2"
              description="Pesquisa rapida de codigos e descricoes clinicas durante a consulta."
            />
            <FeatureCard
              icon={<Calculator className="h-5 w-5" />}
              title="Calculadoras Medicas"
              description="Ferramentas clinicas essenciais reunidas num unico painel."
            />
            <FeatureCard
              icon={<Calendar className="h-5 w-5" />}
              title="Calendario Clinico"
              description="Planeamento de atividades, guardas e objetivos de estudo."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Estatisticas e Progresso"
              description="Acompanha evolucao, pontos fortes e areas a reforcar."
            />
            <FeatureCard
              icon={<Syringe className="h-5 w-5" />}
              title="Plano de Vacinacao"
              description="Consulta interativa do PNV 2020 com esquema por idade e resumo das vacinas."
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border/70 px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Beneficios
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-foreground">
              Mais foco, menos ruido.
            </h2>
            <p className="mt-3 text-muted-foreground">
              A plataforma foi desenhada para simplificar o internato e manter a
              evolucao visivel, com tudo a poucos cliques.
            </p>
          </div>
          <div className="space-y-3">
            <BenefitRow
              title="Poupar tempo na pratica clinica"
              description="Acesso rapido a codigos, calculos e planeamento sem perder tempo a procurar." 
            />
            <BenefitRow
              title="Preparar exames com eficiencia"
              description="Perguntas e estatisticas para treinar com consistencia e medir resultados." 
            />
            <BenefitRow
              title="Organizar estudo e atividade clinica"
              description="Calendario e ferramentas integradas para manter tudo no mesmo local." 
            />
            <BenefitRow
              title="Acompanhar o progresso de aprendizagem"
              description="Visao clara do desempenho para ajustar prioridades de estudo." 
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/70 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 px-6 py-10 text-center shadow-md backdrop-blur sm:px-10">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary/30 to-transparent" />
            <div className="relative">
              <h2 className="font-display mb-2 text-2xl font-semibold text-foreground sm:text-3xl">
                Comeca hoje a usar a plataforma
              </h2>
              <p className="mb-6 text-muted-foreground">
                Centraliza as tuas ferramentas de MGF e ganha ritmo no internato.
              </p>
              <Link
                href="/auth"
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                )}
              >
                Criar conta gratuita
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/70 px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
            >
              <Stethoscope className="h-5 w-5" />
              Internos MGF
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Plataforma de ferramentas essenciais para internos de Medicina
              Geral e Familiar.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Sobre a plataforma
            </p>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              <li>Ferramentas clinicas e de estudo</li>
              <li>Foco no internato MGF</li>
              <li>Atualizacoes continuas</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Contacto
            </p>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              <li>contacto@internosmgf.pt</li>
              <li>
                <a className="text-primary hover:underline" href="#">
                  Privacidade / Termos
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
