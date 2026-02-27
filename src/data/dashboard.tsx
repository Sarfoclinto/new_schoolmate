import type { StatConfig } from "@/types/api/setup/admin";
import { Users, User, LayoutGrid, GraduationCap } from "lucide-react";

export const STATS: StatConfig[] = [
  {
    label: "Total Students",
    key: "totalStudents",
    icon: <Users className="w-5 h-5" />,
    accent: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    label: "Male Students",
    key: "totalMaleStudents",
    icon: <User className="w-5 h-5" />,
    accent: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    label: "Female Students",
    key: "totalFemaleStudents",
    icon: <User className="w-5 h-5" />,
    accent: "bg-violet-50",
    iconColor: "text-violet-500",
  },
  {
    label: "Total Staff",
    key: "totalStaff",
    icon: <Users className="w-5 h-5" />,
    accent: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    label: "Male Staff",
    key: "totalMaleStaff",
    icon: <User className="w-5 h-5" />,
    accent: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    label: "Female Staff",
    key: "totalFemaleStaff",
    icon: <User className="w-5 h-5" />,
    accent: "bg-cyan-50",
    iconColor: "text-cyan-500",
  },
  {
    label: "Teaching Staff",
    key: "totalTeachers",
    icon: <GraduationCap className="w-5 h-5" />,
    accent: "bg-fuchsia-50",
    iconColor: "text-fuchsia-500",
  },
  {
    label: "Sub-Levels",
    key: "totalSubLevels",
    icon: <LayoutGrid className="w-5 h-5" />,
    accent: "bg-orange-50",
    iconColor: "text-orange-500",
  },
];
