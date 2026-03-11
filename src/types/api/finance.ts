import type { AcademicTermGet, AcademicYearGet } from "./setup/year-n-term";

export type TuitionPost = {
  //   Id: string;
  //   SlCode: string;
  //   EducationalLevelId: string;
  //   AcademicLevelId: string;
  //   Amount: number;
  id: string;
  slCode: string;
  educationalLevelId: string;
  academicLevelId: string;
  academicYearId: string;
  academicTermId: string;
  amount: number;
};
export type TuitionUpdate = {
  id: string;
  data: TuitionPost;
};

export type TuitionGet = {
  id: string;
  slCode: string;
  sl: string;

  educationalLevelId: string;
  educationalLevelName: string;

  academicLevelId: string;
  academicLevelName: string;

  academicYear: AcademicYearGet;
  academicTerm: Pick<AcademicTermGet, "academicTermId" | "academicTermName">;

  amount: number;
};

export type SubsidiaryLedger = {
  slCode: string;
  sl: string;
  glCode: string;
};
