/**
 * StudentPagination.tsx
 * Themed prev / page-indicator / next bar.
 * Replaces the old gray-purple Space.Compact buttons.
 */
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export interface ListPaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems?: number;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function pageRange(page: number, pageSize: number, total?: number) {
  const from = (page - 1) * pageSize + 1;
  const to = total ? Math.min(page * pageSize, total) : page * pageSize;
  return total ? `${from}–${to} of ${total}` : `${from}–${to}`;
}

export const ListPagination = ({
  page,
  totalPages,
  pageSize,
  totalItems,
  loading = false,
  onPrev,
  onNext,
}:ListPaginationProps) => {
  const isFirst = page <= 1;
  const isLast = page >= (totalPages || 1);

  const btnBase =
    "flex items-center justify-center w-9 h-9 border text-sm font-bold transition-all duration-150 cursor-pointer select-none";
  const btnActive =
    "bg-white border-slate-200 text-[#1E3A5F] hover:bg-[#0D1B2E] hover:text-[#C9A84C] hover:border-[#0D1B2E]";
  const btnDisabled =
    "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed";

  return (
    <div
      className="flex items-center gap-x-3"
      style={{ fontFamily: "'DM Sans',sans-serif" }}
    >
      {/* Range chip */}
      <span className="hidden sm:inline-flex items-center gap-x-1 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          pageRange(page, pageSize, totalItems)
        )}
      </span>

      {/* Prev / indicator / Next */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst || loading}
          className={`${btnBase} rounded-l-xl ${isFirst || loading ? btnDisabled : btnActive}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center h-9 px-4 border-y border-slate-200 bg-white text-xs font-bold text-[#0D1B2E] min-w-20">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />
          ) : (
            <>
              <span className="text-[#C9A84C]">{page}</span>
              <span className="mx-1.5 text-slate-300">/</span>
              <span>{totalPages || 1}</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={isLast || loading}
          className={`${btnBase} rounded-r-xl ${isLast || loading ? btnDisabled : btnActive}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
