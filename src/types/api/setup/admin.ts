export interface CardData {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalSubLevels: number;
  totalMaleStudents: number;
  totalFemaleStudents: number;
  totalMaleStaff: number;
  totalFemaleStaff: number;
  totalNonTeachingStaff: number;
}

export interface DashboardData {
  dashboardDetails: CardData;
}

// ─── Stat card config ─────────────────────────────────────
export interface StatConfig {
  label: string;
  key: keyof CardData;
  icon: React.ReactNode;
  accent: string; // tailwind bg color for icon bubble
  iconColor: string; // tailwind text color
  link: string
}
