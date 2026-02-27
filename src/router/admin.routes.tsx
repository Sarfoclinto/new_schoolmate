import paths from "@/config/routes";
import AdminLayout from "@/features/admins/components/layout";
import ProtectAdminRoutes from "@/features/admins/components/protect-layout";
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const {
  // setup
  index,
  profile,
  roles,
  educationalLevel,
  academicLevel,
  subLevel,
  promotionPath,
  studyModules,
  facultyNClassroom,
  assessmentNGrading,
  facilities,
  yearsNTerms,

  // students
  registerStudent,
  viewAll,
  viewBySub,
  viewByAca,
  viewByEdu,
  studentDetails,

  // staff
  createStaff,
  staffAssignment,
  staffDetails,
  allStaff,
  staffByMode,
  staffByRole,

  // reports
  stuTermReport,
  stuAttReport,
  stuReportDetail,
} = paths.admin;

// admin pages component
// setup
const Dashboard = lazy(() => import("@/features/admins/pages/setup/dashboard"));
const InsititutionProfile = lazy(
  () => import("@/features/admins/pages/setup/institution-profile"),
);
const Roles = lazy(() => import("@/features/admins/pages/setup/roles"));
const EducationalLevel = lazy(
  () => import("@/features/admins/pages/setup/educational-level"),
);
const AcademicLevel = lazy(
  () => import("@/features/admins/pages/setup/academic-level"),
);
const PromotionPath = lazy(
  () => import("@/features/admins/pages/setup/promotion-path"),
);
const SubLevel = lazy(() => import("@/features/admins/pages/setup/sublevel"));
const StudyModules = lazy(
  () => import("@/features/admins/pages/setup/study-modules"),
);
const FacultynClassroom = lazy(
  () => import("@/features/admins/pages/setup/faculty-n-classroom"),
);
const AssessmentnGrading = lazy(
  () => import("@/features/admins/pages/setup/assesment-n-grading"),
);
const Facilities = lazy(
  () => import("@/features/admins/pages/setup/facilities"),
);
const YearsnTerms = lazy(
  () => import("@/features/admins/pages/setup/years-n-terms"),
);

// students
const RegisterStudent = lazy(
  () => import("@/features/admins/pages/students/register"),
);
const ViewAll = lazy(() => import("@/features/admins/pages/students/view/all"));
const ViewBySubLevel = lazy(
  () => import("@/features/admins/pages/students/view/by-sublevel"),
);
const ViewByAcaLevel = lazy(
  () => import("@/features/admins/pages/students/view/by-aca-level"),
);
const ViewByEduLevel = lazy(
  () => import("@/features/admins/pages/students/view/by-edu-level"),
);
const StudentDetails = lazy(
  () => import("@/features/admins/pages/students/view/detail"),
);

// staff
const CreateStaff = lazy(() => import("@/features/admins/pages/staff/create"));
const StaffAssignment = lazy(
  () => import("@/features/admins/pages/staff/assignment"),
);
const StaffDetails = lazy(
  () => import("@/features/admins/pages/staff/view/staff-detail"),
);
const AllStaff = lazy(() => import("@/features/admins/pages/staff/view/all"));
const StaffByMode = lazy(
  () => import("@/features/admins/pages/staff/view/by-staff-mode"),
);
const StaffByRole = lazy(
  () => import("@/features/admins/pages/staff/view/by-role"),
);

// reports
const ViewTerminalReport = lazy(
  () => import("@/features/admins/pages/reports/terminal"),
);
const ViewMonthlyAttendance = lazy(
  () => import("@/features/admins/pages/reports/monthly-attendance"),
);
const ReportDetail = lazy(
  () => import("@/features/admins/pages/reports/report-details"),
);

const adminRoutes: RouteObject[] = [
  {
    path: index.href,
    element: (
      <ProtectAdminRoutes>
        <AdminLayout />
      </ProtectAdminRoutes>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // setups
      {
        path: profile.href,
        element: <InsititutionProfile />,
      },
      {
        path: roles.href,
        element: <Roles />,
      },
      {
        path: educationalLevel.href,
        element: <EducationalLevel />,
      },
      {
        path: academicLevel.href,
        element: <AcademicLevel />,
      },
      {
        path: promotionPath.href,
        element: <PromotionPath />,
      },
      {
        path: subLevel.href,
        element: <SubLevel />,
      },
      {
        path: studyModules.href,
        element: <StudyModules />,
      },
      {
        path: facultyNClassroom.href,
        element: <FacultynClassroom />,
      },
      {
        path: assessmentNGrading.href,
        element: <AssessmentnGrading />,
      },
      {
        path: facilities.href,
        element: <Facilities />,
      },
      {
        path: yearsNTerms.href,
        element: <YearsnTerms />,
      },

      // students
      {
        path: registerStudent.href,
        element: <RegisterStudent />,
      },
      {
        path: viewAll.href,
        element: <ViewAll />,
      },
      {
        path: viewBySub.href,
        element: <ViewBySubLevel />,
      },
      {
        path: viewByAca.href,
        element: <ViewByAcaLevel />,
      },
      {
        path: viewByEdu.href,
        element: <ViewByEduLevel />,
      },
      {
        path: studentDetails.href,
        element: <StudentDetails />,
      },

      // staff
      {
        path: createStaff.href,
        element: <CreateStaff />,
      },
      {
        path: staffAssignment.href,
        element: <StaffAssignment />,
      },
      {
        path: staffDetails.href,
        element: <StaffDetails />,
      },
      {
        path: allStaff.href,
        element: <AllStaff />,
      },
      {
        path: staffByMode.href,
        element: <StaffByMode />,
      },
      {
        path: staffByRole.href,
        element: <StaffByRole />,
      },

      //
      {
        path: stuTermReport.href,
        element: <ViewTerminalReport />,
      },
      {
        path: stuAttReport.href,
        element: <ViewMonthlyAttendance />,
      },
      {
        path: stuReportDetail.href,
        element: <ReportDetail />,
      },
    ],
  },
];

export default adminRoutes;
