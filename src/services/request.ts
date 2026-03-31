import { deleteHelper, getHelper, patchHelper, postHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  DeletePayload,
  RequestItem,
  RequestPayload,
  UpdatePayload,
} from "@/types/api/request";

const { request } = endpoints;

export const postRequest = async (data: RequestPayload) => {
  return postHelper(request.create, data);
};

export const deleteRequestFn = async (data: DeletePayload) => {
  return deleteHelper(request.delete, "", data);
};

export const updateRequestFn = async (data: UpdatePayload) => {
  return patchHelper(request.update, "", data);
};

export const getUserRequestsFn = async (
  userId: string,
  type: "sender" | "receiver",
) => {
  return getHelper<RequestItem[]>(request.list, { userId, type });
};
