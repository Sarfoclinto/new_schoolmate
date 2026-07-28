import type { Permission } from "@/config/permissions";
import type { SubjectGet, SubjectLite } from "./setup/study-modules";
import type { SubLevelGet, SublevelLite } from "./setup/sublevel";

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

export interface StaffUpdateWithFile {
  id: string;
  data: FormData;
}

export interface UpdateSecurity {
  id: string;
  data: {
    Password: string;
    NewPassword: string;
    ConfirmPassword: string;
  };
}

export interface StaffGetResponse {
  data: StaffGet[];
  pagination: {
    currentPage: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface PrincipalTeacherPost {
  teacherId: string;
  subLevelId: string;
}
export interface PrincipalTeacherGet extends PrincipalTeacherPost {
  isPrincipal: boolean;
  subLevelName: string;
  subLevelAlias: string | null;
  teacherName: string;
}
export type SubLevelTeachersGet = PrincipalTeacherGet;

export interface TeacherMappingPost {
  TeacherId: string;
  SubLevelIds?: string[];
  SubjectIds?: string[];
  ProgramId?: string;
}

export interface TeachersMapping {
  staffId: string;
  teacherName: string;
  subjects: SubjectGet[];
  subLevels: SubLevelGet[];
}
export interface TeacherSubLevelsGet {
  teacherId: string;
  teacherName: string;
  subLevels: SublevelLite[];
}

export interface TeacherSubjectsGet {
  teacherId: string;
  teacherName: string;
  subjects: SubjectLite[];
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

export interface AdminUpdateStaffStatus {
  staffId: string;
  newStatus: "Active" | "Inactive";
}

export interface AssignPermissionsPayload {
  userId: string;
  userPermissions: Permission[];
}
