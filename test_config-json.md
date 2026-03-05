in main.tsx
```
async function bootstrap() {
  try {
    const response = await fetch("/config.json", {
      cache: "no-store", // prevent stale config
    });

    if (!response.ok) {
      throw new Error("Failed to load runtime configuration");
    }

    const config = await response.json();

    // Store globally in memory
    window.__APP_CONFIG__ = config;

    const { createRoot } = await import("react-dom/client");
    const { default: App } = await import("./App");

    createRoot(document.getElementById("root")!).render(
      <App />
    );

  } catch (error) {
    console.error("App failed to start:", error);
    document.body.innerHTML = "<h1>Application failed to start.</h1>";
  }
}

bootstrap();
```


in src/config/appConfig.ts
```
export type AppConfig = {
  API_BASE_URL: string;
  APP_NAME: string;
  ENVIRONMENT: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig;
  }
}

if (!window.__APP_CONFIG__) {
  throw new Error("Config not loaded before app initialization.");
}

export const AppConfig: AppConfig = window.__APP_CONFIG__;
```


 Everywhere in app
 ```
 import { AppConfig } from "@/config/appConfig";

fetch(`${AppConfig.API_BASE_URL}/students`);
```

Prevent json fetching-caching
<location path="config.json">
  <system.webServer>
    <staticContent>
      <clientCache cacheControlMode="DisableCache" />
    </staticContent>
  </system.webServer>
</location>