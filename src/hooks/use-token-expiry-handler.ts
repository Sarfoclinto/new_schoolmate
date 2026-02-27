import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

export const useTokenExpiryHandler = () => {
  const { expiresAt, logout } = useAuth(
    useShallow((s) => ({
      logout: s.logout,
      expiresAt: s.expiresAt,
    })),
  );
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
    toast.error("Session expired. Please login again.");
  }, [logout, navigate]);

  useEffect(() => {
    if (!expiresAt) return;

    const now = Date.now();
    const timeLeft = expiresAt - now;

    if (timeLeft <= 0) {
      handleLogout();
      return;
    }

    const warningTime = 5 * 60 * 1000; // 5 mins before expiry

    const warningTimeout = setTimeout(() => {
      toast.warning("Session expiring soon", {
        description: "Your session will expire in 5 minutes.",
        action: {
          label: "Logout now",
          onClick: () => handleLogout(),
        },
      });
    }, timeLeft - warningTime);

    const logoutTimeout = setTimeout(() => {
      handleLogout();
    }, timeLeft);

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
    };
  }, [expiresAt, handleLogout]);
};
