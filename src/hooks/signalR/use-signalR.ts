import { useCallback, useEffect, useRef } from "react";
import { useSignalRContext } from "./use-signalR-context";
import type {
  SignalREventHandler,
  SignalREventName,
} from "@/types/signalr.type";

/**
 * Main hook for components to interact with SignalR
 * Provides type-safe event subscriptions and server method invocations
 */
export const useSignalR = () => {
  const { client, isConnected, connectionState } = useSignalRContext();
  const unsubscribersRef = useRef<Array<() => void>>([]);

  /**
   * Subscribe to a SignalR event with automatic cleanup
   * @param event - The event name to subscribe to
   * @param handler - The event handler function
   */
  const on = useCallback(
    <T extends SignalREventName>(event: T, handler: SignalREventHandler<T>) => {
      if (!client) {
        console.warn("[useSignalR] Client not initialized");
        return;
      }

      const unsubscribe = client.on(event, handler);
      unsubscribersRef.current.push(unsubscribe);

      return unsubscribe;
    },
    [client],
  );

  /**
   * Cleanup all subscriptions on unmount
   */
  useEffect(() => {
    return () => {
      unsubscribersRef.current.forEach((unsubscribe) => unsubscribe());
      unsubscribersRef.current = [];
    };
  }, []);

  /**
   * Generic invoke method for custom server methods
   */
  const invoke = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async <T = void>(methodName: string, ...args: any[]): Promise<T> => {
      if (!client) throw new Error("SignalR client not initialized");
      return client.invoke<T>(methodName, ...args);
    },
    [client],
  );

  /**
   * Server method wrappers with type safety
   */

  return {
    /** Connections states */
    isConnected,
    connectionState,

    /** For direct event subscriptions */
    on,

    /** For type-safe proxy server method invocations */
    // sample functions
    // addPermission
    // make announcement

    /** For direct type-safe server method invocations */
    invoke,
  };
};
