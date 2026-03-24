import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPath =
    request.nextUrl.pathname.startsWith("/treino") ||
    request.nextUrl.pathname.startsWith("/internato") ||
    request.nextUrl.pathname.startsWith("/icpc2") ||
    request.nextUrl.pathname.startsWith("/vacinacao") ||
    request.nextUrl.pathname.startsWith("/estatisticas") ||
    request.nextUrl.pathname.startsWith("/calendario") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/perfil");

  if (protectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (user && protectedPath && !request.nextUrl.pathname.startsWith("/perfil")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("medical_order_number, graduation_year, workplace")
      .eq("id", user.id)
      .maybeSingle();

    const profileIncomplete =
      !profile?.medical_order_number ||
      !profile?.graduation_year ||
      !profile?.workplace;

    if (profileIncomplete) {
      const url = request.nextUrl.clone();
      url.pathname = "/perfil";
      url.searchParams.set("complete", "1");
      return NextResponse.redirect(url);
    }
  }

  if (request.nextUrl.pathname.startsWith("/auth") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
