import { getHelper, postHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { PaginatedRes } from "@/types/api";
import type {
  GuardianStudentMapPost,
  GuardianWard,
  GuardianWithoutWards,
  GuardianWithWard,
} from "@/types/api/guardian";

const { guardian } = endpoints;

export const getAllGuardiansWithoutWardFn = () => {
  return getHelper<GuardianWithoutWards[]>(guardian.getAll);
};

type Params = {
  search?: string;
  page?: number;
  limit?: number;
};

export const searchGuardianFn = (
  params: Params = { search: "", page: 1, limit: 10 },
) => {
  return getHelper<PaginatedRes<GuardianWithoutWards[]>>(
    guardian.getAllPn,
    params,
  );
};

export const getAllGuardiansWithWardsFn = () => {
  return getHelper<GuardianWithWard[]>(guardian.getAllWithWards);
};

export const getGuardianStudentsFn = async (id: string) => {
  return getHelper<GuardianWard[]>(guardian.getGuardianStudents(id));
};

export const getStudentGuardianFn = async (id: string) => {
  return getHelper<GuardianWithoutWards>(guardian.getByStudentId(id));
};

export const mapStudentToGuardianFn = async (data: GuardianStudentMapPost) => {
  return postHelper(guardian.mapStudentToGuardian, data);
};
