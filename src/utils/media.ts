import { env } from "@/config/constants";

interface BuildMediaUrlOptions {
  baseUrl?: string;
  fallback?: string;
  useNoLogo?: boolean;
}

export const buildMediaUrl = (
  path?: string | null,
  options?: BuildMediaUrlOptions,
) => {
  const {
    baseUrl = env.API_BASE_URL,
    fallback = "/no-logo.png",
    useNoLogo = true,
  } = options || {};

  if (!path) return useNoLogo ? fallback : "";

  // Already absolute URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Ensure no double slash issues
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};
