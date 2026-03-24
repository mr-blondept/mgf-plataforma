import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCanonicalSiteUrl } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const siteUrl = getCanonicalSiteUrl();
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/auth", siteUrl));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/auth?error=oauth", siteUrl));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const metadata = user.user_metadata ?? {};
    const fullName =
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : null;

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName,
      },
      { onConflict: "id" },
    );
  }

  return NextResponse.redirect(new URL(next, siteUrl));
}
