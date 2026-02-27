import paths from "@/config/routes";
import { Navigate } from "react-router-dom";

const HomeView = () => {
  return <Navigate to={paths.auth.login.href} replace />;
};
export default HomeView;
