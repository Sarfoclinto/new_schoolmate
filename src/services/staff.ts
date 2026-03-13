import {
  deleteHelper,
  getHelper,
  postHelper,
  postWithFile,
  updateHelper,
  updateWithFile,
} from "@/api/crud";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/config/constants";
import endpoints from "@/config/endpoints";
import type { Permission } from "@/config/permissions";
import type { RegisterResponse } from "@/types/api";
import type { UpdateReturn } from "@/types/api/setup/auth-n-user";
import type {
  AdminUpdateStaffType,
  AssignPermissionsPayload,
  DeleteMapping,
  StaffGet,
  StaffGetResponse,
  StaffUpdateWithFile,
  TeacherMappingPost,
  TeachersMapping,
  TeacherSubjectsGet,
  TeacherSubLevelsGet,
  UpdateSecurity,
} from "@/types/api/staff";

const { staffMn } = endpoints;

export const getAllStaffPnFn = async (
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
) => {
  return getHelper<StaffGetResponse>(staffMn.getAllPn, { page, limit });
};
export const getAllStaffUnPnFn = async () => {
  return getHelper<StaffGet[]>(staffMn.getAllUnPn);
};
export const getStaffByIdFn = async (id: string) => {
  return getHelper<StaffGet>(staffMn.getById(id));
};
export const getAllTeachersFn = async () => {
  return getHelper<StaffGet[]>(staffMn.allTeachers);
};
export const getTeacherMappingFn = async (id: string) => {
  return getHelper<TeachersMapping>(staffMn.teacherSubjects(id));
};

export const getTeacherSublevelSubjectsFn = async (
  teacherId: string,
  sublevelId: string,
) => {
  return getHelper<TeacherSubjectsGet>(
    staffMn.subLevelSubjects(teacherId, sublevelId),
  );
};
export const getStaffByDashboardTypeFn = async (
  dashboardType: "admin" | "staff",
) => {
  return getHelper<StaffGet[]>(staffMn.getByDashboardType, { dashboardType });
};
export const getTeachersSublevelsFn = async (id: string) => {
  return getHelper<TeacherSubLevelsGet>(staffMn.teacherSublevels(id));
};
export const createStaffFn = async (data: FormData) => {
  return postWithFile<RegisterResponse>(staffMn.create, data);
};
export const adminUpdateStaffFn = async (update: AdminUpdateStaffType) => {
  return updateHelper(staffMn.updateStaff(update.id), update.data);
};
export const updateStaffProfileFn = async (update: StaffUpdateWithFile) => {
  return updateWithFile<UpdateReturn>(
    staffMn.updateProfile(update.id),
    update.data,
  );
};
export const updateStaffImageFn = async (update: StaffUpdateWithFile) => {
  return updateWithFile(
    staffMn.updateImage(update.id),
    update.data,
  );
};

export const updateStaffPasswordFn = async (update: UpdateSecurity) => {
  return updateHelper(staffMn.updatePassword(update.id), update.data);
};

export const createTeacherMapFn = async (data: TeacherMappingPost) => {
  return postHelper(staffMn.createMapping, data);
};

export const deleteTeachersSubjectFn = async (
  ids: DeleteMapping["subject"],
) => {
  return deleteHelper(staffMn.delTeacherSubject(ids.teacherId, ids.subjectId));
};
export const deleteTeachersSublevelFn = async (
  ids: DeleteMapping["subLevel"],
) => {
  return deleteHelper(
    staffMn.delTeacherSublevel(ids.teacherId, ids.subLevelId),
  );
};

export const getUserPermissionsFn = async (_id: string) => {
  return getHelper<Permission[]>(staffMn.getStaffPermissions, {
    staffId: _id,
  });
};

export const syncPermissionsFn = async (_d: AssignPermissionsPayload) => {
  return postHelper(staffMn.syncPermissions, _d);
};
