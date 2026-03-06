import { QueryClient } from "@tanstack/react-query";
import { createEnv } from "./app-config";

export const queryClient = new QueryClient();

export const env = createEnv();
console.log("env: ", env);

export const isProduction = import.meta.env.PROD;
export const isDeveloplement = import.meta.env.DEV;

export const DEFAULT_ROLES = {
  ADMIN: ["admin", "super-admin", "administrator", "principal"],
  STAFF: ["staff", "lecturer", "teacher"],
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 30;
export const df = {
  page: DEFAULT_PAGE.toString(),
  limit: DEFAULT_LIMIT.toString(),
};
