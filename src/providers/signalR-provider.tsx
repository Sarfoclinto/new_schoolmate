// import { SignalRContext, type SignalRContextValue } from "@/data/context";
// import { SignalRClient } from "@/services/signalr-client";
// import type { ConnectionState, SignalRConfig } from "@/types/signalr.type";
// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";

// /**
//  * SignalR Provider Props
//  */
// interface SignalRProviderProps {
//   children: React.ReactNode;
//   config: SignalRConfig;
//   /**
//    * Enable automatic reconnection toast notifications
//    * @default true
//    */
//   enableToasts?: boolean;
//   /**
//    * Auto-connect on mount
//    * @default true
//    */
//   autoConnect?: boolean;
// }

// /**
//  * SignalR Provider Component
//  * Manages the SignalR client lifecycle and connection state
//  */
// export const SignalRProvider: React.FC<SignalRProviderProps> = ({
//   children,
//   config,
//   enableToasts = true,
//   autoConnect = true,
// }) => {
//   const clientRef = useRef<SignalRClient | null>(null);
//   const [connectionState, setConnectionState] =
//     useState<ConnectionState>("Disconnected");
//   const reconnectToastIdRef = useRef<string | number | null>(null);
//   const navigate = useNavigate();

//   /**
//    * Initialize SignalR client
//    */
//   useEffect(() => {
//     // Create client instance
//     const client = new SignalRClient(config);
//     clientRef.current = client;

//     // Setup event subscriptions
//     setupEventSubscriptions(client);

//     // Auto-connect if enabled
//     if (autoConnect) {
//       client.start().catch((error) => {
//         console.error("[SignalRProvider] Failed to auto-connect:", error);
//         if (enableToasts) {
//           toast.error("Failed to connect to server");
//         }
//       });
//     }

//     // Cleanup on unmount
//     return () => {
//       client.stop().catch(console.error);
//       client.dispose();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /**
//    * Setup all event subscriptions
//    */
//   const setupEventSubscriptions = (client: SignalRClient) => {};

//   const value: SignalRContextValue = {
//     client: clientRef.current,
//     isConnected: connectionState === "Connected",
//     connectionState,
//   };

//   return (
//     <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>
//   );
// };
