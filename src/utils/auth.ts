// =============================================================================
// Updated string utils — drop DEFAULT_ROLES entirely
// =============================================================================
import paths from "@/config/routes";
import { DASHBOARD_TYPES, type DashboardType } from "@/config/permissions";
import { useAuth } from "@/store/auth.store";

const dashboardRoutes: Record<DashboardType, string> = {
  [DASHBOARD_TYPES.ADMIN]: paths.admin.index.href,
  [DASHBOARD_TYPES.STAFF]: paths.staff.index.href,
};

/**
 * Returns the correct dashboard route for the currently logged-in user.
 * Relies on `dashboardType` from the auth store — set by the backend on login.
 * No role-name guessing anywhere.
 */
export const getUserDashboardRoute = (): string => {
  const user = useAuth.getState().user;

  if (!user?.dashboardType) {
    console.log("user dashboard not found: ", user?.dashboardType);

    return paths.auth.login.href;
  }

  return (
    dashboardRoutes[user.dashboardType as DashboardType] ??
    paths.public.unknown.redirect(
      `Unknown dashboardType: ${user.dashboardType}`,
    )
  );
};

// =============================================================================
// Auth user type — update your auth store's User type to match this shape
// =============================================================================
import type { Permission } from "@/config/permissions";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  /** Human-readable role name set by the school — display only */
  role: string;
  /**
   * Always one of your known DashboardType values.
   * The backend sets this when the school creates the role.
   */
  dashboardType: DashboardType;
  /**
   * Flat array of permission strings from your PERMISSIONS constant.
   * Backend derives these from the role's saved permissions.
   */
  permissions: Permission[];
}

// =============================================================================
// Sidebar usage — how to wire the hook in SidebarContent
// =============================================================================
//
// import adminMenu from "@/features/admins/data/admin-menu-items";
// import staffMenu from "@/features/staff/data/staff-menu-items";
// import { useFilteredMenu } from "@/hooks/use-filtered-menu";
//
// In AdminLayout's SidebarContent:
//   const filteredMenu = useFilteredMenu(adminMenu);
//   <Menu items={filteredMenu} ... />
//
// In StaffLayout's SidebarContent:
//   const filteredMenu = useFilteredMenu(staffMenu);
//   <Menu items={filteredMenu} ... />
//
// =============================================================================
// Route-level permission guard usage (optional, for tight pages)
// =============================================================================
//
// In admin.routes.tsx:
//   import { ProtectRoute } from "@/components/protect-routes";
//   import { PERMISSIONS } from "@/config/permissions";
//
//   {
//     path: fees.href,
//     element: (
//       <ProtectRoute requiredPermission={PERMISSIONS.FINANCE_READ}>
//         <FeesSetup />
//       </ProtectRoute>
//     ),
//   }
