import SidebarLabel from "@/components/custom/sidebar-label";
import paths from "@/config/routes";
import type { MenuProps } from "antd";
import type { MenuStylesType } from "antd/es/menu/menu";
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
  // Contact2Icon,
  UserCogIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const { admin } = paths;
const { index } = admin;

const menu: MenuProps["items"] = [
  {
    key: admin.index.href,
    label: <Link to={index.href}>{index.label}</Link>,
    icon: <HomeIcon className="size-3.75" />,
  },
  // setup
  {
    key: admin.setup.href,
    label: (
      <SidebarLabel to={admin.setup.href} type="span">
        {admin.setup.label}
      </SidebarLabel>
    ),
    icon: <SettingsIcon className="size-3.75" />,
    type: "submenu",
    children: [
      {
        key: admin.profile.href,
        label: (
          <SidebarLabel type="link" to={admin.profile.href}>
            {admin.profile.label}
          </SidebarLabel>
        ),
        icon: <UserCircleIcon className="size-3.5" />,
      },
      {
        key: admin.roles.href,
        label: (
          <SidebarLabel type="link" to={admin.roles.href}>
            {admin.roles.label}
          </SidebarLabel>
        ),
        icon: <ShieldIcon className="size-3.5" />,
      },
      {
        key: admin.educationalLevel.href,
        label: (
          <SidebarLabel type="link" to={admin.educationalLevel.href}>
            {admin.educationalLevel.label}
          </SidebarLabel>
        ),
        icon: <GraduationCapIcon className="size-3.5" />,
      },
      {
        key: admin.academicLevel.href,
        label: (
          <SidebarLabel type="link" to={admin.academicLevel.href}>
            {admin.academicLevel.label}
          </SidebarLabel>
        ),
        icon: <LayoutGridIcon className="size-3.5" />,
      },
      {
        key: admin.promotionPath.href,
        label: (
          <SidebarLabel type="link" to={admin.promotionPath.href}>
            {admin.promotionPath.label}
          </SidebarLabel>
        ),
        icon: <DoorOpenIcon className="size-3.5" />,
      },
      {
        key: admin.subLevel.href,
        label: (
          <SidebarLabel type="link" to={admin.subLevel.href}>
            {admin.subLevel.label}
          </SidebarLabel>
        ),
        icon: <Building className="size-3.5" />,
      },
      {
        key: admin.facultyNClassroom.href,
        label: (
          <SidebarLabel type="link" to={admin.facultyNClassroom.href}>
            {admin.facultyNClassroom.label}
          </SidebarLabel>
        ),
        icon: <LibraryIcon className="size-3.5" />,
      },
      {
        key: admin.studyModules.href,
        label: (
          <SidebarLabel type="link" to={admin.studyModules.href}>
            {admin.studyModules.label}
          </SidebarLabel>
        ),
        icon: <BookOpenIcon className="size-3.5" />,
      },
      {
        key: admin.assessmentNGrading.href,
        label: (
          <SidebarLabel type="link" to={admin.assessmentNGrading.href}>
            {admin.assessmentNGrading.label}
          </SidebarLabel>
        ),
        icon: <ClipboardCheckIcon className="size-3.5" />,
      },
      {
        key: admin.facilities.href,
        label: (
          <SidebarLabel type="link" to={admin.facilities.href}>
            {admin.facilities.label}
          </SidebarLabel>
        ),
        icon: <Building2Icon className="size-3.5" />,
      },
      {
        key: admin.yearsNTerms.href,
        label: (
          <SidebarLabel type="link" to={admin.yearsNTerms.href}>
            {admin.yearsNTerms.label}
          </SidebarLabel>
        ),
        icon: <Clock10 className="size-3.5" />,
      },
    ],
  },
  // students
  {
    key: admin.students.href,
    label: (
      <SidebarLabel to={admin.students.href} type="span">
        {admin.students.label}
      </SidebarLabel>
    ),
    icon: <UsersIcon className="size-3.75" />,
    type: "submenu",
    children: [
      {
        key: admin.registerStudent.href,
        label: (
          <SidebarLabel type="link" to={admin.registerStudent.href}>
            {admin.registerStudent.label}
          </SidebarLabel>
        ),
        icon: <UserPlusIcon className="size-3.5" />,
      },
      {
        key: admin.viewAll.href,
        label: (
          <SidebarLabel type="link" to={admin.viewAll.href}>
            {admin.viewAll.label}
          </SidebarLabel>
        ),
        icon: <UsersRoundIcon className="size-3.5" />,
      },
      {
        key: admin.viewBySub.href,
        label: (
          <SidebarLabel type="link" to={admin.viewBySub.href}>
            {admin.viewBySub.label}
          </SidebarLabel>
        ),
        icon: <Building className="size-3.5" />,
      },
      {
        key: admin.viewByAca.href,
        label: (
          <SidebarLabel type="link" to={admin.viewByAca.href}>
            {admin.viewByAca.label}
          </SidebarLabel>
        ),
        icon: <LayoutGridIcon className="size-3.5" />,
      },
      {
        key: admin.viewByEdu.href,
        label: (
          <SidebarLabel type="link" to={admin.viewByEdu.href}>
            {admin.viewByEdu.label}
          </SidebarLabel>
        ),
        icon: <GraduationCapIcon className="size-3.5" />,
      },
    ],
  },
  // staff
  {
    key: admin.staff.href,
    label: (
      <SidebarLabel to={admin.staff.href} type="span">
        {admin.staff.label}
      </SidebarLabel>
    ),
    icon: <BriefcaseIcon className="size-3.75" />,
    type: "submenu",
    children: [
      {
        key: admin.createStaff.href,
        label: (
          <SidebarLabel type="link" to={admin.createStaff.href}>
            {admin.createStaff.label}
          </SidebarLabel>
        ),
        icon: <UserPlusIcon className="size-3.5" />,
      },
      {
        key: admin.staffAssignment.href,
        label: (
          <SidebarLabel type="link" to={admin.staffAssignment.href}>
            {admin.staffAssignment.label}
          </SidebarLabel>
        ),
        icon: <ClipboardCheckIcon className="size-3.5" />,
      },
      // {
      //   key: admin.staffDetails.href,
      //   label: (
      //     <SidebarLabel type="link" to={admin.staffDetails.href}>
      //       {admin.staffDetails.label}
      //     </SidebarLabel>
      //   ),
      //   icon: <Contact2Icon className="size-3.5" />,
      // },
      {
        key: admin.allStaff.href,
        label: (
          <SidebarLabel type="link" to={admin.allStaff.href}>
            {admin.allStaff.label}
          </SidebarLabel>
        ),
        icon: <UsersRoundIcon className="size-3.5" />,
      },
      {
        key: admin.staffByMode.href,
        label: (
          <SidebarLabel type="link" to={admin.staffByMode.href}>
            {admin.staffByMode.label}
          </SidebarLabel>
        ),
        icon: <UserCogIcon className="size-3.5" />,
      },
      {
        key: admin.staffByRole.href,
        label: (
          <SidebarLabel type="link" to={admin.staffByRole.href}>
            {admin.staffByRole.label}
          </SidebarLabel>
        ),
        icon: <ShieldCheckIcon className="size-3.5" />,
      },
    ],
  },
];

export default menu;

export const menuStyle: MenuStylesType = {
  item: {
    borderRadius: "8px",
    margin: "1px 8px",
    width: "calc(100% - 16px)",
  },
};

export const parentMenuItems = {
  setup: admin.setup,
};
