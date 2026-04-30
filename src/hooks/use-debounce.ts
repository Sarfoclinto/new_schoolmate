import { useCallback, useRef, useState } from "react";

// ── Debounce hook ──────────────────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState<T>(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const update = useCallback(
    (val: T) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDebounced(val), delay);
    },
    [delay],
  );

  // update on value change from outside
  // eslint-disable-next-line react-hooks/refs
  if (value !== debounced) update(value);

  return debounced;
}
