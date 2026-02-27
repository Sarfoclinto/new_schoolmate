import { env } from "@/config/constants";
import { useAuth } from "@/store/auth.store";
import axios, { type AxiosInstance, type AxiosRequestHeaders } from "axios";
import { queryClient } from "@/config/constants";

// @ts-expect-error - False satisfy
const DEFAULT_HEADERS: AxiosRequestHeaders = {
  "Content-Type": "application/json",
};

const resolveBaseUrl = (baseUrl?: string, baseRoute?: string): string => {
  const resolved = baseUrl?.trim() || env.baseUrl?.trim();

  if (!resolved) {
    throw new Error(
      "No backend url provided (missing baseUrl and VITE_BACKEND_URL)",
    );
  }

  if (baseRoute) {
    return `${resolved}${baseRoute}`;
  }

  return resolved;
};

export const createAxiosInstance = (
  baseRoute?: string,
  baseUrl?: string,
  headers: AxiosRequestHeaders = DEFAULT_HEADERS,
): AxiosInstance => {
  return axios.create({
    baseURL: resolveBaseUrl(baseUrl, baseRoute),
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
  });
};

const api = createAxiosInstance("/User");

// add req interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (err) => Promise.reject(err),
);

// add res interceptor
// on 401 error => logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      useAuth.getState().logout();
      queryClient.clear(); // 🔥 clears all cached data
      window.location.href = "/login";
    }

    return Promise.reject(err);
  },
);

export default api;

/**
 * to logout from all tables
 * window.addEventListener("storage", (event) => {
  if (event.key === "authState") {
    queryClient.clear();
  }
});
 */
