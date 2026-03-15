import Link from "next/link";
import {
  CalendarDays,
  BarChart3,
  Brain,
  BookOpenCheck,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  {
    title: "Estudo",
    description: "Modos de pratica e revisao com questoes organizadas.",
    items: [
      {
        title: "Banco de Perguntas",
        description: "Sessoes livres ou simuladas por modulo.",
        href: "/treino",
        icon: Brain,
      },
      {
        title: "Banco de Questoes",
        description: "Aceda por area clinica e nivel de dificuldade.",
        href: "/treino",
        icon: BookOpenCheck,
      },
      {
        title: "ICPC-2",
        description: "Pesquisa rapida de codigos e explicacoes (versao portuguesa).",
        href: "/icpc2",
        icon: BookOpenCheck,
      },
    ],
  },
  {
    title: "Planeamento",
    description: "Organize o ritmo de estudo e objetivos semanais.",
    items: [
      {
        title: "Calendario",
        description: "Agenda de estudo e eventos importantes.",
        href: "/calendario",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "Progresso",
    description: "Indicadores chave para ajustar o foco.",
    items: [
      {
        title: "Estatisticas",
        description: "Desempenho por modulo e tendencias.",
        href: "/estatisticas",
        icon: BarChart3,
      },
    ],
  },
];

export default function DashboardPage() {
  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-8 shadow-md backdrop-blur">
          <div className="absolute inset-0 hero-surface" />
          <div className="absolute inset-0 soft-grain opacity-30" />
          <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            Tudo organizado por categoria
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Centralize o estudo, planeamento e acompanhamento em um unico lugar.
            Use os atalhos abaixo para entrar diretamente no que precisa.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/treino"
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-sm transition-all",
                "hover:bg-primary/90 hover:shadow-md"
              )}
            >
              Comecar treino
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/calendario"
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em]",
                "text-foreground shadow-sm transition-all hover:bg-secondary/80"
              )}
            >
              Ver calendario
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6">
          {categories.map((category) => (
            <div
              key={category.title}
              className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {category.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <div className="h-1 w-20 rounded-full bg-primary/40" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "group flex items-start gap-4 rounded-2xl border border-border/70 bg-card/80 p-4 backdrop-blur",
                        "transition-all hover:-translate-y-0.5 hover:border-foreground/50 hover:shadow-md"
                      )}
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-secondary/80 text-foreground">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">
                            {item.title}
                          </h3>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
