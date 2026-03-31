import { deleteHelper, getHelper, postHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { Remark, RemarkPayload } from "@/types/api/remarks";

const { remarks } = endpoints;

type ListParams = {
  academicYearId: string;
  academicTermId: string;
  subLevelId: string;
  teacherId?: string;
};

export const getRemarksFn = async (params: ListParams) => {
  return getHelper<Remark[]>(remarks.list, params);
};

export const createRemarkFn = async (data: RemarkPayload) => {
  return postHelper(remarks.create, data);
};

export const deleteRemarkFn = async (id: string) => {
  return deleteHelper(remarks.delete(id));
};
