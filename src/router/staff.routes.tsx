import paths from "@/config/routes";
import StaffLayout from "@/features/staff/components/layout";
import ProtectStaffRoutes from "@/features/staff/components/protect-layout";
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// admin pages component
const Dashboard = lazy(() => import("@/features/staff/pages/dashboard"));

const staffRoutes: RouteObject[] = [
  {
    path: paths.staff.index.href,
    element: (
      <ProtectStaffRoutes>
        <StaffLayout />
      </ProtectStaffRoutes>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
];

export default staffRoutes;
