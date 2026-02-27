/* eslint-disable @typescript-eslint/no-explicit-any */
import { isCanceledError } from "@/utils/error";
import type { DeleteProps } from "@/types/hooks";
import { parseApiError } from "@/utils/error";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { RequestError } from "@/types/error";

const useDelete = <TData = unknown, TVariables = unknown, TError = unknown>({
  deleteFn,
  invalidateQueryKey,
  showSuccessNotification = true,
  successMsg,
  title,
  optimistic,
  onSuccess,
  onError,
  mutationOptions,
}: DeleteProps<TData, TVariables, TError>): UseMutationResult<
  TData,
  TError,
  TVariables,
  unknown
> => {
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, TError, TVariables>({
    mutationFn: deleteFn,

    // optimistic update
    onMutate: async (variables: TVariables) => {
      if (!optimistic && !invalidateQueryKey) return;

      // Cancel outgoing queries for the targeted keys
      const targetKey = optimistic?.queryKey ?? invalidateQueryKey;
      try {
        await queryClient.cancelQueries({ queryKey: targetKey });
      } catch {
        /* ignore */
      }

      // Snapshot previous value(s)
      const previous = queryClient.getQueryData(targetKey!);

      // If updater provided, use it; otherwise try naive list removal if variables is an id
      if (optimistic?.updater) {
        try {
          queryClient.setQueryData(targetKey!, (prev: any) =>
            optimistic.updater!(prev, variables),
          );
        } catch {
          // ignore optimistic failure
        }
      } else {
        // Best-effort: if variables looks like an id (string/number), remove from arrays
        const idCandidate = variables as any;
        if (
          typeof idCandidate === "string" ||
          typeof idCandidate === "number"
        ) {
          queryClient.setQueryData(targetKey!, (prev: any) => {
            if (Array.isArray(prev)) {
              return prev.filter((item) => (item?.id ?? item) !== idCandidate);
            }
            return prev;
          });
        }
      }
      return { previous };
    },

    onSuccess: (data) => {
      if (showSuccessNotification) {
        const message =
          successMsg ??
          (title ? `${title} deleted successfully` : "Deleted successfully");

        toast.success(message);
      }

      onSuccess?.(data);

      // invalidate queries to refresh data
      if (invalidateQueryKey) {
        queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
      }
    },

    // onError: (err: unknown, variables, context: any) => {
    onError: (err: unknown, context: any) => {
      // rollback optimistic
      if (
        context?.previous !== undefined &&
        (optimistic || invalidateQueryKey)
      ) {
        const targetKey = optimistic?.queryKey ?? invalidateQueryKey;
        queryClient.setQueryData(targetKey!, context.previous);
      }

      if (isCanceledError(err)) return;

      toast.error(parseApiError(err as RequestError));

      onError?.(err);
    },

    // always apply user-supplied options (onSettled, retry, etc.)
    ...mutationOptions,
  });

  return mutation;
};

export default useDelete;
