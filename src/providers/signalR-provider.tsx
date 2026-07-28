import { SignalRContext, type SignalRContextValue } from "@/data/context";
import { SignalRClient } from "@/services/signalr-client";
import { useSignalRStore } from "@/store/signalr.store";
import type { ConnectionState, SignalRConfig } from "@/types/signalr.type";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

/**
 * SignalR Provider Props
 */
interface SignalRProviderProps {
  children: React.ReactNode;
  config: SignalRConfig;
  /**
   * Enable automatic reconnection toast notifications
   * @default true
   */
  enableToasts?: boolean;
  /**
   * Auto-connect on mount
   * @default true
   */
  autoConnect?: boolean;
}

/**
 * SignalR Provider Component
 * Manages the SignalR client lifecycle and connection state
 */
export const SignalRProvider: React.FC<SignalRProviderProps> = ({
  children,
  config,
  enableToasts = true,
  autoConnect = true,
}) => {
  const clientRef = useRef<SignalRClient | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("Disconnected");
  const reconnectToastIdRef = useRef<string | number | null>(null);

  // store actions
  const {
    setConnectionError,
    setStoreConnectionState,
    setPermissions,
    setTerms,
    setYear,
    addRequest,
    removeRequest,
    updateStatus,
    updateSubscription,
  } = useSignalRStore(
    useShallow((s) => ({
      setStoreConnectionState: s.setConnectionState,
      setConnectionError: s.setConnectionError,
      setPermissions: s.setPermissions,
      setYear: s.setActiveYear,
      setTerms: s.setActiveTerms,
      addRequest: s.addRequest,
      removeRequest: s.deleteRequest,
      updateStatus: s.updateReqStatus,
      updateSubscription: s.setExpiryStatus,
    })),
  );

  /**
   * Initialize SignalR client
   */
  useEffect(() => {
    // Create client instance
    const client = new SignalRClient(config);
    clientRef.current = client;

    // Setup event subscriptions
    setupEventSubscriptions(client);

    // Auto-connect if enabled
    if (autoConnect) {
      client.start().catch((error) => {
        console.error("[SignalRProvider] Failed to auto-connect:", error);
        if (enableToasts) {
          toast.error("Failed to connect to server");
        }
      });
    }

    // Cleanup on unmount
    return () => {
      client.stop().catch(console.error);
      client.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Setup all event subscriptions
   */
  const setupEventSubscriptions = (client: SignalRClient) => {
    // Connection lifecycle events
    client.on("connected", () => {
      setConnectionState("Connected");
      setStoreConnectionState("Connected");
      setConnectionError(null);
      if (enableToasts && reconnectToastIdRef.current) {
        toast.dismiss(reconnectToastIdRef.current);
        toast.success("Connected to server", { duration: 2000 });
        reconnectToastIdRef.current = null;
      }
    });

    client.on("disconnected", (error) => {
      setConnectionState("Disconnected");
      setStoreConnectionState("Disconnected");
      if (error) {
        setConnectionError(error);
      }
      if (enableToasts) {
        toast.error("Disconnected from server");
      }
    });

    client.on("reconnecting", () => {
      setConnectionState("Reconnecting");
      setStoreConnectionState("Reconnecting");

      if (enableToasts) {
        // reconnectToastIdRef.current = toast.loading("Reconnecting....", {
        //   duration: Infinity,
        //   closeButton: true,
        //   action: {
        //     label: "Dismiss",
        //     onClick: () => {
        //       if (reconnectToastIdRef.current) {
        //         toast.dismiss(reconnectToastIdRef.current);
        //         reconnectToastIdRef.current = null;
        //       }
        //     },
        //   },
        // });
      }
    });

    client.on("reconnected", () => {
      setConnectionState("Connected");
      setStoreConnectionState("Connected");
      setConnectionError(null);

      if (enableToasts && reconnectToastIdRef.current) {
        toast.dismiss(reconnectToastIdRef.current);
        toast.success("Reconnected successfully", { duration: 2000 });
        reconnectToastIdRef.current = null;
      }
    });

    // permissions
    client.on("receivePermissions", (permissions) => {
      if (enableToasts) {
        toast.success("Permissions updated. Menu will be reconfigured soon");
      }
      setTimeout(() => {
        setPermissions(permissions);
      }, 2000);
    });

    // sessions (years and terms)
    client.on("receiveActiveYear", (year) => {
      if (enableToasts) {
        toast.success("Active year updated. Update is in progress");
      }
      setTimeout(() => {
        setYear(year);
      }, 2000);
    });
    client.on("receiveActiveTerms", (terms) => {
      if (enableToasts) {
        toast.success("Active terms updated. Update is in progress");
      }
      setTimeout(() => {
        setTerms(terms);
      }, 2000);
    });

    // requests
    client.on("receiveRequests", (request) => {
      // TODO: Play beep sound
      if (request) {
        addRequest(request);
        if (enableToasts) {
          toast.info("New request received");
        }
      }
    });

    client.on("deleteRequests", (requestId) => {
      if (requestId) {
        removeRequest(requestId);
        if (enableToasts) {
          toast.info("Request deleted");
        }
      }
    });

    client.on("updateRequestStatus", (requestId, status) => {
      if (requestId) {
        updateStatus(requestId, status);
        if (enableToasts) {
          if (status === "approved") {
            toast.info("Request approved");
          } else if (status === "declined") {
            toast.warning("Request declined");
          }
        }
      }
    });

    client.on("receiveSubscriptionStatus", (subscription) => {
      if (subscription.subscriptionHistoryId) {
        updateSubscription(subscription.expiryInfo);
        if (enableToasts) {
          toast.info("Subscription updated successfully");
        }
      }
    });

    // Error handling
    client.on("error", (message) => {
      console.error("[SignalR] Server error:", message);
      if (enableToasts) {
        toast.error(message);
      }
    });
  };

  const value: SignalRContextValue = {
    client: clientRef.current,
    isConnected: connectionState === "Connected",
    connectionState,
  };

  return (
    <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>
  );
};
