import { Outlet } from "react-router-dom";
import StaffLayoutHeader from "./header";
import StaffLayoutSidebar from "./sidebar";
import { SignalRProvider } from "@/providers/signalR-provider";
import { AUTO_CONNECT, ENABLE_TOAST, signalRConfig } from "@/config/signalr";
import SearchCommand from "@/components/common/search-command-1";
// import AutomaticTourManager from "@/components/feature-tour/automatic-tour-manager";
import ManualTourManager from "@/components/feature-tour/manual-tour-manager";

const StaffLayout = () => {
  return (
    <SignalRProvider
      config={signalRConfig}
      enableToasts={ENABLE_TOAST.staff}
      autoConnect={AUTO_CONNECT.staff}
    >
      <main className="w-full min-h-dvh flex bg-[#F4F6FA] relative">
        <StaffLayoutSidebar data-tour="sidebar" />
        <div className="w-full h-full flex flex-col min-h-dvh transition-all duration-300 relative pt-15">
          <StaffLayoutHeader />
          <div className="flex-1 p-2 overflow-auto">
            <Outlet />
          </div>
        </div>
        <SearchCommand />
        {/* <AutomaticTourManager /> */}
        <ManualTourManager />
      </main>
    </SignalRProvider>
  );
};
export default StaffLayout;
