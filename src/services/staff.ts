import {
  deleteHelper,
  getHelper,
  postHelper,
  postWithFile,
  updateHelper,
} from "@/api/crud";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/config/constants";
import endpoints from "@/config/endpoints";
import type { RegisterResponse } from "@/types/api";
import type {
  AdminUpdateStaffType,
  DeleteMapping,
  StaffGet,
  StaffGetResponse,
  TeacherMappingPost,
  TeachersSubjects,
  TeacherSubLevelsGet,
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
export const getTeachersSubjectsFn = async (id: string) => {
  return getHelper<TeachersSubjects>(staffMn.teacherSubjects(id));
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
