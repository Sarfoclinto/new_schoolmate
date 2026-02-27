import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  ClassroomsGet,
  ClassroomsPost,
  ClassroomsUpdate,
  FacultiesGet,
  FacultiesPost,
  FacultiesUpdate,
  Mapping,
} from "@/types/api/setup/faculty-n-classroom";

const {
  facultyNClassroom: { faculty, classroom, mapping },
} = endpoints;

// FACULTY
export const getAllFacultiesFn = async () => {
  return getHelper<FacultiesGet[]>(faculty.getAll);
};
export const getFacultyByIdFn = async (id: string) => {
  return getHelper<FacultiesGet>(faculty.getById(id));
};
export const createFacultyFn = async (data: FacultiesPost) => {
  return postHelper(faculty.create, data);
};
export const updateFacultyFn = async (update: FacultiesUpdate) => {
  return updateHelper(faculty.update(update.id), update.data);
};
export const deleteFacultyFn = async (id: string) => {
  return deleteHelper(faculty.delete(id));
};

// CLASSROOM
export const getAllClassroomsFn = async () => {
  return getHelper<ClassroomsGet[]>(classroom.getAll);
};
export const getClassroomByIdFn = async (id: string) => {
  return getHelper<ClassroomsGet>(classroom.getById(id));
};
export const getClassroomsByFacultyIdFn = async (facultyId: string) => {
  return getHelper<ClassroomsGet[]>(classroom.getByFacultyId(facultyId));
};
export const createClassroomFn = async (data: ClassroomsPost) => {
  return postHelper(classroom.create, data);
};
export const updateClassroomFn = async (update: ClassroomsUpdate) => {
  return updateHelper(classroom.update(update.id), update.data);
};
export const deleteClassroomFn = async (id: string) => {
  return deleteHelper(classroom.delete(id));
};

// MAPPING
export const assignClassroomToSubLevelFn = async (map: Mapping) => {
  return updateHelper(mapping.assign(map.ClassRoomId, map.SubLevelId));
};
export const unassignClassroomFromSubLevelFn = async (map: Mapping) => {
  return updateHelper(mapping.unassign(map.ClassRoomId, map.SubLevelId));
};
