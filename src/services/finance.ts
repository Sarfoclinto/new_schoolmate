import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  ClassBill,
  SubsidiaryLedger,
  SubsidiaryLedgerPost,
  SubsidiaryLedgerUpdate,
  TuitionGet,
  TuitionPost,
  TuitionUpdate,
  BillingStatusReport,
  ManualLevelBillingPayload,
  ManualStudentBillingPayload,
  UnbilledStudent,
} from "@/types/api/finance";
import {
  // generateMockBillingStatus,
  // generateMockClassBill,
  generateMockUnbilledStudents,
  delayMs,
} from "@/mock/finance";

const {
  finance: { fees, ledgers, bills },
} = endpoints;

// ledgers
export const getAllSubsidiaryLedgerFn = async () => {
  return getHelper<SubsidiaryLedger[]>(ledgers.getAllSub);
};
export const createSubsidiaryLedgerFn = async (data: SubsidiaryLedgerPost) => {
  return postHelper(ledgers.create, data);
};
export const updateSubsidiaryLedgerFn = async (
  update: SubsidiaryLedgerUpdate,
) => {
  return updateHelper(ledgers.update(update.id), update.data);
};

// fees
export const createFeesFn = async (data: TuitionPost) => {
  return postHelper(fees.setup, data);
};
export const updateFeesFn = async (update: TuitionUpdate) => {
  return updateHelper(fees.update(update.id), update.data);
};
export const deleteFeesFn = async (id: string) => {
  return deleteHelper(fees.delete(id));
};
type FeesParams = {
  educationalLevelId?: string;
  academicLevelId?: string;
  academicTermId?: string;
  academicYearId?: string;
};
export const getFeesFn = async (params: FeesParams) => {
  return getHelper<TuitionGet[]>(fees.getAll, params);
};

// ------------------------ Bills ----------------------------------------------
export const getClassBillFn = async (_p: {
  subLevelId: string;
  academicYearId?: string;
  academicTermId?: string;
}): Promise<ClassBill> => {
  // TODO: Remove and switch to real API when backend is ready
  // await delayMs(1200); // Simulate network latency
  // return generateMockClassBill();
  return getHelper<ClassBill>(bills.class, _p);
};

export const getBillingStatusFn = async (_p: {
  yearId: string;
  termId: string;
  eduId: string | null;
}): Promise<BillingStatusReport> => {
  // await delayMs(1500); // Simulate network latency
  // return generateMockBillingStatus();
  return getHelper<BillingStatusReport>(bills.billStatus, {
    academicYearId: _p.yearId,
    academicTermId: _p.termId,
    educationalLevelId: _p.eduId,
  });
};

export const manualLevelBillingFn = async (_p: ManualLevelBillingPayload) =>
  postHelper(bills.manualLevel, _p);
export const manualStudentBillingFn = async (_p: ManualStudentBillingPayload) =>
  postHelper(bills.manualStudent, _p);

export const getUnbilledStudentsFn = async (_p: {
  yearId: string;
  termId: string;
  subLevelId?: string;
}): Promise<UnbilledStudent[]> => {
  // TODO: Remove and switch to real API when backend is ready
  await delayMs(1200); // Simulate network latency
  return generateMockUnbilledStudents(_p.subLevelId);
};
