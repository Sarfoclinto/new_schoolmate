import { useUIStore } from "@/store/ui.store";
import { Search, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import UserMenu from "../user-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { signalRSelectors, useSignalRStore } from "@/store/signalr.store";
import { useHotkey } from "@tanstack/react-hotkeys";

const AdminLayoutHeader = () => {
  const { collapsed, toggleCollapsed, isOpen, openSidebar } = useUIStore(
    useShallow((s) => ({
      collapsed: s.menuCollapsed,
      toggleCollapsed: s.toggleMenu,
      isOpen: s.sidebarOpen,
      openSidebar: s.openSidebar,
    })),
  );

  const isMobile = useIsMobile();
  const terms = useSignalRStore(signalRSelectors.academicTerms);
  const year = useSignalRStore(signalRSelectors.academicYear);

  useHotkey("Control+B", () => {
    if (!isOpen) {
      openSidebar();
      return;
    }
    toggleCollapsed();
  });

  const handleCollapseToggle = () => {
    if (!isOpen) {
      openSidebar();
      return;
    }
    toggleCollapsed();
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0! flex items-center justify-between px-6 bg-white border-b border-slate-200/80 z-10 shrink-0",
        isMobile ? "left-0" : collapsed ? "left-18" : "left-65 ",
      )}
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
        <div
          data-tour="custom-search-input"
          className="relative hidden sm:flex items-center cursor-pointer group"
          onClick={() => {
            const event = new KeyboardEvent("keydown", {
              key: "k",
              ctrlKey: true,
            });
            document.dispatchEvent(event);
          }}
        >
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
          <input
            type="text"
            readOnly
            placeholder="Search features... (Ctrl+K)"
            className="pl-9 pr-4 py-2 cursor-pointer text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none hover:border-[#1E3A5F] hover:bg-white focus:border-[#1E3A5F] focus:bg-white transition-all duration-200 w-56 placeholder:text-slate-400"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#1E3A5F" }}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-x-2">
        {/* Notification bell */}
        <div className="flex flex-col gap-1">
          {year && year.academicYearId ? (
            <button
              className="text-[10px] px-2.5 py-0.5 bg-[#0D1B2E] text-[#C9A84C] rounded-md font-bold tracking-wider uppercase flex items-center justify-center"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {year.startYear} — {year.endYear}
            </button>
          ) : (
            <button
              className="text-[10px] px-2.5 py-0.5 animate-pulse bg-[#000914] text-[#ff0000] rounded-md font-bold tracking-wider uppercase flex items-center justify-center"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              No Active Year
            </button>
          )}
          {terms.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-[10px] animate-pulse px-2.5 py-0.5 rounded-md font-bold tracking-wider uppercase border border-[#C9A84C]/30 hover:bg-[#C9A84C]/10 transition-colors cursor-pointer"
                  style={{
                    color: "#1E3A5F",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {terms.length} Active {terms.length === 1 ? "Term" : "Terms"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-50">
                <DropdownMenuGroup>
                  {terms.map((t, i) => (
                    <DropdownMenuItem
                      key={i}
                      className="flex flex-col. items-start. justify-between gap-3"
                    >
                      <span className="font-bold text-[10px] text-[#0D1B2E]">
                        {t.educationalLevelName
                          .split(" ")
                          .slice(0, 2)
                          .join(" ")}
                      </span>
                      <span className="font-bold text-[10px] text-yellow-500">
                        {t.academicTermName}
                      </span>
                      {/* <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                      Academic Session
                    </span> */}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              className="text-[10px] px-2.5 py-0.5 animate-pulse bg-[#000914] text-[#ff0000] rounded-md font-bold tracking-wider uppercase flex items-center justify-center"
              style={{
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              No Active Term
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* User avatar chip */}
        <UserMenu />
      </div>
    </header>
  );
};

export default AdminLayoutHeader;
