import { MotionDiv } from "@/components/custom/motion";
import { cardVariants } from "@/data/variants";
import type { StaffStatConfig, StatConfig } from "@/types/api/setup/admin";
import { ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// ─── Single stat card ─────────────────────────────────────
export const StatCard = ({
  stat,
  value,
  loading,
  index,
  link,
}: {
  stat: StatConfig | StaffStatConfig;
  value?: number;
  loading: boolean;
  index: number;
  link: string;
}) => (
  <MotionDiv
    custom={index}
    initial="hidden"
    animate="visible"
    variants={cardVariants(index)}
    whileHover="hover"
    className="bg-white rounded-xl border border-slate-100 p-5 cursor-pointer select-none"
    style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
  >
    <div className="flex items-center justify-between">
      {/* Icon bubble */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.accent} ${stat.iconColor} shrink-0`}
      >
        {stat.icon}
      </div>

      {/* Value */}
      <span
        className="text-2xl font-bold text-slate-800"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        ) : (
          (value ?? "—")
        )}
      </span>
    </div>

    <div className="mt-4 flex items-center justify-between">
      <Link
        to={link ? link : ""}
        className="text-sm font-semibold text-slate-600 hover:text-[#1E3A5F] transition-colors duration-200 no-underline group flex items-center gap-x-1"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {stat.label}
        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
      </Link>
      {/* subtle accent line at the bottom */}
      <div
        className={`h-1 w-8 rounded-full ${stat?.accent?.replace("bg-", "bg-")?.replace("-50", "-200")}`}
      />
    </div>
  </MotionDiv>
);
