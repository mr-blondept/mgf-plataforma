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
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
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
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
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
  }, [currentMonth, notificacao]);

  function abrirFormulario(novaData: Date) {
    setSelectedDate(novaData);
    setFormTitle("");
    setFormDescription("");
    // Por UX, define como início=agora 09:00
    setFormStart(format(novaData, "yyyy-MM-dd'T'09:00"));
    setFormEnd("");
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
          <div className="flex items-center justify-between gap-2 mb-2">
            <button
              className="p-2 hover:bg-secondary/80 rounded-full transition"
              title="Mês anterior"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft />
            </button>
            <span className="font-semibold text-lg">
              {format(currentMonth, "MMMM yyyy", { locale: pt })}
            </span>
            <button
              className="p-2 hover:bg-secondary/80 rounded-full transition"
              title="Mês seguinte"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center mb-2">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="font-medium text-muted-foreground text-sm py-1">
                {d}
              </div>
            ))}
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin w-7 h-7 text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array(diasNoMes[0].getDay())
                .fill(null)
                .map((_, i) => (
                  <div key={"empty" + i} />
                ))}
              {diasNoMes.map((day, i) => {
                const dayKey = format(day, "yyyy-MM-dd");
                const eventosDia = eventosPorDia[dayKey];
                return (
                  <button
                    key={dayKey}
                    className={cn(
                      "aspect-square rounded-2xl flex flex-col items-center justify-start py-1 px-0.5 border border-border/70 transition group relative outline-none focus:ring-2 ring-offset-2",
                      isToday(day) && "border-primary ring-2 ring-primary/20",
                      isSameMonth(day, currentMonth)
                        ? "bg-card/70 hover:bg-secondary/80"
                        : "bg-muted/60 text-muted-foreground hover:bg-secondary/80 border-border/70"
                    )}
                    aria-label={format(day, "eeee, d MMMM yyyy", { locale: pt })}
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
                            className="rounded-full px-2 py-0.5 bg-secondary/80 text-foreground text-xs truncate w-16"
                          >
                            {ev.title}
                          </span>
                        ))}
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
            Eventos do mês <CalendarIcon className="w-4 h-4" />
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-12">
              <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground">Sem eventos neste mês.</p>
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
                      <span className="font-semibold text-primary">
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
                  <button
                    className="p-1 text-destructive hover:bg-destructive/10 rounded-full transition"
                    title="Eliminar evento"
                    aria-label="Eliminar evento"
                    onClick={() => handleDeleteEvento(ev.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
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
