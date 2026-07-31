import {
  ProtectAdminRoutes,
  ProtectRoute,
} from "@/components/custom/protect-routes";
import SubscriptionGuard from "@/components/custom/subscription-guard";
import UnderConstruction from "@/components/custom/under-construction";
// import UnderConstruction from "@/components/custom/under-construction";
import { ADMIN_ROUTE_PERMISSIONS } from "@/config/route.permission";
import paths from "@/config/routes";
import AdminLayout from "@/features/admins/components/layout";
import { lazy } from "react";
import { type RouteObject } from "react-router-dom";

const {
  // profile
  adminProfile,
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
  principalTeacher,

  // reports
  stuTermReport,
  stuAttReport,
  stuReportDetail,
  academicRecords,
  classRanking,
  bulkReportPrint,

  // finance
  fees,
  subLedgers,
  bills,
  classBill,

  // guardian
  guardian,

  // events & notice
  notice,
  allEvents,
  createEvent,

  // permissions
  admin_permissions,
  staff_permissions,

  // sessions
  closeAcademicTerm,
  openAcademicTerm,
  closeAcademicYear,

  // requests
  request,

  // subscription
  subscription,
} = paths.admin;

// admin pages component
// setup
const Dashboard = lazy(() => import("@/features/admins/pages/dashboard"));
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
const PrincipalTeachers = lazy(
  () => import("@/features/admins/pages/staff/view/view-assignments"),
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
const AcademicRecords = lazy(
  () => import("@/features/admins/pages/reports/view-academic-records"),
);
const ClassRanking = lazy(
  () => import("@/features/admins/pages/reports/class-ranking"),
);
const BulkReportPrint = lazy(
  () => import("@/features/admins/pages/reports/bulk"),
);

// finance
const Fees = lazy(() => import("@/features/admins/pages/finance/fees"));
const SubLedgers = lazy(
  () => import("@/features/admins/pages/finance/create-sub-ledger"),
);
const Bills = lazy(() => import("@/features/admins/pages/finance/bills"));
const ClassBills = lazy(
  () => import("@/features/admins/pages/finance/bills/class"),
);

// guardian
const Guardian = lazy(() => import("@/features/admins/pages/guardian-mng"));

// events & notices
const Notice = lazy(() => import("@/features/admins/pages/notice"));
const AllEvents = lazy(() => import("@/features/admins/pages/events/view"));
const CreateEvent = lazy(() => import("@/features/admins/pages/events/create"));

// progile
const Profile = lazy(() => import("@/features/auth/pages/profile"));

// permission
const AdministrativePermissions = lazy(
  () => import("@/features/admins/pages/permissions/admin_permissions"),
);
const StaffPermissions = lazy(
  () => import("@/features/admins/pages/permissions/staff_permissions"),
);

// sessions
const CloseAcademicTerm = lazy(
  () => import("@/features/admins/pages/session/close-academic-term"),
);
// const OpenAcademicTerm = lazy(
//   () => import("@/features/admins/pages/session/open-academic-term"),
// );
// const CloseAcademicYear = lazy(
//   () => import("@/features/admins/pages/session/close-academic-year"),
// );

// request
const Request = lazy(() => import("@/features/admins/pages/request"));

// subscription
const Subscription = lazy(() => import("@/features/admins/pages/subscription"));

// =============================================================================
// Pages that stay reachable even when the subscription has expired.
// Keep this in sync with `exemptFromExpiry` items in admin-menu-items.ts.
// =============================================================================
const EXEMPT_FROM_EXPIRY = new Set<string>([
  // profile
  adminProfile.href,
  // setup
  index.href,
  profile.href,
  roles.href,
  educationalLevel.href,
  academicLevel.href,
  subLevel.href,
  promotionPath.href,
  studyModules.href,
  facultyNClassroom.href,
  assessmentNGrading.href,
  facilities.href,
  yearsNTerms.href,

  // students
  registerStudent.href,
  viewAll.href,
  viewBySub.href,
  viewByAca.href,
  viewByEdu.href,
  studentDetails.href,

  // staff
  createStaff.href,
  staffAssignment.href,
  staffDetails.href,
  allStaff.href,
  staffByMode.href,
  staffByRole.href,
  principalTeacher.href,

  // reports
  stuAttReport.href,
  academicRecords.href,
  classRanking.href,

  // finance
  fees.href,
  subLedgers.href,
  bills.href,
  classBill.href,

  // guardian
  guardian.href,

  // events & notice
  notice.href,
  allEvents.href,
  createEvent.href,

  // permissions
  admin_permissions.href,
  staff_permissions.href,

  // sessions
  closeAcademicTerm.href,
  openAcademicTerm.href,
  closeAcademicYear.href,

  // requests
  request.href,

  // subscription
  subscription.href,
]);

// =============================================================================
// guard helper
// Wraps a page element in <ProtectRoute> if ROUTE_PERMISSIONS has an entry
// for the given path, then wraps the result in <SubscriptionGuard> unless
// the path is explicitly exempt (e.g. the subscription page itself — wrapping
// it would redirect it to itself in an infinite loop).
//
// The layout-level ProtectAdminRoutes has already confirmed:
//    user is authenticated
//    user has dashboardType === "admin"
// =============================================================================
const guarded = (path: string, element: React.ReactNode): React.ReactNode => {
  const permission = ADMIN_ROUTE_PERMISSIONS[path];

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

// =============================================================================
// Admin routes
// =============================================================================
const adminRoutes: RouteObject[] = [
  {
    path: index.href,
    // ProtectAdminRoutes is the outer shell — handles auth + dashboardType.
    // Individual pages are wrapped by `guarded()` for permission-level checks.
    element: (
      <ProtectAdminRoutes>
        <AdminLayout />
      </ProtectAdminRoutes>
    ),
    children: [
      {
        // Dashboard is always accessible to any admin-dashboard user
        index: true,
        element: <Dashboard />,
      },

      // ── Setup ───────────────────────────────────────────────────────────────
      {
        path: profile.href,
        element: guarded(profile.href, <InsititutionProfile />),
      },
      { path: roles.href, element: guarded(roles.href, <Roles />) },
      {
        path: educationalLevel.href,
        element: guarded(educationalLevel.href, <EducationalLevel />),
      },
      {
        path: academicLevel.href,
        element: guarded(academicLevel.href, <AcademicLevel />),
      },
      {
        path: promotionPath.href,
        element: guarded(promotionPath.href, <PromotionPath />),
      },
      { path: subLevel.href, element: guarded(subLevel.href, <SubLevel />) },
      {
        path: studyModules.href,
        element: guarded(studyModules.href, <StudyModules />),
      },
      {
        path: facultyNClassroom.href,
        element: guarded(facultyNClassroom.href, <FacultynClassroom />),
      },
      {
        path: assessmentNGrading.href,
        element: guarded(assessmentNGrading.href, <AssessmentnGrading />),
      },
      {
        path: facilities.href,
        element: guarded(facilities.href, <Facilities />),
      },
      {
        path: yearsNTerms.href,
        element: guarded(yearsNTerms.href, <YearsnTerms />),
      },

      // ── Students ────────────────────────────────────────────────────────────
      {
        path: registerStudent.href,
        element: guarded(registerStudent.href, <RegisterStudent />),
      },
      { path: viewAll.href, element: guarded(viewAll.href, <ViewAll />) },
      {
        path: viewBySub.href,
        element: guarded(viewBySub.href, <ViewBySubLevel />),
      },
      {
        path: viewByAca.href,
        element: guarded(viewByAca.href, <ViewByAcaLevel />),
      },
      {
        path: viewByEdu.href,
        element: guarded(viewByEdu.href, <ViewByEduLevel />),
      },
      {
        path: studentDetails.href,
        element: guarded(studentDetails.href, <StudentDetails />),
      },

      // ── Staff ───────────────────────────────────────────────────────────────
      {
        path: createStaff.href,
        element: guarded(createStaff.href, <CreateStaff />),
      },
      {
        path: staffAssignment.href,
        element: guarded(staffAssignment.href, <StaffAssignment />),
      },
      {
        path: principalTeacher.href,
        element: guarded(principalTeacher.href, <PrincipalTeachers />),
      },
      {
        path: staffDetails.href,
        element: guarded(staffDetails.href, <StaffDetails />),
      },
      { path: allStaff.href, element: guarded(allStaff.href, <AllStaff />) },
      {
        path: staffByMode.href,
        element: guarded(staffByMode.href, <StaffByMode />),
      },
      {
        path: staffByRole.href,
        element: guarded(staffByRole.href, <StaffByRole />),
      },

      // ── Reports ─────────────────────────────────────────────────────────────
      {
        path: stuTermReport.href,
        element: guarded(stuTermReport.href, <ViewTerminalReport />),
        // element: guarded(
        //   stuTermReport.href,
        //   <UnderConstruction
        //     variant="unavailable"
        //     title="Student terminal report"
        //     description="This page is temporarily unavailable because your subscription has expired. Renew your subscription to regain access to terminal reports and related features."
        //     action={
        //       <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
        //         Renew subscription
        //       </button>
        //     }
        //   />,
        // ),
      },
      {
        path: stuAttReport.href,
        element: guarded(stuAttReport.href, <ViewMonthlyAttendance />),
      },
      {
        path: academicRecords.href,
        element: guarded(academicRecords.href, <AcademicRecords />),
      },
      {
        path: stuReportDetail.href,
        element: guarded(stuReportDetail.href, <ReportDetail />),
      },
      {
        path: classRanking.href,
        element: guarded(classRanking.href, <ClassRanking />),
      },
      {
        path: bulkReportPrint.href,
        element: guarded(bulkReportPrint.href, <BulkReportPrint />),
        // element: guarded(
        //   bulkReportPrint.href,
        //   <UnderConstruction
        //     showTag={false}
        //     title="Bulk Student report  print"
        //     description="Page is currently unavailable due to expired subscription"
        //   />,
        // ),
      },

      // ── Finance ─────────────────────────────────────────────────────────────
      { path: fees.href, element: guarded(fees.href, <Fees />) },
      {
        path: subLedgers.href,
        element: guarded(subLedgers.href, <SubLedgers />),
      },
      { path: bills.href, element: guarded(bills.href, <Bills />) },
      {
        path: classBill.href,
        element: guarded(classBill.href, <ClassBills />),
      },

      // ── Guardian ─────────────────────────────────────────────────────────────
      {
        path: guardian.href,
        element: guarded(guardian.href, <Guardian />),
      },

      // ── Events & Notices ────────────────────────────────────────────────────
      { path: allEvents.href, element: guarded(allEvents.href, <AllEvents />) },
      {
        path: createEvent.href,
        element: guarded(createEvent.href, <CreateEvent />),
      },
      { path: notice.href, element: guarded(notice.href, <Notice />) },

      // ── Permissions ─────────────────────────────────────────────────────────
      {
        path: admin_permissions.href,
        element: guarded(admin_permissions.href, <AdministrativePermissions />),
      },
      {
        path: staff_permissions.href,
        element: guarded(staff_permissions.href, <StaffPermissions />),
      },

      // ── Sessions ────────────────────────────────────────────────────────────
      {
        path: openAcademicTerm.href,
        // element: guarded(openAcademicTerm.href, <OpenAcademicTerm />),
        element: guarded(
          openAcademicTerm.href,
          <UnderConstruction
            showTag={false}
            title="Open Academic Term"
            description="This page is currently under construction."
          />,
        ),
      },
      {
        path: closeAcademicTerm.href,
        element: guarded(closeAcademicTerm.href, <CloseAcademicTerm />),
      },
      {
        path: closeAcademicYear.href,
        // element: guarded(closeAcademicYear.href, <CloseAcademicYear />),
        element: guarded(
          closeAcademicYear.href,
          <UnderConstruction
            showTag={false}
            title="Close Academic Year"
            description="This page is currently under construction."
          />,
        ),
      },
      {
        path: subscription.href,
        element: guarded(subscription.href, <Subscription />),
      },

      // ── Profile (no permission guard — always accessible) ───────────────────
      { path: adminProfile.href, element: <Profile /> },
      {
        path: request.href,
        element: <Request />,
      },
    ],
  },
];

export default adminRoutes;
