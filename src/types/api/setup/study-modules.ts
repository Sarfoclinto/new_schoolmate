import type { SubLevelGet } from "./sublevel";

export interface SubjectGet {
  subjectName: string;
  subjectId: string;
  createdAt: string;
}

export interface ProgramSubjectsGet {
  subjects: {
    programId: string;
    programName: string;
    subjects: SubjectGet[];
  };
  subLevels: SubLevelGet[];
}

export interface SubjectPost {
  SubjectName: string;
}
export interface SubjectUpdate {
  data: SubjectPost;
  id: string;
}

export interface ProgramGet {
  programName: string;
  programId: string;
  createdAt: string;
}

export interface ProgramPost {
  ProgramName: string;
}
export interface ProgramUpdate {
  data: ProgramPost;
  id: string;
}

export interface MappingDelete {
  subject: {
    subjectId: string;
    programId: string;
  };
  subLevel: {
    subLevelId: string;
    programId: string;
  };
}

export interface StudentSubjectsGet {
  studentId: string;
  fullName: string;
  subjects: { subjects: SubjectGet[] };
}

export interface ModulesMappingPost {
  ProgramId: string;
  SubLevelIds?: string[];
  SubjectIds?: string[];
}
