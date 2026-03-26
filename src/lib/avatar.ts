import type { SupabaseClient } from "@supabase/supabase-js";

export const AVATAR_BUCKET = "avatars";

export function getAvatarPublicUrl(
  supabase: SupabaseClient,
  path: string | null | undefined
) {
  if (!path) return null;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function getProviderAvatarUrlFromMetadata(metadata: Record<string, unknown>) {
  if (typeof metadata.avatar_url === "string" && metadata.avatar_url) {
    return metadata.avatar_url;
  }

  if (typeof metadata.picture === "string" && metadata.picture) {
    return metadata.picture;
  }

  return null;
}

export function buildCustomAvatarPath(userId: string, file: File) {
  return `${userId}/custom-${Date.now()}.${getFileExtension(file.type, file.name)}`;
}

export function buildProviderAvatarPath(
  userId: string,
  contentType: string | null,
  sourceUrl: string
) {
  return `${userId}/provider.${getFileExtension(contentType, sourceUrl)}`;
}

function getFileExtension(contentType: string | null, fallbackName: string) {
  const normalizedType = contentType?.toLowerCase() ?? "";

  if (normalizedType.includes("png")) return "png";
  if (normalizedType.includes("webp")) return "webp";
  if (normalizedType.includes("gif")) return "gif";
  if (normalizedType.includes("svg")) return "svg";
  if (normalizedType.includes("jpeg") || normalizedType.includes("jpg")) return "jpg";

  try {
    const pathname = new URL(fallbackName).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
    if (match) return match[1].toLowerCase();
  } catch {
    const match = fallbackName.match(/\.([a-zA-Z0-9]+)$/);
    if (match) return match[1].toLowerCase();
  }

  return "jpg";
}
