import { Outlet } from "react-router-dom";
import StaffLayoutHeader from "./header";
import StaffLayoutSidebar from "./sidebar";

const StaffLayout = () => {
  return (
    <main className="w-full min-h-dvh flex flex-col">
      <StaffLayoutHeader />
      <div className="w-full h-full flex">
        <StaffLayoutSidebar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </main>
  );
};
export default StaffLayout;
