import type { MdResponse } from "@/types/api";
import type { RequestError } from "@/types/error";
import type { CreateProps } from "@/types/hooks";
import { mutationIsCanceledError, parseApiError } from "@/utils/error";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

const usePost = <TData = MdResponse, TVariables = unknown, TError = AxiosError>({
  postFn,
  title,
  successMsg,
  showSuccessNotification = false,
  showErrorNotification = false,
  onSuccess,
  onError,
  mutationOptions,
}: CreateProps<TData, TVariables, TError>): UseMutationResult<
  TData,
  TError,
  TVariables,
  unknown
> => {
  const mutation = useMutation<TData, TError, TVariables>({
    mutationFn: postFn,
    onSuccess: (data) => {
      if (showSuccessNotification) {
        const message =
          successMsg ??
          (title ? `Added ${title} successfully` : "Created successfully");
        toast.success(message);
      }

      // consumer callback
      try {
        onSuccess?.(data);
      } catch (err) {
        // swallow errors thrown in user's handler to avoid breaking react-query flow
        // optionally log here
        console.error("onSuccess handler error", err);
      }
    },
    onError: (err: TError) => {
      if (mutationIsCanceledError(err)) return;

      if (showErrorNotification) {
        toast.error(parseApiError(err as RequestError));
      }

      try {
        onError?.(err);
      } catch (e) {
        console.error("onError handler error", e);
        // swallow
      }
    },
    ...mutationOptions,
  });

  return mutation;
};

export default usePost;
