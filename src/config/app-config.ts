import { EnvSchema } from "@/schemas";

type AppConfig = {
  API_BASE_URL: string;
  APP_NAME: string;
  ENVIRONMENT: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
  }
}

const defaultConfig: AppConfig = {
  API_BASE_URL: "",
  APP_NAME: "",
  ENVIRONMENT: import.meta.env.MODE ?? "development",
};

const runtimeConfig = window.__APP_CONFIG__ ?? {};

export const AppConfig: AppConfig = {
  ...defaultConfig,
  ...runtimeConfig,
};

export const createEnv = () => {
  const res = EnvSchema.safeParse(AppConfig);

  if (!res.success) {
    const errors = res.error.flatten().fieldErrors;
    const errorMsg = Object.entries(errors)
      .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
      .join(" | ");

    console.error("❌ Invalid Environment Configuration:", errors);
    throw new Error(`Environment validation failed: ${errorMsg}`);
  }
  return res.data;
};

if (!AppConfig.API_BASE_URL) {
  console.error("API_BASE_URL is not configured!");
}
