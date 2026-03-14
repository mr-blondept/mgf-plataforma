import Link from "next/link";
import {
  Stethoscope,
  BookOpen,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
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
        "group relative overflow-hidden rounded-md border border-border bg-card p-6 shadow-sm",
        "transition-all duration-200 hover:-translate-y-1 hover:border-primary"
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-primary/10 blur-2xl" />
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary transition-transform duration-200 group-hover:scale-105">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Hero */}
      <section className="relative flex flex-1 flex-col justify-center px-4 py-16 lg:py-20">
        <div className="absolute inset-0 hero-surface" />
        <div className="absolute inset-0 soft-grain opacity-40" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              Roteiro completo para o Internato MGF
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="inline-flex items-center border border-border bg-card px-4 py-2 shadow-sm">
                Descobre
              </span>{" "}
              <span className="inline-flex items-center rounded-full border border-border bg-primary px-5 py-2 text-primary-foreground shadow-sm">
                o foco
              </span>{" "}
              <span className="inline-flex items-center border border-border bg-card px-4 py-2 shadow-sm">
                em MGF
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Banco de questões orientado por módulos, explicações claras e
              métricas práticas para acompanhar a evolução real do seu estudo.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/treino"
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-md border border-border bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                )}
              >
                Começar a Estudar
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth"
                className={cn(
                  "inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] shadow-sm transition-all hover:bg-secondary"
                )}
              >
                Já tenho conta
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
              {[
                { label: "Questões revisadas", value: "1.200+" },
                { label: "Módulos clínicos", value: "6" },
                { label: "Tempo médio", value: "12 min/dia" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md border border-border bg-card px-4 py-3 text-left shadow-sm"
                >
                  <p className="text-lg font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto w-full max-w-md">
            <div className="card-elevated relative overflow-hidden rounded-md p-6">
              <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Sessao de estudo
                    </p>
                    <p className="text-xl font-semibold text-foreground">
                      MGF - Pediatria
                    </p>
                  </div>
                  <div className="rounded-full border border-border bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    Em andamento
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Taxa de acerto", value: "78%" },
                    { label: "Perguntas feitas", value: "42" },
                    { label: "Dificuldade média", value: "Moderada" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-md border border-border bg-secondary px-4 py-3"
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
                <div className="rounded-md border border-border bg-muted p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Proximo objetivo
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    Reforcar cardiologia e saude mental nesta semana.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-secondary/60 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Desenhado para resultados
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-foreground">
              Tudo o que precisa para ter sucesso
            </h2>
            <p className="mt-2 text-muted-foreground">
              Estruture o estudo com um fluxo claro: pratica, feedback imediato
              e metricas que orientam as proximas decisoes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Perguntas por Módulos"
              description="Perguntas organizadas por áreas: MGF, Medicina Interna, Pediatria, Ginecologia, Saúde Mental e Geriatria."
            />
            <FeatureCard
              icon={<Clock className="h-5 w-5" />}
              title="Dois Modos de Estudo"
              description="Prática livre sem pressão ou exames simulados com tempo limitado para testar os seus conhecimentos."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Estatísticas Detalhadas"
              description="Acompanhe o seu desempenho por módulo, identifique pontos fracos e veja a sua evolução ao longo do tempo."
            />
            <FeatureCard
              icon={<CheckCircle className="h-5 w-5" />}
              title="Explicações Completas"
              description="Cada pergunta inclui uma explicação detalhada para consolidar o conhecimento após a resposta."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-md border border-border bg-card px-6 py-10 text-center shadow-md sm:px-10">
            <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
            <div className="relative">
              <h2 className="font-display mb-2 text-2xl font-semibold text-foreground sm:text-3xl">
                Pronto para começar?
              </h2>
              <p className="mb-6 text-muted-foreground">
                Crie a sua conta gratuitamente e comece a estudar hoje mesmo.
              </p>
              <Link
                href="/auth"
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-md border border-border bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                )}
              >
                Criar Conta Gratuita
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
          >
            <Stethoscope className="h-5 w-5" />
            MGF Quiz
          </Link>
          <p className="text-sm text-muted-foreground">
            Plataforma de estudo para Internato de MGF
          </p>
        </div>
      </footer>
    </div>
  );
}
