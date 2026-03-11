import paths from "@/config/routes";
// import PageLoad from "@/components/custom/page-load";
import {
  DASHBOARD_TYPES,
  type DashboardType,
  type Permission,
} from "@/config/permissions";
import { useAuth } from "@/store/auth.store";
import { getUserDashboardRoute } from "@/utils/auth";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useSignalRStore } from "@/store/signalr.store";
import { useShallow } from "zustand/react/shallow";
import PageLoad from "./page-load";

// =============================================================================
// Shared guard logic
// =============================================================================

interface GuardProps extends PropsWithChildren {
  /**
   * Which dashboard type this layout belongs to.
   * Derived from the `dashboardType` field the backend returns on login.
   */
  requiredDashboard: DashboardType;
  /**
   * Optional — a specific permission the user must hold to access this route.
   * Use this on individual pages that need tighter control beyond just the
   * dashboard type (e.g. a finance settings page inside the admin dashboard).
   */
  requiredPermission?: Permission;
}

const RouteGuard = ({
  children,
  requiredDashboard,
  requiredPermission,
}: GuardProps) => {
  const { user, isAuth, isLoading } = useAuth(
    useShallow((s) => ({
      login: s.login,
      isAuth: s.isAuth,
      user: s.user,
      isLoading: s.isLoading,
    })),
  );
  const permissions = useSignalRStore((s) => s.permissions);

  // ── 1. Auth is still resolving (e.g. token refresh on first load) ──────────
  if (isLoading) return <PageLoad />;

  // ── 2. Not authenticated at all ────────────────────────────────────────────
  if (!isAuth || !user) {
    return <Navigate to={paths.auth.login.href} replace />;
  }

  // ── 3. Authenticated but wrong dashboard type ──────────────────────────────
  // Send them to their own dashboard instead of back to login —
  // they ARE logged in, just in the wrong place.
  if (user.dashboardType !== requiredDashboard) {
    return <Navigate to={getUserDashboardRoute()} replace />;
  }

  // ── 4. Right dashboard but missing a specific permission ───────────────────
  // Redirect to their dashboard root; you could also render a 403 page here.
  if (requiredPermission && !permissions?.includes(requiredPermission)) {
    return <Navigate to={getUserDashboardRoute()} replace />;
  }

  // ── 5. All checks passed ───────────────────────────────────────────────────
  return <>{children}</>;
};

// =============================================================================
// ProtectAdminRoutes
// Wraps the entire AdminLayout — every child route inherits the admin guard.
// =============================================================================
export const ProtectAdminRoutes = ({ children }: PropsWithChildren) => (
  <RouteGuard requiredDashboard={DASHBOARD_TYPES.ADMIN}>{children}</RouteGuard>
);

// =============================================================================
// ProtectStaffRoutes
// Wraps the entire StaffLayout.
// =============================================================================
export const ProtectStaffRoutes = ({ children }: PropsWithChildren) => (
  <RouteGuard requiredDashboard={DASHBOARD_TYPES.STAFF}>{children}</RouteGuard>
);

// =============================================================================
// ProtectRoute
// Use on individual pages that need a specific permission beyond the layout
// guard. Works for both admin and staff routes.
//
// Usage in a route file:
//
//   {
//     path: fees.href,
//     element: (
//       <ProtectRoute requiredPermission={PERMISSIONS.FINANCE_READ}>
//         <FeesSetup />
//       </ProtectRoute>
//     ),
//   }
//
// Because this sits inside an already-guarded layout, `requiredDashboard`
// defaults to whatever the parent layout already confirmed — we skip the
// dashboard check here to avoid redundancy. If you ever use this outside
// a guarded layout, pass `requiredDashboard` explicitly.
// =============================================================================
interface ProtectRouteProps extends PropsWithChildren {
  requiredPermission: Permission;
}

export const ProtectRoute = ({
  children,
  requiredPermission,
}: ProtectRouteProps) => {
  const { user, isAuth, isLoading } = useAuth(
    useShallow((s) => ({
      login: s.login,
      isAuth: s.isAuth,
      user: s.user,
      isLoading: s.isLoading,
    })),
  );
  const permissions = useSignalRStore((s) => s.permissions);

  if (isLoading) return <PageLoad />;
  if (!isAuth || !user) {
    return <Navigate to={paths.auth.login.href} replace />;
  }

  if (!permissions?.includes(requiredPermission)) {
    // Redirect to their dashboard root; swap for a <Forbidden /> page if you
    // want to show an explicit "you don't have access" message.
    return <Navigate to={getUserDashboardRoute()} replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
