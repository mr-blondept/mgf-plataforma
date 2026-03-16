// Calendário aprimorado com melhores práticas de UX, notificações e feedbacks visuais
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  startOfYear,
  endOfYear,
  isSameMonth,
  isSameDay,
  isToday,
  startOfDay,
  endOfDay,
  parseISO,
  isBefore,
  isAfter,
} from "date-fns";
import { pt } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  X,
  Trash2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserEvent = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  color: string | null;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const EVENT_COLORS = [
  { id: "sky", label: "Azul", value: "#38bdf8" },
  { id: "emerald", label: "Verde", value: "#34d399" },
  { id: "amber", label: "Âmbar", value: "#f59e0b" },
  { id: "rose", label: "Rosa", value: "#f43f5e" },
  { id: "violet", label: "Violeta", value: "#a78bfa" },
  { id: "slate", label: "Cinza", value: "#64748b" },
];

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `rgba(56, 189, 248, ${alpha})`;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isWeekend(day: Date) {
  const weekday = day.getDay();
  return weekday === 0 || weekday === 6;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getEasterDate(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getPortugueseHolidays(year: number) {
  const easter = getEasterDate(year);
  const fixed = [
    { date: new Date(year, 0, 1), name: "Ano Novo" },
    { date: new Date(year, 3, 25), name: "Liberdade" },
    { date: new Date(year, 4, 1), name: "Dia do Trabalhador" },
    { date: new Date(year, 5, 10), name: "Dia de Portugal" },
    { date: new Date(year, 7, 15), name: "Assunção de Nossa Senhora" },
    { date: new Date(year, 9, 5), name: "Implantação da República" },
    { date: new Date(year, 10, 1), name: "Todos os Santos" },
    { date: new Date(year, 11, 1), name: "Restauração da Independência" },
    { date: new Date(year, 11, 8), name: "Imaculada Conceição" },
    { date: new Date(year, 11, 25), name: "Natal" },
  ];
  const movable = [
    { date: addDays(easter, -47), name: "Carnaval" },
    { date: addDays(easter, -2), name: "Sexta-Feira Santa" },
    { date: easter, name: "Páscoa" },
    { date: addDays(easter, 60), name: "Corpo de Deus" },
  ];
  return [...fixed, ...movable];
}

function getHolidayName(day: Date) {
  const holidays = getPortugueseHolidays(day.getFullYear());
  const match = holidays.find((holiday) => isSameDay(day, holiday.date));
  return match?.name ?? null;
}

function buildDayTitle(day: Date, eventosDia: UserEvent[]) {
  const base = format(day, "eeee, d MMMM yyyy", { locale: pt });
  const holiday = getHolidayName(day);
  if (eventosDia.length === 0) return base;
  const titles = eventosDia.map((ev) => ev.title).join(" · ");
  if (holiday) {
    return `${base} — ${holiday} — ${titles}`;
  }
  return `${base} — ${titles}`;
}

function Notificacao({
  mensagem,
  tipo = "success",
  onFechar,
}: {
  mensagem: string;
  tipo?: "success" | "error";
  onFechar: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed right-4 top-4 z-50 px-4 py-2 rounded-2xl border border-border/70 bg-card/80 shadow-lg backdrop-blur flex items-center gap-2 transition-all animate-fade-in",
        tipo === "success"
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive"
      )}
      role="alert"
    >
      <span>
        {tipo === "success" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <X className="w-5 h-5" />
        )}
      </span>
      <span>{mensagem}</span>
      <button
        onClick={onFechar}
        className="ml-2 p-1 rounded hover:bg-muted transition"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"year" | "month">("year");
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formColor, setFormColor] = useState(EVENT_COLORS[0].value);
  const [customColor, setCustomColor] = useState(EVENT_COLORS[0].value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificacao, setNotificacao] = useState<{ msg: string; tipo: "success" | "error" } | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);

  // Corrige: Não fazer createClient fora do efeito, evita problema com hydration e causa problemas de duplicidade
  // Corrige: Busca user autenticado antes de buscar eventos, senão pega eventos sem filtro por user 
  useEffect(() => {
    setLoading(true);

    const fetchEvents = async () => {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        // Se não estiver autenticado, redireciona para login
        window.location.href = "/auth";
        return;
      }
      const start = viewMode === "year" ? startOfYear(currentMonth) : startOfMonth(currentMonth);
      const end = viewMode === "year" ? endOfYear(currentMonth) : endOfMonth(currentMonth);
      const { data, error } = await supabase
        .from("user_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_at", start.toISOString())
        .lte("start_at", end.toISOString())
        .order("start_at", { ascending: true });

      if (error) {
        setError("Erro ao carregar os eventos.");
        setEvents([]);
      } else {
        setEvents(data || []);
        setError(null);
      }
      setLoading(false);
    };

    fetchEvents();
    // Removido "supabase" de deps para evitar bug: createClient é sempre novo
  }, [currentMonth, notificacao, viewMode]);

  function abrirFormulario(novaData: Date) {
    setSelectedDate(novaData);
    setFormTitle("");
    setFormDescription("");
    // Por UX, define como início=agora 09:00
    setFormStart(format(novaData, "yyyy-MM-dd'T'09:00"));
    setFormEnd("");
    setFormColor(EVENT_COLORS[0].value);
    setCustomColor(EVENT_COLORS[0].value);
    setShowForm(true);
    setError(null);
    setTimeout(() => {
      formRef.current?.querySelector("input")?.focus();
    }, 150);
  }

  function fecharFormulario() {
    setShowForm(false);
    setSelectedDate(null);
    setError(null);
  }

  async function handleSalvarEvento(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) {
      setError("Por favor, insira um título");
      return;
    }
    if (!formStart) {
      setError("Por favor, defina a data/hora de início.");
      return;
    }
    if (formEnd && formStart && isAfter(new Date(formStart), new Date(formEnd))) {
      setError("A data de fim deve ser posterior ao início.");
      return;
    }

    setSaving(true);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      setError("Precisa estar autenticado para criar eventos.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("user_events").insert([
      {
        user_id: user.id,
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        start_at: new Date(formStart).toISOString(),
        end_at: formEnd ? new Date(formEnd).toISOString() : null,
        color: formColor || null,
      },
    ]);

    setSaving(false);

    if (error) {
      setError("Não foi possível adicionar o evento. Tente novamente.");
      setNotificacao({ msg: "Erro ao adicionar evento", tipo: "error" });
    } else {
      setNotificacao({ msg: "Evento adicionado!", tipo: "success" });
      setShowForm(false);
      setFormTitle("");
      setFormDescription("");
      setFormStart("");
      setFormEnd("");
      setFormColor(EVENT_COLORS[0].value);
      setCustomColor(EVENT_COLORS[0].value);
      setSelectedDate(null);
      setError(null);
    }
  }

  async function handleDeleteEvento(id: string) {
    if (!confirm("Tem a certeza que deseja eliminar este evento?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("user_events").delete().eq("id", id);
    if (error) {
      setNotificacao({ msg: "Erro ao eliminar evento", tipo: "error" });
    } else {
      setNotificacao({ msg: "Evento eliminado!", tipo: "success" });
    }
  }

  async function handleEditarCorEvento(id: string, color: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("user_events")
      .update({ color })
      .eq("id", id);
    if (error) {
      setNotificacao({ msg: "Erro ao atualizar cor", tipo: "error" });
    } else {
      setNotificacao({ msg: "Cor atualizada!", tipo: "success" });
    }
  }

  const diasNoMes = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const eventosPorDia = diasNoMes.reduce<Record<string, UserEvent[]>>((map, day) => {
    const key = format(day, "yyyy-MM-dd");
    map[key] = [];
    return map;
  }, {});

  events.forEach(ev => {
    const key = format(parseISO(ev.start_at), "yyyy-MM-dd");
    if (eventosPorDia[key]) eventosPorDia[key].push(ev);
  });

  const coresPorDia = events.reduce<Record<string, string[]>>((map, ev) => {
    const key = format(parseISO(ev.start_at), "yyyy-MM-dd");
    if (!map[key]) map[key] = [];
    if (ev.color) map[key].push(ev.color);
    return map;
  }, {});

  const coresEmUso = Array.from(
    new Set(events.map((ev) => ev.color).filter(Boolean))
  ) as string[];

  const yearMonths = Array.from({ length: 12 }, (_, index) =>
    new Date(currentMonth.getFullYear(), index, 1)
  );

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="relative mx-auto max-w-3xl px-4 py-6">
        <h1 className="font-bold text-2xl mb-2 flex items-center gap-2">
          <CalendarIcon className="w-7 h-7 text-primary" />
          Calendário
        </h1>

        {notificacao && (
          <Notificacao
            mensagem={notificacao.msg}
            tipo={notificacao.tipo}
            onFechar={() => setNotificacao(null)}
          />
        )}

        <section className="bg-card/80 rounded-3xl border border-border/70 shadow-md backdrop-blur p-5 mb-8">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-secondary/80 rounded-full transition"
                title={viewMode === "year" ? "Ano anterior" : "Mês anterior"}
                onClick={() =>
                  setCurrentMonth(
                    viewMode === "year" ? subMonths(currentMonth, 12) : subMonths(currentMonth, 1)
                  )
                }
              >
                <ChevronLeft />
              </button>
              <span className="font-semibold text-lg">
                {viewMode === "year"
                  ? format(currentMonth, "yyyy")
                  : format(currentMonth, "MMMM yyyy", { locale: pt })}
              </span>
              <button
                className="p-2 hover:bg-secondary/80 rounded-full transition"
                title={viewMode === "year" ? "Ano seguinte" : "Mês seguinte"}
                onClick={() =>
                  setCurrentMonth(
                    viewMode === "year" ? addMonths(currentMonth, 12) : addMonths(currentMonth, 1)
                  )
                }
              >
                <ChevronRight />
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-secondary/60 p-1">
              <button
                type="button"
                onClick={() => setViewMode("year")}
                className={cn(
                  "rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition",
                  viewMode === "year"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Ano
              </button>
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={cn(
                  "rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition",
                  viewMode === "month"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Mês
              </button>
            </div>
          </div>

          {coresEmUso.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="uppercase tracking-[0.25em]">Legenda</span>
              {coresEmUso.map((color) => {
                const label =
                  EVENT_COLORS.find((item) => item.value === color)?.label ??
                  "Personalizada";
                return (
                  <span
                    key={color}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-[0.2rem]"
                      style={{ backgroundColor: color }}
                    />
                    {label}
                  </span>
                );
              })}
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1">
                <span className="h-2.5 w-2.5 rounded-[0.2rem] border border-primary/60" />
                Feriado
              </span>
            </div>
          )}

          {viewMode === "year" ? (
            loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="animate-spin w-7 h-7 text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {yearMonths.map((month) => {
                  const daysInMonth = eachDayOfInterval({
                    start: startOfMonth(month),
                    end: endOfMonth(month),
                  });
                  return (
                    <div
                      key={format(month, "yyyy-MM")}
                      className="rounded-2xl border border-border/70 bg-card/70 p-4 text-left transition hover:border-foreground/40 hover:bg-secondary/70"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentMonth(month);
                          setViewMode("month");
                        }}
                        className="flex w-full items-center justify-between"
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {format(month, "MMMM", { locale: pt })}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          Ver mês
                        </span>
                      </button>
                      <div className="mt-3 grid grid-cols-7 text-center">
                        {WEEKDAYS.map((d, i) => (
                          <div
                            key={`${format(month, "yyyy-MM")}-wd-${i}`}
                            className="text-[10px] text-muted-foreground py-0.5"
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                      <div className="mt-1 grid grid-cols-7 gap-1 text-center">
                        {Array(daysInMonth[0].getDay())
                          .fill(null)
                          .map((_, i) => (
                            <div key={`empty-${format(month, "yyyy-MM")}-${i}`} />
                          ))}
                        {daysInMonth.map((day) => {
                          const dayKey = format(day, "yyyy-MM-dd");
                          const eventosDia = eventosPorDia[dayKey] ?? [];
                          const dayColors = coresPorDia[dayKey] ?? [];
                          const dayColor = dayColors[0];
                          const holidayName = getHolidayName(day);
                          return (
                            <button
                              key={dayKey}
                              type="button"
                              onClick={() => {
                                setCurrentMonth(month);
                                setViewMode("month");
                                abrirFormulario(day);
                              }}
                              className={cn(
                                "h-7 w-7 sm:h-8 sm:w-8 rounded-lg border border-border/70 text-[10px] sm:text-[11px] font-medium transition",
                                isToday(day) && "border-primary text-primary",
                                isWeekend(day) && "border-accent/40",
                                holidayName && "border-primary/60 text-primary",
                                isSameMonth(day, month)
                                  ? "bg-card/70 hover:bg-secondary/80"
                                  : "bg-muted/60 text-muted-foreground"
                              )}
                              style={
                                dayColor
                                  ? { backgroundColor: hexToRgba(dayColor, 0.12) }
                                  : undefined
                              }
                              title={
                                holidayName
                                  ? `${buildDayTitle(day, eventosDia)}`
                                  : buildDayTitle(day, eventosDia)
                              }
                            >
                              {format(day, "d")}
                              {eventosDia.length > 0 && (
                                <span className="mt-0.5 flex items-center justify-center gap-0.5">
                                  {dayColors.slice(0, 3).map((color, idx) => (
                                    <span
                                      key={`${dayKey}-sq-${idx}`}
                                      className="h-1.5 w-1.5 rounded-[0.15rem]"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin w-7 h-7 text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 text-center mb-2">
                {WEEKDAYS.map((d, i) => (
                  <div key={i} className="font-medium text-muted-foreground text-sm py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array(diasNoMes[0].getDay())
                  .fill(null)
                  .map((_, i) => (
                    <div key={"empty" + i} />
                  ))}
                {diasNoMes.map((day) => {
                  const dayKey = format(day, "yyyy-MM-dd");
                  const eventosDia = eventosPorDia[dayKey];
                  const dayColors = coresPorDia[dayKey] ?? [];
                  const dayColor = dayColors[0];
                  const holidayName = getHolidayName(day);
                  return (
                    <button
                      key={dayKey}
                      className={cn(
                        "aspect-square rounded-2xl flex flex-col items-center justify-start py-1 px-0.5 border border-border/70 transition group relative outline-none focus:ring-2 ring-offset-2",
                        isToday(day) && "border-primary ring-2 ring-primary/20",
                        isWeekend(day) && "border-accent/40",
                        holidayName && "border-primary/60 text-primary",
                        isSameMonth(day, currentMonth)
                          ? "bg-card/70 hover:bg-secondary/80"
                          : "bg-muted/60 text-muted-foreground hover:bg-secondary/80 border-border/70"
                      )}
                      style={
                        dayColor
                          ? { backgroundColor: hexToRgba(dayColor, 0.12) }
                          : undefined
                      }
                      aria-label={
                        holidayName
                          ? `${buildDayTitle(day, eventosDia)}`
                          : buildDayTitle(day, eventosDia)
                      }
                      onClick={() => abrirFormulario(day)}
                      tabIndex={0}
                    >
                      <span
                        className={cn(
                          "font-medium text-base mb-1",
                          isToday(day) && "text-primary"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      <div className="flex flex-col items-center gap-0.5">
                        {eventosDia.length > 0 &&
                          eventosDia.slice(0, 2).map((ev) => (
                            <span
                              title={ev.title}
                              key={ev.id}
                              className="rounded-full px-2 py-0.5 text-xs truncate w-16 text-white"
                              style={{
                                backgroundColor: ev.color ?? "var(--primary)",
                              }}
                            >
                              {ev.title}
                            </span>
                          ))}
                        {eventosDia.length > 0 && dayColors.length > 1 && (
                          <div className="mt-1 flex items-center gap-1">
                            {dayColors.slice(0, 4).map((color, idx) => (
                              <span
                                key={`${dayKey}-pill-${idx}`}
                                className="h-1.5 w-1.5 rounded-[0.15rem]"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        )}
                        {eventosDia.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{eventosDia.length - 2} mais
                          </span>
                        )}
                      </div>
                      <span className="sr-only">
                        {eventosDia.length === 1
                          ? "1 evento"
                          : eventosDia.length > 1
                          ? `${eventosDia.length} eventos`
                          : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          <button
            className="mt-4 flex gap-2 items-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] hover:bg-primary/90 transition shadow"
            onClick={() => abrirFormulario(new Date())}
          >
            <Plus className="w-4 h-4" />
            Adicionar Evento
          </button>
        </section>

      {/* Lista detalhada dos eventos do mês */}
        <section>
          <h2 className="font-semibold text-lg mt-6 mb-3 flex items-center gap-2">
            {viewMode === "year" ? "Eventos do ano" : "Eventos do mês"}{" "}
            <CalendarIcon className="w-4 h-4" />
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-12">
              <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground">
              {viewMode === "year" ? "Sem eventos neste ano." : "Sem eventos neste mês."}
            </p>
          ) : (
            <ul className="space-y-4">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className={cn(
                    "bg-card/80 rounded-2xl border border-border/70 px-4 py-2 flex justify-between items-center shadow-sm backdrop-blur",
                    isBefore(parseISO(ev.start_at), new Date()) && "opacity-70"
                  )}
                >
                  <div>
                    <div className="flex gap-2 items-center">
                      <span className="inline-flex items-center gap-2 font-semibold text-primary">
                        <span
                          className="h-2.5 w-2.5 rounded-[0.2rem]"
                          style={{
                            backgroundColor: ev.color ?? "var(--primary)",
                          }}
                        />
                        {format(parseISO(ev.start_at), "dd/MM, HH:mm", { locale: pt })}
                      </span>
                      <span className="text-base">{ev.title}</span>
                    </div>
                    {ev.description && (
                      <div className="text-muted-foreground text-sm mt-0.5">
                        {ev.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={ev.color ?? EVENT_COLORS[0].value}
                      onChange={(e) => handleEditarCorEvento(ev.id, e.target.value)}
                      className="h-9 w-10 rounded-lg border border-border/70 bg-card/70 p-1"
                      aria-label="Alterar cor do evento"
                    />
                    <button
                      className="p-1 text-destructive hover:bg-destructive/10 rounded-full transition"
                      title="Eliminar evento"
                      aria-label="Eliminar evento"
                      onClick={() => handleDeleteEvento(ev.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

      {/* Modal formulário adicionar evento */}
      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center animate-fade-in">
          <form
            ref={formRef}
            onSubmit={handleSalvarEvento}
            className="bg-card/80 rounded-3xl p-6 shadow-xl w-full max-w-md animate-fade-in flex flex-col gap-3 border border-border/70 backdrop-blur relative"
          >
            <button
              type="button"
              className="absolute right-2 top-2 p-1 rounded-full hover:bg-secondary/80 text-muted-foreground"
              onClick={fecharFormulario}
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-1">
              Adicionar evento em{" "}
              {selectedDate && format(selectedDate, "dd/MM/yyyy", { locale: pt })}
            </h3>
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-2xl px-3 py-2 text-sm">{error}</div>
            )}
            <label className="flex flex-col gap-1">
              <span className="font-medium">Título *</span>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="border border-input rounded-xl p-2 bg-background/70 focus:ring-2 ring-ring/30"
                required
                maxLength={80}
                placeholder="Título do evento"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Descrição</span>
              <textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                className="border border-input rounded-xl p-2 min-h-[60px] bg-background/70 focus:ring-2 ring-ring/30"
                maxLength={200}
                placeholder="Descrição (opcional)"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Cor do evento</span>
              <div className="grid grid-cols-3 gap-2">
                {EVENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setFormColor(color.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-xs font-semibold transition",
                      formColor === color.value
                        ? "bg-secondary/80 text-foreground"
                        : "bg-card/70 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-[0.2rem]"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setFormColor(e.target.value);
                  }}
                  className="h-10 w-12 rounded-lg border border-border/70 bg-card/70 p-1"
                  aria-label="Escolher cor personalizada"
                />
                <button
                  type="button"
                  onClick={() => setFormColor(customColor)}
                  className={cn(
                    "rounded-full border border-border/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] transition",
                    formColor === customColor
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                  )}
                >
                  Cor personalizada
                </button>
              </div>
            </label>
            <div className="flex gap-2">
              <label className="flex-1 flex flex-col gap-1">
                <span className="font-medium">Início *</span>
                <input
                  type="datetime-local"
                  value={formStart}
                  onChange={e => setFormStart(e.target.value)}
                  className="border border-input rounded-xl p-2 bg-background/70"
                  required
                />
              </label>
              <label className="flex-1 flex flex-col gap-1">
                <span className="font-medium">Fim</span>
                <input
                  type="datetime-local"
                  value={formEnd}
                  onChange={e => setFormEnd(e.target.value)}
                  className="border border-input rounded-xl p-2 bg-background/70"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-[0.3em] hover:bg-primary/90 transition",
                saving && "opacity-75 cursor-not-allowed"
              )}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A guardar...
                </span>
              ) : (
                "Guardar evento"
              )}
            </button>
          </form>
        </div>
      )}
      </div>
    </main>
  );
}
