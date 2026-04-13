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
  glCode: string; // 100
  description: string;
};

export type SubsidiaryLedgerPost = Pick<SubsidiaryLedger, "sl">;

export type SubsidiaryLedgerUpdate = {
  id: string;
  data: SubsidiaryLedgerPost;
};



/**
 * endpoint: /GetClassBill
 * 
 * queryParams:
 * subLevelId: string
 * academicYearId?: string;
 * academicTermId?: string;
 */


export interface SubLedgerBill {
  slCode: string;
  sl: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface StudentBill {
  studentId: string;
  fullName: string;
  otherName: string;
  subLedgerBill: SubLedgerBill[];
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export type ClassBill = StudentBill[];
