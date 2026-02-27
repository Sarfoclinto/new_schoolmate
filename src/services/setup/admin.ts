import { getHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { DashboardData } from "@/types/api/setup/admin";

export const getAdminDashboardData = async () => {
  return getHelper<DashboardData>(endpoints.admin.dashboardData);
};
