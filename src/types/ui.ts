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
export type YearsNTerms = "years" | "terms";

// staff
export type ClassesnSubjects = "classes" | "subjects" | "sublevel-subject";

export interface ReportPaths {
  studentId: string;
  academicYearId: string;
  academicTermId: string;
  subLevelId: string;
}
