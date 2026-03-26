"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Mail, TriangleAlert, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FooterModalKey = "about" | "join" | "report" | null;

const modalContent = {
  about: {
    icon: Users,
    eyebrow: "Sobre",
    title: "MediFam",
    body:
      "Plataforma focada em apoiar o estudo, a organização e a prática diária em Medicina Geral e Familiar.",
    ctaLabel: "Fechar",
  },
  join: {
    icon: Mail,
    eyebrow: "Junta-te a nós",
    title: "Queres colaborar?",
    body:
      "Se quiseres contribuir com ideias, conteúdos ou feedback, entra em contacto connosco para avaliarmos novas colaborações.",
    ctaLabel: "Percebi",
  },
  report: {
    icon: TriangleAlert,
    eyebrow: "Reporta um erro",
    title: "Encontraste um problema?",
    body:
      "Envia uma descrição breve do que aconteceu, em que página estavas e, se possível, os passos para reproduzir o erro.",
    ctaLabel: "Fechar",
  },
} as const;

export default function AppFooter() {
  const [activeModal, setActiveModal] = useState<FooterModalKey>(null);
  const [reportMessage, setReportMessage] = useState("");
  const [reportStatus, setReportStatus] = useState<"idle" | "sending" | "sent">(
    "idle"
  );
  const [reportError, setReportError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!activeModal) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeModal]);

  const currentModal = activeModal ? modalContent[activeModal] : null;

  function openModal(modal: FooterModalKey) {
    setActiveModal(modal);
    setReportMessage("");
    setReportError(null);
    setReportStatus("idle");
  }

  function closeModal() {
    setActiveModal(null);
    setReportMessage("");
    setReportError(null);
    setReportStatus("idle");
  }

  async function handleSubmitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setReportStatus("sending");
    setReportError(null);

    const response = await fetch("/api/report-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: reportMessage,
        pathname,
      }),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setReportError(data.error ?? "Não foi possível enviar o reporte.");
      setReportStatus("idle");
      return;
    }

    setReportStatus("sent");
    setReportMessage("");
  }

  return (
    <>
      <footer className="border-t border-border/70 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground/80">
            MediFam
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:justify-end">
            <button
              type="button"
              onClick={() => openModal("about")}
              className="transition-colors hover:text-foreground"
            >
              Sobre
            </button>
            <button
              type="button"
              onClick={() => openModal("join")}
              className="transition-colors hover:text-foreground"
            >
              Junta-te a nós
            </button>
            <button
              type="button"
              onClick={() => openModal("report")}
              className="transition-colors hover:text-foreground"
            >
              Reporta um erro
            </button>
          </div>
        </div>
      </footer>

      {currentModal ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8">
          <button
            type="button"
            aria-label="Fechar modal"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-border/70 bg-background p-6 shadow-2xl sm:p-7">
            <button
              type="button"
              aria-label="Fechar"
              onClick={closeModal}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/60 text-foreground transition hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <currentModal.icon className="h-5 w-5" />
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {currentModal.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
              {currentModal.title}
            </h2>
            {activeModal === "report" ? (
              <form className="mt-4 space-y-4" onSubmit={handleSubmitReport}>
                <p className="text-sm leading-6 text-muted-foreground">
                  {currentModal.body}
                </p>
                <textarea
                  value={reportMessage}
                  onChange={(event) => setReportMessage(event.target.value)}
                  placeholder="Descreve o problema que encontraste..."
                  rows={6}
                  className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                  minLength={10}
                />
                {reportError ? (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {reportError}
                  </div>
                ) : null}
                {reportStatus === "sent" ? (
                  <div className="rounded-xl border border-emerald-300/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    Reporte enviado com sucesso.
                  </div>
                ) : null}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={reportStatus === "sending"}
                    className={cn(
                      "inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
                    )}
                  >
                    {reportStatus === "sending" ? "A enviar..." : "Enviar"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-border/70 px-5 text-sm font-semibold text-foreground transition hover:bg-secondary/80"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {currentModal.body}
                </p>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={cn(
                      "inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    )}
                  >
                    {currentModal.ctaLabel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
