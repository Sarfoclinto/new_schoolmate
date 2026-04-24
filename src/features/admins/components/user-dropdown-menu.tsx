import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignalRContext } from "@/hooks/signalR/use-signalR-context";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
// import { useTourStore } from "@/store/tour.store";
import { getInitials, getUserProfileRoute } from "@/utils/string";
import { Tooltip } from "antd";
import {
  // SettingsIcon,
  DoorOpenIcon,
  User2Icon,
  // HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const UserMenu = () => {
  const user = useAuth((s) => s.user);
  const open = useUIStore((s) => s.openLogoutMenu);
  const { isConnected } = useSignalRContext();
  // const { startManualTour } = useTourStore();

  return (
    <DropdownMenu data-tour="user-menu">
      <DropdownMenuTrigger asChild>
        <button className="flex items-center cursor-pointer gap-x-2.5 pl-1 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all duration-200 group">
          <div
            className="w-8 h-8 relative rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #1E3A5F, #2D5A8E)",
              color: "white",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {user?.imageUrl ? (
              <img
                src={user?.imageUrl}
                className="size-full rounded-full"
                alt="avatar"
              />
            ) : (
              getInitials(user?.name)
            )}
            <Tooltip title={isConnected ? "Online" : "Offline"}>
              <span
                className={cn(
                  "absolute cursor-pointer size-2.5 rounded-full bottom-0 -right-0.5",
                  isConnected ? "bg-green-500" : "bg-red-500",
                )}
              />
            </Tooltip>
          </div>
          <div className="hidden md:block text-left leading-none">
            <p
              className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 leading-none mb-0.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {user?.name ?? "Name"}
            </p>
            <p
              className="text-xs text-slate-400 leading-none"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {user?.role ?? "Role"}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-42">
        <DropdownMenuGroup>
          <Link to={getUserProfileRoute()}>
            <DropdownMenuItem className="flex items-center gap-x-2">
              <User2Icon />
              Profile
            </DropdownMenuItem>
          </Link>
          {/* <DropdownMenuItem
            onClick={startManualTour}
            className="flex items-center gap-x-2"
          >
            <HelpCircle />
            Take Tour
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex items-center gap-x-1"
            variant="destructive"
            onClick={open}
          >
            <DoorOpenIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default UserMenu;
