"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}

function createSegment(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  steps: number,
) {
  return Array.from({ length: steps }, (_, index) => {
    const progress = steps === 1 ? 0 : index / (steps - 1);
    return {
      x: lerp(fromX, toX, progress),
      y: lerp(fromY, toY, progress),
    };
  });
}

function createArc(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  startAngle: number,
  endAngle: number,
  steps: number,
) {
  return Array.from({ length: steps }, (_, index) => {
    const progress = steps === 1 ? 0 : index / (steps - 1);
    const angle = lerp(startAngle, endAngle, progress);
    return {
      x: centerX + Math.cos(angle) * radiusX,
      y: centerY + Math.sin(angle) * radiusY,
    };
  });
}

function uniquePoints(points: Array<{ x: number; y: number }>) {
  const map = new Map<string, { x: number; y: number }>();

  for (const point of points) {
    const x = Math.round(point.x * 10) / 10;
    const y = Math.round(point.y * 10) / 10;
    map.set(`${x}:${y}`, { x, y });
  }

  return Array.from(map.values());
}

function buildStethoscopeModel() {
  const earTips = uniquePoints([
    ...createArc(-8.6, -14.3, 1.15, 0.85, Math.PI * 0.1, Math.PI * 1.9, 6),
    ...createArc(-5.9, -14.3, 1.15, 0.85, Math.PI * 0.1, Math.PI * 1.9, 6),
  ]).map((point, index) => ({
    id: `accent-${index}`,
    ...point,
    size: 8,
    color: "accent" as const,
    phase: index * 0.22,
  }));

  const metal = uniquePoints([
    ...createArc(-7.25, -7.6, 2.35, 7.9, Math.PI * 1.06, Math.PI * 1.82, 18),
    ...createArc(-7.25, -7.6, 2.9, 8.45, Math.PI * 1.05, Math.PI * 1.82, 18),
    ...createArc(-7.25, -7.6, 3.45, 8.95, Math.PI * 1.05, Math.PI * 1.82, 18),
  ]).map((point, index) => ({
    id: `metal-${index}`,
    ...point,
    size: 6,
    color: "metal" as const,
    phase: 0.3 + index * 0.17,
  }));

  const tube = uniquePoints([
    ...createSegment(-5.1, -0.1, -2.6, 2.3, 7),
    ...createSegment(-2.6, 2.3, -2.1, 8.4, 10),
    ...createArc(2.8, 8.6, 8.2, 12.6, Math.PI * 0.96, Math.PI * 2.05, 28),
    ...createArc(2.8, 8.6, 8.9, 13.3, Math.PI * 0.96, Math.PI * 2.05, 28),
    ...createArc(2.8, 8.6, 9.6, 14, Math.PI * 0.96, Math.PI * 2.05, 28),
    ...createSegment(7.2, -0.7, 10.9, 3.8, 12),
  ]).map((point, index) => ({
    id: `tube-${index}`,
    ...point,
    size: 7,
    color: "tube" as const,
    phase: 0.15 + index * 0.11,
  }));

  const chest = uniquePoints([
    ...createArc(11.9, -0.4, 2.15, 2.15, 0, Math.PI * 2, 16),
    ...createArc(11.9, -0.4, 1.45, 1.45, 0, Math.PI * 2, 12),
    { x: 11.9, y: -0.4 },
  ]).map((point, index) => ({
    id: `chest-${index}`,
    ...point,
    size: index === uniquePoints([{ x: 11.9, y: -0.4 }]).length - 1 ? 8 : 6,
    color: "metal" as const,
    phase: 0.5 + index * 0.14,
  }));

  return [...earTips, ...metal, ...tube, ...chest];
}

const STETHOSCOPE_CUBES = buildStethoscopeModel();

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

function InteractiveStethoscope() {
  const [time, setTime] = useState(0);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();

    const animate = (now: number) => {
      setTime((now - start) / 1000);
      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const renderedCubes = useMemo(() => {
    return STETHOSCOPE_CUBES.map((cube) => {
      const baseX = cube.x * 18;
      const baseY = cube.y * 18;

      let shiftX = Math.sin(time * 0.85 + cube.phase) * 1.8;
      let shiftY = Math.cos(time * 0.8 + cube.phase) * 1.6;

      if (pointer) {
        const dx = baseX - pointer.x;
        const dy = baseY - pointer.y;
        const distance = Math.hypot(dx, dy);
        const radius = 150;

        if (distance < radius) {
          const force = ((radius - distance) / radius) ** 2 * 18;
          const angle = Math.atan2(dy, dx);
          shiftX += Math.cos(angle) * force;
          shiftY += Math.sin(angle) * force;
        }
      }

      return {
        ...cube,
        x: baseX + shiftX,
        y: baseY + shiftY,
      };
    });
  }, [pointer, time]);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-border/70 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.78))] shadow-[0_28px_80px_rgba(15,23,42,0.12)]"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: event.clientX - rect.left - rect.width / 2,
          y: event.clientY - rect.top - rect.height / 2,
        });
      }}
      onPointerLeave={() => setPointer(null)}
    >
      <div className="absolute inset-0 soft-grain opacity-20" />

      {renderedCubes.map((cube) => {
        const styles =
          cube.color === "tube"
            ? {
                background:
                  "linear-gradient(145deg, rgba(211,47,47,0.96), rgba(180,27,27,0.88))",
                borderColor: "rgba(185,28,28,0.34)",
                boxShadow: "0 8px 18px rgba(185,28,28,0.18)",
              }
            : cube.color === "accent"
              ? {
                  background:
                    "linear-gradient(145deg, rgba(148,163,184,0.95), rgba(113,128,150,0.9))",
                  borderColor: "rgba(100,116,139,0.35)",
                  boxShadow: "0 8px 16px rgba(100,116,139,0.14)",
                }
              : {
                  background:
                    "linear-gradient(145deg, rgba(241,245,249,0.98), rgba(148,163,184,0.92))",
                  borderColor: "rgba(148,163,184,0.36)",
                  boxShadow: "0 8px 18px rgba(148,163,184,0.18)",
                };

        return (
          <div
            key={cube.id}
            className="absolute left-1/2 top-1/2 rounded-[3px] border transition-transform duration-300 ease-out"
            style={{
              width: `${cube.size}px`,
              height: `${cube.size}px`,
              transform: `translate(${cube.x}px, ${cube.y}px)`,
              ...styles,
            }}
          />
        );
      })}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] app-surface">
      <section className="relative px-4 py-10 sm:py-14 lg:py-20">
        <div className="absolute inset-0 hero-surface opacity-90" />
        <div className="absolute inset-0 soft-grain opacity-30" />

        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Internato MGF
            </div>

            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Plataforma para acompanhar o MGF.
            </h1>

            <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              Um espaço único para estudar, consultar ferramentas clínicas e organizar o internato.
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

          <InteractiveStethoscope />
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
              Começar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
