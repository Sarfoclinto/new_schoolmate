// ─── Field label ──────────────────────────────────────────
export const FieldLabel = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <span
    className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-x-1"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    {children}
    {required && <span className="text-rose-500">*</span>}
  </span>
);
