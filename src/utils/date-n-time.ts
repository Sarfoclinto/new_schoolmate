/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "@/lib/dayjs";

export function timeAgo(dateString: string): string {
  const past = new Date(dateString).getTime();
  const now = Date.now();
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hr`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""}`;
}

export const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

export function getDayOfWeek(dateString: string): string {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format. Expected format: YYYY-MM-DD");
  }

  const dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}

export function formatDate(dateString: string): string {
  return dayjs(dateString).format("MMM Do, YYYY");
}

export const getAgeOutOfDate = (date: string) => {
  return dayjs().diff(date, "year");
};

export const convertTo12HourFormat = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const formatAntdDate = (date: any): string => {
  if (!date || !date.$d) return ""; // Handle invalid input gracefully
  return dayjs(date.$d).format("YYYY-MM-DD");
};

export const formatAntdTime = (time: any): string => {
  if (!time || !time.$d) return ""; // Handle invalid input gracefully
  return dayjs(time.$d).format("HH:mm:ss");
};

export const formatDateOutDatetime = (dateTimeStr: string): string => {
  const date = new Date(dateTimeStr);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  const getDaySuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getDaySuffix(day)} ${month} ${year}`;
};

export const formatTimeOutDateTime = (dateTimeStr: string): string => {
  const date = new Date(dateTimeStr);

  const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";

  return `${hours}:${minutes} ${ampm}`;
};

export const getDayjsForDatePicker = (
  dateStr: string,
  format?: string,
): dayjs.Dayjs | null => {
  if (!dateStr) return null;

  const parsedDate = format ? dayjs(dateStr, format) : dayjs(dateStr);

  return parsedDate.isValid() ? parsedDate : null;
};

export const getDayjsForTimePicker = (
  timeStr: string,
  format: string = "HH:mm:ss",
): dayjs.Dayjs | null => {
  if (!timeStr) return null;

  const parsedTime = dayjs(timeStr, format);
  return parsedTime.isValid() ? parsedTime : null;
};

export const disableFutureYears = (current: dayjs.Dayjs) =>
  current.year() > dayjs().year();

export const disablePastYears = (current: dayjs.Dayjs) =>
  current.year() < dayjs().year();

export const disableFutureDate = (current: dayjs.Dayjs) =>
  current && current >= dayjs().endOf("day");
