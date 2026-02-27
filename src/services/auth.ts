import { postHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { LoginPayload, LoginReturn } from "@/types/api/setup/auth-n-user";

export const loginFn = async (cred: LoginPayload) => {
  return postHelper<LoginReturn>(endpoints.auth.login, cred);
};
