import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  SubsidiaryLedger,
  SubsidiaryLedgerPost,
  SubsidiaryLedgerUpdate,
  TuitionGet,
  TuitionPost,
  TuitionUpdate,
} from "@/types/api/finance";

const {
  finance: { fees, ledgers },
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
