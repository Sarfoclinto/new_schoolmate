import { BookOpen, CheckCircle2, LayoutGrid, X } from "lucide-react";

export const SectionDivider = ({ label }: { label: string }) => (
  <div className="my-5 flex items-center gap-x-3">
    <span className="flex-1 h-px bg-slate-100" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 select-none">
      {label}
    </span>
    <span className="flex-1 h-px bg-slate-100" />
  </div>
);

// ─────────────────────────────────────────────────────────
// CardHeader — gradient strip reused in every panel
// ─────────────────────────────────────────────────────────
export const CardHeader = ({
  icon,
  title,
  badge,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string | number;
  meta?: React.ReactNode;
}) => (
  <div
    className="flex items-center gap-x-3 px-5 py-3.5"
    style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)" }}
  >
    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
      {icon}
    </div>
    <span
      className="text-white font-semibold text-sm flex-1 leading-tight"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {title}
    </span>
    {badge !== undefined && (
      <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
    {meta}
  </div>
);

// ─────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────
export const EmptyState = ({
  icon,
  message,
  sub,
}: {
  icon: React.ReactNode;
  message: string;
  sub?: string;
}) => (
  <div className="flex flex-col items-center py-12 gap-2.5 text-slate-300 px-6">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
      {icon}
    </div>
    <p className="text-sm font-semibold text-slate-400 text-center">
      {message}
    </p>
    {sub && <p className="text-xs text-slate-300 text-center">{sub}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────
// Preference card — replaces the AntD Radio.Group
// ─────────────────────────────────────────────────────────
export const PreferenceCard = ({
  active,
  icon,
  label,
  desc,
  onClick,
}: {
  // value: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer
      ${
        active
          ? "border-[#1E3A5F] bg-[#EEF2F8]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
      }
    `}
  >
    <div
      className={`flex items-center gap-x-2 mb-1 text-sm font-bold
      ${active ? "text-[#1E3A5F]" : "text-slate-600"}`}
    >
      <span className={active ? "text-[#C9A84C]" : "text-slate-400"}>
        {icon}
      </span>
      {label}
      {active && (
        <CheckCircle2 className="w-3.5 h-3.5 text-[#1E3A5F] ml-auto" />
      )}
    </div>
    <p
      className={`text-[11px] leading-tight ${active ? "text-[#1E3A5F]/60" : "text-slate-400"}`}
    >
      {desc}
    </p>
  </button>
);

// ─────────────────────────────────────────────────────────
// Teacher avatar / info chip
// ─────────────────────────────────────────────────────────
export const TeacherChip = ({
  name,
  subjectCount,
  subLevelCount,
  onClear,
}: {
  name: string;
  subjectCount: number;
  subLevelCount: number;
  onClear: () => void;
}) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="flex items-center gap-x-3 bg-white border border-slate-200 rounded-2xl px-4 py-3"
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.07)" }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 select-none"
        style={{ background: "linear-gradient(135deg, #0D1B2E, #2D5A8E)" }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-bold text-[#0D1B2E] text-sm truncate leading-tight"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {name}
        </p>
        <div className="flex items-center gap-x-3 mt-0.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-x-1">
            <BookOpen className="w-3 h-3 text-[#C9A84C]" />
            {subjectCount} subject{subjectCount !== 1 ? "s" : ""}
          </span>
          <span className="w-px h-3 bg-slate-200" />
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-x-1">
            <LayoutGrid className="w-3 h-3 text-[#1E3A5F]" />
            {subLevelCount} sub-level{subLevelCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Clear */}
      <button
        type="button"
        onClick={onClear}
        className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all cursor-pointer shrink-0"
        title="Clear selection"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Preview tab button
// ─────────────────────────────────────────────────────────
export type PreviewTab = "subjects" | "sublevels";

export const PreviewTabBtn = ({
  // tabKey,
  active,
  icon,
  label,
  count,
  onClick,
}: {
  // tabKey: PreviewTab;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex items-center gap-x-2 px-5 py-3 text-xs font-bold border-b-2 transition-all
      cursor-pointer flex-1 justify-center
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
    <span
      className={`
        text-[10px] font-bold px-1.5 py-0.5 rounded-full
        ${active ? "bg-[#0D1B2E] text-[#C9A84C]" : "bg-slate-200 text-slate-500"}
      `}
    >
      {count}
    </span>
  </button>
);
