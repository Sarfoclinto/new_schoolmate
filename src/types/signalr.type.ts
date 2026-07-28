import type { Permission } from "@/config/permissions";
import type { AcademicTermGet, AcademicYearGet } from "./api/setup/year-n-term";
import type { RequestItem } from "./api/request";
import type { SubscriptionRes } from "./api/finance";

/**
 * SignalR Event Map - Strongly typed event handlers
 */
export interface SignalREventMap {
  // Connection events
  connected: () => void;
  disconnected: (error?: Error) => void;
  reconnecting: () => void;
  reconnected: () => void;
  // errors
  error: (error: string) => void;

  // permission
  receivePermissions: (permission: Permission[]) => void;

  // sessions (years and terms)
  receiveActiveYear: (year: AcademicYearGet) => void;
  receiveActiveTerms: (terms: AcademicTermGet[]) => void;

  // requests
  receiveRequests: (request: RequestItem) => void;
  deleteRequests: (id: string) => void;
  updateRequestStatus: (
    requestId: string,
    status: "approved" | "declined",
  ) => void;

  // subscription status
  receiveSubscriptionStatus: (status: SubscriptionRes) => void;
}
/**
 * SignalR Connection State
 */
export type ConnectionState =
  | "Disconnected"
  | "Connecting"
  | "Connected"
  | "Reconnecting"
  | "Disconnecting";

/**
 * SignalR Configuration
 */
export interface SignalRConfig {
  hubUrl: string;
  automaticReconnect?: number[];
  accessTokenFactory?: () => string | null;
  logLevel?: "trace" | "debug" | "info" | "warn" | "error" | "none";
}

/**
 * Type-safe event names
 */
export type SignalREventName = keyof SignalREventMap;

/**
 * Type-safe event handler
 */
export type SignalREventHandler<T extends SignalREventName> =
  SignalREventMap[T];

/**
 * Subscriber function type
 */
export type EventSubscriber<T extends SignalREventName> = {
  event: T;
  handler: SignalREventHandler<T>;
  id: string;
};
