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
  status: "Active" | "Inactive";
}

export interface AcademicTermPost {
  AcademicTerm?: string[];
  AcademicTermType: string;
  EducationalLevelId: string;
}
export interface ActivateTerm {
  id: string;
  data: {
    Status: "Active";
    StartDate: string;
    EndDate: string;
    UserId: string;
  };
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
  permissions: { permission: Permission; createdOn: string }[];
}
