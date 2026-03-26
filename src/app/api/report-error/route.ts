import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const mailgunApiKey = process.env.MAILGUN_API_KEY;
const mailgunDomain = process.env.MAILGUN_DOMAIN;
const errorReportTo = process.env.ERROR_REPORT_TO;
const mailgunFrom =
  process.env.MAILGUN_FROM ??
  `MediFam Reports <postmaster@${process.env.MAILGUN_DOMAIN}>`;

export async function POST(request: Request) {
  if (!mailgunApiKey || !mailgunDomain || !errorReportTo) {
    return NextResponse.json(
      { error: "Configuração de email incompleta." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as {
    message?: string;
    pathname?: string;
  };

  const message = body.message?.trim() ?? "";
  const pathname = body.pathname?.trim() ?? "";

  if (message.length < 10) {
    return NextResponse.json(
      { error: "Descreve o erro com mais detalhe." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Tens de iniciar sessão para reportar um erro." },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const reporterName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    "Utilizador MediFam";
  const reporterEmail = user.email ?? "sem-email";

  const formData = new URLSearchParams();
  formData.set("from", mailgunFrom);
  formData.set("to", errorReportTo);
  formData.set("subject", `Novo reporte de erro - ${reporterName}`);
  formData.set(
    "text",
    [
      `Nome: ${reporterName}`,
      `Email: ${reporterEmail}`,
      `User ID: ${user.id}`,
      `Página: ${pathname || "não indicada"}`,
      "",
      "Mensagem:",
      message,
    ].join("\n")
  );
  formData.set("h:Reply-To", reporterEmail);

  const response = await fetch(
    `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString(
          "base64"
        )}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: `Falha ao enviar reporte. (${errorText})` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
