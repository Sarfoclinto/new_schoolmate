import { PaymentPostSchema, type SavePaymentProps } from "@/types/api/finance";
import usePost from "../api/use-post";
import { useCallback, useEffect } from "react";
import { savePaymentFn } from "@/services/finance";

const useSavePayment = ({ save, payload }: SavePaymentProps) => {
  const { mutate, data, isPending, isError, error } = usePost({
    mutationOptions: { mutationKey: ["savetransaction", payload.reference] },
    postFn: savePaymentFn,
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
