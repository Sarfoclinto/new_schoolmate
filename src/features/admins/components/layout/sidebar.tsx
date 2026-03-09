import { useUIStore } from "@/store/ui.store";
import { Drawer, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link, useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useIsMobile } from "@/hooks/use-mobile";
import { getInitials, getUserDashboardRoute } from "@/utils/string";
import { useAuth } from "@/store/auth.store";
import { useFilteredMenu } from "@/hooks/use-filtered-menu";
import adminMenu from "../../data/admin-menu-items";
import type { ItemType } from "antd/es/menu/interface";
import { menuStyle } from "@/config/constants";

const SIDEBAR_BG = "#0D1B2E";
const SIDEBAR_WIDTH = 260;

const LogoSection = ({ collapsed }: { collapsed: boolean }) => (
  <div
    className="flex items-center justify-center px-5 border-b border-white/10"
    style={{ height: 64, background: "#0A1628" }}
  >
    <Link
      to={getUserDashboardRoute()}
      className="flex items-center gap-x-3 no-underline group"
    >
      <div className="relative shrink-0">
        <div
          className="absolute inset-0 rounded-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"
          style={{
            background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)",
          }}
        />
        <img
          src="/logo.png"
          width={collapsed ? 32 : 36}
          className="relative z-10 transition-all duration-300"
        />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span
            className="text-white font-bold tracking-widest text-sm uppercase"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "0.15em",
            }}
          >
            SchoolMate
          </span>
          <span
            className="text-[8px] tracking-[0.2em] uppercase mt-0.5"
            style={{
              color: "#C9A84C",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            Admin Console
          </span>
        </div>
      )}
    </Link>
  </div>
);

const SidebarContent = ({ collapsed }: { collapsed: boolean }) => {
  const { pathname } = useLocation();
  const user = useAuth((s) => s.user);
  const filteredMenu = useFilteredMenu(adminMenu) as ItemType[];
  return (
    <div className="flex flex-col h-full" style={{ background: SIDEBAR_BG }}>
      <LogoSection collapsed={collapsed} />
      {!collapsed && (
        <div className="px-5 pt-5 pb-2">
          <span
            className="text-[10px] font-semibold tracking-[0.18em] uppercase"
            style={{ color: "#4A6080", fontFamily: "'DM Sans', sans-serif" }}
          >
            Navigation
          </span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-thumb-white/10">
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          defaultSelectedKeys={[pathname]}
          className="cms-sider"
          // items={menu}
          items={filteredMenu}
          style={{ background: "transparent", border: "none" }}
          styles={menuStyle}
        />
      </div>
      {!collapsed && (
        <div
          className="px-5 py-4 border-t border-white/10 flex items-center gap-x-3"
          style={{ background: "#0A1628" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
              color: "#0D1B2E",
            }}
          >
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p
              className="text-white text-sm font-semibold truncate uppercase leading-none mb-0.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {user?.role ?? "role"}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "#4A6080", fontFamily: "'DM Sans', sans-serif" }}
            >
              {user?.email ?? "email"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminLayoutSidebar = () => {
  const isMobile = useIsMobile();
  const { isOpen, collapsed, setCollapsed, closeSidebar } = useUIStore(
    useShallow((s) => ({
      isOpen: s.sidebarOpen,
      closeSidebar: s.closeSidebar,
      collapsed: s.menuCollapsed,
      setCollapsed: s.setCollapsed,
    })),
  );

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onClose={closeSidebar}
        placement="left"
        styles={{ body: { padding: 0, background: SIDEBAR_BG } }}
        size={SIDEBAR_WIDTH}
        closable={false}
        mask={{ closable: true, enabled: true, blur: true }}
      >
        <SidebarContent collapsed={false} />
      </Drawer>
    );
  }

  return (
    <Sider
      collapsed={collapsed}
      onCollapse={(c) => setCollapsed(c)}
      theme="dark"
      width={SIDEBAR_WIDTH}
      collapsedWidth={72}
      style={{
        background: SIDEBAR_BG,
        boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
        position: "sticky",
        top: 0,
        height: "100dvh",
        overflow: "hidden",
        flexShrink: 0,
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <SidebarContent collapsed={collapsed} />
    </Sider>
  );
};

export default AdminLayoutSidebar;
