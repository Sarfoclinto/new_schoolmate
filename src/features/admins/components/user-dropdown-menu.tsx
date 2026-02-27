import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { getInitials } from "@/utils/string";
import { DoorOpenIcon, SettingsIcon, User2Icon } from "lucide-react";

const UserMenu = () => {
  const user = useAuth((s) => s.user);
  const open = useUIStore((s) => s.openLogoutMenu);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center cursor-pointer gap-x-2.5 pl-1 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all duration-200 group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #1E3A5F, #2D5A8E)",
              color: "white",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {getInitials(user?.name)}
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
          <DropdownMenuItem className="flex items-center gap-x-2">
            <User2Icon />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-x-2">
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
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
