import { DEFAULT_ROLES } from "@/config/constants";
import paths from "@/config/routes";
import { useAuth } from "@/store/auth.store";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";

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
export const sanitizePhone = (raw: string): string => {
  // 1. Remove all non-digit characters
  const digitsOnly = raw.replace(/\D/g, "");

  // 2. Remove a single leading "0", if present
  const withoutLeadingZero = digitsOnly.startsWith("0")
    ? digitsOnly.slice(1)
    : digitsOnly;

  // 3. Prefix with "233"
  return `233${withoutLeadingZero}`;
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

/**
 * Generates a unique reference string.
 * Default pattern: DDMMYYYY_HHMMSS_RANDOM
 * @param length Length of the random suffix
 * @param prefix Optional custom prefix
 */
export const generateReference = (
  length = 5,
  prefix?: string,
  includeTimestamp = true,
): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const timestamp = includeTimestamp
    ? dayjs().format("DDMMYYYY_HHmmss")
    : "";

  return [prefix, timestamp, result].filter(Boolean).join("_");
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

/**
 * Redacts a string by keeping a specified number of characters at the start and end.
 */
export interface RedactOptions {
  visibleStart?: number;
  visibleEnd?: number;
  maskChar?: string;
}

export const redactString = (
  str: string | null | undefined,
  options: RedactOptions = {},
): string => {
  if (!str) return "";
  const { visibleStart = 2, visibleEnd = 1, maskChar = "*" } = options;

  if (str.length <= visibleStart + visibleEnd) {
    return str;
  }

  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const mask = maskChar.repeat(str.length - (visibleStart + visibleEnd));

  return `${start}${mask}${end}`;
};
