import { z } from "zod";
import {
  DASHBOARD_TYPES,
  // PERMISSIONS
} from "./config/permissions";

export const LoginPayloadSchema = z.object({
  UserId: z
    .string()
    .trim()
    .refine((val) => val.toLowerCase().startsWith("st-"), {
      message: "UserId must start with ST-",
    })
    .min(6, { message: "UserId must be at least 6 characters long" }),
  Password: z.string().min(1, { message: "Password is required" }),
});

// ── Permission value union ─────────────────────────────────────────────────────
// Derived from your PERMISSIONS const so schema and types are always in sync.
// const permissionValues = Object.values(PERMISSIONS) as [string, ...string[]];
// const PermissionSchema = z.enum(permissionValues);

// ── DashboardType union ────────────────────────────────────────────────────────
const dashboardTypeValues = Object.values(DASHBOARD_TYPES) as [
  string,
  ...string[],
];
const DashboardTypeSchema = z.enum(dashboardTypeValues);

export const UserSchema = z.object({
  userId: z.string(),
  name: z.string(),
  role: z.string(), // human-readable label — display only
  roleId: z.string(),
  phone: z.string(),
  email: z.string(),
  createdAt: z.string(),
  staffId: z.string(),
  imageUrl: z.string().nullable(),

  // ── New fields the backend now returns ──────────────────────────────────────
  /**
   * Which layout/dashboard this user belongs to.
   * Set by the backend based on the role's dashboardType field.
   * Always one of: "admin" | "staff"
   */
  dashboardType: DashboardTypeSchema,

  /**
   * Flat array of permission strings this user holds.
   * Derived server-side from the role's saved permissions.
   * Empty array means the user can log in but sees almost nothing.
   */
  // permissions: z.array(PermissionSchema).default([]),
});

export const EnvSchema = z.object({
  API_BASE_URL: z.url(),
  APP_NAME: z.string(),
  ENVIRONMENT: z.string(),
  ISPROD: z.boolean(),
  ISDEV: z.boolean(),
});
