export interface AttendancePost {
  Status: "Present" | "Absent";
  StudentId: string;
  SubLevelId: string;
  AttendanceDate: string;
  UserId: string;
}

export interface SubLevelAttendanceGet {
  studentAttendanceId: string;
  studentId: string;
  studentFullName: string;
  attendanceDate: string;
  status: "Present" | "Absent";
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

