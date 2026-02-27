import React, { useEffect, useState } from "react";
import dayjs from "@/lib/dayjs";
import { cn } from "@/lib/utils";

/**
 * Props for the LiveClock component
 */
export interface LiveClockProps {
  /**
   * Display mode: 'date', 'time', or 'both'
   * @default 'both'
   */
  mode?: "date" | "time" | "both";
  /**
   * Custom dayjs format string. If provided, overrides the default formats for the selected mode.
   */
  format?: string;
  /**
   * Additional tailwind classes for styling
   */
  className?: string;
  /**
   * Inline styles
   */
  style?: React.CSSProperties;
}

export const LiveClock: React.FC<LiveClockProps> = ({
  mode = "both",
  format,
  className,
  style,
}) => {
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getFormat = () => {
    if (format) return format;
    if (mode === "date") return "dddd, D MMMM YYYY";
    if (mode === "time") return "h:mm:ss A";
    return "dddd, D MMMM YYYY | h:mm:ss A";
  };

  return (
    <div
      className={cn(
        "text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap",
        className,
      )}
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)", ...style }}
    >
      {now.format(getFormat())}
    </div>
  );
};
