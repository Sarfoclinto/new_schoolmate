const staffPaths = {
  index: { href: "/staff", label: "Dashboard" },
  profile: { href: "/staff/profile", label: "Profile" },
  notification: { href: "/staff/notifications", label: "Notifications" },

  //   setup
  myWork: { label: "My Assignments", href: "/staff/assignments" },
  classesnSubjects: {
    label: "Classes & Subjects",
    href: "/staff/assignments/classes-n-subjects",
  },
  students: {
    label: "Students",
    href: "/staff/assignments/students",
  },

  // academic records
  academicRecords: {
    label: "Academic Records",
    href: "/staff/academic-records",
  },
  passMark: {
    label: "Pass Mark",
    href: "/staff/academic-records/pass-mark",
  },
  addRecord: {
    label: "Add Record",
    href: "/staff/academic-records/add-record",
  },
  viewRecords: {
    label: "View Records",
    href: "/staff/academic-records/view-records",
  },

  // attendance
  attendance: {
    label: "Attendance",
    href: "/staff/attendance",
  },
  viewAttendance: {
    label: "View Attendance",
    href: "/staff/attendance/view",
  },
  markAttendance: {
    label: "Mark Attendance",
    href: "/staff/attendance/mark",
  },

  // notice
  notice: { label: "Notices", href: "/staff/notices" },
};

export default staffPaths;
