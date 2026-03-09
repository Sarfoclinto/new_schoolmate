import {
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
// =============================================================================
// PERMISSIONS
// These are the predefined permission keys your system recognises.
// Schools pick from these when creating roles — they never invent their own.
// =============================================================================

export const ADMINISTRATIVE_PERMISSIONS = {
  // ADMINISTRATIVE PERMISSIONS
  // ── Setup ──────────────────────────────────────────────────────────────────
  // Controls access to all institution configuration pages
  SETUP_READ: "admin:setup:read",
  SETUP_WRITE: "admin:setup:write",

  // ── Permissions ──────────────────────────────────────────────────────────────────
  // Controls access to permission configuration
  PERMISSIONS_READ: "admin:permissions:read",
  PERMISSIONS_WRITE: "admin:permissions:write",

  // ── Students ───────────────────────────────────────────────────────────────
  STUDENTS_READ: "admin:students:read", // view students (all views, details)
  STUDENTS_WRITE: "admin:students:write", // register new students

  // ── Staff ──────────────────────────────────────────────────────────────────
  STAFF_READ: "admin:staff:read", // view staff members
  STAFF_WRITE: "admin:staff:write", // create staff, manage assignments

  // ── Reports ────────────────────────────────────────────────────────────────
  REPORTS_READ: "admin:reports:read", // view terminal & attendance reports

  // ── Finance ────────────────────────────────────────────────────────────────
  FINANCE_READ: "admin:finance:read", // view fees setup
  FINANCE_WRITE: "admin:finance:write", // manage fees

  // ── Events & Notices ───────────────────────────────────────────────────────
  EVENTS_READ: "admin:events:read", // view events and notices
  EVENTS_WRITE: "admin:events:write", // create events

  // ── Academic Records (staff) ───────────────────────────────────────────────
  RECORDS_READ: "admin:records:read", // view academic records
  RECORDS_WRITE: "admin:records:write", // add/edit academic records

  // ── Attendance (staff) ─────────────────────────────────────────────────────
  ATTENDANCE_READ: "admin:attendance:read",
  ATTENDANCE_WRITE: "admin:attendance:write", // mark attendance

  // ── Assignments (staff) ────────────────────────────────────────────────────
  // View own assigned classes, subjects and students.
  // All staff with a dashboard should have this — no explicit guard needed,
  // but kept here for completeness and future API-level checks.
  ASSIGNMENTS_READ: "admin:assignments:read",
};

export const STAFF_PERMISSIONS = {
  // Staff PERMISSIONS
  // ── Assignments (staff) ──────────────────────────────────────────────────────────────────
  // Controls access to all classes and subjects assigned to the staff member
  STAFF_ASSIGNMENTS_READ: "staff:assignments:read", // view assigned classes, subjects and students.

  // ── Academic records (staff) ──────────────────────────────────────────────────────────────────
  // Controls access to staff member ability to view, add, edit and delete a student's academic records
  STAFF_RECORDS_READ: "staff:records:read", // view academic records
  STAFF_RECORDS_WRITE: "staff:records:write", // add/edit academic records

  // ── Attendance (staff) ──────────────────────────────────────────────────────────────────
  // Controls access to staff member ability to mark/update attendance and view monthly attendance
  STAFF_ATTENDANCE_WRITE: "staff:attendance:write", // mark/update attendance
  STAFF_ATTENDANCE_READ: "staff:attendance:read", // read attendance

  // ── Notices ──────────────────────────────────────────────────────────────────
  STAFF_NOTICES_WRITE: "staff:notices:write", // create notices
};

export const PERMISSIONS = {
  ...ADMINISTRATIVE_PERMISSIONS,
  ...STAFF_PERMISSIONS,
} as const;

// Derive the union type from the values so everything stays in sync
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type AdminPermission =
  (typeof ADMINISTRATIVE_PERMISSIONS)[keyof typeof ADMINISTRATIVE_PERMISSIONS];
export type StaffPermission =
  (typeof STAFF_PERMISSIONS)[keyof typeof STAFF_PERMISSIONS];

// ── Grouped for the role-creation checkbox UI ─────────────────────────────────
// Present these groups to the school when they build a custom role.
export const ADMIN_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "Setup & Configuration",
    description: "Manage institution profile, levels, and system settings.",
    icon: Settings,
    permissions: [PERMISSIONS.SETUP_READ, PERMISSIONS.SETUP_WRITE],
  },
  {
    label: "Permissions",
    description: "Manage users and their permissions.",
    icon: Shield,
    permissions: [PERMISSIONS.PERMISSIONS_READ, PERMISSIONS.PERMISSIONS_WRITE],
  },
  {
    label: "Students",
    description: "Handle student registrations and profile management.",
    icon: GraduationCap,
    permissions: [PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_WRITE],
  },
  {
    label: "Staff",
    description: "Manage staff accounts and work assignments.",
    icon: Users,
    permissions: [PERMISSIONS.STAFF_READ, PERMISSIONS.STAFF_WRITE],
  },
  {
    label: "Reports",
    description: "Access terminal reports and attendance summaries.",
    icon: FileText,
    permissions: [PERMISSIONS.REPORTS_READ],
  },
  {
    label: "Finance",
    description: "Oversee tuition fees and financial ledgers.",
    icon: Wallet,
    permissions: [PERMISSIONS.FINANCE_READ, PERMISSIONS.FINANCE_WRITE],
  },
  {
    label: "Events & Notices",
    description: "Create and view school events and announcements.",
    icon: Calendar,
    permissions: [PERMISSIONS.EVENTS_READ, PERMISSIONS.EVENTS_WRITE],
  },
  {
    label: "Academic Records",
    description: "Manage student grades and performance records.",
    icon: BookOpen,
    permissions: [PERMISSIONS.RECORDS_READ, PERMISSIONS.RECORDS_WRITE],
  },
  {
    label: "Attendance",
    description: "Track and mark daily student attendance.",
    icon: ClipboardCheck,
    permissions: [PERMISSIONS.ATTENDANCE_READ, PERMISSIONS.ATTENDANCE_WRITE],
  },
  {
    label: "Assignments",
    description: "View assigned classes, subjects, and schedules.",
    icon: LayoutDashboard,
    permissions: [PERMISSIONS.ASSIGNMENTS_READ],
  },
];

/**
 * Grouped for the role-creation checkbox UI
 * Present these groups to the school when they build a custom role for staff.
 */
export const STAFF_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "My Assignments",
    description: "View assigned classes, subjects, and students.",
    icon: Briefcase,
    permissions: [PERMISSIONS.STAFF_ASSIGNMENTS_READ],
  },
  {
    label: "Academic Records",
    description: "Manage student grades and performance records.",
    icon: BookOpen,
    permissions: [
      PERMISSIONS.STAFF_RECORDS_READ,
      PERMISSIONS.STAFF_RECORDS_WRITE,
    ],
  },
  {
    label: "Attendance",
    description: "Track and mark daily student attendance.",
    icon: ClipboardCheck,
    permissions: [
      PERMISSIONS.STAFF_ATTENDANCE_READ,
      PERMISSIONS.STAFF_ATTENDANCE_WRITE,
    ],
  },
  {
    label: "Notices",
    description: "View school events and announcements.",
    icon: Bell,
    permissions: [PERMISSIONS.STAFF_NOTICES_WRITE],
  },
];

// ── Dashboard types ────────────────────────────────────────────────────────────
// The backend always returns one of these — never a raw role string.
export const DASHBOARD_TYPES = {
  ADMIN: "admin",
  STAFF: "staff",
} as const;

export type DashboardType =
  (typeof DASHBOARD_TYPES)[keyof typeof DASHBOARD_TYPES];

export interface PermissionGroup {
  label: string;
  description: string;
  icon: LucideIcon;
  permissions: Permission[];
}
