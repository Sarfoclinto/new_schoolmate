// =============================================================================
// SubscriptionGuard
// Wraps individual admin pages. If the subscription has expired, bounces the
// user to the subscription page — regardless of how they got to the URL
// (sidebar click, back button, typed address, bookmark, etc).
//
// This is deliberately separate from RouteGuard/ProtectRoute: expiry isn't a
// permission, it's a billing state, and every guarded page remounts this on
// each navigation (unlike the layout-level guard, which only mounts once).

import type { DashboardType } from "@/config/permissions";
import paths from "@/config/routes";
import { useAuth } from "@/store/auth.store";
import { useSignalRStore } from "@/store/signalr.store";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

// =============================================================================
const SubscriptionGuard = ({ children }: PropsWithChildren) => {
  const isExpired = useSignalRStore((s) => s.expiryStatus?.isExpired) ?? false;

  if (isExpired) {
    const dashboardType = useAuth.getState().user?.dashboardType as
      | DashboardType
      | undefined;
    if (!dashboardType) {
      return <Navigate to={paths.auth.login.href} replace />;
    }
    const subscriptionPath =
      dashboardType === "admin"
        ? paths.admin.subscription.href
        : paths.staff.subscription.href;
    return <Navigate to={subscriptionPath} replace />;
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
