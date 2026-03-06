/**
 * AdminMonthlyAttendance.tsx
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────┐
 * │  PAGE HEADER  breadcrumb                                     │
 * ├──────────────────────────────────────────────────────────────┤
 * │  FILTER BAR   sub-level select  +  month picker             │
 * ├──────────────────────────────────────────────────────────────┤
 * │  STAT CHIPS   Students | Present | Absent | Attendance Rate  │
 * ├──────────────────────────────────────────────────────────────┤
 * │  ATTENDANCE GRID                                             │
 * │  Sticky "Student" column · day columns with heatmap cells    │
 * │  Footer row: per-day totals                                  │
 * └──────────────────────────────────────────────────────────────┘
 *
 * Changes vs original:
 *  - AntD icons / breadcrumb     →  lucide-react + custom nav
 *  - AntD Table                  →  custom sticky-column grid table
 *    (AntD Table can't do the mixed sticky + horizontal scroll well at
 *     fine-grained per-cell coloring without fighting the component)
 *  - ✔ / x strings              →  colour-coded pill cells
 *  - Added per-student summary   →  Present / Absent / Rate columns pinned right
 *  - Added per-day totals footer →  shows how many present each day
 *  - Added stat chips            →  class-level summary at a glance
 *  - Print / export button       →  opens print-optimised window
 */

import { attendanceKeys, educationKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import type { SelectTypes } from "@/types/ui";
import { useMemo, useState } from "react";
import dayjs from "@/lib/dayjs";
import type { Dayjs } from "dayjs";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Filter,
  LayoutGrid,
  Percent,
  Printer,
  Users,
  XCircle,
} from "lucide-react";
import { DatePicker, Select, Skeleton } from "antd";
import { MotionButton, MotionDiv } from "@/components/custom/motion";
import { AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { getMonthlyAttendanceFn } from "@/services/attendance";
import { getTeachersSublevelsFn } from "@/services/staff";
import { useAuth } from "@/store/auth.store";

// ─────────────────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────────────────

/** Returns every Date in the given month */
function getMonthDays(year: number, month: number): Date[] {
  const d = new Date(year, month - 1, 1);
  const days: Date[] = [];
  while (d.getMonth() === month - 1) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const SHORT_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Returns the 3-letter abbreviated month name */
const monthName = (m: Dayjs) => m.format("MMMM YYYY");

// ─────────────────────────────────────────────────────────
// Stat chip
// ─────────────────────────────────────────────────────────
const StatChip = ({
  icon,
  label,
  value,
  sub,
  color = "navy",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "navy" | "green" | "rose" | "amber";
}) => {
  const colors = {
    navy: {
      bg: "bg-[#EEF2F8]",
      icon: "bg-[#1E3A5F] text-[#C9A84C]",
      text: "text-[#0D1B2E]",
      sub: "text-[#1E3A5F]/60",
    },
    green: {
      bg: "bg-emerald-50",
      icon: "bg-emerald-500 text-white",
      text: "text-emerald-800",
      sub: "text-emerald-500",
    },
    rose: {
      bg: "bg-rose-50",
      icon: "bg-rose-500 text-white",
      text: "text-rose-800",
      sub: "text-rose-400",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "bg-amber-500 text-white",
      text: "text-amber-800",
      sub: "text-amber-500",
    },
  };
  const c = colors[color];

  return (
    <div
      className={`flex items-center gap-x-3 ${c.bg} rounded-2xl px-4 py-3 border border-white flex-1 min-w-32.5`}
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.04)" }}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5 ${c.text} opacity-60`}
        >
          {label}
        </p>
        <p
          className={`text-xl font-bold leading-tight ${c.text}`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {value}
        </p>
        {sub && (
          <p className={`text-[10px] font-medium mt-0.5 ${c.sub}`}>{sub}</p>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Attendance cell
// ─────────────────────────────────────────────────────────
type AttStatus = "Present" | "Absent" | null;

const AttCell = ({ status }: { status: AttStatus }) => {
  if (status === "Present")
    return (
      <div className="flex items-center justify-center">
        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
        </span>
      </div>
    );
  if (status === "Absent")
    return (
      <div className="flex items-center justify-center">
        <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-rose-500 block" />
        </span>
      </div>
    );
  return <span className="text-slate-200 text-xs select-none">—</span>;
};

// ─────────────────────────────────────────────────────────
// Rate badge — coloured by rate
// ─────────────────────────────────────────────────────────
const RateBadge = ({ rate }: { rate: number }) => {
  const colour =
    rate >= 90
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : rate >= 70
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-rose-100 text-rose-700 border-rose-200";

  return (
    <span
      className={`inline-flex items-center justify-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${colour}`}
    >
      {rate.toFixed(0)}%
    </span>
  );
};

// ─────────────────────────────────────────────────────────
// Empty / prompt state
// ─────────────────────────────────────────────────────────
const EmptyState = ({
  icon,
  message,
  sub,
}: {
  icon: React.ReactNode;
  message: string;
  sub?: string;
}) => (
  <div className="flex flex-col items-center py-16 gap-3 text-slate-300">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
      {icon}
    </div>
    <p className="text-sm font-semibold text-slate-400">{message}</p>
    {sub && (
      <p className="text-xs text-slate-300 text-center max-w-65">{sub}</p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────
// PRINT STYLES — injected once
// ─────────────────────────────────────────────────────────
const ATT_PRINT_STYLES = `
@media print {
  body > * { display: none !important; }
  #att-print-host { display: block !important; position: fixed; top:0; left:0; width:100%; background:#fff; z-index:99999; }
  @page { size: A4 landscape; margin: 8mm 10mm; }
}
#att-print-host { display: none; }
.att-print-table { width: 100%; border-collapse: collapse; font-size: 9px; font-family: sans-serif; }
.att-print-table th, .att-print-table td { border: 1px solid #ccc; padding: 2px 4px; text-align: center; }
.att-print-table th { background: #f0f0f0; font-weight: 700; }
.att-print-table .col-name { text-align: left; min-width: 120px; }
.att-print-p  { color: #16a34a; font-weight: 700; }
.att-print-a  { color: #dc2626; font-weight: 700; }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("att-print-styles")
) {
  const el = document.createElement("style");
  el.id = "att-print-styles";
  el.textContent = ATT_PRINT_STYLES;
  document.head.appendChild(el);
}

const ViewMonthlyAttendance = () => {
  const [selectedSubLevel, setSublevel] = useState<SelectTypes | null>(null);
  const [selectedMonth, setMonth] = useState(dayjs());
  const user = useAuth((s) => s.user);
  const teacherId = user?.userId;

  // const printRef = useRef<HTMLDivElement>(null);

  // ── Derived date values ──────────────────────────────
  const { month, year } = useMemo(
    () => ({
      month: Number(selectedMonth.format("MM")),
      year: Number(selectedMonth.format("YYYY")),
    }),
    [selectedMonth],
  );

  const monthYearString = useMemo(
    () => selectedMonth.format("YYYY-MM"),
    [selectedMonth],
  );

  const monthDays = useMemo(() => {
    return getMonthDays(year, month).map((date) => ({
      day: date.getDate(),
      dayName: SHORT_DAYS[date.getDay()],
      dateStr: format(date, "yyyy-MM-dd"),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    }));
  }, [year, month]);

  // queries
  const { data: sublevelData, isLoading: loadingSublevels } = useFetch({
    queryFn: () => getTeachersSublevelsFn(teacherId!),
    queryKeys: educationKeys.custom("teacher-sublevels", { teacherId }),
    enabled: !!teacherId,
  });

  const subLevelOptions = useMemo(
    () =>
      sublevelData?.subLevels?.map((s) => ({
        label: s.subLevelName,
        value: s.subLevelId,
      })) ?? [],
    [sublevelData],
  );

  const { data, isLoading } = useFetch({
    queryFn: () =>
      getMonthlyAttendanceFn(selectedSubLevel?.value ?? "", monthYearString!),
    queryKeys: attendanceKeys.custom("monthly", {
      monthYearString,
      sublevel: selectedSubLevel?.value,
    }),
    enabled: !!selectedSubLevel?.value && !!monthYearString,
  });

  // ── Processed data ───────────────────────────────────
  /**
   * attendanceGrid[studentIdx][dateStr] = "Present" | "Absent"
   * Also precompute per-student summary and per-day totals.
   */

  const { rows, perDayPresent, stats } = useMemo(() => {
    if (!data?.length) return { rows: [], perDayPresent: {}, stats: null };

    const perDayPresent: Record<string, number> = {};
    monthDays.forEach(({ dateStr }) => {
      perDayPresent[dateStr] = 0;
    });

    let totalPresent = 0;
    let totalRecords = 0;

    const rows = data.map((student) => {
      const map: Record<string, AttStatus> = {};
      student.attendance.forEach((r) => {
        map[r.attendanceDate] = r.status as AttStatus;
      });

      let studentPresent = 0;
      let studentAbsent = 0;

      monthDays.forEach(({ dateStr }) => {
        const s = map[dateStr] ?? null;
        if (s === "Present") {
          studentPresent++;
          perDayPresent[dateStr]++;
          totalPresent++;
        } else if (s === "Absent") {
          studentAbsent++;
        }
        if (s !== null) totalRecords++;
      });

      const schoolDays = studentPresent + studentAbsent;
      const rate = schoolDays > 0 ? (studentPresent / schoolDays) * 100 : 0;

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        map,
        present: studentPresent,
        absent: studentAbsent,
        rate,
      };
    });

    const overallRate =
      totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

    return {
      rows,
      perDayPresent,
      stats: {
        students: data.length,
        totalPresent,
        totalAbsent: totalRecords - totalPresent,
        overallRate,
      },
    };
  }, [data, monthDays]);

  // ── Print handler ────────────────────────────────────
  const handlePrint = () => {
    if (!data?.length) return;

    const rows_html = rows
      .map(
        (r, i) =>
          `<tr>
        <td class="col-name">${i + 1}. ${r.studentName}</td>
        ${monthDays
          .map(({ dateStr }) => {
            const s = r.map[dateStr] ?? null;
            return `<td>${s === "Present" ? '<span class="att-print-p">P</span>' : s === "Absent" ? '<span class="att-print-a">A</span>' : ""}</td>`;
          })
          .join("")}
        <td>${r.present}</td>
        <td>${r.absent}</td>
        <td>${r.rate.toFixed(0)}%</td>
      </tr>`,
      )
      .join("");

    const footer_html = `<tr style="background:#f0f0f0;font-weight:700">
        <td class="col-name">Total Present</td>
        ${monthDays.map(({ dateStr }) => `<td>${(perDayPresent as Record<string, number>)[dateStr] ?? 0}</td>`).join("")}
        <td colspan="3"></td>
      </tr>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Monthly Attendance — ${selectedSubLevel?.label} — ${monthName(selectedMonth)}</title>
      <style>
        * { box-sizing: border-box; } body { margin: 0; padding: 8mm; }
        @page { size: A4 landscape; margin: 8mm 10mm; }
        .att-print-table { width: 100%; border-collapse: collapse; font-size: 9px; font-family: sans-serif; }
        .att-print-table th, .att-print-table td { border: 1px solid #ccc; padding: 2px 4px; text-align: center; }
        .att-print-table th { background: #f0f0f0; font-weight: 700; }
        .att-print-table .col-name { text-align: left; min-width: 140px; }
        .att-print-p { color: #16a34a; font-weight: 700; }
        .att-print-a { color: #dc2626; font-weight: 700; }
        h2 { font-family: sans-serif; font-size: 13px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.08em; }
        p.sub { font-family: sans-serif; font-size: 10px; color: #555; margin: 0 0 8px; }
      </style>
    </head><body>
      <h2>Monthly Attendance Report</h2>
      <p class="sub">${selectedSubLevel?.label} · ${monthName(selectedMonth)}</p>
      <table class="att-print-table">
        <thead><tr>
          <th class="col-name">Student Name</th>
          ${monthDays
            .map(
              ({ day, dayName, isWeekend }) =>
                `<th style="${isWeekend ? "background:#f8f8f8;color:#999" : ""}">${day}<br/><small>${dayName}</small></th>`,
            )
            .join("")}
          <th>Pres.</th><th>Abs.</th><th>Rate</th>
        </tr></thead>
        <tbody>${rows_html}${footer_html}</tbody>
      </table>
    </body></html>`);
    win.document.close();
    win.onload = () => win.print();
  };

  const hasData = rows.length > 0;
  const showEmpty = !isLoading && !!selectedSubLevel && !hasData;
  const showPrompt = !selectedSubLevel;

  // ── Render ───────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* ── Page header ─────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5 flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1
            className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Monthly Attendance
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Attendance</span>
            <ChevronRight className="w-3 h-3" />
            <span>Monthly View</span>
            {selectedSubLevel && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#0D1B2E] font-semibold">
                  {selectedSubLevel.label}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Print button */}
        <AnimatePresence>
          {hasData && (
            <MotionButton
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-x-2 px-4 py-2.5 rounded-xl font-bold text-xs text-[#0D1B2E] bg-white border border-slate-200 hover:border-[#1E3A5F] hover:bg-[#EEF2F8] transition-all cursor-pointer"
              style={{ boxShadow: "0 1px 4px rgba(13,27,46,0.06)" }}
            >
              <Printer className="w-3.5 h-3.5 text-[#1E3A5F]" />
              Print Attendance
            </MotionButton>
          )}
        </AnimatePresence>
      </MotionDiv>

      {/* ── Filter bar ──────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        {/* Header strip */}
        <div
          className="flex items-center gap-x-3 px-5 py-3.5"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
            <Filter className="w-4 h-4" />
          </div>
          <span className="text-white font-semibold text-sm flex-1">
            Select Class &amp; Month
          </span>
          {selectedSubLevel && (
            <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full">
              {monthName(selectedMonth)}
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Sub-Level / Class
            </p>
            <Select
              size="large"
              labelInValue
              showSearch={{
                filterOption: (input, opt) =>
                  String(opt?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase()),
              }}
              placeholder="Search and select a class…"
              className="w-full"
              options={subLevelOptions}
              loading={loadingSublevels}
              disabled={loadingSublevels}
              onChange={(opt) =>
                setSublevel({
                  value: opt.value,
                  label: opt.label as string,
                })
              }
              value={selectedSubLevel ?? undefined}
            />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Month
            </p>
            <DatePicker
              size="large"
              picker="month"
              className="w-full"
              value={selectedMonth}
              disabledDate={(d) => d && d > dayjs().startOf("month")}
              onChange={(v) => v && setMonth(v)}
              format="MMMM YYYY"
            />
          </div>
        </div>
      </MotionDiv>

      {/* ── Stat chips ──────────────────────────────── */}
      <AnimatePresence>
        {stats && (
          <MotionDiv
            key="stats"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4"
          >
            <StatChip
              icon={<Users className="w-4 h-4" />}
              label="Students"
              value={stats.students}
              sub="in class"
              color="navy"
            />
            <StatChip
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="Total Present"
              value={stats.totalPresent}
              sub="record entries"
              color="green"
            />
            <StatChip
              icon={<XCircle className="w-4 h-4" />}
              label="Total Absent"
              value={stats.totalAbsent}
              sub="record entries"
              color="rose"
            />
            <StatChip
              icon={<Percent className="w-4 h-4" />}
              label="Avg. Rate"
              value={`${stats.overallRate.toFixed(1)}%`}
              sub="overall attendance"
              color={
                stats.overallRate >= 90
                  ? "green"
                  : stats.overallRate >= 70
                    ? "amber"
                    : "rose"
              }
            />
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* ── Main card ───────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 16px rgba(13,27,46,0.07)" }}
      >
        {/* Card header */}
        <div
          className="flex items-center gap-x-3 px-5 py-3.5 border-b border-slate-100"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
          <span className="text-white font-semibold text-sm flex-1">
            {selectedSubLevel
              ? `${selectedSubLevel.label} — ${monthName(selectedMonth)}`
              : "Attendance Grid"}
          </span>
          {hasData && (
            <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full">
              {rows.length} students
            </span>
          )}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="p-5 flex flex-col gap-y-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                active
                paragraph={{ rows: 0 }}
                className="m-0!"
              />
            ))}
          </div>
        )}

        {/* Prompt — no class selected */}
        {showPrompt && !isLoading && (
          <EmptyState
            icon={<LayoutGrid className="w-7 h-7 text-slate-300" />}
            message="No class selected"
            sub="Select a sub-level and month above to view attendance records"
          />
        )}

        {/* Empty — class selected but no data */}
        {showEmpty && (
          <EmptyState
            icon={<CalendarDays className="w-7 h-7 text-slate-300" />}
            message="No attendance records"
            sub={`No data found for ${selectedSubLevel?.label} in ${monthName(selectedMonth)}`}
          />
        )}

        {/* ── THE ATTENDANCE GRID ──────────────────── */}
        {hasData && !isLoading && (
          <div className="overflow-x-auto">
            <table
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: `${180 + monthDays.length * 30 + 120}px`,
                width: "100%",
                fontSize: "12px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <thead>
                <tr>
                  {/* Sticky name column header */}
                  <th
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 3,
                      background: "#F4F6FA",
                      borderBottom: "2px solid #E2E8F0",
                      borderRight: "2px solid #E2E8F0",
                      padding: "10px 14px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#475569",
                      minWidth: 180,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Student Name
                  </th>

                  {/* Day columns */}
                  {monthDays.map(({ day, dayName, isWeekend }) => (
                    <th
                      key={day}
                      style={{
                        borderBottom: "2px solid #E2E8F0",
                        padding: "6px 2px",
                        textAlign: "center",
                        width: 34,
                        background: isWeekend ? "#F8FAFC" : "#F4F6FA",
                        color: isWeekend ? "#94A3B8" : "#475569",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          fontWeight: 500,
                          lineHeight: 1.2,
                          color: "inherit",
                        }}
                      >
                        {dayName}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          lineHeight: 1.4,
                          color: isWeekend ? "#94A3B8" : "#1E3A5F",
                        }}
                      >
                        {day}
                      </div>
                    </th>
                  ))}

                  {/* Summary column headers */}
                  {[
                    { label: "Pres.", title: "Days Present" },
                    { label: "Abs.", title: "Days Absent" },
                    { label: "Rate", title: "Attendance Rate" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      title={col.title}
                      style={{
                        position: "sticky",
                        right:
                          col.label === "Rate"
                            ? 0
                            : col.label === "Abs."
                              ? 44
                              : 88,
                        zIndex: 3,
                        borderBottom: "2px solid #E2E8F0",
                        borderLeft:
                          col.label === "Pres." ? "2px solid #E2E8F0" : "none",
                        padding: "6px 8px",
                        textAlign: "center",
                        width: 44,
                        background: "#EEF2F8",
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#1E3A5F",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row, ri) => (
                  <tr
                    key={row.studentId}
                    style={{ background: ri % 2 === 0 ? "#fff" : "#FAFBFD" }}
                  >
                    {/* Sticky name cell */}
                    <td
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                        background: ri % 2 === 0 ? "#fff" : "#FAFBFD",
                        borderBottom: "1px solid #F1F5F9",
                        borderRight: "2px solid #E2E8F0",
                        padding: "8px 14px",
                        fontWeight: 600,
                        color: "#0D1B2E",
                        whiteSpace: "nowrap",
                        minWidth: 180,
                      }}
                    >
                      <div className="flex items-center gap-x-2.5">
                        {/* Index + avatar initial */}
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 8,
                            background: "#0D1B2E",
                            color: "#C9A84C",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {row.studentName.charAt(0).toUpperCase()}
                        </span>
                        <span style={{ fontSize: "12px" }}>
                          {row.studentName}
                        </span>
                      </div>
                    </td>

                    {/* Day cells */}
                    {monthDays.map(({ dateStr, isWeekend }) => {
                      const s = row.map[dateStr] ?? null;
                      return (
                        <td
                          key={dateStr}
                          style={{
                            borderBottom: "1px solid #F1F5F9",
                            textAlign: "center",
                            padding: "6px 2px",
                            background:
                              s === "Present"
                                ? "rgba(16,185,129,0.06)"
                                : s === "Absent"
                                  ? "rgba(239,68,68,0.06)"
                                  : isWeekend
                                    ? "#F8FAFC"
                                    : "transparent",
                          }}
                        >
                          <AttCell status={s} />
                        </td>
                      );
                    })}

                    {/* Summary: present */}
                    <td
                      style={{
                        position: "sticky",
                        right: 88,
                        zIndex: 2,
                        background: ri % 2 === 0 ? "#EEF2F8" : "#E8EDF5",
                        borderBottom: "1px solid #DDE4EF",
                        borderLeft: "2px solid #E2E8F0",
                        padding: "8px 4px",
                        textAlign: "center",
                        fontWeight: 700,
                        color: "#059669",
                        fontSize: "12px",
                      }}
                    >
                      {row.present}
                    </td>

                    {/* Summary: absent */}
                    <td
                      style={{
                        position: "sticky",
                        right: 44,
                        zIndex: 2,
                        background: ri % 2 === 0 ? "#EEF2F8" : "#E8EDF5",
                        borderBottom: "1px solid #DDE4EF",
                        padding: "8px 4px",
                        textAlign: "center",
                        fontWeight: 700,
                        color: "#DC2626",
                        fontSize: "12px",
                      }}
                    >
                      {row.absent}
                    </td>

                    {/* Summary: rate */}
                    <td
                      style={{
                        position: "sticky",
                        right: 0,
                        zIndex: 2,
                        background: ri % 2 === 0 ? "#EEF2F8" : "#E8EDF5",
                        borderBottom: "1px solid #DDE4EF",
                        padding: "8px 6px",
                        textAlign: "center",
                      }}
                    >
                      <RateBadge rate={row.rate} />
                    </td>
                  </tr>
                ))}

                {/* ── Footer row: per-day totals ── */}
                <tr>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                      background: "#0D1B2E",
                      borderTop: "2px solid #0D1B2E",
                      borderRight: "2px solid #1E3A5F",
                      padding: "8px 14px",
                      fontWeight: 700,
                      color: "#C9A84C",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Total Present
                  </td>
                  {monthDays.map(({ dateStr }) => {
                    const count =
                      (perDayPresent as Record<string, number>)[dateStr] ?? 0;
                    const pct = rows.length > 0 ? count / rows.length : 0;
                    const bg =
                      pct >= 0.9
                        ? "rgba(16,185,129,0.25)"
                        : pct >= 0.7
                          ? "rgba(245,158,11,0.2)"
                          : pct > 0
                            ? "rgba(239,68,68,0.15)"
                            : "#1a2e48";

                    return (
                      <td
                        key={dateStr}
                        style={{
                          background: count === 0 ? "#1a2e48" : bg,
                          borderTop: "2px solid #0D1B2E",
                          padding: "8px 2px",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: "11px",
                          color: count === 0 ? "#475569" : "#0D1B2E",
                        }}
                      >
                        {count || "—"}
                      </td>
                    );
                  })}

                  {/* Rate in footer = total present / (students × school days shown) */}
                  <td
                    colSpan={3}
                    style={{
                      position: "sticky",
                      right: 0,
                      zIndex: 2,
                      background: "#0D1B2E",
                      borderTop: "2px solid #0D1B2E",
                      borderLeft: "2px solid #1E3A5F",
                      padding: "8px 10px",
                      textAlign: "center",
                      color: "#C9A84C",
                      fontSize: "11px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stats?.overallRate.toFixed(1)}% avg.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        {hasData && (
          <div className="flex items-center gap-x-5 px-5 py-3 border-t border-slate-100 bg-slate-50/60">
            {[
              { dot: "bg-emerald-500", label: "Present" },
              { dot: "bg-rose-500", label: "Absent" },
              { dot: "bg-slate-300", label: "No record" },
            ].map(({ dot, label }) => (
              <div
                key={label}
                className="flex items-center gap-x-1.5 text-xs text-slate-500 font-medium"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
                {label}
              </div>
            ))}
            <div className="ml-auto flex items-center gap-x-4 text-xs text-slate-400 font-medium">
              <span>
                <span className="font-bold text-emerald-600">≥90%</span> —
                Excellent
              </span>
              <span>
                <span className="font-bold text-amber-600">70–89%</span> — Good
              </span>
              <span>
                <span className="font-bold text-rose-600">&lt;70%</span> — Poor
              </span>
            </div>
          </div>
        )}
      </MotionDiv>
    </div>
  );
};
export default ViewMonthlyAttendance;
