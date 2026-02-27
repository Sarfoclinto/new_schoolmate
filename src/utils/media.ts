import { env } from "@/config/constants";

interface BuildMediaUrlOptions {
  baseUrl?: string;
  fallback?: string;
}

export const buildMediaUrl = (
  path?: string | null,
  options?: BuildMediaUrlOptions,
) => {
  const { baseUrl = env.baseUrl, fallback = "/no-logo.png" } = options || {};

  if (!path) return fallback;

  // Already absolute URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Ensure no double slash issues
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};
