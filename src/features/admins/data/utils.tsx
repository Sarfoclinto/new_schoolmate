// ─────────────────────────────────────────────────────────
// Drawer titles (maps component key → friendly label + icon)

import { GraduationCap, Heart, ImageIcon, User, Users } from "lucide-react";

// ─────────────────────────────────────────────────────────
export type UpdateKey =
  | "personal"
  | "parent"
  | "guardian"
  | "imgs"
  | "enrollment";

export const drawerMeta: Record<
  UpdateKey,
  { label: string; icon: React.ReactNode }
> = {
  personal: {
    label: "Update Personal Info",
    icon: <User className="w-4 h-4" />,
  },
  parent: {
    label: "Update Parents Info",
    icon: <Users className="w-4 h-4" />,
  },
  guardian: {
    label: "Update Guardian Info",
    icon: <Heart className="w-4 h-4" />,
  },
  imgs: { label: "Update Photos", icon: <ImageIcon className="w-4 h-4" /> },
  enrollment: {
    label: "Update Enrollment Info",
    icon: <GraduationCap className="w-4 h-4" />,
  },
};
