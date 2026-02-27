import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

export const useUnsavedChangesWarning = (shouldBlock: boolean) => {
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?",
      );

      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);
};
