"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Calculator,
  CalendarDays,
  Clock3,
  GraduationCap,
  GripVertical,
  Search,
  Syringe,
  UserRound,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import PageLoadingView from "@/components/PageLoadingView";

type FeatureId =
  | "treino"
  | "icpc2"
  | "calculadoras"
  | "vacinacao"
  | "calendario"
  | "internato"
  | "estatisticas"
  | "perfil";

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
    id: "treino",
    href: "/treino",
    title: "Banco de Perguntas",
    description: "Criar treino, lançar simulados e retomar sessões.",
    icon: BookOpenCheck,
    accent: "from-amber-500/20 to-orange-500/5",
  },
  {
    id: "icpc2",
    href: "/icpc2",
    title: "ICPC-2",
    description: "Pesquisar códigos e descrições de forma rápida.",
    icon: Search,
    accent: "from-sky-500/20 to-cyan-500/5",
  },
  {
    id: "calculadoras",
    href: "/calculadoras",
    title: "Calculadoras",
    description: "Dose pediátrica oral e futuras ferramentas clínicas.",
    icon: Calculator,
    accent: "from-cyan-500/20 to-sky-500/5",
  },
  {
    id: "vacinacao",
    href: "/vacinacao",
    title: "Vacinação",
    description: "Abrir o mapa vacinal e rever o PNV por idade.",
    icon: Syringe,
    accent: "from-emerald-500/20 to-lime-500/5",
  },
  {
    id: "calendario",
    href: "/calendario",
    title: "Calendário",
    description: "Organizar estudo, consultas e eventos importantes.",
    icon: CalendarDays,
    accent: "from-fuchsia-500/20 to-rose-500/5",
  },
  {
    id: "internato",
    href: "/internato",
    title: "Internato MGF",
    description: "Acompanha o progresso do internato com uma grelha completa e guardada por utilizador.",
    icon: GraduationCap,
    accent: "from-sky-500/20 to-blue-500/5",
  },
  {
    id: "estatisticas",
    href: "/estatisticas",
    title: "Estatísticas",
    description: "Consultar progresso quando precisares de detalhe.",
    icon: BarChart3,
    accent: "from-indigo-500/20 to-violet-500/5",
  },
  {
    id: "perfil",
    href: "/perfil",
    title: "Perfil",
    description: "Gerir dados pessoais e definições da conta.",
    icon: UserRound,
    accent: "from-slate-500/20 to-zinc-500/5",
  },
] as const satisfies ReadonlyArray<{
  id: FeatureId;
  href: string;
  title: string;
  description: string;
  icon: typeof BookOpenCheck;
  accent: string;
}>;

function sanitizeFeatureIds(ids: string[] | null | undefined) {
  return (ids ?? []).filter(
    (id): id is FeatureId => FEATURE_CARDS.some((card) => card.id === id),
  );
}

function defaultFeatureOrder() {
  return FEATURE_CARDS.map((card) => card.id);
}

function sortFeatureCards(order: FeatureId[]) {
  const positions = new Map(order.map((id, index) => [id, index]));

  return [...FEATURE_CARDS].sort((a, b) => {
    const aIndex = positions.get(a.id);
    const bIndex = positions.get(b.id);

    if (aIndex === undefined && bIndex === undefined) {
      return FEATURE_CARDS.findIndex((item) => item.id === a.id) - FEATURE_CARDS.findIndex((item) => item.id === b.id);
    }

    if (aIndex === undefined) {
      return 1;
    }

    if (bIndex === undefined) {
      return -1;
    }

    return aIndex - bIndex;
  });
}

function moveItem(order: FeatureId[], draggedId: FeatureId, targetId: FeatureId) {
  if (draggedId === targetId) {
    return order;
  }

  const next = [...order];
  const fromIndex = next.indexOf(draggedId);
  const targetIndex = next.indexOf(targetId);

  if (fromIndex === -1 || targetIndex === -1) {
    return order;
  }

  next.splice(fromIndex, 1);
  next.splice(targetIndex, 0, draggedId);
  return next;
}

function FeatureCard({
  id,
  href,
  title,
  description,
  icon: Icon,
  accent,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
}: (typeof FEATURE_CARDS)[number] & {
  draggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLSpanElement>, id: FeatureId) => void;
  onDragOver?: (event: DragEvent<HTMLElement>, id: FeatureId) => void;
  onDrop?: (event: DragEvent<HTMLElement>, id: FeatureId) => void;
}) {
  const router = useRouter();

  return (
    <article
      onClick={() => router.push(href)}
      onDragOver={onDragOver ? (event) => onDragOver(event, id) : undefined}
      onDrop={onDrop ? (event) => onDrop(event, id) : undefined}
      className="group relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-foreground/30 hover:bg-card"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", accent)} />
      <div className="absolute inset-0 soft-grain opacity-20" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/75 shadow-sm">
          <Icon className="h-5 w-5 text-foreground" />
        </span>

        <div className="flex items-center gap-2">
          {draggable ? (
            <span
              draggable
              onDragStart={onDragStart ? (event) => onDragStart(event, id) : undefined}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              className="relative z-20 flex h-9 w-9 cursor-grab items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </span>
          ) : null}

          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
        </div>
      </div>
      <div className="relative z-10 mt-5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  );
}

export default function PainelPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nextEvents, setNextEvents] = useState<UserEvent[]>([]);
  const [sessions, setSessions] = useState<QuestionSession[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [featureOrder, setFeatureOrder] = useState<FeatureId[]>(defaultFeatureOrder);
  const [draggedFeatureId, setDraggedFeatureId] = useState<FeatureId | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

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

      setUserId(user.id);
      const now = new Date().toISOString();

      const [eventsResult, sessionsResult, preferencesResult] = await Promise.all([
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
        supabase
          .from("user_calculator_preferences")
          .select("dashboard_feature_order")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (eventsResult.error || sessionsResult.error || preferencesResult.error) {
        setErrorMsg("Não foi possível carregar o Painel.");
        setLoading(false);
        return;
      }

      setNextEvents((eventsResult.data ?? []) as UserEvent[]);
      setSessions((sessionsResult.data ?? []) as QuestionSession[]);
      const storedOrder = sanitizeFeatureIds(preferencesResult.data?.dashboard_feature_order);
      setFeatureOrder([
        ...storedOrder,
        ...defaultFeatureOrder().filter((id) => !storedOrder.includes(id)),
      ]);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const activeSessions = useMemo(
    () => sessions.filter((session) => session.status !== "completed").slice(0, 3),
    [sessions],
  );

  const orderedFeatureCards = useMemo(() => sortFeatureCards(featureOrder), [featureOrder]);

  async function persistFeatureOrder(nextOrder: FeatureId[]) {
    if (!userId) {
      return;
    }

    setSavingOrder(true);

    const supabase = createClient();
    const { error } = await supabase.from("user_calculator_preferences").upsert(
      {
        user_id: userId,
        dashboard_feature_order: nextOrder,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      setErrorMsg("Não foi possível guardar a ordem das funcionalidades do Painel.");
    }

    setSavingOrder(false);
  }

  function handleDragStart(_event: DragEvent<HTMLSpanElement>, id: FeatureId) {
    setDraggedFeatureId(id);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
  }

  function handleDrop(_event: DragEvent<HTMLElement>, targetId: FeatureId) {
    if (!draggedFeatureId) {
      return;
    }

    const nextOrder = moveItem(featureOrder, draggedFeatureId, targetId);
    setFeatureOrder(nextOrder);
    setDraggedFeatureId(null);
    void persistFeatureOrder(nextOrder);
  }

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="absolute inset-0 hero-surface opacity-70" />
      <div className="absolute inset-0 soft-grain opacity-25" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8">
        {loading ? (
          <PageLoadingView
            label="A carregar painel"
            detail="A preparar funcionalidades, sessões e próximos eventos antes de mostrar o Painel."
          />
        ) : (
          <>
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
            {savingOrder ? (
              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground">
                A guardar ordem...
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {orderedFeatureCards.map((card) => (
              <FeatureCard
                key={card.id}
                {...card}
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
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
                          ? ` · atualizado às ${format(parseISO(session.updated_at), "d MMM, HH:mm", {
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
          </>
        )}
      </div>
    </main>
  );
}
