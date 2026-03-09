import type { RequestError } from "@/types/error";
import type { FetchProps } from "@/types/hooks";
import { isCanceledError, parseApiError } from "@/utils/error";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

const useFetch = <TData, TError>({
  queryFn,
  queryKeys,
  title,
  enabled = true,
  showErrorNotification = true,
  queryOptions,
  onError,
}: FetchProps<TData, TError>): UseQueryResult<TData, TError> => {
  const qr = useQuery<TData, TError>({
    queryKey: queryKeys,
    queryFn: ({ signal }) => queryFn({ signal }),    
    enabled,
    ...queryOptions,
  });

  useEffect(() => {
    if (!qr.isPending && qr.error) {
      if (isCanceledError(qr.error)) {
        // do not surface notifications for cancelled requests
        return;
      }
      if (showErrorNotification) {
        const message = title
          ? `${title}: ${parseApiError(qr.error as unknown as RequestError)}`
          : parseApiError(qr.error as unknown as RequestError);
        toast.error(message);
      }
      onError?.(qr.error);
    }
  }, [onError, qr.error, qr.isPending, showErrorNotification, title]);

  return qr;
};

export default useFetch;
