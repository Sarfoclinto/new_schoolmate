import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth.store";
import { getUserDashboardRoute } from "@/utils/string";
import paths from "@/config/routes";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const ProtectedRoute = ({
  allowedRoles,
  children,
}: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={paths.auth.login.href} replace />;
  }

  const userRole = user.role?.toUpperCase();

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={getUserDashboardRoute()} replace />;
  }

  return <>{children}</>;
};
