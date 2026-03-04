import { Outlet } from "react-router-dom";
import StaffLayoutHeader from "./header";
import StaffLayoutSidebar from "./sidebar";

const StaffLayout = () => {
  return (
    <main className="w-full min-h-dvh flex bg-[#F4F6FA] relative">
      <StaffLayoutSidebar />
      <div className="w-full h-full flex flex-col min-h-dvh transition-all duration-300 relative pt-15">
        <StaffLayoutHeader />
        <div className="flex-1 p-2 overflow-auto">
          <Outlet />
        </div>
      </div>
    </main>
  );
};
export default StaffLayout;
