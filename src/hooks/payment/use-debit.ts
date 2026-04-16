import type { DebitObj, TransStatRes } from "@/types/api/finance";
import { useEffect, useRef, useState } from "react";
import usePost from "../api/use-post";
import { checkStatusFn, debitFn } from "@/services/finance";
import useFetch from "../api/use-fetch";
import type {
  QueryObserverResult,
  UseMutateFunction,
} from "@tanstack/react-query";
import type { MdResponse } from "@/types/api";
import type { AxiosError } from "axios";

export interface CreateDebitProps {
  onSuccessFn?: () => void;
  refNo: string;
  /** Max polling time in milliseconds. Default: 2 minutes */
  maxPollingTime?: number;
  /** Max number of polling attempts. Default: 20 */
  maxAttempts?: number;
}

export interface UseDebitReturn {
  // Mutation state
  isDebiting: boolean;
  // mutate: ReturnType<typeof usePost>["mutate"];
  mutate: UseMutateFunction<
    MdResponse,
    AxiosError<unknown, unknown>,
    DebitObj,
    unknown
  >;
  debitError: ReturnType<typeof usePost>["error"];
  isDebitSuccess: ReturnType<typeof usePost>["isSuccess"];

  // Polling state
  isPolling: boolean;
  isChecking: boolean;
  pollAttempt: number;
  pollError: Error | null;
  hasExceededTimeout: boolean;
  hasExceededMaxAttempts: boolean;

  // Transaction response
  transRes: TransStatRes | undefined;

  // Controls
  stopPolling: () => void;
  /** Clear all state and reset hook */
  reset: () => void;
}

const SUCCESS_MESSAGE = "Successfully Processed Transaction";
const DEFAULT_MAX_POLLING_TIME = 2 * 60 * 1000; // 2 minutes
const DEFAULT_MAX_ATTEMPTS = 20;

export const useDebit = ({
  onSuccessFn,
  refNo,
  maxPollingTime = DEFAULT_MAX_POLLING_TIME,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
}: CreateDebitProps): UseDebitReturn => {
  // Polling delays: starts at 10s, decreases to 3s minimum
  const POLL_DELAYS = [10_000, 7_000, 5_000, 3_000];

  // State
  const [pollAttempt, setPollAttempt] = useState(0);
  const [pollError, setPollError] = useState<Error | null>(null);
  const [hasExceededTimeout, setHasExceededTimeout] = useState(false);
  const [hasExceededMaxAttempts, setHasExceededMaxAttempts] = useState(false);

  // Refs: track timing, attempts, timers, and abort signals
  const attemptRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStartTimeRef = useRef(0);
  const isPollingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    queryFn: ({ signal }) => checkStatusFn({ refNo }, signal),
    enabled: false,
    showErrorNotification: false, // We handle error display in the hook
    queryOptions: { retry: false },
  });

  /**
   * Check if transaction is successful
   */
  const isTransactionSuccess = transRes?.responseMessage === SUCCESS_MESSAGE;

  /**
   * Clear polling timers and reset internal state
   */
  const clearPolling = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Abort any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    isPollingRef.current = false;
  };

  /**
   * Stop polling and optionally reset all state
   */
  const stopPolling = () => {
    clearPolling();
    setPollError(null);
    setHasExceededTimeout(false);
    setHasExceededMaxAttempts(false);
  };

  /**
   * Complete reset of hook state
   */
  const reset = () => {
    stopPolling();
    attemptRef.current = 0;
    pollStartTimeRef.current = 0;
    setPollAttempt(0);
  };

  /**
   * Main polling function with comprehensive edge case handling
   */
  const pollStatus = async () => {
    try {
      // Safety check: abort if exceeding limits
      // eslint-disable-next-line react-hooks/purity
      const elapsedTime = Date.now() - pollStartTimeRef.current;

      if (elapsedTime > maxPollingTime) {
        setHasExceededTimeout(true);
        clearPolling();
        setPollError(
          new Error(
            `Polling timeout exceeded (${(maxPollingTime / 1000).toFixed(0)}s)`,
          ),
        );
        return;
      }

      if (attemptRef.current >= maxAttempts) {
        setHasExceededMaxAttempts(true);
        clearPolling();
        setPollError(
          new Error(`Maximum polling attempts exceeded (${maxAttempts})`),
        );
        return;
      }

      // Execute status check
      const result: QueryObserverResult<TransStatRes, { refNo: string }> =
        await refetch();

      setPollAttempt((p) => p + 1);

      // Success case: stop polling
      if (result.data?.responseMessage === SUCCESS_MESSAGE) {
        clearPolling();
        setPollError(null);
        return;
      }

      // Failure/Declined case: also stop polling
      if (
        result.data?.responseMessage &&
        result.data.responseMessage.toLowerCase().includes("fail")
      ) {
        clearPolling();
        setPollError(new Error(result.data.responseMessage));
        return;
      }

      // Still pending: schedule next poll
      attemptRef.current += 1;

      // Get next delay (use last delay if we've exhausted the array)
      const nextDelayIndex = Math.min(
        attemptRef.current,
        POLL_DELAYS.length - 1,
      );
      const nextDelay = POLL_DELAYS[nextDelayIndex];

      timerRef.current = setTimeout(pollStatus, nextDelay);
    } catch (error) {
      // Check if error is due to abort signal
      if (error instanceof Error && error.name === "AbortError") {
        // Request was cancelled - this is expected when user stops polling
        return;
      }

      // Network or API error during polling
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check if we should retry
      if (attemptRef.current < maxAttempts - 1) {
        attemptRef.current += 1;
        setPollError(new Error(`Polling error: ${errorMessage}`));

        const nextDelayIndex = Math.min(
          attemptRef.current,
          POLL_DELAYS.length - 1,
        );
        const nextDelay = POLL_DELAYS[nextDelayIndex];

        timerRef.current = setTimeout(pollStatus, nextDelay);
      } else {
        // Exceeded max attempts on error
        setHasExceededMaxAttempts(true);
        clearPolling();
        setPollError(
          new Error(
            `Polling failed after ${maxAttempts} attempts: ${errorMessage}`,
          ),
        );
      }
    }
  };

  /**
   * Initiate polling sequence
   */
  const startPolling = () => {
    // Safety: prevent concurrent polling
    if (isPollingRef.current) {
      console.warn("Polling already in progress for reference:", refNo);
      return;
    }

    clearPolling();
    attemptRef.current = 0;
    pollStartTimeRef.current = Date.now();
    isPollingRef.current = true;
    setPollAttempt(1);
    setPollError(null);
    setHasExceededTimeout(false);
    setHasExceededMaxAttempts(false);

    // Start first poll immediately
    timerRef.current = setTimeout(pollStatus, POLL_DELAYS[0]);
  };

  /**
   * Cleanup on unmount - critical for preventing memory leaks and orphaned timers
   */
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);

  /**
   * Auto-stop polling when transaction succeeds
   */
  useEffect(() => {
    if (isTransactionSuccess) {
      clearPolling();
      setPollError(null);
    }
  }, [isTransactionSuccess]);

  return {
    // Mutation state
    isDebiting,
    mutate,
    debitError,
    isDebitSuccess,

    // Polling state
    isPolling: isPollingRef.current,
    isChecking,
    pollAttempt,
    pollError,
    hasExceededTimeout,
    hasExceededMaxAttempts,

    // Transaction response
    transRes,

    // Controls
    stopPolling,
    reset,
  };
};
