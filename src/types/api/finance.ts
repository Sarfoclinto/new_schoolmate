import type { AcademicTermGet, AcademicYearGet } from "./setup/year-n-term";

export type TuitionPost = {
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

// --------------- BILLS ------------------------------
// Class bill
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

// Bill center
export interface SubLedgerConfig {
  slCode: string;
  sl: string;
  amount: number;
}

export interface BilledSubLedger extends SubLedgerConfig {
  studentsCharged: number;
  totalCharged: number;
}

export interface SubLevelBillingStatus {
  subLevelId: string;
  subLevelName: string;
  totalStudents: number;
  billedStudents: number;
  unbilledStudents: number;
  billedSubLedgers: string[]; // slCodes
}

export type BillingHealth =
  | "fully_billed"
  | "partially_billed"
  | "not_billed"
  | "not_configured";

export interface AcaLevelBillingStatus {
  academicLevelId: string;
  academicLevelName: string;
  feeConfigured: boolean;
  billingStatus: BillingHealth;
  totalStudents: number;
  billedStudents: number;
  unbilledStudents: number;
  configuredSubLedgers: SubLedgerConfig[];
  billedSubLedgers: BilledSubLedger[];
  missingSubLedgers: SubLedgerConfig[];
  subLevels: SubLevelBillingStatus[];
}

export interface BillingStatusReport {
  academicYearId: string;
  academicTermId: string;
  academicLevels: AcaLevelBillingStatus[];
}

export interface ManualLevelBillingPayload {
  academicYearId: string;
  academicTermId: string;
  educationalLevelIds: string[];
  subLedgerCodes?: string[];
  userId: string;
}

export interface ManualStudentBillingPayload {
  academicYearId: string;
  academicTermId: string;
  studentIds: string[];
  subLedgerCodes?: string[];
  userId: string;
}

export interface UnbilledStudent {
  studentId: string;
  fullName: string;
  otherName: string;
  subLevelId: string;
  subLevelName: string;
  admittedOn: string;
  reason?: "new_admission" | "omitted" | "unknown";
}
