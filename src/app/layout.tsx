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
  title: "Internos MGF - Plataforma de estudo",
  description:
    "Internos MGF reúne banco de perguntas, estatísticas e ferramentas do Internato de Medicina Geral e Familiar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <title>Internos MGF</title>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${sora.variable} min-h-screen app-surface`}
      >
        <AppHeader />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
