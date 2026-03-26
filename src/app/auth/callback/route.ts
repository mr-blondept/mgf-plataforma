import { NextResponse, type NextRequest } from "next/server";
import {
  AVATAR_BUCKET,
  buildProviderAvatarPath,
  getProviderAvatarUrlFromMetadata,
} from "@/lib/avatar";
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
    const providerAvatarUrl = getProviderAvatarUrlFromMetadata(metadata);
    const fullName =
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : null;
    let providerAvatarPath: string | null = null;

    if (providerAvatarUrl) {
      providerAvatarPath = await copyProviderAvatarToStorage(
        supabase,
        user.id,
        providerAvatarUrl
      );
    }

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("avatar_path")
      .eq("id", user.id)
      .maybeSingle();

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName,
        avatar_path: existingProfile?.avatar_path ?? null,
        provider_avatar_path: providerAvatarPath,
        provider_avatar_url: providerAvatarUrl,
      },
      { onConflict: "id" },
    );
  }

  return NextResponse.redirect(new URL(next, siteUrl));
}

async function copyProviderAvatarToStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  sourceUrl: string
) {
  try {
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type");
    const avatarPath = buildProviderAvatarPath(userId, contentType, sourceUrl);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(avatarPath, arrayBuffer, {
        contentType: contentType ?? "image/jpeg",
        upsert: true,
      });

    if (error) return null;

    return avatarPath;
  } catch {
    return null;
  }
}
