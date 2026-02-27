import paths from "@/config/routes";
import { useAuth } from "@/store/auth.store";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

const ProtectStaffRoutes = ({ children }: PropsWithChildren) => {
  const { user, isAuth } = useAuth();
  const role = user?.role.toLowerCase();

  const isPermitted = isAuth && user && role?.includes("teach");

  if (!isPermitted) {
    return <Navigate to={paths.auth.login.href} replace />;
  }
  return children;
};
export default ProtectStaffRoutes;
