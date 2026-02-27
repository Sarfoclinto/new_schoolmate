import type { EduLevelGet } from "./educational-level";

export interface AcaLevelGet extends EduLevelGet {
  academicLevelId: string;
  academicLevelName: string;
  academicLevelAlias: string;
}

export interface AcaLevelPost {
  EducationalLevelId: string;
  AcademicLevelName: string;
  AcademicLevelAlias?: string;
}

export interface AcaLevelUpdate {
  data: AcaLevelPost;
  id: string;
}

export interface AcaLevelFormValues {
  EducationalLevel: { value: string; label: string };
  AcademicLevelName: string;
  AcademicLevelAlias: string;
  hasNoAcademicLevel?: boolean;
  useAlias: boolean;
}
