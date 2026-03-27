"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Coffee, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

const donationOptions = [
  { amountCents: 300, label: "3 €", hint: "Café curto" },
  { amountCents: 500, label: "5 €", hint: "Café duplo" },
  { amountCents: 1000, label: "10 €", hint: "Pequeno apoio" },
  { amountCents: 2000, label: "20 €", hint: "Grande incentivo" },
] as const;

function BuyUsACoffeeContent() {
  const searchParams = useSearchParams();
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const paymentSuccess = searchParams.get("success") === "1";
  const paymentCancelled = searchParams.get("cancelled") === "1";

  async function handleCheckout() {
    setStatus("sending");
    setErrorMsg(null);

    const response = await fetch("/api/create-coffee-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amountCents: selectedAmount,
      }),
    });

    const data = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !data.url) {
      setErrorMsg(data.error ?? "Não foi possível iniciar o pagamento.");
      setStatus("idle");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="absolute inset-0 hero-surface opacity-70" />
      <div className="absolute inset-0 soft-grain opacity-25" />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/75 shadow-sm">
                <Coffee className="h-5 w-5 text-foreground" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Buy us a coffee
                </p>
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  Apoiar o MediFam
                </h1>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Se a plataforma te for útil no internato, no estudo ou na prática clínica, podes
              apoiar o seu desenvolvimento com um contributo simples via Stripe.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {donationOptions.map((option) => (
                <button
                  key={option.amountCents}
                  type="button"
                  onClick={() => setSelectedAmount(option.amountCents)}
                  className={cn(
                    "rounded-[1.5rem] border px-4 py-4 text-left transition-all",
                    selectedAmount === option.amountCents
                      ? "border-primary bg-primary/10 text-foreground shadow-sm"
                      : "border-border/70 bg-secondary/60 text-foreground hover:border-foreground/40",
                  )}
                >
                  <p className="text-base font-semibold">{option.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{option.hint}</p>
                </button>
              ))}
            </div>

            {errorMsg ? (
              <div className="mt-5 rounded-[1.5rem] border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-900">
                {errorMsg}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={status === "sending"}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
              >
                {status === "sending" ? "A abrir Stripe..." : "Continuar para pagamento"}
              </button>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border/70 px-5 text-sm font-semibold text-foreground transition hover:bg-secondary/80"
              >
                Agora não
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            {paymentSuccess ? (
              <div className="rounded-[2rem] border border-emerald-300/60 bg-emerald-50 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800">
                  Obrigado
                </p>
                <p className="mt-2 text-lg font-semibold text-emerald-950">
                  O teu apoio foi recebido com sucesso.
                </p>
              </div>
            ) : null}

            {paymentCancelled ? (
              <div className="rounded-[2rem] border border-amber-300/60 bg-amber-50 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-800">
                  Pagamento cancelado
                </p>
                <p className="mt-2 text-lg font-semibold text-amber-950">
                  Não foi feita qualquer cobrança.
                </p>
              </div>
            ) : null}

            <section className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <HeartHandshake className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Para quê este apoio
                </p>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>Ajuda a manter e melhorar as ferramentas clínicas, o banco de perguntas e os conteúdos da plataforma.</p>
                <p>É uma forma simples de apoiar o tempo investido no desenvolvimento contínuo do MediFam.</p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function BuyUsACoffeePage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
          <div className="absolute inset-0 hero-surface opacity-70" />
          <div className="absolute inset-0 soft-grain opacity-25" />
          <div className="relative mx-auto w-full max-w-5xl px-4 py-8">
            <div className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <p className="text-sm text-muted-foreground">A preparar página de apoio...</p>
            </div>
          </div>
        </main>
      }
    >
      <BuyUsACoffeeContent />
    </Suspense>
  );
}
