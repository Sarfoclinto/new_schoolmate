import { createEnv } from "@/utils/string";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
export const env = createEnv();
export const isProduction = import.meta.env.PROD;

export const DEFAULT_ROLES = {
  ADMIN: ["admin", "super-admin", "administrator"],
  STAFF: ["staff", "lecturer", "teacher"],
};


export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 30;
export const df = {
  page: DEFAULT_PAGE.toString(),
  limit: DEFAULT_LIMIT.toString(),
};

