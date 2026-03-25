"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Calculator,
  CalendarDays,
  Clock3,
  GraduationCap,
  Search,
  Syringe,
  UserRound,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import LoadingSkeleton from "@/components/LoadingSkeleton";

type UserEvent = {
  id: string;
  title: string;
  start_at: string;
};

type QuestionSession = {
  id: string;
  mode: "treino" | "simulado";
  status: "active" | "paused" | "completed";
  category: string;
  categories: string[] | null;
  total_questions: number | null;
  updated_at: string | null;
};

const FEATURE_CARDS = [
  {
    href: "/treino",
    title: "Banco de Perguntas",
    description: "Criar treino, lançar simulados e retomar sessões.",
    icon: BookOpenCheck,
    accent: "from-amber-500/20 to-orange-500/5",
  },
  {
    href: "/icpc2",
    title: "ICPC-2",
    description: "Pesquisar códigos e descrições de forma rápida.",
    icon: Search,
    accent: "from-sky-500/20 to-cyan-500/5",
  },
  {
    href: "/calculadoras",
    title: "Calculadoras",
    description: "Dose pediatrica oral e futuras ferramentas clinicas.",
    icon: Calculator,
    accent: "from-cyan-500/20 to-sky-500/5",
  },
  {
    href: "/vacinacao",
    title: "Vacinação",
    description: "Abrir o mapa vacinal e rever o PNV por idade.",
    icon: Syringe,
    accent: "from-emerald-500/20 to-lime-500/5",
  },
  {
    href: "/calendario",
    title: "Calendário",
    description: "Organizar estudo, consultas e eventos importantes.",
    icon: CalendarDays,
    accent: "from-fuchsia-500/20 to-rose-500/5",
  },
  {
    href: "/internato",
    title: "Internato MGF",
    description: "Acompanha o progresso do internato com uma grelha completa e guardada por utilizador.",
    icon: GraduationCap,
    accent: "from-sky-500/20 to-blue-500/5",
  },
  {
    href: "/estatisticas",
    title: "Estatísticas",
    description: "Consultar progresso quando precisares de detalhe.",
    icon: BarChart3,
    accent: "from-indigo-500/20 to-violet-500/5",
  },
  {
    href: "/perfil",
    title: "Perfil",
    description: "Gerir dados pessoais e definições da conta.",
    icon: UserRound,
    accent: "from-slate-500/20 to-zinc-500/5",
  },
];

function FeatureCard({
  href,
  title,
  description,
  icon: Icon,
  accent,
}: (typeof FEATURE_CARDS)[number]) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-foreground/30 hover:bg-card"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", accent)} />
      <div className="absolute inset-0 soft-grain opacity-20" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/75 shadow-sm">
          <Icon className="h-5 w-5 text-foreground" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
      </div>
      <div className="relative mt-5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}

export default function PainelPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nextEvents, setNextEvents] = useState<UserEvent[]>([]);
  const [sessions, setSessions] = useState<QuestionSession[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setErrorMsg(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const now = new Date().toISOString();

      const [eventsResult, sessionsResult] = await Promise.all([
        supabase
          .from("user_events")
          .select("id, title, start_at")
          .eq("user_id", user.id)
          .gte("start_at", now)
          .order("start_at", { ascending: true })
          .limit(4),
        supabase
          .from("question_sessions")
          .select("id, mode, status, category, categories, total_questions, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
      ]);

      if (eventsResult.error || sessionsResult.error) {
        setErrorMsg("Não foi possível carregar o Painel.");
        setLoading(false);
        return;
      }

      setNextEvents((eventsResult.data ?? []) as UserEvent[]);
      setSessions((sessionsResult.data ?? []) as QuestionSession[]);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const activeSessions = useMemo(
    () => sessions.filter((session) => session.status !== "completed").slice(0, 3),
    [sessions],
  );

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="absolute inset-0 hero-surface opacity-70" />
      <div className="absolute inset-0 soft-grain opacity-25" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8">
        {errorMsg ? (
          <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMsg}
          </div>
        ) : null}

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Funcionalidades
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                Tudo acessível a partir daqui
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {FEATURE_CARDS.map((card) => (
              <FeatureCard key={card.href} {...card} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Continuar
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                  Sessões pendentes
                </h2>
              </div>
              <BookOpenCheck className="h-5 w-5 text-muted-foreground" />
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                {[0, 1, 2].map((item) => (
                  <LoadingSkeleton key={item} className="h-20" />
                ))}
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-border/70 bg-background/55 p-5 text-sm text-muted-foreground">
                Não tens sessões ativas ou em pausa. Se quiseres, começa um novo
                treino ou um novo simulado.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {activeSessions.map((session) => {
                  const label = session.categories?.length
                    ? session.categories.join(" · ")
                    : session.category;

                  return (
                    <div
                      key={session.id}
                      className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                        {session.mode === "simulado" ? "Simulado" : "Treino"} · {session.status}
                      </p>
                      <p className="mt-2 font-semibold text-foreground">{label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {session.total_questions ?? 0} questões
                        {session.updated_at
                          ? ` · atualizado a ${format(parseISO(session.updated_at), "d MMM, HH:mm", {
                              locale: pt,
                            })}`
                          : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href="/treino"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Abrir banco de perguntas
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Agenda
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                  Próximos eventos
                </h2>
              </div>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                {[0, 1, 2].map((item) => (
                  <LoadingSkeleton key={item} className="h-20" />
                ))}
              </div>
            ) : nextEvents.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-border/70 bg-background/55 p-5 text-sm text-muted-foreground">
                Ainda não tens eventos futuros registados no calendário.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {nextEvents.map((event) => {
                  const eventDate = parseISO(event.start_at);

                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-border/70 bg-background/60 px-4 py-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-center">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            {format(eventDate, "MMM", { locale: pt })}
                          </p>
                          <p className="text-xl font-semibold text-foreground">
                            {format(eventDate, "d")}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(eventDate, "EEEE, HH:mm", { locale: pt })}
                          </p>
                        </div>
                      </div>
                      <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href="/calendario"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Abrir calendário completo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
