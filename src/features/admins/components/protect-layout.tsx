import paths from "@/config/routes";
import { useAuth } from "@/store/auth.store";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

const ProtectAdminRoutes = ({ children }: PropsWithChildren) => {
  const { user, isAuth } = useAuth();
  const role = user?.role.toLowerCase();

  const isPermitted = isAuth && user && role?.includes("admin");

  if (!isPermitted) {
    return <Navigate to={paths.auth.login.href} replace />;
  }
  return children;
};
export default ProtectAdminRoutes;
