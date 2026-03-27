import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCanonicalSiteUrl } from "@/lib/site-url";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const allowedAmounts = new Set([300, 500, 1000, 2000]);

export async function POST(request: Request) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Configuração do Stripe incompleta." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as {
    amountCents?: number;
  };

  const amountCents = Number(body.amountCents);

  if (!Number.isFinite(amountCents) || !allowedAmounts.has(amountCents)) {
    return NextResponse.json(
      { error: "Montante inválido." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const siteUrl = getCanonicalSiteUrl();
  const successUrl = `${siteUrl}/buy-us-a-coffee?success=1`;
  const cancelUrl = `${siteUrl}/buy-us-a-coffee?cancelled=1`;

  const formData = new URLSearchParams();
  formData.set("mode", "payment");
  formData.set("success_url", successUrl);
  formData.set("cancel_url", cancelUrl);
  formData.set("billing_address_collection", "auto");
  formData.set("submit_type", "donate");
  formData.set("locale", "pt");
  formData.set("payment_method_types[0]", "card");
  formData.set("line_items[0][quantity]", "1");
  formData.set("line_items[0][price_data][currency]", "eur");
  formData.set("line_items[0][price_data][unit_amount]", String(amountCents));
  formData.set("line_items[0][price_data][product_data][name]", "Buy us a coffee");
  formData.set(
    "line_items[0][price_data][product_data][description]",
    "Apoio ao desenvolvimento da plataforma MediFam.",
  );
  formData.set("metadata[source]", "buy_us_a_coffee");

  if (user?.id) {
    formData.set("metadata[user_id]", user.id);
  }

  if (user?.email) {
    formData.set("customer_email", user.email);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = (await response.json()) as { url?: string; error?: { message?: string } };

  if (!response.ok || !data.url) {
    return NextResponse.json(
      { error: data.error?.message ?? "Não foi possível criar a sessão de pagamento." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: data.url });
}
