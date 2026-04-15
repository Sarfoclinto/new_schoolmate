import type { TransStatRes } from "@/types/api/finance";
import { useEffect, useRef, useState } from "react";
import usePost from "../api/use-post";
import { checkStatusFn, debitFn } from "@/services/finance";
import useFetch from "../api/use-fetch";
import type { QueryObserverResult } from "@tanstack/react-query";

export interface CreateDebitProps {
  onSuccessFn?: () => void;
  refNo: string;
}

export const useDebit = ({ onSuccessFn, refNo }: CreateDebitProps) => {
  const POLL_DELAYS = [10_000, 7_000, 5_000, 3_000]; // in ms
  const [pollAttempt, setPollAttempt] = useState(0);

  const {
    mutate,
    error: debitError,
    isPending: isDebiting,
    isSuccess: isDebitSuccess,
  } = usePost({
    postFn: debitFn,
    onSuccess: () => {
      onSuccessFn?.();
      startPolling();
    },
  });

  const {
    data: transRes,
    isLoading: isChecking,
    refetch,
  } = useFetch<TransStatRes, { refNo: string }>({
    queryKeys: ["debitStatus", refNo],
    queryFn: () => checkStatusFn({ refNo }),
    enabled: false,
    showErrorNotification: true,
    queryOptions: { retry: false },
  });

  // refs to tract attempts and timer ID
  const attemptRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // clear any pending timer & reset
  const clearPolling = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    attemptRef.current = 0;
    setPollAttempt(0);
    // remove(); // clear out old query data
  };

  const stopPolling = () => {
    clearPolling();
  };

  // the actual polling function
  const pollStatus = async () => {
    try {
      const result: QueryObserverResult<TransStatRes, { refNo: string }> =
        await refetch();
      setPollAttempt((p) => p + 1);
      const code = result.data?.responseMessage;
      if (code !== "Successfully Processed Transaction") {
        // advance to next delay index until last, then stay there
        if (attemptRef.current < POLL_DELAYS.length - 1) {
          attemptRef.current += 1;
        }
        timerRef.current = setTimeout(
          pollStatus,
          POLL_DELAYS[attemptRef.current],
        );
      }
    } catch {
      // on error, retry if attempts remain
      if (attemptRef.current < POLL_DELAYS.length - 1) {
        attemptRef.current += 1;
        timerRef.current = setTimeout(
          pollStatus,
          POLL_DELAYS[attemptRef.current],
        );
      }
    }
  };

  const startPolling = () => {
    clearPolling();
    attemptRef.current = 0;
    setPollAttempt(1);
    timerRef.current = setTimeout(pollStatus, POLL_DELAYS[0]);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);

  return {
    isDebiting,
    mutate,
    debitError,
    isDebitSuccess,
    transRes,
    isChecking,
    stopPolling,
    pollAttempt,
    // isPolling: 
  };
};
