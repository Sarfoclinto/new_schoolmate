import {
  ADMINISTRATIVE_PERMISSIONS,
  STAFF_PERMISSIONS,
  type Permission,
} from "./permissions";
import paths from "./routes";

const { admin, staff } = paths;

export const ADMIN_ROUTE_PERMISSIONS: Record<string, Permission> = {
  // setup
  [admin.profile.href]: ADMINISTRATIVE_PERMISSIONS.SETUP_WRITE,
  [admin.roles.href]: ADMINISTRATIVE_PERMISSIONS.SETUP_WRITE,
  [admin.educationalLevel.href]: ADMINISTRATIVE_PERMISSIONS.SETUP_WRITE,
  [admin.academicLevel.href]: ADMINISTRATIVE_PERMISSIONS.SETUP_WRITE,
  [admin.promotionPath.href]: ADMINISTRATIVE_PERMISSIONS.SETUP_WRITE,
  [admin.subLevel.href]: ADMINISTRATIVE_PERMISSIONS.SETUP_WRITE,
  [admin.studyModules.href]: ADMINISTRATIVE_PERMISSIONS.SETUP_WRITE,
  [admin.facultyNClassroom.href]: ADMINISTRATIVE_PERMISSIONS.SETUP_WRITE,
  [admin.assessmentNGrading.href]: ADMINISTRATIVE_PERMISSIONS.SETUP_WRITE,
  [admin.facilities.href]: ADMINISTRATIVE_PERMISSIONS.SETUP_WRITE,
  [admin.yearsNTerms.href]: ADMINISTRATIVE_PERMISSIONS.SETUP_WRITE,

  // students
  [admin.registerStudent.href]: ADMINISTRATIVE_PERMISSIONS.STUDENTS_WRITE,
  [admin.viewAll.href]: ADMINISTRATIVE_PERMISSIONS.STUDENTS_READ,
  [admin.viewBySub.href]: ADMINISTRATIVE_PERMISSIONS.STUDENTS_READ,
  [admin.viewByAca.href]: ADMINISTRATIVE_PERMISSIONS.STUDENTS_READ,
  [admin.viewByEdu.href]: ADMINISTRATIVE_PERMISSIONS.STUDENTS_READ,
  [admin.studentDetails.href]: ADMINISTRATIVE_PERMISSIONS.STUDENTS_WRITE,

  // staff
  [admin.createStaff.href]: ADMINISTRATIVE_PERMISSIONS.STAFF_WRITE,
  [admin.staffAssignment.href]: ADMINISTRATIVE_PERMISSIONS.STAFF_WRITE,
  [admin.allStaff.href]: ADMINISTRATIVE_PERMISSIONS.STAFF_READ,
  [admin.staffByMode.href]: ADMINISTRATIVE_PERMISSIONS.STAFF_READ,
  [admin.staffByRole.href]: ADMINISTRATIVE_PERMISSIONS.STAFF_READ,
  [admin.staffDetails.href]: ADMINISTRATIVE_PERMISSIONS.STAFF_WRITE,

  // reports
  [admin.stuTermReport.href]: ADMINISTRATIVE_PERMISSIONS.REPORTS_READ,
  [admin.stuReportDetail.href]: ADMINISTRATIVE_PERMISSIONS.REPORTS_READ,
  [admin.stuAttReport.href]: ADMINISTRATIVE_PERMISSIONS.REPORTS_READ,

  // finance
  [admin.fees.href]: ADMINISTRATIVE_PERMISSIONS.FINANCE_WRITE,

  // events & notice
  [admin.notice.href]: ADMINISTRATIVE_PERMISSIONS.EVENTS_WRITE,
  [admin.allEvents.href]: ADMINISTRATIVE_PERMISSIONS.EVENTS_WRITE,
  [admin.createEvent.href]: ADMINISTRATIVE_PERMISSIONS.EVENTS_WRITE,

  // permissions
  [admin.admin_permissions.href]: ADMINISTRATIVE_PERMISSIONS.PERMISSIONS_WRITE,
  [admin.staff_permissions.href]: ADMINISTRATIVE_PERMISSIONS.PERMISSIONS_WRITE,

  // sessions
  [admin.openAcademicTerm.href]: ADMINISTRATIVE_PERMISSIONS.SESSION_WRITE,
  [admin.closeAcademicTerm.href]: ADMINISTRATIVE_PERMISSIONS.SESSION_WRITE,
  [admin.closeAcademicYear.href]: ADMINISTRATIVE_PERMISSIONS.SESSION_WRITE,
};

export const STAFF_ROUTE_PERMISSIONS: Record<string, Permission> = {
  // assignments
  [staff.classesnSubjects.href]: STAFF_PERMISSIONS.STAFF_ASSIGNMENTS_READ,
  [staff.students.href]: STAFF_PERMISSIONS.STAFF_ASSIGNMENTS_READ,

  //   academic records
  [staff.addRecord.href]: STAFF_PERMISSIONS.STAFF_RECORDS_WRITE,
  [staff.viewRecords.href]: STAFF_PERMISSIONS.STAFF_RECORDS_READ,
  [staff.passMark.href]: STAFF_PERMISSIONS.STAFF_RECORDS_WRITE,

  //   attendance
  [staff.markAttendance.href]: STAFF_PERMISSIONS.STAFF_ATTENDANCE_WRITE,
  [staff.viewAttendance.href]: STAFF_PERMISSIONS.STAFF_ATTENDANCE_READ,

  //   notices
  [staff.notice.href]: STAFF_PERMISSIONS.STAFF_NOTICES_WRITE,
};
