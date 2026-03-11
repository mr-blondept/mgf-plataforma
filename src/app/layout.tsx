import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import AppHeader from "@/components/AppHeader";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MGF Quiz - Internato de Medicina Geral e Familiar",
  description:
    "Plataforma de estudo para o Internato de Medicina Geral e Familiar com perguntas de escolha múltipla, estatísticas e acompanhamento de progresso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={`${manrope.variable} ${fraunces.variable} min-h-screen app-surface`}
      >
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
