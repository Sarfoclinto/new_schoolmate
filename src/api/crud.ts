import type { GetSingleOptions, MdResponse } from "@/types/api";
import api from "./axios";

// post
export const postHelper = async <T = MdResponse>(
  path: string,
  data?: unknown,
  params?: object,
) => {
  const res = await api.post(path, data, { params });
  return res.data as T;
};
export const postWithFile = async <T = MdResponse>(
  path: string,
  data: FormData,
) => {
  const res = await api.post(path, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data as T;
};

// get
export const getHelper = async <T = unknown>(
  path: string,
  params: object = {},
) => {
  const { data } = await api.get(path, { params });
  return data as T;
};
export const getSingle = async <T = unknown>(
  path: string,
  id: string | number,
  options: GetSingleOptions,
  params: Record<string, unknown> = {},
) => {
  let finalPath = path;
  let finalParams = params;

  if (options.mode === "route") {
    finalPath = `${path}/${id}`;
  } else {
    finalParams = { ...finalParams, [options.paramKey]: id };
  }

  const res = await api.get(finalPath, { params: finalParams });
  return Array.isArray(res.data) ? (res.data[0] as T) : (res.data as T);
};

// update
export const updateHelper = async <T = MdResponse>(
  path: string,
  data?: unknown,
) => {
  const res = await api.put(path, data);
  return res.data as T;
};
export const updateWithFile = async <T = MdResponse>(
  path: string,
  data: FormData,
) => {
  const res = await api.put(path, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data as T;
};

// delete
export const deleteHelper = async <T = MdResponse>(
  path: string,
  data?: unknown,
  params?: object,
) => {
  const res = await api.delete(path, { data, params });
  return res.data as T;
};

// patch
export const patchHelper = async <T = MdResponse>(
  path: string,
  data?: unknown,
  params?: object,
) => {
  const res = await api.patch(path, data, { params });
  return res.data as T;
};
