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
const PAGE_SIZES = [12, 24, 48];

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
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


  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, filtered.length);
  const paginatedItems = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filtered, pageSize]
  );

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="absolute inset-0 hero-surface" />
      <div className="absolute inset-0 soft-grain opacity-30" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-8">
        <section className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-md backdrop-blur">
          <div className="relative p-6">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/20 to-transparent" />
            <div className="relative flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-border/70 bg-secondary/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  ICPC-2
                </span>
                <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-semibold text-foreground">
                  Versão portuguesa
                </span>
              </div>
              <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
                Códigos e explicações clínicas
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Pesquisa inteligente por código, capítulo, componente e texto
                clínico. A navegação foi reorganizada para manter filtros e
                resultados lado a lado.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Total
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {RAW_ITEMS.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Filtrados
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {filtered.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Página atual
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {currentPage}/{totalPages}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
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
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur xl:sticky xl:top-24 xl:self-start">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Filtros
                </p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">
                  Pesquisa e navegação
                </h2>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <div className="xl:col-span-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Pesquisa
                    </label>
                    <input
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Ex: P73, depressao, cefaleia, ansiedade..."
                      className="mt-3 w-full rounded-2xl border border-border/70 bg-background/90 px-4 py-3 text-base text-foreground shadow-sm transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Capítulo
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chapters.map((chapter) => {
                        const isActive = chapter === chapterFilter;
                        return (
                          <button
                            key={chapter}
                            type="button"
                            onClick={() => {
                              setChapterFilter(chapter);
                              setPage(1);
                            }}
                            className={cn(
                              "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] transition",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "border border-border/70 bg-secondary/70 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                            )}
                          >
                            {chapter}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Componente
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {COMPONENTS.map((component) => {
                        const isActive = component.id === componentFilter;
                        return (
                          <button
                            key={component.id}
                            type="button"
                            onClick={() => {
                              setComponentFilter(component.id);
                              setPage(1);
                            }}
                            className={cn(
                              "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "border border-border/70 bg-secondary/70 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                            )}
                          >
                            {component.id === "Todos" ? component.label : component.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Itens por página
                  </label>
                  {(query ||
                    chapterFilter !== "Todos" ||
                    componentFilter !== "Todos") && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setChapterFilter("Todos");
                        setComponentFilter("Todos");
                        setPage(1);
                      }}
                      className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Limpar
                    </button>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  {PAGE_SIZES.map((size) => {
                    const isActive = size === pageSize;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setPageSize(size);
                          setPage(1);
                        }}
                        className={cn(
                          "flex-1 rounded-2xl px-3 py-2 text-sm font-semibold transition",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "border border-border/70 bg-background/80 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="rounded-3xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-muted-foreground">
                  A mostrar <span className="font-semibold text-foreground">{pageStart}</span>
                  {pageEnd > 0 ? `–${pageEnd}` : ""} de{" "}
                  <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                  resultado{filtered.length === 1 ? "" : "s"}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="text-sm font-medium text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Seguinte
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {paginatedItems.map((item, index) => (
                <article
                  key={`${item.code}-${item.title}-${index}`}
                  className="group rounded-3xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                          {item.code}
                        </span>
                        <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                          Capítulo {item.chapter}
                        </span>
                        {item.component && (
                          <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                            Componente {item.component}
                          </span>
                        )}
                        {item.is_standard_procedure && (
                          <span className="rounded-full border border-border/70 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            Procedimento padrão
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 text-lg font-semibold leading-tight text-foreground">
                        {item.title}
                      </h2>
                    </div>
                  </div>
                  {item.details ? (
                    <p className="mt-4 line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {item.details}
                    </p>
                  ) : (
                    <p className="mt-4 text-sm italic text-muted-foreground">
                      Sem detalhe adicional disponível neste código.
                    </p>
                  )}
                </article>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full rounded-3xl border border-border/70 bg-card/80 p-6 text-center text-sm text-muted-foreground">
                  Nenhum código encontrado. Experimente outro termo de pesquisa.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
