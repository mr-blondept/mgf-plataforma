import Link from "next/link";
import { ArrowUpRight, Syringe } from "lucide-react";

export default function CalculadorasPage() {
  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="absolute inset-0 hero-surface opacity-70" />
      <div className="absolute inset-0 soft-grain opacity-25" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8">
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Calculadoras
              </p>
              <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
                Disponivel agora
              </h1>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Link
              href="/calculadoras/doses-pediatricas"
              className="group relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-foreground/30 hover:bg-card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-cyan-500/5 opacity-80" />
              <div className="absolute inset-0 soft-grain opacity-20" />
              <div className="relative flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/75 shadow-sm">
                  <Syringe className="h-5 w-5 text-foreground" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
              </div>
              <div className="relative mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Calculadora 01
                </p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">
                  Doses pediátricas
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Calculo de dose oral por peso, frequencia, concentracao e limite maximo.
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
