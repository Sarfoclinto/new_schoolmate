import {
  PaymentPostSchema,
  SubscriptionPostSchema,
  type SavePaymentProps,
  type SaveSubscriptionProps,
} from "@/types/api/finance";
import usePost from "../api/use-post";
import { useCallback, useEffect } from "react";
import { savePaymentFn, saveSubscription } from "@/services/finance";
import { toast } from "sonner";
import { useSignalRStore } from "@/store/signalr.store";

const useSavePayment = ({ save, payload, onSuccessSave }: SavePaymentProps) => {
  const { mutate, data, isPending, isError, error } = usePost({
    mutationOptions: { mutationKey: ["savetransaction", payload.reference] },
    postFn: savePaymentFn,
    onSuccess: (data) => {
      if (data.responseCode === 1) {
        toast.success(data.responseMessage);
      } else {
        toast.error(data.responseMessage);
      }
      onSuccessSave?.(data);
    },
  });

  const handleSave = useCallback(() => {
    const result = PaymentPostSchema.safeParse(payload);
    if (result.success) {
      mutate(result.data);
    } else {
      toast.error(result.error.message);
    }
  }, [mutate, payload]);

  useEffect(() => {
    if (save) {
      handleSave();
    }
  }, [handleSave, save]);

  return { data, isPending, isError, error };
};
export const useSaveSubscription = ({
  save,
  payload,
  onSuccessSave,
}: SaveSubscriptionProps) => {
  const saveExpiryState = useSignalRStore((s) => s.setExpiryStatus);
  const { mutate, data, isPending, isError, error } = usePost({
    mutationOptions: { mutationKey: ["saveSubscription", payload.reference] },
    postFn: saveSubscription,
    onSuccess: (data, variables) => {
      const raw = localStorage.getItem("saveSubscriptionVariables");
      const exisiting = raw ? JSON.parse(raw) : null;
      const final = exisiting
        ? Array.isArray(exisiting)
          ? exisiting.push(variables)
          : [variables]
        : null;
      localStorage.setItem("saveSubscriptionVariables", JSON.stringify(final));
      if (data.subscriptionHistoryId) {
        saveExpiryState({ ...data.expiryInfo, isExpired: false });
        toast.success("Subscription made successfully");
      } else {
        toast.error("Subscription failed");
      }
      onSuccessSave?.(data);
    },
    onError: (err, variables) => {
      toast.error("An error occurred", { description: err.message });
      const raw = localStorage.getItem("saveSubscriptionVariables");
      const exisiting = raw ? JSON.parse(raw) : null;
      const final = exisiting
        ? Array.isArray(exisiting)
          ? exisiting.push(variables)
          : [variables]
        : null;
      localStorage.setItem("saveSubscriptionVariables", JSON.stringify(final));
    },
  });

  const handleSave = useCallback(() => {
    const result = SubscriptionPostSchema.safeParse(payload);
    if (result.success) {
      mutate(result.data);
    } else {
      toast.error(result.error.message);
    }
  }, [mutate, payload]);

  useEffect(() => {
    if (save) {
      handleSave();
    }
  }, [handleSave, save]);

  return { data, isPending, isError, error };
};
export default useSavePayment;
