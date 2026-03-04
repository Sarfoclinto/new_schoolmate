import SidebarLabel from "@/components/custom/sidebar-label";
import paths from "@/config/routes";
import type { MenuProps } from "antd";
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
  AlertOctagon,
} from "lucide-react";

const { staff } = paths;
const { index } = staff;

const menu: MenuProps["items"] = [
  // dashboard
  {
    key: staff.index.href,
    label: <SidebarLabel to={index.href}>{index.label}</SidebarLabel>,
    icon: <HomeIcon className="size-3.75" />,
  },
  //   assignments
  {
    key: staff.myWork.href,
    label: (
      <SidebarLabel to={staff.myWork.href} type="span">
        {staff.myWork.label}
      </SidebarLabel>
    ),
    icon: <BriefcaseIcon className="size-3.75" />,
    type: "submenu",
    children: [
      {
        key: staff.classesnSubjects.href,
        label: (
          <SidebarLabel type="link" to={staff.classesnSubjects.href}>
            {staff.classesnSubjects.label}
          </SidebarLabel>
        ),
        icon: <BookOpenIcon className="size-3.5" />,
      },
      {
        key: staff.students.href,
        label: (
          <SidebarLabel type="link" to={staff.students.href}>
            {staff.students.label}
          </SidebarLabel>
        ),
        icon: <GraduationCapIcon className="size-3.5" />,
      },
    ],
  },
  {
    key: staff.academicRecords.href,
    label: (
      <SidebarLabel to={staff.academicRecords.href} type="span">
        {staff.academicRecords.label}
      </SidebarLabel>
    ),
    icon: <BookOpenIcon className="size-3.75" />,
    type: "submenu",
    children: [
      {
        key: staff.passMark.href,
        label: (
          <SidebarLabel type="link" to={staff.passMark.href}>
            {staff.passMark.label}
          </SidebarLabel>
        ),
        icon: <TargetIcon className="size-3.5" />,
      },
      {
        key: staff.addRecord.href,
        label: (
          <SidebarLabel type="link" to={staff.addRecord.href}>
            {staff.addRecord.label}
          </SidebarLabel>
        ),
        icon: <PlusCircleIcon className="size-3.5" />,
      },
      {
        key: staff.viewRecords.href,
        label: (
          <SidebarLabel type="link" to={staff.viewRecords.href}>
            {staff.viewRecords.label}
          </SidebarLabel>
        ),
        icon: <ClipboardListIcon className="size-3.5" />,
      },
    ],
  },
  {
    key: staff.attendance.href,
    label: (
      <SidebarLabel to={staff.attendance.href} type="span">
        {staff.attendance.label}
      </SidebarLabel>
    ),
    icon: <CalendarCheckIcon className="size-3.75" />,
    type: "submenu",
    children: [
      {
        key: staff.markAttendance.href,
        label: (
          <SidebarLabel type="link" to={staff.markAttendance.href}>
            {staff.markAttendance.label}
          </SidebarLabel>
        ),
        icon: <UserCheckIcon className="size-3.5" />,
      },
      {
        key: staff.viewAttendance.href,
        label: (
          <SidebarLabel type="link" to={staff.viewAttendance.href}>
            {staff.viewAttendance.label}
          </SidebarLabel>
        ),
        icon: <ClipboardListIcon className="size-3.5" />,
      },
    ],
  },
  {
    key: staff.notice.href,
    label: (
      <SidebarLabel type="link" to={staff.notice.href}>
        {staff.notice.label}
      </SidebarLabel>
    ),
    icon: <AlertOctagon className="size-3.5" />,
  },
];

export default menu;
