import { DEFAULT_ROLES } from "@/config/constants";
import paths from "@/config/routes";
import { useAuth } from "@/store/auth.store";
import { toast } from "sonner";

export const sanitizeInput = (input: string) => {
  const sanitized = input.replace(/<[^>]*>/g, ""); // Remove HTML tags
  return sanitized;
};

export const capitalizeWords = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const sanitizePhoneNumber = (str: string) => {
  return str.replace(/[^0-9]/g, ""); // Remove non-numeric characters
};

export const truncateString = (str: string, value: number) => {
  return str.slice(0, value);
};

export const getPageRange = (pageNumber: number, pageSize: number): string => {
  if (pageNumber < 1 || pageSize < 1) {
    throw new Error("Page number and page size must be greater than zero.");
  }
  const startItem = (pageNumber - 1) * pageSize + 1;
  const endItem = pageNumber * pageSize;
  return `${startItem} - ${endItem}`;
};

export const generateRandomString = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,/|{}';:!@#$%^&*()_+=-][";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function getOrdinal(position: number): string {
  const suffixes: { [key: number]: string } = {
    1: "st",
    2: "nd",
    3: "rd",
  };

  const remainder = position % 100;
  const suffix =
    remainder >= 11 && remainder <= 13 ? "th" : suffixes[position % 10] || "th";

  return `${position}${suffix}`;
}

export const getUserProfileRoute = () => {
  const user = useAuth.getState().user;

  if (!user || !user.role) {
    return paths.auth.login.href;
  }

  const normalizedRole = user.role.toLowerCase();
  if (DEFAULT_ROLES.ADMIN.includes(normalizedRole))
    return paths.admin.adminProfile.href;
  if (DEFAULT_ROLES.STAFF.includes(normalizedRole))
    return paths.staff.profile.href;

  return paths.public.unknown.redirect(
    `Invalid role for profile: ${user.role}`,
  );
};

export const getInitials = (text = "Fist Last") =>
  text
    ? text
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
    : "N/A";

export const copyToClipboard = async (text?: string) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Failed to copy to clipboard");
  }
};
