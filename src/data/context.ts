import type { SignalRClient } from "@/services/signalr-client";
import type { ConnectionState } from "@/types/signalr.type";
import { createContext } from "react";

/**
 * SignalR Context Value
 */
export interface SignalRContextValue {
  client: SignalRClient | null;
  isConnected: boolean;
  connectionState: ConnectionState;
}

export const SignalRContext = createContext<SignalRContextValue | null>(null);
