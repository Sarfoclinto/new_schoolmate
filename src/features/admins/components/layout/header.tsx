import { useUIStore } from "@/store/ui.store";
import { Bell, Search, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import UserMenu from "../user-dropdown-menu";

const AdminLayoutHeader = () => {
  const { collapsed, toggleCollapsed, isOpen, openSidebar } = useUIStore(
    useShallow((s) => ({
      collapsed: s.menuCollapsed,
      toggleCollapsed: s.toggleMenu,
      isOpen: s.sidebarOpen,
      openSidebar: s.openSidebar,
    })),
  );

  const handleCollapseToggle = () => {
    if (!isOpen) {
      openSidebar();
      return;
    }
    toggleCollapsed();
  };

  return (
    <header
      className="w-full flex items-center justify-between px-6 bg-white border-b border-slate-200/80 z-10 shrink-0"
      style={{
        height: 64,
        boxShadow: "0 1px 0 rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03)",
      }}
    >
      {/* Left section */}
      <div className="flex items-center gap-x-4">
        <button
          onClick={handleCollapseToggle}
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200" />

        {/* Search bar */}
        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#1E3A5F] focus:bg-white transition-all duration-200 w-56 placeholder:text-slate-400"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#1E3A5F" }}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-x-2">
        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800">
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: "#C9A84C" }}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* User avatar chip */}
        <UserMenu />
      </div>
    </header>
  );
};

export default AdminLayoutHeader;
