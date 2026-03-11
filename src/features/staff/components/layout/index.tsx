import { Outlet } from "react-router-dom";
import StaffLayoutHeader from "./header";
import StaffLayoutSidebar from "./sidebar";
import { SignalRProvider } from "@/providers/signalR-provider";
import { AUTO_CONNECT, ENABLE_TOAST, signalRConfig } from "@/config/signalr";

const StaffLayout = () => {
  return (
    <SignalRProvider
      config={signalRConfig}
      enableToasts={ENABLE_TOAST.staff}
      autoConnect={AUTO_CONNECT.staff}
    >
      <main className="w-full min-h-dvh flex bg-[#F4F6FA] relative">
        <StaffLayoutSidebar />
        <div className="w-full h-full flex flex-col min-h-dvh transition-all duration-300 relative pt-15">
          <StaffLayoutHeader />
          <div className="flex-1 p-2 overflow-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </SignalRProvider>
  );
};
export default StaffLayout;
