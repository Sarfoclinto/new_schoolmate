/**
 * StudentListPage.tsx
 * ─────────────────────────────────────────────────────────────
 * Reusable shell for every "view students" page variant.
 * Each variant supplies its own filters, columns, data, and pagination.
 *
 * Props:
 *   title          – Page and card heading
 *   breadcrumb     – [parent, current]
 *   icon           – Lucide icon element shown in the card header
 *   stats          – Optional stat chips in the page header
 *   filters        – Any filter controls (Select, Input…) for the toolbar
 *   columns        – AntD TableProps columns
 *   dataSource     – Typed record array
 *   loading        – Loading state
 *   pagination     – { page, totalPages, pageSize, totalItems? }
 *   onPrev/onNext  – Page handlers
 *   rowKey         – Table rowKey (default "studentId")
 *   emptyText      – Custom empty state text
 */

import { MotionDiv } from "@/components/custom/motion";
import { Table, type TableProps } from "antd";
import { ChevronRight } from "lucide-react";
import { ListPagination } from "./pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
export interface StatBadge {
  label: string;
  value: number | string;
  color?: "navy" | "gold" | "green" | "rose" | "slate";
}

export interface PaginationMeta {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems?: number;
}

export interface ListPageProps<T extends object> {
  title: string;
  breadcrumb: [string, string];
  icon: React.ReactNode;
  stats?: StatBadge[];
  filters?: React.ReactNode;
  columns: TableProps<T>["columns"];
  dataSource: T[];
  loading?: boolean;
  pagination?: PaginationMeta;
  onPrev?: () => void;
  onNext?: () => void;
  rowKey?: string;
  emptyText?: string;
  showCardHeader?: boolean;
  className?: string;
}

// ── Stat chip colour map ──────────────────────────────────────
const statStyle: Record<NonNullable<StatBadge["color"]>, string> = {
  navy: "bg-[#0D1B2E] text-white",
  gold: "bg-[#C9A84C]/15 text-[#8B6914] border border-[#C9A84C]/30",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border border-rose-200",
  slate: "bg-slate-100 text-slate-600",
};

// ── Component ─────────────────────────────────────────────────
export function ListPage<T extends object>({
  title,
  breadcrumb,
  icon,
  stats,
  filters,
  columns,
  dataSource,
  loading = false,
  pagination,
  onPrev,
  onNext,
  rowKey = "studentId",
  emptyText = "No students found",
  showCardHeader = true,
  className,
}: ListPageProps<T>) {
  const isMobile = useIsMobile();
  const collapsed = useUIStore((s) => s.menuCollapsed);
  // const opened = useUIStore((s) => s.sidebarOpen);
  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className={cn(
        "p-2",
        collapsed ? "max-w-[94.1dvw]" : "max-w-[81dvw]",
        isMobile && "max-w-[94.1dvw]",
        className,
      )}
    >
      {/* ── Page header ── */}
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1
            className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">
              {breadcrumb[0]}
            </span>
            <ChevronRight className="w-3 h-3" />
            <span>{breadcrumb[1]}</span>
          </nav>
        </div>

        {/* Stat chips */}
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-x-2 flex-wrap gap-y-1.5">
            {stats.map((s) => (
              <span
                key={s.label}
                className={`inline-flex items-center gap-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${statStyle[s.color ?? "slate"]}`}
              >
                <span className="opacity-60 font-semibold">{s.label}</span>
                {s.value}
              </span>
            ))}
          </div>
        )}
      </MotionDiv>

      {/* ── Main card ── */}
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 16px rgba(13,27,46,0.07)" }}
      >
        {/* ── Card header ── */}
        {showCardHeader && (
          <div
            className="flex items-center gap-x-3 px-5 py-4"
            style={{
              background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
              {icon}
            </div>
            <span className="text-white font-semibold text-sm flex-1">
              {title}
            </span>
            {pagination?.totalItems !== undefined && (
              <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2.5 py-0.5 rounded-full">
                {pagination.totalItems} students
              </span>
            )}
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="px-5 py-3 border-b border-slate-100 bg-[#F8FAFD] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Filters */}
          <div className="flex items-center gap-x-2 flex-wrap gap-y-2 min-w-0 flex-1">
            {filters ?? (
              <span className="text-xs text-slate-300 italic">No filters</span>
            )}
          </div>
          {/* Top pagination */}
          {pagination && onPrev && onNext && (
            <ListPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              loading={loading}
              onPrev={onPrev}
              onNext={onNext}
            />
          )}
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <Table<T>
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            rowKey={rowKey}
            pagination={false}
            size="middle"
            scroll={{ x: isMobile ? "max-content" : "" }}
            styles={{ header: { cell: { color: "white" } } }}
            locale={{
              emptyText: (
                <div className="flex flex-col items-center py-14 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <svg
                      className="text-slate-300 w-7 h-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-400">
                    {emptyText}
                  </p>
                  <p className="text-xs text-slate-300">
                    Try adjusting your filters
                  </p>
                </div>
              ),
            }}
          />
        </div>

        {/* ── Bottom pagination ── */}
        {pagination && (
          <div className="px-5 py-3 border-t border-slate-100 bg-[#F8FAFD] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium hidden sm:block">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            {onPrev && onNext && (
              <ListPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                loading={loading}
                onPrev={onPrev}
                onNext={onNext}
              />
            )}
          </div>
        )}
      </MotionDiv>
    </div>
  );
}
