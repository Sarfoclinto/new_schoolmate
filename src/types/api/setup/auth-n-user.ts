import { z } from "zod";
import type { LoginPayloadSchema, UserSchema } from "../../../schemas";
import type { ActivePeriods } from "./year-n-term";

// inferred types from schema
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
export type User = z.infer<typeof UserSchema>;

// hardcoded
export interface LoginReturn {
  user: User | null;
  other: ActivePeriods;
  token: string | null;
  isAuth: boolean;
  responseCode: 0 | 1;
  responseMessage: string;
}
