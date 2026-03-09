const adminPaths = {
  index: { href: "/admin", label: "Dashboard" },
  adminProfile: { href: "/admin/profile", label: "Profile" },
  // setup
  setup: { label: "Institution Setup", href: "/admin/institutionsetup" },
  profile: { label: "Profile", href: "/admin/institutionsetup/profile" },
  roles: { label: "Roles", href: "/admin/institutionsetup/role" },
  educationalLevel: {
    label: "Education Levels",
    href: "/admin/institutionsetup/educationalLevel",
  },
  academicLevel: {
    label: "Academic Levels",
    href: "/admin/institutionsetup/academicLevel",
  },
  promotionPath: {
    label: "Promotion Paths",
    href: "/admin/institutionsetup/promotionPath",
  },
  subLevel: {
    label: "Sub Levels",
    href: "/admin/institutionsetup/subLevel",
  },
  studyModules: {
    href: "/admin/institutionsetup/study-modules",
    label: "Study Modules",
  },
  facultyNClassroom: {
    href: "/admin/institutionsetup/faculty-n-classroom",
    label: "Faculty & Classroom",
  },
  assessmentNGrading: {
    href: "/admin/institutionsetup/assessment-n-grading",
    label: "Assessment & Grading",
  },
  facilities: {
    href: "/admin/institutionsetup/facilities",
    label: "Facilities",
  },
  yearsNTerms: {
    href: "/admin/institutionsetup/years-n-terms",
    label: "Years & Terms",
  },

  // students
  students: { label: "Students", href: "/admin/students" },
  registerStudent: {
    label: "Register Student",
    href: "/admin/students/register",
  },
  studentDetails: {
    label: "Student Details",
    href: "/admin/students/details",
  },
  viewAll: {
    label: "View All",
    href: "/admin/students/view/all",
  },
  viewByEdu: {
    label: "View by Edu",
    href: "/admin/students/view/by-edu",
  },
  viewByAca: {
    label: "View by Aca",
    href: "/admin/students/view/by-aca",
  },
  viewBySub: {
    label: "View by Sublevel",
    href: "/admin/students/view/by-sub",
  },

  // staff
  staff: { label: "Staff", href: "/admin/staff" },
  createStaff: {
    label: "Create Staff",
    href: "/admin/staff/create",
  },
  staffAssignment: {
    label: "Staff Assignment",
    href: "/admin/staff/assignment",
  },
  staffDetails: {
    label: "Staff Details",
    href: "/admin/staff/details",
  },
  allStaff: {
    label: "View All",
    href: "/admin/staff/view/all",
  },
  staffByMode: {
    label: "View by Mode",
    href: "/admin/staff/view/by-mode",
  },
  staffByRole: {
    label: "View by Role",
    href: "/admin/staff/view/by-role",
  },

  // reports
  reports: { label: "Reports", href: "/admin/reports" },
  stuTermReport: {
    label: "Terminal Report",
    href: "/admin/reports/student-report",
  },
  stuReportDetail: {
    label: "Student Report Detail",
    href: "/admin/reports/student-report-detail",
  },
  stuAttReport: {
    label: "Attendance",
    href: "/admin/reports/student-attendance-report",
  },

  // finance
  finance: { label: "Finance", href: "/admin/finance" },
  fees: { label: "Fees", href: "/admin/finance/fees" },

  // events & notice
  notice: { label: "Notices", href: "/admin/notices" },
  events: { label: "Events & Notices", href: "/admin/events" },
  createEvent: {
    label: "Create Event",
    href: "/admin/events/create",
  },
  eventDetails: {
    label: "Event Details",
    href: "/admin/events/details",
  },
  allEvents: {
    label: "Events",
    href: "/admin/events/view/all",
  },

  // permisions
  permissions: { label: "Permissions", href: "/admin/permissions" },
  admin_permissions: {
    label: "Admins. Permissions",
    href: "/admin/administrative_permissions",
  },
  staff_permissions: {
    label: "Staff Permissions",
    href: "/admin/staff_permissions",
  },
};

export default adminPaths;
