import { BadgeCheck, ChevronRight, Mars, Venus } from "lucide-react";

// ─────────────────────────────────────────────────────────
// Skeleton shimmer — used while data is loading
// ─────────────────────────────────────────────────────────
export const Shimmer = ({ className }: { className?: string }) => (
  <div
    className={`bg-slate-200 rounded-lg animate-pulse ${className ?? "h-4 w-full"}`}
  />
);

/** One detail field — label + value */
export const DetailField = ({
  icon,
  label,
  value,
  highlight,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  highlight?: boolean;
}) => (
  <div className="flex flex-col gap-y-0.5 min-w-0">
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-x-1">
      {icon && <span className="text-slate-300">{icon}</span>}
      {label}
    </span>
    <span
      className={`text-sm font-semibold truncate ${
        highlight ? "text-[#C9A84C]" : "text-[#0D1B2E]"
      }`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {value || <span className="text-slate-300 font-normal italic">N/A</span>}
    </span>
  </div>
);

/** Gender badge */
export const GenderBadge = ({ value }: { value?: string }) => {
  if (!value) return <span className="text-slate-300 italic text-sm">N/A</span>;
  const isMale = value.toLowerCase() === "male";
  return (
    <span
      className={`inline-flex items-center gap-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
        isMale
          ? "bg-sky-50 border-sky-200 text-sky-700"
          : "bg-amber-50 border-amber-200 text-amber-700"
      }`}
    >
      {isMale ? <Mars className="w-3 h-3" /> : <Venus className="w-3 h-3" />}
      {value}
    </span>
  );
};

/** Status badge */
export const StatusBadge = ({ value }: { value?: string }) => (
  <span className="inline-flex items-center gap-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
    <BadgeCheck className="w-3 h-3" />
    {value || "Active"}
  </span>
);

/** Tab button — gold underline style */
export const TabBtn = ({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex items-center justify-center gap-x-2 px-5 py-3.5 text-xs font-bold border-b-2 transition-all
      cursor-pointer whitespace-nowrap
      ${
        active
          ? "border-[#C9A84C] text-[#0D1B2E]"
          : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
      }
    `}
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    <span className={active ? "text-[#C9A84C]" : ""}>{icon}</span>
    {label}
  </button>
);

/** Update option button — shown inside the "choose what to update" modal */
export const UpdateOptionBtn = ({
  icon,
  label,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-x-4 px-4 py-3.5 rounded-xl border-2 border-slate-100 bg-white hover:border-[#1E3A5F] hover:bg-[#EEF2F8] transition-all duration-200 cursor-pointer text-left group"
  >
    <div className="w-9 h-9 rounded-xl bg-[#EEF2F8] group-hover:bg-[#1E3A5F] flex items-center justify-center text-[#1E3A5F] group-hover:text-[#C9A84C] transition-all shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p
        className="font-bold text-sm text-[#0D1B2E] group-hover:text-[#1E3A5F] leading-tight"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1E3A5F] ml-auto shrink-0 transition-all group-hover:translate-x-0.5" />
  </button>
);
