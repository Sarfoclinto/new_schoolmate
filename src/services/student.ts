import { getHelper, postWithFile, updateWithFile } from "@/api/crud";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/config/constants";
import endpoints from "@/config/endpoints";
import type { RegisterResponse } from "@/types/api";
import type {
  AcademicLevelStudentsGet,
  AcaStudentsResponse,
  AllStudentsResponse,
  EduStudentsResponse,
  StudentGet,
  StudentUpdateWithFile,
  SubLevelStudentsGet,
} from "@/types/api/student";

const { students } = endpoints;
const { updates } = students;
// GET
export const getAllStuPnFn = async (
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
) => {
  return getHelper<AllStudentsResponse>(students.getAllPn, { page, limit });
};
export const getAllEduStuFn = async (
  eduId: string,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
) => {
  return getHelper<EduStudentsResponse>(students.getByEduId(eduId), {
    page,
    limit,
  });
};
export const getAllAcaStuFn = async (
  acaId: string,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
) => {
  return getHelper<AcaStudentsResponse>(students.getByAcaId(acaId), {
    page,
    limit,
  });
};
export const getAllSubLevelStuFn = async (sublevelId: string) => {
  return getHelper<SubLevelStudentsGet[]>(students.getBySubId(sublevelId));
};
export const getStuByIdFn = async (id: string) => {
  return getHelper<StudentGet>(students.getById(id));
};

export const getAllAcaStuUnPnFn = async (acaId: string) => {
  return getHelper<AcademicLevelStudentsGet[]>(students.getByAcaIdUnPn(acaId));
};
export const getAllStuUnPnFn = async () => {
  return getHelper<AcademicLevelStudentsGet[]>(students.getAllUnPn);
};

// POST / UPDATE / DELETE
export const registerStuFn = async (data: FormData) => {
  return postWithFile<RegisterResponse>(students.register, data);
};
export const updateStuPersonalInfoFn = async (
  update: StudentUpdateWithFile,
) => {
  return updateWithFile(updates.personal(update.id), update.data);
};
export const updateStuParentsInfoFn = async (update: StudentUpdateWithFile) => {
  return updateWithFile(updates.parents(update.id), update.data);
};

export const updateStuGuardiansInfoFn = async (
  update: StudentUpdateWithFile,
) => {
  return updateWithFile(updates.guardians(update.id), update.data);
};
export const updateStuEnrollmentInfoFn = async (
  update: StudentUpdateWithFile,
) => {
  return updateWithFile(updates.enrollment(update.id), update.data);
};
