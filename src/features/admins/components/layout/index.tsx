import { Outlet } from "react-router-dom";
import AdminLayoutHeader from "./header";
import AdminLayoutSidebar from "./sidebar";
import { SignalRProvider } from "@/providers/signalR-provider";
import { AUTO_CONNECT, ENABLE_TOAST, signalRConfig } from "@/config/signalr";
import InfoModal from "@/components/common/info-modal";

const AdminLayout = () => {
  return (
    <SignalRProvider
      config={signalRConfig}
      enableToasts={ENABLE_TOAST.admin}
      autoConnect={AUTO_CONNECT.admin}
    >
      <main className="w-full min-h-dvh flex bg-[#F4F6FA] relative">
        <AdminLayoutSidebar />
        <div className="w-full h-full flex flex-col min-h-dvh transition-all duration-300 relative pt-15">
          <AdminLayoutHeader />
          <div className="flex-1 p-2 overflow-auto">
            <Outlet />
          </div>
        </div>
        <InfoModal />
      </main>
    </SignalRProvider>
  );
};
export default AdminLayout;
