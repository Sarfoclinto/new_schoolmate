import { useSignalRStore } from "@/store/signalr.store";
import { useShallow } from "zustand/react/shallow";

export function useExpiredSubscription() {
  const expiryStatus = useSignalRStore(
    useShallow((state) => state.expiryStatus),
  );
  return {
    ...expiryStatus,
    isExpired:
      expiryStatus?.isExpired ||
      (expiryStatus?.expiryDate &&
        new Date(expiryStatus.expiryDate) < new Date()),
  };
}
