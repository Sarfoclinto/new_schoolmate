import { PaymentPostSchema, type SavePaymentProps } from "@/types/api/finance";
import usePost from "../api/use-post";
import { useCallback, useEffect } from "react";
import { savePaymentFn } from "@/services/finance";
import { toast } from "sonner";

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
      console.log(result.error);
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
