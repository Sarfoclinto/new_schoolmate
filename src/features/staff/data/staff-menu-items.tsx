import SidebarLabel from "@/components/custom/sidebar-label";
import paths from "@/config/routes";
import { STAFF_PERMISSIONS as PERMISSIONS } from "@/config/permissions";
import {
  HomeIcon,
  BookOpenIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  TargetIcon,
  PlusCircleIcon,
  ClipboardListIcon,
  CalendarCheckIcon,
  UserCheckIcon,
  MessageSquareTextIcon,
  SendIcon,
  AlertOctagon,
} from "lucide-react";
import type { AppMenuItem } from "@/features/admins/data/admin-menu-items";

const { staff } = paths;
const { index } = staff;

// Cast helper
const item = (i: AppMenuItem): AppMenuItem => i;

const staffMenu: AppMenuItem[] = [
  // ── Dashboard ──────────────────────────────────────────────────────────────
  item({
    key: staff.index.href,
    label: <SidebarLabel to={index.href}>{index.label}</SidebarLabel>,
    icon: <HomeIcon className="size-3.75" />,
    // No guard — visible to all staff dashboard users
  }),

  // ── My Work (Assignments) ──────────────────────────────────────────────────
  item({
    key: staff.myWork.href,
    label: (
      <SidebarLabel to={staff.myWork.href} type="span">
        {staff.myWork.label}
      </SidebarLabel>
    ),
    icon: <BriefcaseIcon className="size-3.75" />,
    permission: PERMISSIONS.STAFF_ASSIGNMENTS_READ,
    type: "submenu",
    children: [
      item({
        key: staff.classesnSubjects.href,
        label: (
          <SidebarLabel type="link" to={staff.classesnSubjects.href}>
            {staff.classesnSubjects.label}
          </SidebarLabel>
        ),
        icon: <BookOpenIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_ASSIGNMENTS_READ,
      }),
      item({
        key: staff.students.href,
        label: (
          <SidebarLabel type="link" to={staff.students.href}>
            {staff.students.label}
          </SidebarLabel>
        ),
        icon: <GraduationCapIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_ASSIGNMENTS_READ,
      }),
    ],
  }),

  // ── Academic Records ───────────────────────────────────────────────────────
  item({
    key: staff.academicRecords.href,
    label: (
      <SidebarLabel to={staff.academicRecords.href} type="span">
        {staff.academicRecords.label}
      </SidebarLabel>
    ),
    icon: <BookOpenIcon className="size-3.75" />,
    permission: PERMISSIONS.STAFF_RECORDS_READ,
    type: "submenu",
    children: [
      item({
        key: staff.passMark.href,
        label: (
          <SidebarLabel type="link" to={staff.passMark.href}>
            {staff.passMark.label}
          </SidebarLabel>
        ),
        icon: <TargetIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_RECORDS_WRITE,
      }),
      item({
        key: staff.addRecord.href,
        label: (
          <SidebarLabel type="link" to={staff.addRecord.href}>
            {staff.addRecord.label}
          </SidebarLabel>
        ),
        icon: <PlusCircleIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_RECORDS_WRITE,
      }),
      item({
        key: staff.viewRecords.href,
        label: (
          <SidebarLabel type="link" to={staff.viewRecords.href}>
            {staff.viewRecords.label}
          </SidebarLabel>
        ),
        icon: <ClipboardListIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_RECORDS_READ,
      }),
    ],
  }),

  // ── Attendance ─────────────────────────────────────────────────────────────
  item({
    key: staff.attendance.href,
    label: (
      <SidebarLabel to={staff.attendance.href} type="span">
        {staff.attendance.label}
      </SidebarLabel>
    ),
    icon: <CalendarCheckIcon className="size-3.75" />,
    permission: PERMISSIONS.STAFF_ATTENDANCE_READ,
    type: "submenu",
    children: [
      item({
        key: staff.markAttendance.href,
        label: (
          <SidebarLabel type="link" to={staff.markAttendance.href}>
            {staff.markAttendance.label}
          </SidebarLabel>
        ),
        icon: <UserCheckIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_ATTENDANCE_WRITE,
      }),
      item({
        key: staff.viewAttendance.href,
        label: (
          <SidebarLabel type="link" to={staff.viewAttendance.href}>
            {staff.viewAttendance.label}
          </SidebarLabel>
        ),
        icon: <ClipboardListIcon className="size-3.5" />,
        permission: PERMISSIONS.STAFF_ATTENDANCE_READ,
      }),
    ],
  }),

  // ── Notices ────────────────────────────────────────────────────────────────
  // Notices are read-only for staff — no write permission needed
  item({
    key: staff.notice.href,
    label: (
      <SidebarLabel type="link" to={staff.notice.href}>
        {staff.notice.label}
      </SidebarLabel>
    ),
    icon: <AlertOctagon className="size-3.5" />,
    permission: PERMISSIONS.STAFF_NOTICES_WRITE,
  }),

  // ── Request ────────────────────────────────────────────────────────────────
  item({
    key: staff.request.href,
    label: (
      <SidebarLabel type="link" to={staff.request.href}>
        {staff.request.label}
      </SidebarLabel>
    ),
    icon: <SendIcon className="size-3.5" />,
  }),

  // ── Remarks ────────────────────────────────────────────────────────────────
  item({
    key: staff.remarks.href,
    label: (
      <SidebarLabel type="link" to={staff.remarks.href}>
        {staff.remarks.label}
      </SidebarLabel>
    ),
    icon: <MessageSquareTextIcon className="size-3.5" />,
  }),
];

export default staffMenu;
