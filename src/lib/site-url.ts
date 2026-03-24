const DEFAULT_PRODUCTION_URL = "https://medifam.site";

function normalizeUrl(value: string | undefined) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
}

export function getCanonicalSiteUrl() {
  return (
    normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeUrl(process.env.APP_URL) ??
    normalizeUrl(process.env.SITE_URL) ??
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    DEFAULT_PRODUCTION_URL
  );
}

