import "@/styles/full-calendar.css";
import { Outlet } from "react-router-dom";
import LogOutModal from "./logout-modal";
import { useTokenExpiryHandler } from "@/hooks/use-token-expiry-handler";
import ScrollToTop from "../custom/scroll-to-top";
import InfoModal from "./info-modal";

const SharedLayout = () => {
  useTokenExpiryHandler();
  return (
    <main>
      <LogOutModal />
      <InfoModal />
      <ScrollToTop />
      <Outlet />
    </main>
  );
};
export default SharedLayout;
