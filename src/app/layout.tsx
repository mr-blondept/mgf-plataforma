import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AppHeader from "@/components/AppHeader";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediFam - Plataforma de estudo",
  description:
    "MediFam reúne banco de perguntas, estatísticas e ferramentas para Medicina Geral e Familiar.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const unsupportedBrowserScript = `
    (function () {
      var ua = window.navigator.userAgent;
      var isInternetExplorer = /MSIE|Trident\\//.test(ua);
      var hasModernApis =
        !!window.Promise &&
        !!window.fetch &&
        !!window.Map &&
        !!window.Set &&
        !!window.URL &&
        !!window.URLSearchParams &&
        !!window.WeakMap &&
        !!window.Symbol &&
        !!Array.prototype.includes &&
        !!String.prototype.includes &&
        !!window.CSS &&
        !!window.CSS.supports &&
        window.CSS.supports("display", "grid") &&
        window.CSS.supports("backdrop-filter", "blur(2px)");

      if (!isInternetExplorer && hasModernApis) return;

      function showUnsupportedBrowserNotice() {
        var appShell = document.getElementById("app-shell");
        var warning = document.getElementById("unsupported-browser");
        if (appShell) appShell.style.display = "none";
        if (warning) warning.style.display = "flex";
        document.documentElement.setAttribute("data-unsupported-browser", "true");
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", showUnsupportedBrowserNotice);
        return;
      }

      showUnsupportedBrowserNotice();
    })();
  `;

  return (
    <html lang="pt">
      <head>
        <title>MediFam</title>
        <link rel="icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <script dangerouslySetInnerHTML={{ __html: unsupportedBrowserScript }} />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${sora.variable} min-h-screen app-surface`}
      >
        <div
          id="unsupported-browser"
          style={{ display: "none" }}
          className="unsupported-browser-shell min-h-screen items-center justify-center px-6 py-12"
        >
          <div className="unsupported-browser-card w-full max-w-3xl overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
            <div className="unsupported-browser-hero px-8 py-10 text-left sm:px-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/75 text-primary shadow-sm sm:mx-0">
                <span className="font-display text-xl font-semibold">M</span>
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-sky-900/70">
                MediFam
              </p>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Browser não suportado
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
                A plataforma MediFam não funciona corretamente neste browser. Para uma experiência segura e completa, utiliza uma versão atual do Chrome, Edge, Safari ou Firefox.
              </p>
            </div>

            <div className="grid gap-6 px-8 py-8 sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    O que está a acontecer?
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    O browser que estás a usar é antigo ou não suporta as tecnologias necessárias para abrir a plataforma com estabilidade.
                  </p>
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    Para continuar
                  </p>
                  <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    <li>1. Abre esta página no Google Chrome, Microsoft Edge, Safari ou Firefox.</li>
                    <li>2. Se estiveres num computador institucional, pede a abertura num browser atualizado.</li>
                    <li>3. Volta a entrar na MediFam depois de mudares de browser.</li>
                  </ol>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/80">
                  Browsers recomendados
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-sm font-semibold">Google Chrome</p>
                    <p className="mt-1 text-xs text-slate-300">Recomendado para melhor compatibilidade.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-sm font-semibold">Microsoft Edge</p>
                    <p className="mt-1 text-xs text-slate-300">Boa opção em computadores Windows.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-sm font-semibold">Safari</p>
                    <p className="mt-1 text-xs text-slate-300">Compatível em dispositivos Apple.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-sm font-semibold">Firefox</p>
                    <p className="mt-1 text-xs text-slate-300">Alternativa moderna e compatível.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="app-shell">
          <AppHeader />
          {children}
          <SpeedInsights />
        </div>

        <Script id="statcounter-config" strategy="lazyOnload">
          {`
            var sc_project=13212648;
            var sc_invisible=1;
            var sc_security="61ce3788";
          `}
        </Script>
        <Script
          id="statcounter-script"
          src="https://www.statcounter.com/counter/counter.js"
          strategy="lazyOnload"
        />
        <noscript>
          <div className="statcounter">
            <a title="Web Analytics" href="https://statcounter.com/" target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="statcounter"
                src="https://c.statcounter.com/13212648/0/61ce3788/1/"
                alt="Web Analytics"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>
        </noscript>
      </body>
    </html>
  );
}
