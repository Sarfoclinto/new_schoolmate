import { MotionDiv } from "./motion";

// ─── Section wrapper ──────────────────────────────────────
export const FormSection = ({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) => (
  <MotionDiv
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut", delay }}
    className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
    style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
  >
    {/* Section header */}
    <div
      className="flex items-center gap-x-3 px-6 py-4 border-b border-slate-100"
      style={{
        background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
      }}
    >
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
        {icon}
      </div>
      <span
        className="text-white font-semibold text-sm tracking-wide"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {title}
      </span>
    </div>
    <div className="p-6">{children}</div>
  </MotionDiv>
);
