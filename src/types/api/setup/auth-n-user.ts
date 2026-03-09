import { z } from "zod";
import type { Others } from "./year-n-term";
import type { MdResponse } from "@/types/api";
import type { LoginPayloadSchema, UserSchema } from "@/schemas";

// inferred types from schema
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
export type User = z.infer<typeof UserSchema>;

// hardcoded
export interface LoginReturn {
  user: User | null;
  other: Others;
  token: string | null;
  isAuth: boolean;
  responseCode: 0 | 1;
  responseMessage: string;
}

export interface UpdateReturn {
  user: User | null;
  response: MdResponse;
}
