import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  AcaLevelGet,
  AcaLevelPost,
  AcaLevelUpdate,
} from "@/types/api/setup/academic-level";

const { acaLevel } = endpoints;

export const getAllAcaLevelsFn = () => {
  return getHelper<AcaLevelGet[]>(acaLevel.getAll);
};

export const getAcaByEduIdFn = (id: string) => {
  return getHelper<AcaLevelGet[]>(acaLevel.getByEduId(id));
};

export const getAcaByIdFn = (id: string) => {
  return getHelper<AcaLevelGet>(acaLevel.getById(id));
};

export const createAcaLevelFn = (data: AcaLevelPost) => {
  return postHelper(acaLevel.create, data);
};

export const updateAcaLevelFn = (update: AcaLevelUpdate) => {
  return updateHelper(acaLevel.update(update.id), update.data);
};

export const deleteAcaLevelFn = (id: string) => {
  return deleteHelper(acaLevel.delete(id));
};
