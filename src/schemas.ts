import { z } from "zod";

export const LoginPayloadSchema = z.object({
  UserId: z
    .string()
    .trim()
    .startsWith("ST-", { message: "UserId must start with ST-" })
    .min(6, { message: "UserId must be at least 6 characters long" }),
  Password: z.string().min(1, { message: "Password is required" }),
});

export const UserSchema = z.object({
  userId: z.string(),
  staffId: z.string(),
  name: z.string(),
  role: z.string(),
  email: z.string(),
  phone: z.string(),
  createdAt: z.string(),
});

export const EnvSchema = z.object({
  API_BASE_URL: z.url(),
  APP_NAME: z.string(),
  ENVIRONMENT: z.string(),
  ISPROD: z.boolean(),
  ISDEV: z.boolean(),
});
