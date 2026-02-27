import { getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  AcademicTermGet,
  AcademicTermPost,
  AcademicYearGet,
  AcademicYearPost,
  AcademicYearUpdate,
  ActivateTerm,
  ActivateYear,
} from "@/types/api/setup/year-n-term";

const {
  yearsnTerms: { year, term },
} = endpoints;

// years
export const getAllYearsFn = async () => {
  return getHelper<AcademicYearGet[]>(year.getAll);
};
export const getYearByIdFn = async (id: string) => {
  return getHelper<AcademicYearGet>(year.getById(id));
};
export const createYearFn = async (data: AcademicYearPost) => {
  return postHelper(year.create, data);
};
export const updateYearFn = async (update: AcademicYearUpdate) => {
  return updateHelper(year.update(update.id), update.data);
};
export const activeYearFn = async (update: ActivateYear) => {
  return updateHelper(year.active(update.id), update.data);
};

// terms
export const getAllTermsFn = async () => {
  return getHelper<AcademicTermGet[]>(term.getAll);
};
export const getTermByIdFn = async (id: string) => {
  return getHelper<AcademicTermGet>(term.getById(id));
};
export const getTermsBySubIdFn = async (id: string) => {
  return getHelper<AcademicTermGet[]>(term.getBySubId(id));
};
export const getTermsByEduIdFn = async (id: string) => {
  return getHelper<AcademicTermGet[]>(term.getByEduId(id));
};
export const createTermFn = async (data: AcademicTermPost) => {
  return postHelper(term.create, data);
};
export const activeTermFn = async (update: ActivateTerm) => {
  return updateHelper(term.active(update.id), update.data);
};
export const deleteTermFn = async (id: string) => {
  return updateHelper(term.delete(id));
};
