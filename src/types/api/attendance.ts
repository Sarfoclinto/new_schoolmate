export interface AttendancePostTypes {
  Status: "Present" | "Absent";
  StudentId: string;
  SubLevelId: string;
  AttendanceDate: string;
  UserId: string;
}

export interface SubLevelAttendanceGetType {
  studentAttendanceId: string;
  studentId: string;
  studentFullName: string;
  attendanceDate: string;
  status: "Present" | "Absent";
}

export interface monthlyAttendanceParams {
  sublevelId: string;
  monthYear: string;
}

interface attendanceRecord {
  attendanceDate: string;
  status: string;
}

export interface StudentsMonthlyAttendance {
  studentId: string;
  studentName: string;
  attendance: attendanceRecord[];
}
