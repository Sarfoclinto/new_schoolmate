import "@/styles/full-calendar.css";
import { Outlet } from "react-router-dom";
import LogOutModal from "./logout-modal";
import { useTokenExpiryHandler } from "@/hooks/use-token-expiry-handler";

const SharedLayout = () => {
  useTokenExpiryHandler();
  return (
    <main>
      <LogOutModal />
      <Outlet />
    </main>
  );
};
export default SharedLayout;
