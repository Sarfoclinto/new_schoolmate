import { getHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { DashboardData } from "@/types/api/setup/admin";

export const getAdminDashboardData = async (params?: {
  academicYearId?: string;
  academicTermId?: string;
}) => {
  return getHelper<DashboardData>(endpoints.admin.dashboardData, params);
};
