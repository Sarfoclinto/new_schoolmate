import { ExternalLink } from "lucide-react";

// ─── Preview row ──────────────────────────────────────────
export const PreviewRow = ({
  icon,
  label,
  value,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  link?: boolean;
}) => (
  <div className="flex items-start gap-x-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-7 h-7 rounded-md bg-[#F4F6FA] flex items-center justify-center text-[#1E3A5F] shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p
        className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </p>
      {link && value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[#1E3A5F] hover:text-[#C9A84C] transition-colors flex items-center gap-x-1 no-underline"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {value}
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      ) : (
        <p
          className="text-sm font-medium text-slate-700 truncate"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {value || (
            <span className="text-slate-300 italic font-normal">
              Not provided
            </span>
          )}
        </p>
      )}
    </div>
  </div>
);
