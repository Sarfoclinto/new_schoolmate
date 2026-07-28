import type {
  MutationFunction,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

export type UpdateParamProps<T = object> = {
  id: string;
  data: T | FormData;
};

export type FetchProps<TData, TError> = {
  queryFn: (ctx: { signal?: AbortSignal }) => Promise<TData>;
  queryKeys: QueryKey;
  title?: string;
  enabled?: boolean;
  /**
   * If true, show antd notification on error (default true).
   * If you want to show a custom UI, set to false and provide onError.
   */
  showErrorNotification?: boolean;
  /**
   * Extra options to pass to useQuery (staleTime, retry, refetchInterval, etc.)
   */
  queryOptions?: Omit<
    UseQueryOptions<TData, TError, TData>,
    "queryKey" | "queryFn"
  >;
  /**
   * Optional callback invoked after the notification (or in place of it if you set showErrorNotification=false)
   */
  onError?: (err: TError) => void;
};

export type CreateProps<TData, TVariables, TError = unknown> = {
  /**
   * The mutation function that performs the create operation.
   * Should return the created resource (or whatever the server returns).
   */
  postFn: MutationFunction<TData, TVariables>;

  /**
   * Optional title used to prefix the success notification (eg. "User")
   */
  title?: string;

  /**
   * Optional explicit success message to show instead of generated text.
   */
  successMsg?: string;

  /**
   * Toggle showing notifications (defaults true).
   */
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;

  /**
   * Optional callbacks. Both are invoked after built-in notification handling.
   */
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (err: TError, variables: TVariables) => void;

  /**
   * Extra `useMutation` options (retry, onSettled, etc.). Note:
   * if you pass `onSuccess` or `onError` here they will be invoked *after*
   * the wrapper's handlers and your callbacks.
   */
  mutationOptions?: UseMutationOptions<TData, TError, TVariables>;
};

export type DeleteProps<
  TData = unknown,
  TVariables = unknown,
  TError = unknown,
> = {
  /**
   * The delete function. Should return whatever the server returns (often { success: true }).
   * The function receives whatever you pass into mutate() (commonly an id).
   */
  deleteFn: MutationFunction<TData, TVariables>;

  /**
   * Optional list/query-key to invalidate after deletion (or used for optimistic updates).
   */
  invalidateQueryKey?: QueryKey | QueryKey[];

  /**
   * Optional: if true, show built-in success notification.
   */
  showSuccessNotification?: boolean;
  successMsg?: string;
  title?: string;

  /**
   * Optional optimistic updater: update the cached data before the server responds.
   * Example: to remove item from a list cache, return the previous data as context.
   *
   * If not provided, the hook will attempt a basic optimistic removal for lists
   * if `invalidateQueryKey` is given (see implementation).
   */
  optimistic?: {
    /**
     * QueryKey to target for optimistic update. If not provided, but invalidateQueryKey is
     * an array or single key representing a list, the hook tries a best-effort update.
     */
    queryKey?: QueryKey;
    /**
     * Function to compute optimistic update. Receives previous cached value and variables.
     * Should return the new cached value.
     */
    updater?: (prev: unknown, variables: TVariables) => unknown;
  };

  onSuccess?: (data: TData) => void;
  onError?: (err: unknown) => void;

  mutationOptions?: UseMutationOptions<TData, TError, TVariables>;
};

export type UpdateProps<
  TData = unknown,
  TVariables = UpdateParamProps,
  TError = unknown,
> = {
  updateFn: MutationFunction<TData, TVariables>;
  /**
   * Query key(s) to invalidate after update (or used for optimistic update).
   */
  invalidateQueryKey?: QueryKey | QueryKey[];
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMsg?: string;
  title?: string;

  optimistic?: {
    queryKey?: QueryKey;
    /**
     * updater receives the previous cached value and variables and should return the new value.
     * For a list, it might map and replace the updated item.
     */
    updater?: (
      prev: unknown,
      variables: TVariables,
      returned?: TData,
    ) => unknown;
  };

  onSuccess?: (data: TData) => void;
  onError?: (err: TError) => void;

  mutationOptions?: UseMutationOptions<TData, TError, TVariables>;
};
