"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  Calculator,
  GraduationCap,
  Search,
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
      "Pesquisa rápida de códigos e descrições clínicas durante a consulta.",
    icon: Search,
  },
  {
    title: "Calculadoras Médicas",
    description:
      "Ferramentas clínicas essenciais reunidas num único painel.",
    icon: Calculator,
  },
  {
    title: "Calendário Clínico",
    description:
      "Planeamento de atividades, guardas e objetivos de estudo.",
    icon: Calendar,
  },
  {
    title: "Estatísticas e Progresso",
    description:
      "Acompanha a evolução, os pontos fortes e as áreas a reforçar.",
    icon: BarChart3,
  },
  {
    title: "Plano de Vacinação",
    description:
      "Consulta interativa do PNV 2020 com esquema por idade e resumo das vacinas.",
    icon: Syringe,
  },
  {
    title: "Progressão do Internato",
    description:
      "Grelha detalhada de MGF 1, MGF 2 e MGF 3 com progresso pessoal guardado por utilizador.",
    icon: GraduationCap,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] app-surface">
      <section className="relative overflow-hidden px-4 pb-10 pt-10 sm:pb-14 sm:pt-16">
        <div className="absolute inset-0 hero-surface opacity-70" />
        <div className="absolute inset-0 soft-grain opacity-30" />
        <div className="absolute left-1/2 top-12 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-center">
          <div className="space-y-5 text-center lg:text-left">
            <h1 className="font-display text-[2.15rem] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Plataforma para acompanhar o MGF.
            </h1>

            <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground sm:text-lg lg:mx-0">
              Um espaço único para estudar, consultar ferramentas clínicas e organizar o percurso.
            </p>

            <div className="flex items-center justify-center lg:justify-start">
              <Link
                href="/auth"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-md transition-all hover:bg-primary/90"
              >
                Entrar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-[360px] lg:block lg:max-w-none">
            <StethoscopeCubes />
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
                className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-sm backdrop-blur sm:p-5"
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

        </div>
      </section>
    </main>
  );
}
