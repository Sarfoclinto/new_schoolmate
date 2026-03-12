import { getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  AcademicTermGet,
  AcademicTermPost,
  AcademicTermTimeRange,
  AcademicYearGet,
  AcademicYearPost,
  AcademicYearUpdate,
  ActivateTerm,
  ActivateYear,
  LastClosedTermRecord,
  CloseTermPayload,
  OpenTermPayload,
  UpdateAcademicTermTimeRange,
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
// !NOT IN USE
export const getAllTermsFn = async () => {
  return getHelper<AcademicTermGet[]>(term.getAll);
};
// !NOT IN USE
export const getTermByIdFn = async (id: string) => {
  return getHelper<AcademicTermGet>(term.getById(id));
};
// !NOT IN USE
export const getTermsBySubIdFn = async (id: string) => {
  return getHelper<AcademicTermGet[]>(term.getBySubId(id));
};
export const getTermsByEduIdFn = async (id: string) => {
  return getHelper<AcademicTermGet[]>(term.getByEduId(id));
};

export const getTermsFromStateByEduId = async (eduId: string,yearId: string) => {
  return getHelper<AcademicTermTimeRange[]>(term.getTermTimeRange, {
    educationalLevelId: eduId,
    academicYearId: yearId,
  });
}
export const getTermsTimeRangeFn = async (eduId: string, yearId: string) => {
  return getHelper<AcademicTermTimeRange[]>(term.getTermTimeRange, {
    educationalLevelId: eduId,
    academicYearId: yearId,
  });
};
// Returns the most recently closed term for a given educational level
export const getLastClosedTermFn = async (_eduLevelId: string) => {
  return getHelper<LastClosedTermRecord>(term.getRecentlyClosedByEduId, {
    educationalLevelId: _eduLevelId,
  });
};

// Opens (re-activates) a new academic term
export const openAcademicTermFn = async (_payload: OpenTermPayload) => {
  return postHelper(term.open, _payload);
};

export const updateTermTimeRangeFn = async (
  data: UpdateAcademicTermTimeRange,
) => {
  return postHelper(term.updateTermTimeRange, data);
};
export const createTermFn = async (data: AcademicTermPost) => {
  return postHelper(term.create, data);
};
export const activeTermFn = async (update: ActivateTerm) => {
  return postHelper(term.active, update);
};
export const deleteTermFn = async (id: string) => {
  return updateHelper(term.delete(id));
};

export const closeAcademicTermFn = async (data: CloseTermPayload) => {
  return postHelper(term.closeTerm, data);
};
