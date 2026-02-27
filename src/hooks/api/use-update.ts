/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RequestError } from "@/types/error";
import type { UpdateProps } from "@/types/hooks";
import { isCanceledError, parseApiError } from "@/utils/error";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

const useUpdate = <TData = unknown, TVariables = unknown, TError = AxiosError>({
  updateFn,
  invalidateQueryKey,
  showSuccessNotification = false,
  showErrorNotification = false,
  successMsg,
  title,
  optimistic,
  onSuccess,
  onError,
  mutationOptions,
}: UpdateProps<TData, TVariables, TError>): UseMutationResult<
  TData,
  TError,
  TVariables,
  unknown
> => {
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, TError, TVariables>({
    mutationFn: updateFn,

    onMutate: async (variables: TVariables) => {
      const targetKey = optimistic?.queryKey ?? invalidateQueryKey;
      if (!targetKey) return;

      try {
        await queryClient.cancelQueries({ queryKey: targetKey });
      } catch {
        /* ignore */
      }

      const previous = queryClient.getQueryData(targetKey);

      // If updater provided, apply it
      if (optimistic?.updater) {
        try {
          queryClient.setQueryData(targetKey, (prev: any) =>
            optimistic.updater!(prev, variables),
          );
        } catch {
          // ignore
        }
      } else {
        // Best-effort: if variables includes `id` and `payload` shape, replace in array or in object
        const v: any = variables as any;
        const id =
          v?.id ??
          (typeof v === "string" || typeof v === "number" ? v : undefined);

        if (id !== undefined) {
          queryClient.setQueryData(targetKey, (prev: any) => {
            if (Array.isArray(prev)) {
              return prev.map((item) =>
                (item?.id ?? item) === id
                  ? { ...item, ...(v?.payload ?? v) }
                  : item,
              );
            }
            // if object keyed by id
            if (prev && (prev as any).id === id) {
              return { ...(prev as any), ...(v?.payload ?? v) };
            }
            return prev;
          });
        }
      }

      return { previous };
    },

    // onSuccess: (data, variables, context) => {
    onSuccess: (data) => {
      if (showSuccessNotification) {
        const message =
          successMsg ??
          (title ? `${title} updated successfully` : "Updated successfully");
        toast.success(message);
      }

      onSuccess?.(data);

      // ensure server state: invalidate relevant keys
      if (invalidateQueryKey) {
        queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
      }
    },

    // onError: (err: unknown, variables, context: any) => {
    // onError: (err: TError, context: any) => {
    onError: (err: TError) => {
      // rollback on error
      // if (
      //   context?.previous !== undefined &&
      //   (optimistic || invalidateQueryKey)
      // ) {
      //   const targetKey = optimistic?.queryKey ?? invalidateQueryKey;
      //   queryClient.setQueryData(targetKey!, context.previous);
      // }

      if (isCanceledError(err)) return;
      if (showErrorNotification) toast.error(parseApiError(err as RequestError));

      onError?.(err);
    },

    ...mutationOptions,
  });

  return mutation;
};

export default useUpdate;
