import type { RequestError } from "@/types/error";

export const isCanceledError = (err: unknown) => {
  if (!err || typeof err !== "object") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e: any = err as any;
  // covers axios Abort / cancel shapes and generic CancelledError names
  return (
    e?.code === "ERR_CANCELED" ||
    e?.name === "CanceledError" ||
    (typeof e?.message === "string" &&
      e.message?.toLowerCase().includes("cancel"))
  );
};

export const mutationIsCanceledError = (err: unknown) => {
  if (!err || typeof err !== "object") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e: any = err as any;
  return (
    e?.code === "ERR_CANCELED" ||
    e?.name === "CanceledError" ||
    (typeof e?.message === "string" &&
      e.message.toLowerCase().includes("cancel"))
  );
};

export const parseApiError = (err: RequestError): string => {
  switch (err.request?.status) {
    case 422:
      return parseUnprocessableContent(err);
    default:
      return err.response?.data?.message ?? err.message;
  }
};

const parseUnprocessableContent = (err: RequestError) => {
  if (err.response.data.errors) {
    return Object.values(err.response.data.errors).join(",");
  } else {
    return err.response.data.message;
  }
};
