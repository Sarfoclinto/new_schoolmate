import type { Permission } from "@/config/permissions";
import type { EventGet } from "../event";
import type { InstitutionGet } from "./institution";
import type { NoticeGet } from "./notice";

export interface AcademicTermGet {
  academicTermId: string;
  academicTermType: string;
  academicTermName: string;
  educationalLevelName: string;
  educationalLevelId: string;
  createdAt: string;
}

export type AcademicTermWithStatus = AcademicTermGet & {
  status: "Active" | "Inactive";
};

export interface AcademicTermTimeRange {
  startDate: string;
  endDate: string;
  academicTermId: string;
  academicTermName: string;
  status: "Active" | "Inactive";
  educationalLevelId: string;
  academicYearName: string;
  academicYearId: string;
}

export interface UpdateAcademicTermTimeRange {
  EducationalLevelId: string;
  AcademicTermId: string;
  AcademicYearId: string;
  StartDate: string;
  EndDate: string;
}

export interface AcademicTermPost {
  AcademicTerm?: string[];
  AcademicTermType: string;
  EducationalLevelId: string;
}
export interface ActivateTerm {
  AcademicTermId: string;
  AcademicYearId: string;
  EducationalLevelId: string;
  Status: "Active";
}

export interface AcademicYearGet {
  academicYearId: string;
  startYear: string;
  endYear: string;
  createdAt: string;
  status: "Active" | "Inactive";
}
export interface AcademicYearPost {
  StartYear: string;
  EndYear: string;
}
export interface AcademicYearUpdate {
  data: AcademicYearPost;
  id: string;
}
export interface ActivateYear {
  id: string;
  data: {
    Status: "Activate";
  };
}

export interface CalendarItem {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: EventGet | NoticeGet;
}

export interface Others {
  academicYear: AcademicYearGet;
  academicTerm: AcademicTermGet[];
  institution: InstitutionGet;
  permissions: Permission[];
}

export interface CloseTermPayload {
  VacationName: string;
  HeadMasterRemarks?: string;
  Notice?: string;
  UserId: string;
  CurrentAcademicTermId: string;
  NextAcademicTermId: string;
  AcademicYearId: string;
  EducationalLevelId: string;
  ReOpeningYearId: string;
  settings: {
    publishReport: boolean;
    billStudents: boolean;
    [key: string]: boolean; // room for future settings
  };
}

export interface OpenTermPayload {
  VacationId: string;
  ReOpeningYearName: string; // start-end
  UserId: string;
  HeadMasterRemarks?: string;
  Notice?: string
  Settings: {
    PublishReport: boolean;
    BillStudents: boolean;
  };
}

// query params
// educationalLevelId
export interface LastClosedTermRecord {
  vacationId: string;
  vacationName: string;
  closedTermId: string;
  closedTermName: string;
  nextTermId: string;
  nextTermName: string;
  currentYearId: string;
  currentYearName: string;
  reOpeningYearId: string;
  reOpeningYearName: string;
  educationalLevelId: string;
  notice: string;
  headMasterRemarks: string;
  settingsApplied: {
    publishReport: boolean;
    billStudents: boolean;
    // extend as you add more settings
  };
}
