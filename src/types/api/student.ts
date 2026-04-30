import type { PaginationProps } from "@/types/ui";
import type { Dayjs } from "dayjs";
import type { InstitutionGet } from "./setup/institution";
import type { GradeGet } from "./setup/assessment-n-grading";
import type { VacationGet } from "./vacation";

export interface StudentPost {
  // personal data
  Surname: string;
  FirstName: string;
  OtherName: string;
  DateOfBirth: Dayjs;
  Gender: "Male" | "Female";
  Address: string;
  Email?: string;
  Contact?: string;
  Nationality: string;
  Religion: string;
  StudentImage: string;
  Note?: string;

  // fathers data
  FatherFullName?: string;
  FatherContact?: string;
  FatherOccupation?: string;
  //   FatherImage?: string;
  FatherLivingStatus: "Deceased" | "Alive";

  //   mothers data
  MotherFullName?: string;
  MotherContact?: string;
  MotherOccupation?: string;
  //   MotherImage?: string;
  MotherLivingStatus: "Deceased" | "Alive";

  //   guardian data
  GuardianFullname: string;
  GuardianContact: string;
  GuardianOccupation: string;
  Relationship: string;
  //   GuardianImage: string;
  GuardianAddress: string;

  // enrollment data
  ProgramId: string;
  SubLevelId: string;
  AcademicYearId: string;
  AcademicTermId: string;
  SubjectIds: string[];
}

export interface StudentGet {
  // personal data
  studentId: string;
  surname: string;
  firstName: string;
  otherName: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  address: string;
  email?: string;
  contact?: string;
  nationality: string;
  religion: string;
  studentImage: string;
  status: string;
  note?: string;

  // fathers data
  parentId: string;
  fatherFullName?: string;
  fatherContact?: string;
  fatherOccupation?: string;
  fatherImage?: string;
  fatherLivingStatus: "Deceased" | "Alive";

  //   mothers data
  motherFullName?: string;
  motherContact?: string;
  motherOccupation?: string;
  motherImage?: string;
  motherLivingStatus: "Deceased" | "Alive";

  //   guardian data
  guardianId: string;
  guardianFullName: string;
  guardianContact: string;
  guardianOccupation: string;
  relationship: string;
  guardianImage: string;
  guardianAddress: string;

  // enrollment data
  programId: string;
  programName: string;
  subLevelId: string;
  subLevelName: string;
  academicYearId: string;
  academicYearName: string;
  academicTermId: string;
  academicTermName: string;
  educationalLevelId: string;
  educationalLevelName: string;
  academicLevelId: string;
  academicLevelName: string;
  startYear: string;
  endYear: string;
}

export interface SubLevelStudentsGet {
  studentId: string;
  fullName: string;
  otherName: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  subLevelId: string;
  subLevelName: string;
  studentImage: string;
  programName: string;
  createdAt: string;
}

export interface AllStudentGet {
  studentId: string;
  fullName: string;
  otherName: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  subLevelId: string;
  subLevelName: string;
  academicLevelId: string;
  academicLevelName: string;
  educationalLevelId: string;
  programName: string;
  educationalLevelName: string;
  createdAt: string;
}

export interface AllStudentsResponse {
  students: AllStudentGet[];
  pagination: PaginationProps;
}

export type EducationalLevelStudentsGet = AllStudentGet;

export interface EduStudentsResponse {
  students: EducationalLevelStudentsGet[];
  pagination: PaginationProps;
}

export interface AcademicLevelStudentsGet {
  studentId: string;
  fullName: string;
  otherName: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  academicLevelId: string;
  programName: string;
  academicLevelName: string;
  studentImage: string;
  createdAt: string;
}
export interface AcaStudentsResponse {
  students: AcademicLevelStudentsGet[];
  pagination: PaginationProps;
}

export interface StudentUpdateWithFile {
  id: string;
  data: FormData;
}
export interface StudentUpdateWithoutFile {
  id: string;
  data: unknown;
}

// report
interface studentDetails {
  studentId: string;
  surname: string;
  firstName: string;
  otherName: string;
  status: string;
  studentImage: string;
  gender: string;

  programId: string;
  programName: string;

  subLevelId: string;
  subLevelName: string;
  capacity: number;
  numberOfStudentInSublevel: number;

  academicYearId: string;
  startYear: string;
  endYear: string;
  academicYearStatus: string;

  academicTermId: string;
  academicTermType: string;
  academicTermName: string;
  academicTermStatus: string;
}

export interface Assessment {
  assessmentId: string;
  assessmentName: string;
  assessmentPercentage: number;
  scaledMarks: number;
}

export interface SubjectReport {
  subjectId: string;
  subjectName: string;
  assessments: Assessment[];
  total: number;
  positionInSubject: number;
  gradings: { grade: string; remark: string };
  teacherId: string;
  teacherName: string;
}

export interface StudentSubLevelPosition {
  studentId: string;
  totalMarks: number;
  positionInSubLevel: number;
}

interface studentAttendance {
  schoolDays: number;
  attendedDays: number;
}

export interface StudentTerminalReportGet {
  institution: InstitutionGet;
  studentDetails: studentDetails;
  subjectReports: SubjectReport[];
  subLevelPosition: StudentSubLevelPosition;
  attendance: studentAttendance;
  vacation: VacationGet[];
  gradingSystems: GradeGet[];
  remarks: string;
  dates: {
    vacationTermDate: string;
    reopeningTermDate: string;
  };
}

export interface UpdateStudentEnrollment {
  id: string;
  data: {
    SubLevelId: string;
    ProgramId: string;
    AcademicYearId: string;
    AcademicTermId: string;
  };
}

export interface StudentOption {
  studentId: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  subLevelId: string;
  subLevelName: string;
  guardianId: string;
  guardianName: string;
  guardianContact: string;
}
