import { getHelper, postWithFile, updateWithFile } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { InstitutionGet } from "@/types/api/setup/institution";

export const getInstitutionProfile = async () => {
  return getHelper<InstitutionGet>(endpoints.institution.profile);
};

export const createInstitution = async (data: FormData) => {
  return postWithFile(endpoints.institution.create, data);
};

export const updateInstitution = async ({
  data,
  instId,
}: {
  instId: string;
  data: FormData;
}) => {
  return updateWithFile(endpoints.institution.update(instId), data);
};
