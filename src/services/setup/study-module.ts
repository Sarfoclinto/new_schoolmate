import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  MappingDelete,
  ModulesMappingPost,
  ProgramGet,
  ProgramPost,
  ProgramSubjectsGet,
  ProgramUpdate,
  StudentSubjectsGet,
  SubjectGet,
  SubjectPost,
  SubjectUpdate,
} from "@/types/api/setup/study-modules";

const {
  studyModules: { subject, program, createMapping },
} = endpoints;

// SUBJECTS
export const getAllSubjectsFn = async () => {
  return getHelper<SubjectGet[]>(subject.getAll);
};
export const getSublevelSubjectsFn = async (id: string) => {
  return getHelper<SubjectGet[]>(subject.getBySublevel(id));
};
export const createSubjectFn = async (data: SubjectPost) => {
  return postHelper(subject.create, data);
};
export const updateSubjectFn = async (update: SubjectUpdate) => {
  return updateHelper(subject.update(update.id), update.data);
};
export const deleteSubjectFn = async (id: string) => {
  return deleteHelper(subject.delete(id));
};
export const getOmittedSubsFn = async (stuId: string) => {
  return getHelper<StudentSubjectsGet>(program.getOmittedSubjects(stuId));
};

// PROGRAMS
export const getAllProgramsFn = async () => {
  return getHelper<ProgramGet[]>(program.getAll);
};
export const getProgramSubjectsFn = async (programId: string) => {
  return getHelper<ProgramSubjectsGet>(program.subjects(programId));
};
export const createProgramFn = async (data: ProgramPost) => {
  return postHelper(program.create, data);
};
export const updateProgramFn = async (update: ProgramUpdate) => {
  return updateHelper(program.update(update.id), update.data);
};
export const deleteProgramFn = async (id: string) => {
  return deleteHelper(program.delete(id));
};
export const deleteProgramSubjectFn = async (
  update: MappingDelete["subject"],
) => {
  return deleteHelper(
    program.deleteSubject(update.programId, update.subjectId),
  );
};
export const deleteProgramSubLevelFn = async (
  update: MappingDelete["subLevel"],
) => {
  return deleteHelper(
    program.deleteSublevel(update.programId, update.subLevelId),
  );
};

// MAPPING
export const createModuleMappingFn = async (data: ModulesMappingPost) => {
  return postHelper(createMapping, data);
};
