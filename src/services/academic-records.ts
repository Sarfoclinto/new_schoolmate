import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  AcademicRecordPost,
  ClassRanking,
  ClassRecordsGet,
  PassmarkGet,
  PassmarkPost,
  PassmarkUpdate,
  SubLevelSubjectAcademicRecordGet,
} from "@/types/api/academic-records";

const {
  academicRecords: { passmark, records },
} = endpoints;

export const addPassmarkFn = async (data: PassmarkPost) => {
  return postHelper(passmark.create, data);
};
export const updatePassmarkFn = async (update: PassmarkUpdate) => {
  return updateHelper(passmark.update(update.id), update.data);
};
export const deletePassmarkFn = async (id: string) => {
  return deleteHelper(passmark.delete(id), {});
};
export const getPassmarkFn = async (teacherId: string, sublevelId: string) => {
  return getHelper<PassmarkGet[]>(
    passmark.teacherSublevelSubject(teacherId, sublevelId),
  );
};

// records
export const addRecordFn = async (data: AcademicRecordPost) => {
  return postHelper(records.add, data);
};

type UpdatePayload = {
  id: string;
  data: AcademicRecordPost;
};
export const updateRecordFn = async ({ id, data }: UpdatePayload) => {
  return updateHelper(records.update, data, { academicRecordId: id });
};
export const getSublvelSubjectRecordsFn = async (
  assessId: string,
  sublevelId: string,
  subjectId: string,
  academicYearId?: string,
  academicTermId?: string,
) => {
  return getHelper<SubLevelSubjectAcademicRecordGet[]>(
    records.sublevelSubjectsRecords(assessId, sublevelId, subjectId),
    {
      academicTermId,
      academicYearId,
    },
  );
};

export const getSublevelRecords = async (
  sublevelId: string,
  assessId: string,
  teacherId?: string,
  academicTermId?: string,
) => {
  return getHelper<ClassRecordsGet[]>(records.sublevelAcademicRecords, {
    assessmentId: assessId,
    subLevelId: sublevelId,
    teacherId: teacherId,
    academicTermId,
  });
};

export const getClassRankingFn = async (
  subLevelId: string,
  academicTermId: string,
  academicYearId?: string,
) => {
  return getHelper<ClassRanking>(records.classRanking, {
    subLevelId,
    academicYearId,
    academicTermId,
  });
};
