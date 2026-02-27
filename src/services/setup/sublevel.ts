import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  SubLevelPost,
  SubLevelGet,
  SubLevelUpdate,
} from "@/types/api/setup/sublevel";

const { sublevel } = endpoints;

export const getAllSubLevelsFn = async () => {
  return getHelper<SubLevelGet[]>(sublevel.getAll);
};

export const getSublevelsWithoutProgramFn = async () => {
  return getHelper<SubLevelGet[]>(sublevel.withoutProgram);
};

export const getSubLevelByIdFn = (id: string) => {
  return getHelper<SubLevelGet>(sublevel.getById(id));
};

export const getSubLevelsByAcaIdFn = (id: string) => {
  return getHelper<SubLevelGet[]>(sublevel.getByAcaId(id));
};

export const createSubLevelFn = async (data: SubLevelPost) => {
  return postHelper(sublevel.create, data);
};

export const updateSubLevelFn = async (update: SubLevelUpdate) => {
  return updateHelper(sublevel.update(update.id), update.data);
};

export const deleteSubLevelFn = async (id: string) => {
  return deleteHelper(sublevel.delete(id));
};
