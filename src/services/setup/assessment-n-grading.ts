import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  AssessmentGet,
  AssessmentGetResponse,
  AssessmentPost,
  AssessmentUpdate,
  GradeGet,
  GradePost,
  GradeUpdate,
} from "@/types/api/setup/assessment-n-grading";

const {
  assessmentNGrading: { grading, assessment },
} = endpoints;

// grading
export const getAllGradingFn = async () => {
  return getHelper<GradeGet[]>(grading.getAll);
};
export const getGradingByEduIdFn = async (id: string) => {
  return getHelper<GradeGet[]>(grading.getByEduId(id));
};
export const getGradingByIdFn = async (id: string) => {
  return getHelper<GradeGet>(grading.getById(id));
};
export const createGradingFn = async (data: GradePost) => {
  return postHelper(grading.create, data);
};
export const updateGradingFn = async (update: GradeUpdate) => {
  return updateHelper(grading.update(update.id), update.data);
};
export const deleteGradingFn = async (id: string) => {
  return deleteHelper(grading.delete(id));
};

// assessment
export const getAllAssessmentsFn = async () => {
  return getHelper<AssessmentGet[]>(assessment.getAll);
};
export const getAssessmentsBySubIdFn = async (id: string) => {
  return getHelper<AssessmentGetResponse>(assessment.getBySubId(id));
};
export const getAssessmentsByEduIdFn = async (id: string) => {
  return getHelper<AssessmentGetResponse>(assessment.getByEduId(id));
};
export const createAssessmentFn = async (data: AssessmentPost) => {
  return postHelper(assessment.create, data);
};
export const updateAssessmentFn = async (update: AssessmentUpdate) => {
  return updateHelper(assessment.update(update.id), update.data);
};
export const deleteAssessmentFn = async (id: string) => {
  return deleteHelper(assessment.delete(id));
};
