import type { MdResponse } from "../api";
import type { AcademicTermGet, AcademicYearGet } from "./setup/year-n-term";
import { z } from "zod";

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
  academicLevelIds: string[];
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

export type PaymentMethod = "split" | "cash" | "cheque" | "mobile_money";

export interface SplitEntry {
  method: "cash" | "cheque" | "mobile_money" | "other";
  amount: number;
  referenceNumber?: string;
}

export type VerifyResponse = {
  responseCode: "01" | "100";
};

export type DetailsResponse = {
  name: string;
};

export type UseVerifyResult = {
  valid: boolean;
  name: string | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
};

export interface DebitObj {
  refNo: string;
  msisdn: string;
  amount: number;
  network: string;
  narration: string;
}

export type TransStatRes = {
  responseCode: string | "03";
  responseMessage: string;
};

export const PaymentPostSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  slCode: z.string().optional(),
  amount: z.number().positive("Amount must be greater than 0"),
  paymentMode: z.enum(["split", "cash", "cheque", "momo"]),
  payer: z.string().min(1, "Payer name is required"),
  reference: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  description: z.string().min(1, "Description is required"),
  chequeReference: z
    .object({
      chequeNumber: z.string().min(1, "Cheque number is required"),
      accountNumber: z.string().min(1, "Account number is required"),
    })
    .optional(),
});

export const validatePaymentPayload = (payload: unknown) => {
  return PaymentPostSchema.safeParse(payload);
};

export type PaymentPost = z.infer<typeof PaymentPostSchema>;

export type SavePaymentProps = {
  save: boolean;
  payload: PaymentPost;
  onSuccessSave?: (payload: MdResponse) => void;
};

/**
 * /GetStudentPaymentHistory
 * params obj {
 *  studentId: string;
 *  academicYearId?: string;
 *  academicTermId?: string;
 * }
 */
export type PaymentMode = "cash" | "momo" | "cheque";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";

export interface PaymentGet {
  paymentId: string;
  label: string;
  sl?: {
    slCode: string;
    sl: string;
  };
  paymentMode: PaymentMode;
  reference?: string;
  accountNumber?: string;
  chequeNumber?: string;
  amount: number;
  status: PaymentStatus;
  payer: string;
  description: string;
  createdOn: string;
  updatedOn: string;
}

export interface PendingPayment {
  studentId: string;
  studentName: string;
  pendingPayments: PaymentGet[];
}

export interface StudentBillRef {
  studentId: string;
  fullName: string;
  otherName?: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  subLevelName?: string;
}

export interface UpdateStatusPayload {
  paymentId: string;
  status: "paid" | "cancelled";
}
