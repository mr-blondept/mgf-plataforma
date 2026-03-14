"use client";

import { useDeferredValue, useMemo, useState } from "react";
import icpc2Data from "@/data/icpc2.json";
import { cn } from "@/lib/utils";

type ICPC2Entry = {
  code: string;
  title: string;
  details?: string | null;
  is_standard_procedure?: boolean | null;
};

const RAW_ITEMS = icpc2Data as ICPC2Entry[];
const COMPONENTS = [
  { id: "Todos", label: "Todos" },
  { id: "1", label: "1 · Sintomas/queixas (01–29)" },
  { id: "2", label: "2 · Diagnóstico/triagem/prevenção (30–49)" },
  { id: "3", label: "3 · Tratamento/procedimentos (50–59)" },
  { id: "4", label: "4 · Resultados de exames (60–61)" },
  { id: "5", label: "5 · Administrativo (62)" },
  { id: "6", label: "6 · Encaminhamentos/outros (63–69)" },
  { id: "7", label: "7 · Diagnósticos/doenças (70–99)" },
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getChapter(code: string) {
  return code.slice(0, 1).toUpperCase();
}

function getComponent(code: string) {
  const digits = code.slice(1);
  const number = Number.parseInt(digits, 10);
  if (Number.isNaN(number)) return null;
  if (number >= 1 && number <= 29) return "1";
  if (number >= 30 && number <= 49) return "2";
  if (number >= 50 && number <= 59) return "3";
  if (number >= 60 && number <= 61) return "4";
  if (number === 62) return "5";
  if (number >= 63 && number <= 69) return "6";
  if (number >= 70 && number <= 99) return "7";
  return null;
}

export default function ICPC2Page() {
  const [query, setQuery] = useState("");
  const [chapterFilter, setChapterFilter] = useState("Todos");
  const [componentFilter, setComponentFilter] = useState("Todos");
  const deferredQuery = useDeferredValue(query);

  const chapters = useMemo(() => {
    const set = new Set(RAW_ITEMS.map((item) => getChapter(item.code)));
    return ["Todos", ...Array.from(set).sort()];
  }, []);

  const indexedItems = useMemo(
    () =>
      RAW_ITEMS.map((item) => {
        const normalizedCode = normalizeText(item.code.replace(/\s+/g, ""));
        const normalizedTitle = normalizeText(item.title);
        const normalizedDetails = normalizeText(item.details ?? "");
        return {
          ...item,
          chapter: getChapter(item.code),
          component: getComponent(item.code),
          normalized: `${normalizedCode} ${normalizedTitle} ${normalizedDetails}`.trim(),
          normalizedCode,
        };
      }),
    []
  );

  const queryTerms = useMemo(() => {
    const q = normalizeText(deferredQuery);
    return q === "" ? [] : q.split(" ").filter(Boolean);
  }, [deferredQuery]);

  const filtered = useMemo(() => {
    const looksLikeCode = (term: string) =>
      /^[a-z]\d{1,3}$/i.test(term) || /^[a-z]\d{1,3}[a-z]?$/i.test(term);

    return indexedItems.filter((item) => {
      if (chapterFilter !== "Todos" && item.chapter !== chapterFilter) {
        return false;
      }
      if (componentFilter !== "Todos" && item.component !== componentFilter) {
        return false;
      }

      if (queryTerms.length === 0) return true;

      return queryTerms.every((term) => {
        if (looksLikeCode(term)) {
          return item.normalizedCode.startsWith(term);
        }
        return item.normalized.includes(term);
      });
    });
  }, [chapterFilter, componentFilter, indexedItems, queryTerms]);

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)]">
      <div className="absolute inset-0 hero-surface" />
      <div className="absolute inset-0 soft-grain opacity-40" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
        <section className="overflow-hidden rounded-3xl border border-border bg-card/85 shadow-md">
          <div className="relative p-6">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/20 to-transparent" />
            <div className="relative flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-border/70 bg-card/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                  ICPC-2
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Versão portuguesa
                </span>
              </div>
              <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
                Códigos e explicações clínicas
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Pesquisa inteligente por código, capítulo, componente e texto
                clínico. Ideal para revisão rápida e navegação estruturada.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-card/90 px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Total
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {RAW_ITEMS.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/90 px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Filtrados
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {filtered.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/90 px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Capítulos
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {chapters.length - 1}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border/70 bg-background/70 p-6">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-sm">
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Pesquisa
                </label>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ex: P73, depressao, cefaleia, ansiedade..."
                  className="mt-2 w-full rounded-xl border border-border bg-background/80 px-4 py-2 text-sm text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-sm">
                  <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Capítulo
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {chapters.map((chapter) => {
                      const isActive = chapter === chapterFilter;
                      return (
                        <button
                          key={chapter}
                          type="button"
                          onClick={() => setChapterFilter(chapter)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold transition",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "border border-border bg-background/80 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          {chapter}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-sm">
                  <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Componente
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COMPONENTS.map((component) => {
                      const isActive = component.id === componentFilter;
                      return (
                        <button
                          key={component.id}
                          type="button"
                          onClick={() => setComponentFilter(component.id)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold transition",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "border border-border bg-background/80 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          {component.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
              </p>
              {(query ||
                chapterFilter !== "Todos" ||
                componentFilter !== "Todos") && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setChapterFilter("Todos");
                    setComponentFilter("Todos");
                  }}
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {filtered.map((item, index) => (
            <article
              key={`${item.code}-${item.title}-${index}`}
              className="group rounded-3xl border border-border bg-card/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  {item.code}
                </span>
                <h2 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h2>
                {item.is_standard_procedure && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Procedimento padrão
                  </span>
                )}
              </div>
              {item.details && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {item.details}
                </p>
              )}
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full rounded-3xl border border-border bg-card/90 p-6 text-center text-sm text-muted-foreground">
              Nenhum código encontrado. Experimente outro termo de pesquisa.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
