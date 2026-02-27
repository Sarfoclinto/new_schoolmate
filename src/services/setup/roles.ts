import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { RoleGet, RolePost, RoleUpdate } from "@/types/api/setup/roles";

const { roles } = endpoints;

export const createRoleFn = async (data: RolePost) => {
  return postHelper(roles.createRole, data);
};

export const updateRoleFn = async (data: RoleUpdate) => {
  return updateHelper(roles.updateRole(data.id), data.data);
};

export const deleteRoleFn = async (roleId: string) => {
  return deleteHelper(roles.deleteRole(roleId));
};

export const getAllRolesFn = async () => {
  return getHelper<RoleGet[]>(roles.getAllRoles);
};
