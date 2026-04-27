import { MotionDiv } from "@/components/custom/motion";
import { cardVariants } from "@/data/variants";
import type { StaffStatConfig, StatConfig } from "@/types/api/setup/admin";
import { ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// ─── Single stat card ─────────────────────────────────────
// export const StatCard = ({
//   stat,
//   value,
//   loading,
//   index,
//   link,
// }: {
//   stat: StatConfig | StaffStatConfig;
//   value?: number;
//   loading: boolean;
//   index: number;
//   link: string;
// }) => (
//   <MotionDiv
//     custom={index}
//     initial="hidden"
//     animate="visible"
//     variants={cardVariants(index)}
//     whileHover="hover"
//     className="bg-white rounded-xl border border-slate-100 p-5 cursor-pointer select-none"
//     style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
//   >
//     <div className="flex items-center justify-between">
//       {/* Icon bubble */}
//       <div
//         className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.accent} ${stat.iconColor} shrink-0`}
//       >
//         {stat.icon}
//       </div>

//       {/* Value */}
//       <span
//         className="text-2xl font-bold text-slate-800"
//         style={{ fontFamily: "'DM Sans', sans-serif" }}
//       >
//         {loading ? (
//           <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
//         ) : (
//           (value ?? "—")
//         )}
//       </span>
//     </div>

//     <div className="mt-4 flex items-center justify-between">
//       <Link
//         to={link ? link : ""}
//         className="text-sm font-semibold text-slate-600 hover:text-[#1E3A5F] transition-colors duration-200 no-underline group flex items-center gap-x-1"
//         style={{ fontFamily: "'DM Sans', sans-serif" }}
//       >
//         {stat.label}
//         <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
//       </Link>
//       {/* subtle accent line at the bottom */}
//       <div
//         className={`h-1 w-8 rounded-full ${stat?.accent?.replace("bg-", "bg-")?.replace("-50", "-200")}`}
//       />
//     </div>
//   </MotionDiv>
// );

// ─── Full stat card (default, shown when finance section is hidden) ────────────
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
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.accent} ${stat.iconColor} shrink-0`}
      >
        {stat.icon}
      </div>
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
        to={link || ""}
        className="text-sm font-semibold text-slate-600 hover:text-[#1E3A5F] transition-colors duration-200 no-underline group flex items-center gap-x-1"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {stat.label}
        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
      </Link>
      <div
        className={`h-1 w-8 rounded-full ${stat?.accent?.replace("bg-", "bg-")?.replace("-50", "-200")}`}
      />
    </div>
  </MotionDiv>
);

// ─── Compact stat pill (shown inside the unified strip when finance is visible) ─
export const CompactStatPill = ({
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
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: index * 0.04 }}
    className="group shrink-0"
  >
    <Link
      to={link || ""}
      className="no-underline flex items-center gap-x-2.5 px-3.5 py-2.5 rounded-xl
        bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm
        transition-all cursor-pointer select-none"
      style={{ boxShadow: "0 1px 4px rgba(13,27,46,0.05)" }}
    >
      {/* Icon bubble — smaller */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${stat.accent} ${stat.iconColor}`}
        style={{ fontSize: "0.7rem" }}
      >
        {/* Scale down the icon via wrapper */}
        <span className="scale-75 origin-center">{stat.icon}</span>
      </div>

      <div className="min-w-0">
        <p
          className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {stat.label}
        </p>
        <p
          className="text-base font-bold text-[#0D1B2E] leading-none"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400 inline" />
          ) : (
            (value ?? "—")
          )}
        </p>
      </div>
    </Link>
  </MotionDiv>
);
