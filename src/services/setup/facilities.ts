import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  StructureGet,
  StructurePost,
  StructureUpdate,
} from "@/types/api/setup/facilities";

const { facilities } = endpoints;

export const getAllFacilitiesFn = async () => {
  return getHelper<StructureGet[]>(facilities.getAll);
};
export const createFacilityFn = async (data: StructurePost) => {
  return postHelper(facilities.create, data);
};

export const updateFacilityFn = async (update: StructureUpdate) => {
  return updateHelper(facilities.update(update.id), update.data);
};

export const deleteFacilityFn = async (id: string) => {
  return deleteHelper(facilities.delete(id));
};
