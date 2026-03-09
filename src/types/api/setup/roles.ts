import z from "zod";

export const RolePostSchema = z.object({
  RoleName: z.string().min(1, { message: "Role name is required" }),
  DashboardType: z.enum(["admin", "staff"]),
});

export type RolePost = z.infer<typeof RolePostSchema>;

export interface RoleUpdate {
  data: RolePost;
  id: string;
}

export interface RoleGet {
  roleId: string;
  roleName: string;
  dashboardType: "admin" | "staff";
}
