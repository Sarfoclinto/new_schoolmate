import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  EduLevelGet,
  EduLevelPost,
  EduUpdate,
} from "@/types/api/setup/educational-level";

const { eduLevel } = endpoints;

export const getAllEduLevelsFn = async () => {
  return getHelper<EduLevelGet[]>(eduLevel.getAll);
};

export const getEdulevelByIdFn = async (id: string) => {
  return getHelper<EduLevelGet>(eduLevel.getById(id));
};

export const createEduLevelFn = async (data: EduLevelPost) => {
  return postHelper(eduLevel.create, data);
};

export const updateEduLevelFn = async (update: EduUpdate) => {
  return updateHelper(eduLevel.update(update.id), update.data);
};

export const deleteEduLevelFn = async (id: string) => {
  return deleteHelper(eduLevel.delete(id));
};
