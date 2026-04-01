export interface SubLevelGet {
  subLevelId: string;
  subLevelName: string;
  subLevelAlias: string;
  capacity: number;
  createdAt: string;

  academicLevelId: string;
  academicLevelName: string;
  academicLevelAlias: string;
  
  educationalLevelId: string;
  educationalLevelName: string;
  educationalLevelAlias: string;
}

export interface SubLevelPost {
  AcademicLevelId: string;
  Capacity: number;
  SubLevelName: string;
  SubLevelAlias?: string;
}

export interface SubLevelUpdate {
  data: SubLevelPost;
  id: string;
}

export interface SubLevelFormValues {
  EducationalLevel: string;
  AcademicLevel: { value: string; label: string };
  Capacity: number;
  SubLevelName: string;
  SubLevelAlias: string;
  hasNoSubLevel?: boolean;
  useAlias: boolean;
}

export interface SublevelLite {
  subLevelId: string;
  subLevelName: string;
  educationalLevelId: string;
}
