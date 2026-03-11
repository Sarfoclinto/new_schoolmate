import { SignalRContext, type SignalRContextValue } from "@/data/context";
import { useContext } from "react";

/**
 * Hook to access SignalR context
 * @throws Error if used outside SignalRProvider
 */
export const useSignalRContext = (): SignalRContextValue => {
  const ctx = useContext(SignalRContext);
  if (!ctx) {
    throw new Error("useSignalRContext must be used within a SignalRProvider");
  }
  return ctx;
};
