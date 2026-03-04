import paths from "@/config/routes";
import StaffLayout from "@/features/staff/components/layout";
import ProtectStaffRoutes from "@/features/staff/components/protect-layout";
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

  // profile
  profile,

  // notification
  notification,
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

// notification
const Notifications = lazy(() => import("@/features/staff/pages/notification"));

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
        element: <Dashboard />,
      },
      // assignments
      {
        path: classesnSubjects.href,
        element: <ClassesnSubjects />,
      },
      {
        path: students.href,
        element: <Students />,
      },

      // academic records
      {
        path: addRecord.href,
        element: <AddRecords />,
      },
      {
        path: viewRecords.href,
        element: <ViewRecords />,
      },
      {
        path: passMark.href,
        element: <PassMarks />,
      },

      // attendance
      {
        path: markAttendance.href,
        element: <MarkAttendance />,
      },
      {
        path: viewAttendance.href,
        element: <ViewAttance />,
      },

      // notices
      {
        path: notice.href,
        element: <Notice />,
      },

      // profile
      {
        path: profile.href,
        element: <Profile />,
      },

      // notifications
      {
        path: notification.href,
        element: <Notifications />,
      },
    ],
  },
];

export default staffRoutes;
