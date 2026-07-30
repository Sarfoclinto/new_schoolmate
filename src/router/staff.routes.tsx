import {
  ProtectRoute,
  ProtectStaffRoutes,
} from "@/components/custom/protect-routes";
import SubscriptionGuard from "@/components/custom/subscription-guard";
import { STAFF_ROUTE_PERMISSIONS } from "@/config/route.permission";
import paths from "@/config/routes";
import StaffLayout from "@/features/staff/components/layout";
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const { staff } = paths;
const {
  // assignments
  classesnSubjects,
  students,
  index,

  // academic records
  addRecord,
  passMark,
  viewRecords,

  // attendance
  markAttendance,
  viewAttendance,

  // notice
  notice,

  // request
  request,

  // profile
  profile,

  // remarks
  remarks,

  // notification
  notification,

  //subscription
  subscription,
} = staff;

// admin pages component
const Dashboard = lazy(() => import("@/features/staff/pages/dashboard"));

// assginments
const ClassesnSubjects = lazy(
  () => import("@/features/staff/pages/assignments/classes-n-subjects"),
);
const Students = lazy(
  () => import("@/features/staff/pages/assignments/students"),
);

// academic records
const AddRecords = lazy(
  () => import("@/features/staff/pages/academic-records/add-record"),
);
const ViewRecords = lazy(
  () => import("@/features/staff/pages/academic-records/view-records"),
);
const PassMarks = lazy(
  () => import("@/features/staff/pages/academic-records/pass-marks"),
);

// attendance
const MarkAttendance = lazy(
  () => import("@/features/staff/pages/attendance/mark"),
);
const ViewAttance = lazy(
  () => import("@/features/staff/pages/attendance/view"),
);

// progile
const Profile = lazy(() => import("@/features/auth/pages/profile"));

// notice
const Notice = lazy(() => import("@/features/staff/pages/notice"));

// request
const Request = lazy(() => import("@/features/staff/pages/request"));

// remarks
const Remarks = lazy(() => import("@/features/staff/pages/remarks"));

// notification
const Notifications = lazy(() => import("@/features/staff/pages/notification"));

// subscription
const Subscription = lazy(() => import("@/features/staff/pages/subscription"));

// =============================================================================
// Pages that stay reachable even when the subscription has expired.
// Keep this in sync with `exemptFromExpiry` items in staff-menu-items.ts.
// =============================================================================
const EXEMPT_FROM_EXPIRY = new Set<string>([
  index.href,
  classesnSubjects.href,
  students.href,
  viewAttendance.href,
  addRecord.href,
  viewRecords.href,
]);

// =============================================================================
// guard helper
// Wraps a page element in <ProtectRoute> if ROUTE_PERMISSIONS has an entry
// for the given path. Otherwise returns the element unwrapped.
//
// The layout-level ProtectAdminRoutes has already confirmed:
//   ✅ user is authenticated
//   ✅ user has dashboardType === "admin"
//
// This guard only adds the finer per-page permission check on top of that.
// =============================================================================
const guarded = (path: string, element: React.ReactNode): React.ReactNode => {
  const permission = STAFF_ROUTE_PERMISSIONS[path];

  const permissionChecked = permission ? (
    <ProtectRoute requiredPermission={permission} intendedPath={path}>
      {element}
    </ProtectRoute>
  ) : (
    element
  );

  if (EXEMPT_FROM_EXPIRY.has(path)) return permissionChecked;

  return <SubscriptionGuard>{permissionChecked}</SubscriptionGuard>;
};

const staffRoutes: RouteObject[] = [
  {
    path: index.href,
    element: (
      <ProtectStaffRoutes>
        <StaffLayout />
      </ProtectStaffRoutes>
    ),
    children: [
      {
        index: true,
        element: guarded(index.href, <Dashboard />),
      },
      // assignments
      {
        path: classesnSubjects.href,
        element: guarded(classesnSubjects.href, <ClassesnSubjects />),
      },
      {
        path: students.href,
        element: guarded(students.href, <Students />),
      },

      // academic records
      {
        path: addRecord.href,
        element: guarded(addRecord.href, <AddRecords />),
      },
      {
        path: viewRecords.href,
        element: guarded(viewRecords.href, <ViewRecords />),
      },
      {
        path: passMark.href,
        element: guarded(passMark.href, <PassMarks />),
      },

      // attendance
      {
        path: markAttendance.href,
        element: guarded(markAttendance.href, <MarkAttendance />),
      },
      {
        path: viewAttendance.href,
        element: guarded(viewAttendance.href, <ViewAttance />),
      },

      // notices
      {
        path: notice.href,
        element: guarded(notice.href, <Notice />),
      },

      // requests
      {
        path: request.href,
        element: guarded(request.href, <Request />),
      },

      // profile
      {
        path: profile.href,
        element: guarded(profile.href, <Profile />),
      },

      // remarks
      {
        path: remarks.href,
        element: guarded(remarks.href, <Remarks />),
      },

      // notifications
      {
        path: notification.href,
        element: guarded(notification.href, <Notifications />),
      },

      // subscription
      {
        path: subscription.href,
        element: <Subscription />,
      },
    ],
  },
];

export default staffRoutes;
