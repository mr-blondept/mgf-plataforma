"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import icpc2Data from "@/data/icpc2.json";

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

function highlightText(text: string, terms: string[]) {
  if (!text || terms.length === 0) return text;

  const escapedTerms = terms
    .map((term) => term.trim())
    .filter((term) => term.length > 1)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (escapedTerms.length === 0) return text;

  const matcher = new RegExp(`(${escapedTerms.join("|")})`, "gi");
  const parts = text.split(matcher);

  return parts.map((part, index) => {
    const isMatch = escapedTerms.some((term) =>
      new RegExp(`^${term}$`, "i").test(part)
    );

    return isMatch ? (
      <mark
        key={`${part}-${index}`}
        className="rounded bg-primary/20 px-1 text-foreground"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    );
  });
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

  const hasFilters =
    query.trim() !== "" || chapterFilter !== "Todos" || componentFilter !== "Todos";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            ICPC-2
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Códigos e explicações (versão portuguesa)
          </h1>
          <p className="text-sm text-muted-foreground">
            Pesquisa rápida por código, título ou critérios. Use o filtro por
            capítulo para navegar mais depressa.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Pesquisa
              </label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ex: P73, depressão, cefaleia, ansiedade..."
                  className="w-full rounded-xl border border-border bg-card/80 py-2 pl-9 pr-4 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Dica: pode pesquisar por código (ex: P73) ou por palavras-chave.
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-border bg-background/80 px-4 py-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Capítulo
                </label>
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Componente
                </label>
                <select
                  value={chapterFilter}
                  onChange={(event) => setChapterFilter(event.target.value)}
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none"
                >
                  {chapters.map((chapter) => (
                    <option key={chapter} value={chapter}>
                      {chapter === "Todos" ? "Todos os capítulos" : `Capítulo ${chapter}`}
                    </option>
                  ))}
                </select>

                <select
                  value={componentFilter}
                  onChange={(event) => setComponentFilter(event.target.value)}
                  className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none"
                >
                  {COMPONENTS.map((component) => (
                    <option key={component.id} value={component.id}>
                      {component.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
          </p>
          {hasFilters && (
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
      </section>

      <section className="mt-6 grid gap-4">
        {filtered.map((item, index) => (
          <article
            key={`${item.code}-${item.title}-${index}`}
            className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm transition hover:border-primary/40"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {item.code}
              </span>
              <h2 className="text-lg font-semibold text-foreground">
                {highlightText(item.title, queryTerms)}
              </h2>
              {item.is_standard_procedure && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Procedimento padrão
                </span>
              )}
            </div>
            {item.details && (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {highlightText(item.details, queryTerms)}
              </p>
            )}
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-border bg-card/90 p-6 text-center text-sm text-muted-foreground">
            Nenhum código encontrado. Experimente outro termo de pesquisa.
          </div>
        )}
      </section>
    </main>
  );
}
