import { Outlet } from "react-router-dom";
import AdminLayoutHeader from "./header";
import AdminLayoutSidebar from "./sidebar";

const AdminLayout = () => {
  return (
    <main className="w-full min-h-dvh flex bg-[#F4F6FA]">
      <AdminLayoutSidebar />
      <div className="w-full h-full flex flex-col min-h-dvh transition-all duration-300">
        <AdminLayoutHeader />
        <div className="flex-1 p-2 overflow-auto">
          <Outlet />
        </div>
      </div>
    </main>
  );
};
export default AdminLayout;
