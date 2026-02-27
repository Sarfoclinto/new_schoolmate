import type { SubjectGet } from "./setup/study-modules";
import type { SubLevelGet } from "./setup/sublevel";

export interface StaffGet {
  staffId: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  address: string;
  gender: string;
  religion: string;
  status: string;

  nationalId: string;

  dateOfBirth: string;
  staffImage: string;
  staffRole: string;
  staffMode: string;
  staffPhone: string;
  note: string;
  emergencyName: string;
  emergencyContact: string;
  emergencyRelationship: string;
  createdOn: string;
}

export interface StaffGetResponse {
  data: StaffGet[];
  pagination: {
    currentPage: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface TeacherMappingPost {
  TeacherId: string;
  SubLevelIds?: string[];
  SubjectIds?: string[];
  ProgramId?: string;
}

export interface TeachersSubjects {
  staffId: string;
  teacherName: string;
  subjects: SubjectGet[];
  subLevels: SubLevelGet[];
}
export interface TeacherSubLevelsGet {
  teacherId: string;
  teacherName: string;
  subLevels: SubLevelGet[];
}

export interface TeacherSubjectSubLevels {
  subjectId: string;
  subjectName: string;
  subLevels: SubLevelGet[];
}

export interface DeleteMapping {
  subject: {
    teacherId: string;
    subjectId: string;
  };
  subLevel: {
    teacherId: string;
    subLevelId: string;
  };
}

export interface AdminUpdateStaffType {
  id: string;
  data: {
    title: string;
    staffMode: string;
    roleId: string;
  };
}
