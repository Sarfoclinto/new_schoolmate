// =============================================================================
// SubscriptionGuard
// Wraps individual admin pages. If the subscription has expired, bounces the
// user to the subscription page — regardless of how they got to the URL
// (sidebar click, back button, typed address, bookmark, etc).
//
// This is deliberately separate from RouteGuard/ProtectRoute: expiry isn't a
// permission, it's a billing state, and every guarded page remounts this on
// each navigation (unlike the layout-level guard, which only mounts once).

import paths from "@/config/routes";
import { useSignalRStore } from "@/store/signalr.store";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

// =============================================================================
const SubscriptionGuard = ({ children }: PropsWithChildren) => {
  const isExpired = useSignalRStore((s) => s.expiryStatus?.isExpired) ?? false;

  if (isExpired) {
    return <Navigate to={paths.admin.subscription.href} replace />;
  }

  return <>{children}</>;
};

export default SubscriptionGuard
