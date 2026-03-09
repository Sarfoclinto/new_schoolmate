// import {
//   LayoutDashboard,
//   UserCircle,
//   Briefcase,
//   BookOpen,
//   ClipboardCheck,
//   Bell,
//   type LucideIcon,
// } from "lucide-react";
// import staffPaths from "@/config/staff.routes";
// import { PERMISSIONS, type Permission } from "@/config/permissions";
// import type { AppMenuItem } from "@/features/admins/data/admin-menu-items";

// /**
//  * Staff Menu Items
//  * Filtered by the user's permissions in the sidebar.
//  */
// export const staffMenu: AppMenuItem[] = [
//   {
//     title: "Dashboard",
//     icon: LayoutDashboard,
//     url: staffPaths.index.href,
//     // Dashboard is usually accessible to all logged-in staff
//   },
//   {
//     title: "My Assignments",
//     icon: Briefcase,
//     url: staffPaths.myWork.href,
//     permission: PERMISSIONS.ASSIGNMENTS_READ,
//     children: [
//       {
//         title: "Classes & Subjects",
//         url: staffPaths.classesnSubjects.href,
//         permission: PERMISSIONS.ASSIGNMENTS_READ,
//       },
//       {
//         title: "Students",
//         url: staffPaths.students.href,
//         permission: PERMISSIONS.ASSIGNMENTS_READ,
//       },
//     ],
//   },
//   {
//     title: "Academic Records",
//     icon: BookOpen,
//     url: staffPaths.academicRecords.href,
//     permission: PERMISSIONS.RECORDS_READ,
//     children: [
//       {
//         title: "View Records",
//         url: staffPaths.viewRecords.href,
//         permission: PERMISSIONS.RECORDS_READ,
//       },
//       {
//         title: "Add Record",
//         url: staffPaths.addRecord.href,
//         permission: PERMISSIONS.RECORDS_WRITE,
//       },
//       {
//         title: "Pass Marks",
//         url: staffPaths.passMark.href,
//         permission: PERMISSIONS.RECORDS_READ,
//       },
//     ],
//   },
//   {
//     title: "Attendance",
//     icon: ClipboardCheck,
//     url: staffPaths.attendance.href,
//     permission: PERMISSIONS.ATTENDANCE_READ,
//     children: [
//       {
//         title: "Mark Attendance",
//         url: staffPaths.markAttendance.href,
//         permission: PERMISSIONS.ATTENDANCE_WRITE,
//       },
//       {
//         title: "View History",
//         url: staffPaths.viewAttendance.href,
//         permission: PERMISSIONS.ATTENDANCE_READ,
//       },
//     ],
//   },
//   {
//     title: "Notices",
//     icon: Bell,
//     url: staffPaths.notice.href,
//     permission: PERMISSIONS.EVENTS_READ,
//   },
//   {
//     title: "Profile",
//     icon: UserCircle,
//     url: staffPaths.profile.href,
//     // Profile is usually accessible to all
//   },
// ];

// export default staffMenu;
