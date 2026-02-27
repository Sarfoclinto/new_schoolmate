import { useEffect, useRef } from "react";

interface UseInactivityOptions {
  timeout: number; // milliseconds
  onInactive: () => void;
}

export const useInactivity = ({
  timeout,
  onInactive,
}: UseInactivityOptions) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        onInactive();
      }, timeout);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeout, onInactive]);
};

// example usage
// useInactivity({
//   timeout: 10 * 60 * 1000, // 10 minutes
//   onInactive: () => {
//     logout();
//     navigate(paths.auth.login.href);
//   },
// });

// or use npm install react-idle-timer
// example usage with react-idle-timer
// import { useIdleTimer } from "react-idle-timer";

// const { isIdle } = useIdleTimer({
//   timeout: 1000 * 60 * 10, // 10 minutes
//   onIdle: () => logout(),
//   debounce: 500,
// });
