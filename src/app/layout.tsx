import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
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
          className="min-h-screen items-center justify-center px-6 py-12"
        >
          <div className="w-full max-w-xl rounded-[2rem] border border-border bg-white px-8 py-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="font-display text-xl font-semibold">M</span>
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold text-foreground">
              Browser nao suportado
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              A plataforma MediFam e compatível com Chrome, Edge, Safari e Firefox.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Para continuar, abre esta plataforma num browser atualizado. Browsers antigos ou desatualizados nao suportam a experiencia completa.
            </p>
          </div>
        </div>

        <div id="app-shell">
          <AppHeader />
          {children}
          <SpeedInsights />
        </div>
      </body>
    </html>
  );
}
