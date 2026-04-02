import SidebarLabel from "@/components/custom/sidebar-label";
import { PERMISSIONS, type Permission } from "@/config/permissions";
import paths from "@/config/routes";
import {
  HomeIcon,
  SettingsIcon,
  UserCircleIcon,
  ShieldIcon,
  GraduationCapIcon,
  BookOpenIcon,
  DoorOpenIcon,
  LayoutGridIcon,
  Building2Icon,
  LibraryIcon,
  ClipboardCheckIcon,
  Building,
  UsersIcon,
  UserPlusIcon,
  UsersRoundIcon,
  Clock10,
  BriefcaseIcon,
  UserCogIcon,
  ShieldCheckIcon,
  FileTextIcon,
  WalletIcon,
  ReceiptIcon,
  CalendarCheckIcon,
  CalendarDaysIcon,
  CalendarPlusIcon,
  CalendarCheck2Icon,
  AlertOctagon,
  CalendarXIcon,
  CalendarRangeIcon,
  ShieldCheck,
  ClipboardList,
  CoinsIcon,
  PrinterIcon,
  SendIcon,
} from "lucide-react";

const { admin } = paths;
const { index, permissions } = admin;

// ── Extended menu item type ───────────────────────────────────────────────────
// Ant Design's ItemType doesn't have a permission field, so we extend it.
// The filter utility reads this before passing items to <Menu />.
export type AppMenuItem = {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** If set, the item is hidden unless the user holds this permission. */
  permission?: Permission;
  type?: "submenu" | "group" | "divider";
  children?: AppMenuItem[];
};

// Cast helper — keeps JSX clean below
const item = (i: AppMenuItem): AppMenuItem => i;

const adminMenu: AppMenuItem[] = [
  // ── Dashboard ──────────────────────────────────────────────────────────────
  // No permission guard — every admin-dashboard user always sees this.
  item({
    key: index.href,
    label: <SidebarLabel to={index.href}>{index.label}</SidebarLabel>,
    icon: <HomeIcon className="size-3.75" />,
  }),
  // ── Permission ──────────────────────────────────────────────────────────────
  // Parent guarded by PERMISSIONS_READ; children can be individually tightened
  // with PERMISSIONS_WRITE once you want write-only pages to disappear for viewers.
  item({
    key: permissions.href,
    label: (
      <SidebarLabel to={permissions.href} type="span">
        {permissions.label}
      </SidebarLabel>
    ),
    icon: <ShieldCheck className="size-3.75" />,
    permission: PERMISSIONS.PERMISSIONS_READ,
    type: "submenu",
    children: [
      item({
        key: admin.admin_permissions.href,
        icon: <ShieldCheckIcon className="size-3.5" />,
        label: (
          <SidebarLabel type="link" to={admin.admin_permissions.href}>
            {admin.admin_permissions.label}
          </SidebarLabel>
        ),
        permission: PERMISSIONS.PERMISSIONS_WRITE,
      }),
      item({
        key: admin.staff_permissions.href,
        icon: <UserCogIcon className="size-3.5" />,
        label: (
          <SidebarLabel type="link" to={admin.staff_permissions.href}>
            {admin.staff_permissions.label}
          </SidebarLabel>
        ),
        permission: PERMISSIONS.PERMISSIONS_WRITE,
      }),
    ],
  }),

  // ── Setup ──────────────────────────────────────────────────────────────────
  // Parent guarded by SETUP_READ; children can be individually tightened
  // with SETUP_WRITE once you want write-only pages to disappear for viewers.
  item({
    key: admin.setup.href,
    label: (
      <SidebarLabel to={admin.setup.href} type="span">
        {admin.setup.label}
      </SidebarLabel>
    ),
    icon: <SettingsIcon className="size-3.75" />,
    permission: PERMISSIONS.SETUP_READ,
    type: "submenu",
    children: [
      item({
        key: admin.profile.href,
        label: (
          <SidebarLabel type="link" to={admin.profile.href}>
            {admin.profile.label}
          </SidebarLabel>
        ),
        icon: <UserCircleIcon className="size-3.5" />,
        permission: PERMISSIONS.SETUP_READ,
      }),
      item({
        key: admin.roles.href,
        label: (
          <SidebarLabel type="link" to={admin.roles.href}>
            {admin.roles.label}
          </SidebarLabel>
        ),
        icon: <ShieldIcon className="size-3.5" />,
        permission: PERMISSIONS.SETUP_WRITE,
      }),
      item({
        key: admin.educationalLevel.href,
        label: (
          <SidebarLabel type="link" to={admin.educationalLevel.href}>
            {admin.educationalLevel.label}
          </SidebarLabel>
        ),
        icon: <GraduationCapIcon className="size-3.5" />,
        permission: PERMISSIONS.SETUP_WRITE,
      }),
      item({
        key: admin.academicLevel.href,
        label: (
          <SidebarLabel type="link" to={admin.academicLevel.href}>
            {admin.academicLevel.label}
          </SidebarLabel>
        ),
        icon: <LayoutGridIcon className="size-3.5" />,
        permission: PERMISSIONS.SETUP_WRITE,
      }),
      item({
        key: admin.promotionPath.href,
        label: (
          <SidebarLabel type="link" to={admin.promotionPath.href}>
            {admin.promotionPath.label}
          </SidebarLabel>
        ),
        icon: <DoorOpenIcon className="size-3.5" />,
        permission: PERMISSIONS.SETUP_WRITE,
      }),
      item({
        key: admin.subLevel.href,
        label: (
          <SidebarLabel type="link" to={admin.subLevel.href}>
            {admin.subLevel.label}
          </SidebarLabel>
        ),
        icon: <Building className="size-3.5" />,
        permission: PERMISSIONS.SETUP_WRITE,
      }),
      item({
        key: admin.facultyNClassroom.href,
        label: (
          <SidebarLabel type="link" to={admin.facultyNClassroom.href}>
            {admin.facultyNClassroom.label}
          </SidebarLabel>
        ),
        icon: <LibraryIcon className="size-3.5" />,
        permission: PERMISSIONS.SETUP_WRITE,
      }),
      item({
        key: admin.studyModules.href,
        label: (
          <SidebarLabel type="link" to={admin.studyModules.href}>
            {admin.studyModules.label}
          </SidebarLabel>
        ),
        icon: <BookOpenIcon className="size-3.5" />,
        permission: PERMISSIONS.SETUP_WRITE,
      }),
      item({
        key: admin.assessmentNGrading.href,
        label: (
          <SidebarLabel type="link" to={admin.assessmentNGrading.href}>
            {admin.assessmentNGrading.label}
          </SidebarLabel>
        ),
        icon: <ClipboardCheckIcon className="size-3.5" />,
        permission: PERMISSIONS.SETUP_WRITE,
      }),
      item({
        key: admin.facilities.href,
        label: (
          <SidebarLabel type="link" to={admin.facilities.href}>
            {admin.facilities.label}
          </SidebarLabel>
        ),
        icon: <Building2Icon className="size-3.5" />,
        permission: PERMISSIONS.SETUP_WRITE,
      }),
      item({
        key: admin.yearsNTerms.href,
        label: (
          <SidebarLabel type="link" to={admin.yearsNTerms.href}>
            {admin.yearsNTerms.label}
          </SidebarLabel>
        ),
        icon: <Clock10 className="size-3.5" />,
        permission: PERMISSIONS.SETUP_WRITE,
      }),
    ],
  }),

  // ── Students ───────────────────────────────────────────────────────────────
  item({
    key: admin.students.href,
    label: (
      <SidebarLabel to={admin.students.href} type="span">
        {admin.students.label}
      </SidebarLabel>
    ),
    icon: <UsersIcon className="size-3.75" />,
    permission: PERMISSIONS.STUDENTS_READ,
    type: "submenu",
    children: [
      item({
        key: admin.registerStudent.href,
        label: (
          <SidebarLabel type="link" to={admin.registerStudent.href}>
            {admin.registerStudent.label}
          </SidebarLabel>
        ),
        icon: <UserPlusIcon className="size-3.5" />,
        permission: PERMISSIONS.STUDENTS_WRITE,
      }),
      item({
        key: admin.viewAll.href,
        label: (
          <SidebarLabel type="link" to={admin.viewAll.href}>
            {admin.viewAll.label}
          </SidebarLabel>
        ),
        icon: <UsersRoundIcon className="size-3.5" />,
        permission: PERMISSIONS.STUDENTS_READ,
      }),
      item({
        key: admin.viewBySub.href,
        label: (
          <SidebarLabel type="link" to={admin.viewBySub.href}>
            {admin.viewBySub.label}
          </SidebarLabel>
        ),
        icon: <Building className="size-3.5" />,
        permission: PERMISSIONS.STUDENTS_READ,
      }),
      item({
        key: admin.viewByAca.href,
        label: (
          <SidebarLabel type="link" to={admin.viewByAca.href}>
            {admin.viewByAca.label}
          </SidebarLabel>
        ),
        icon: <LayoutGridIcon className="size-3.5" />,
        permission: PERMISSIONS.STUDENTS_READ,
      }),
      item({
        key: admin.viewByEdu.href,
        label: (
          <SidebarLabel type="link" to={admin.viewByEdu.href}>
            {admin.viewByEdu.label}
          </SidebarLabel>
        ),
        icon: <GraduationCapIcon className="size-3.5" />,
        permission: PERMISSIONS.STUDENTS_READ,
      }),
    ],
  }),

  // ── Staff ──────────────────────────────────────────────────────────────────
  item({
    key: admin.staff.href,
    label: (
      <SidebarLabel to={admin.staff.href} type="span">
        {admin.staff.label}
      </SidebarLabel>
    ),
    icon: <BriefcaseIcon className="size-3.75" />,
    permission: PERMISSIONS.STAFF_READ,
    type: "submenu",
    children: [
      item({
        key: admin.createStaff.href,
        label: (
          <SidebarLabel type="link" to={admin.createStaff.href}>
            {admin.createStaff.label}
          </SidebarLabel>
        ),
        icon: <UserPlusIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_WRITE,
      }),
      item({
        key: admin.staffAssignment.href,
        label: (
          <SidebarLabel type="link" to={admin.staffAssignment.href}>
            {admin.staffAssignment.label}
          </SidebarLabel>
        ),
        icon: <ClipboardCheckIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_WRITE,
      }),
      item({
        key: admin.principalTeacher.href,
        label: (
          <SidebarLabel type="link" to={admin.principalTeacher.href}>
            {admin.principalTeacher.label}
          </SidebarLabel>
        ),
        icon: <UserCogIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_WRITE,
      }),
      item({
        key: admin.allStaff.href,
        label: (
          <SidebarLabel type="link" to={admin.allStaff.href}>
            {admin.allStaff.label}
          </SidebarLabel>
        ),
        icon: <UsersRoundIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_READ,
      }),
      item({
        key: admin.staffByMode.href,
        label: (
          <SidebarLabel type="link" to={admin.staffByMode.href}>
            {admin.staffByMode.label}
          </SidebarLabel>
        ),
        icon: <UserCogIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_READ,
      }),
      item({
        key: admin.staffByRole.href,
        label: (
          <SidebarLabel type="link" to={admin.staffByRole.href}>
            {admin.staffByRole.label}
          </SidebarLabel>
        ),
        icon: <ShieldCheckIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_READ,
      }),
    ],
  }),

  // ── Reports ────────────────────────────────────────────────────────────────
  item({
    key: admin.reports.href,
    label: (
      <SidebarLabel to={admin.reports.href} type="span">
        {admin.reports.label}
      </SidebarLabel>
    ),
    icon: <FileTextIcon className="size-3.75" />,
    permission: PERMISSIONS.REPORTS_READ,
    type: "submenu",
    children: [
      item({
        key: admin.academicRecords.href,
        label: (
          <SidebarLabel type="link" to={admin.academicRecords.href}>
            {admin.academicRecords.label}
          </SidebarLabel>
        ),
        icon: <ClipboardList className="size-3.5" />,
        permission: PERMISSIONS.REPORTS_READ,
      }),
      item({
        key: admin.stuTermReport.href,
        label: (
          <SidebarLabel type="link" to={admin.stuTermReport.href}>
            {admin.stuTermReport.label}
          </SidebarLabel>
        ),
        icon: <FileTextIcon className="size-3.5" />,
        permission: PERMISSIONS.REPORTS_READ,
      }),
      item({
        key: admin.classRanking.href,
        label: (
          <SidebarLabel type="link" to={admin.classRanking.href}>
            {admin.classRanking.label}
          </SidebarLabel>
        ),
        icon: <ClipboardList className="size-3.5" />,
      }),
      item({
        key: admin.bulkReportPrint.href,
        label: (
          <SidebarLabel type="link" to={admin.bulkReportPrint.href}>
            {admin.bulkReportPrint.label}
          </SidebarLabel>
        ),
        icon: <PrinterIcon className="size-3.5" />,
      }),

      item({
        key: admin.stuAttReport.href,
        label: (
          <SidebarLabel type="link" to={admin.stuAttReport.href}>
            {admin.stuAttReport.label}
          </SidebarLabel>
        ),
        icon: <CalendarCheckIcon className="size-3.5" />,
        permission: PERMISSIONS.REPORTS_READ,
      }),
    ],
  }),

  // ── Finance ────────────────────────────────────────────────────────────────
  item({
    key: admin.finance.href,
    label: (
      <SidebarLabel to={admin.finance.href} type="span">
        {admin.finance.label}
      </SidebarLabel>
    ),
    icon: <WalletIcon className="size-3.75" />,
    permission: PERMISSIONS.FINANCE_READ,
    type: "submenu",
    children: [
      item({
        key: admin.fees.href,
        label: (
          <SidebarLabel type="link" to={admin.fees.href}>
            {admin.fees.label}
          </SidebarLabel>
        ),
        icon: <ReceiptIcon className="size-3.5" />,
        permission: PERMISSIONS.FINANCE_WRITE,
      }),
      item({
        key: admin.subLedgers.href,
        label: (
          <SidebarLabel type="link" to={admin.subLedgers.href}>
            {admin.subLedgers.label}
          </SidebarLabel>
        ),
        icon: <CoinsIcon className="size-3.5" />,
        permission: PERMISSIONS.FINANCE_WRITE,
      }),
    ],
  }),

  // ── Events & Notices ───────────────────────────────────────────────────────
  item({
    key: admin.events.href,
    label: (
      <SidebarLabel to={admin.events.href} type="span">
        {admin.events.label}
      </SidebarLabel>
    ),
    icon: <CalendarCheck2Icon className="size-3.75" />,
    permission: PERMISSIONS.EVENTS_READ,
    type: "submenu",
    children: [
      item({
        key: admin.notice.href,
        label: (
          <SidebarLabel type="link" to={admin.notice.href}>
            {admin.notice.label}
          </SidebarLabel>
        ),
        icon: <AlertOctagon className="size-3.5" />,
        permission: PERMISSIONS.EVENTS_READ,
      }),
      item({
        key: admin.allEvents.href,
        label: (
          <SidebarLabel type="link" to={admin.allEvents.href}>
            {admin.allEvents.label}
          </SidebarLabel>
        ),
        icon: <CalendarDaysIcon className="size-3.5" />,
        permission: PERMISSIONS.EVENTS_READ,
      }),
      item({
        key: admin.createEvent.href,
        label: (
          <SidebarLabel type="link" to={admin.createEvent.href}>
            {admin.createEvent.label}
          </SidebarLabel>
        ),
        icon: <CalendarPlusIcon className="size-3.5" />,
        permission: PERMISSIONS.EVENTS_WRITE,
      }),
    ],
  }),

  // ── Session ──────────────────────────────────────────────────────────────
  item({
    key: admin.sessions.href,
    label: (
      <SidebarLabel to={admin.sessions.href} type="span">
        {admin.sessions.label}
      </SidebarLabel>
    ),
    icon: <Clock10 className="size-3.75" />,
    permission: PERMISSIONS.SESSION_READ,
    type: "submenu",
    children: [
      item({
        key: admin.closeAcademicTerm.href,
        label: (
          <SidebarLabel type="link" to={admin.closeAcademicTerm.href}>
            {admin.closeAcademicTerm.label}
          </SidebarLabel>
        ),
        icon: <CalendarXIcon className="size-3.5" />,
        permission: PERMISSIONS.SESSION_WRITE,
      }),
      item({
        key: admin.openAcademicTerm.href,
        label: (
          <SidebarLabel type="link" to={admin.openAcademicTerm.href}>
            {admin.openAcademicTerm.label}
          </SidebarLabel>
        ),
        icon: <CalendarRangeIcon className="size-3.5" />,
        permission: PERMISSIONS.SESSION_WRITE,
      }),
    ],
  }),

  // ── Request ────────────────────────────────────────────────────────────────
  item({
    key: admin.request.href,
    label: (
      <SidebarLabel type="link" to={admin.request.href}>
        {admin.request.label}
      </SidebarLabel>
    ),
    icon: <SendIcon className="size-3.5" />,
  }),
];

export default adminMenu;
