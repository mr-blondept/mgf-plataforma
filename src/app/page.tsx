"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  Calculator,
  Search,
  Sparkles,
  Syringe,
} from "lucide-react";

import StethoscopeCubes from "@/components/StethoscopeCubes";

const FEATURES = [
  {
    title: "Banco de Perguntas",
    description:
      "Treino para o exame com perguntas focadas em MGF e feedback imediato.",
    icon: BookOpen,
  },
  {
    title: "Explorador ICPC-2",
    description:
      "Pesquisa rapida de codigos e descricoes clinicas durante a consulta.",
    icon: Search,
  },
  {
    title: "Calculadoras Medicas",
    description:
      "Ferramentas clinicas essenciais reunidas num unico painel.",
    icon: Calculator,
  },
  {
    title: "Calendario Clinico",
    description:
      "Planeamento de atividades, guardas e objetivos de estudo.",
    icon: Calendar,
  },
  {
    title: "Estatisticas e Progresso",
    description:
      "Acompanha evolucao, pontos fortes e areas a reforcar.",
    icon: BarChart3,
  },
  {
    title: "Plano de Vacinacao",
    description:
      "Consulta interativa do PNV 2020 com esquema por idade e resumo das vacinas.",
    icon: Syringe,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] app-surface">
      <section className="relative overflow-hidden px-4 pb-10 pt-10 sm:pb-14 sm:pt-14 lg:pb-20 lg:pt-20">
        <div className="absolute inset-0 hero-surface opacity-90" />
        <div className="absolute inset-0 soft-grain opacity-30" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/50 to-transparent" />
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Internato MGF
            </div>

            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Plataforma para acompanhar o MGF.
            </h1>

            <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              Um espaco unico para estudar, consultar ferramentas clinicas e organizar o internato.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-md transition-all hover:bg-primary/90"
              >
                Entrar na plataforma
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#funcionalidades"
                className="inline-flex items-center justify-center rounded-full border border-border/70 bg-secondary/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] shadow-sm transition-all hover:bg-secondary"
              >
                Ver funcionalidades
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-x-8 top-12 h-24 rounded-full bg-white/40 blur-3xl" />
            <div className="relative scale-[0.92] sm:scale-100">
              <StethoscopeCubes />
            </div>
          </div>
        </div>
      </section>

      <section
        id="funcionalidades"
        className="border-t border-border/70 bg-card/30 px-4 py-14 sm:py-16"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Funcionalidades
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-secondary/80 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {feature.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-md transition-all hover:bg-primary/90"
            >
              Comecar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
