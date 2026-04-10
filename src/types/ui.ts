export interface SelectTypes {
  label: string;
  value: string;
}

export interface PaginationProps {
  currentPage: number;
  totalRecords: number;
  totalPages: number;
}

export type StudyModuleTabKey =
  | "subjects"
  | "programs"
  | "assign-subjects"
  | "assign-sublevels"
  | "view";

export type FacultyNClassroomTabKey = "faculty" | "classroom" | "assign-class";
export type AssessmentNGradingTabKey = "assessment" | "grading";
export type YearsNTerms = "years" | "terms" | "terms_update";
export type TeacherAssignments =
  | "principal-teachers"
  | "assign-teacher"
  | "sublevel-teachers";

  export type BulkReportTab = "generate" | "list-n-download"
  export type Fees = "set" | "view"

// staff
export type ClassesnSubjects = "classes" | "subjects" | "sublevel-subject";

export interface ReportPaths {
  studentId: string;
  academicYearId: string;
  academicTermId: string;
  subLevelId: string;
}
