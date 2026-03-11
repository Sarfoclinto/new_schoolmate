import type { SignalRConfig } from "@/types/signalr.type";
import { env } from "./constants";
import endpoints from "./endpoints";
import { useAuth } from "@/store/auth.store";

/**
 * SignalR Configuration
 */
export const signalRConfig: SignalRConfig = {
  hubUrl: `${env.API_BASE_URL}${endpoints.signalR.hub}`,
  automaticReconnect: [0, 2000, 10000, 30000],
  accessTokenFactory: () => {
    try {
      const token = useAuth.getState().token;
      if (token) {
        return token;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  },
  logLevel: env.ISDEV ? "debug" : "warn",
};

export const AUTO_CONNECT = { admin: false, staff: false };
export const ENABLE_TOAST = { admin: true, staff: true };
