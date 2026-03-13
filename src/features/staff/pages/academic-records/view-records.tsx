/**
 * ClassRecords.tsx  (Teacher view)
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  PAGE HEADER  breadcrumb                                         │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  FILTER CARD   Class select  ·  Assessment select               │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  STAT CHIPS    Students · Subjects · Class Avg · High · Low     │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  RECORDS TABLE                                                   │
 * │   # │ Sticky name │ Subject cols … │ Sticky Avg% col            │
 * │   Score cells: coloured pill + mini progress bar                │
 * │   Footer row: per-subject class averages (navy dark row)        │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * Design tokens: navy #0D1B2E × gold #C9A84C · DM Sans + Playfair Display
 * Icons:   lucide-react   (replaces react-icons + antd icons)
 * No AntD Spin, no AntD Breadcrumb, no AntD Form wrapper
 */

import { Select } from "antd";
import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  ChevronRight,
  BookOpen,
  Users,
  BarChart2,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  Filter,
  Search,
  GraduationCap,
  Hash,
  Layers,
} from "lucide-react";
import { useAuth } from "@/store/auth.store";
import { getTeacherMappingFn } from "@/services/staff";
import useFetch from "@/hooks/api/use-fetch";
import {
  academicRecordsKeys,
  educationKeys,
  mappingsKeys,
} from "@/config/query-keys";
import type { SelectTypes } from "@/types/ui";
import { getAssessmentsBySubIdFn } from "@/services/setup/assessment-n-grading";
import { getSublevelRecords } from "@/services/academic-records";
import { MotionDiv } from "@/components/custom/motion";
import { CardHeader } from "@/features/admins/components/teacher-util-components";
import { FL } from "@/features/admins/components/util-components";
import { useUIStore } from "@/store/ui.store";
import { useShallow } from "zustand/react/shallow";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { capitalizeWords } from "@/utils/string";

// ─── Stat chip ──────────────────────────────────────────────────────
const StatChip = ({
  icon,
  label,
  value,
  sub,
  accent = "navy",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "navy" | "green" | "rose" | "amber";
}) => {
  const palette = {
    navy: {
      wrap: "bg-[#EEF2F8]",
      iconWrap: "bg-[#1E3A5F] text-[#C9A84C]",
      val: "text-[#0D1B2E]",
      muted: "text-[#1E3A5F]/50",
    },
    green: {
      wrap: "bg-emerald-50",
      iconWrap: "bg-emerald-500 text-white",
      val: "text-emerald-700",
      muted: "text-emerald-500/70",
    },
    rose: {
      wrap: "bg-rose-50",
      iconWrap: "bg-rose-500 text-white",
      val: "text-rose-700",
      muted: "text-rose-400/70",
    },
    amber: {
      wrap: "bg-amber-50",
      iconWrap: "bg-amber-500 text-white",
      val: "text-amber-700",
      muted: "text-amber-500/70",
    },
  };
  const c = palette[accent];

  return (
    <div
      className={`flex items-center gap-x-3 ${c.wrap} rounded-2xl px-4 py-3 border border-white flex-1 min-w-32.5`}
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.05)" }}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.iconWrap}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5 opacity-60 ${c.val}`}
        >
          {label}
        </p>
        <p
          className={`text-xl font-bold leading-tight ${c.val}`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {value}
        </p>
        {sub && (
          <p className={`text-[10px] font-medium mt-0.5 ${c.muted}`}>{sub}</p>
        )}
      </div>
    </div>
  );
};

// ─── Score pill + bar ────────────────────────────────────────────────
/**
 * raw = "marks/markedOver"  e.g. "42/60"
 * undefined/null → em-dash
 */
const ScoreCell = ({ raw }: { raw?: string }) => {
  if (!raw || raw.startsWith("undefined") || raw.startsWith("null")) {
    return (
      <span
        className="text-slate-300 text-xs select-none"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        —
      </span>
    );
  }

  const [mStr, oStr] = raw.split("/");
  const m = parseFloat(mStr);
  const o = parseFloat(oStr);
  const pct = o > 0 ? (m / o) * 100 : 0;

  const { bar, pill, text } =
    pct >= 70
      ? {
          bar: "#10B981",
          pill: "bg-emerald-50 border-emerald-200",
          text: "text-emerald-700",
        }
      : pct >= 50
        ? {
            bar: "#F59E0B",
            pill: "bg-amber-50 border-amber-200",
            text: "text-amber-700",
          }
        : {
            bar: "#EF4444",
            pill: "bg-rose-50 border-rose-200",
            text: "text-rose-700",
          };

  return (
    <div className="flex flex-col items-center gap-y-1.5 py-0.5">
      {/* Pill */}
      <span
        className={`inline-flex items-center gap-x-0.5 px-2 py-0.5 rounded-full border text-[11px] font-bold ${pill} ${text}`}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          minWidth: 52,
          justifyContent: "center",
        }}
      >
        {isNaN(m) ? "—" : m}
        <span className="opacity-40 font-normal text-[10px]">
          /{isNaN(o) ? "—" : o}
        </span>
      </span>
      {/* Bar */}
      <div className="w-10 h-0.75 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(Math.max(pct, 0), 100)}%`,
            background: bar,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
};

// ─── Average badge (sticky right col) ──────────────────────────────
const AvgBadge = ({ avg }: { avg: number | null }) => {
  if (avg === null) return <span className="text-slate-300 text-xs">—</span>;

  const { colour, bg } =
    avg >= 70
      ? { colour: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" }
      : avg >= 50
        ? { colour: "text-amber-700", bg: "bg-amber-50 border-amber-200" }
        : { colour: "text-rose-700", bg: "bg-rose-50 border-rose-200" };

  return (
    <span
      className={`inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full border ${bg} ${colour}`}
      style={{ fontFamily: "'DM Sans', sans-serif", minWidth: 54 }}
    >
      {avg.toFixed(1)}%
    </span>
  );
};

// ─── Empty / prompt state ────────────────────────────────────────────
const EmptyState = ({
  icon,
  message,
  sub,
}: {
  icon: React.ReactNode;
  message: string;
  sub?: string;
}) => (
  <div className="flex flex-col items-center py-16 gap-3">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
      {icon}
    </div>
    <p className="text-sm font-semibold text-slate-400 text-center">
      {message}
    </p>
    {sub && (
      <p className="text-xs text-slate-300 text-center max-w-65">{sub}</p>
    )}
  </div>
);

// ─── Skeleton rows ───────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="p-5 flex flex-col gap-y-2.5">
    {Array.from({ length: 7 }).map((_, i) => (
      <div
        key={i}
        className="h-10 rounded-xl bg-slate-100 animate-pulse"
        style={{ opacity: 1 - i * 0.09 }}
      />
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// ② UTILITIES
// ═══════════════════════════════════════════════════════════════════

const parsePct = (raw?: string): number | null => {
  if (!raw || raw.startsWith("undefined") || raw.startsWith("null"))
    return null;
  const [mStr, oStr] = raw.split("/");
  const m = parseFloat(mStr);
  const o = parseFloat(oStr);
  return isNaN(m) || isNaN(o) || o === 0 ? null : (m / o) * 100;
};

const ViewRecords = () => {
  const user = useAuth((s) => s.user);
  const [sublevel, setSublevel] = useState<SelectTypes | null>(null);
  const [assessment, setAssessment] = useState<SelectTypes | null>(null);
  const [search, setSearch] = useState("");

  const { collapsed } = useUIStore(
    useShallow((s) => ({
      collapsed: s.menuCollapsed,
    })),
  );
  const isMobile = useIsMobile();

  const teacherId = user?.userId;
  const sublevelId = sublevel?.value;
  const assessmentId = assessment?.value;

  const { data: teacherMapping, isLoading: loadingMapping } = useFetch({
    queryFn: () => getTeacherMappingFn(teacherId!),
    queryKeys: mappingsKeys.custom("teacher", { teacherId }),
    enabled: !!teacherId,
  });
  const { data: assessments, isLoading: loadingAssessments } = useFetch({
    queryFn: () => getAssessmentsBySubIdFn(sublevelId!),
    queryKeys: educationKeys.custom("assessment", { sublevelId }),
    enabled: !!sublevelId,
  });
  const { data: subLevelRecords, isLoading: loadingRecords } = useFetch({
    queryFn: () => getSublevelRecords(sublevelId!, assessmentId!, teacherId!),
    queryKeys: academicRecordsKeys.custom("sublevel-records", {
      assessmentId,
      sublevelId,
      teacherId,
    }),
    enabled: !!sublevelId && !!assessmentId && !!teacherId,
  });

  // ── Select options ────────────────────────────────────────────────
  const subLevelOptions = useMemo(
    () =>
      teacherMapping?.subLevels?.map((s) => ({
        label: s.subLevelName,
        value: s.subLevelId,
      })) ?? [],
    [teacherMapping],
  );

  const assessmentOptions = useMemo(
    () =>
      assessments?.assessments?.map((a) => ({
        label: capitalizeWords(a.assessmentName),
        value: a.assessmentId,
      })) ?? [],
    [assessments],
  );

  /** Subjects from teacher mapping — drives the dynamic columns */
  const subjects = useMemo(
    () => teacherMapping?.subjects ?? [],
    [teacherMapping],
  );

  // ── Data rows ─────────────────────────────────────────────────────
  /** One flat object per student: { key, studentFullName, [subjectId]: "m/o", … } */
  const allRows = useMemo(() => {
    return (subLevelRecords ?? []).map((record) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row: Record<string, any> = {
        key: record.studentId,
        studentFullName: record.studentFullName,
      };
      record?.subjects?.forEach((subject) => {
        const r = subject.academicRecord[0];
        row[subject.subjectId] = r ? `${r.marks}/${r.markedOver}` : undefined;
      });
      return row;
    });
  }, [subLevelRecords]);

  /** Filtered by name search */
  const dataSource = useMemo(() => {
    if (!search?.trim()) return allRows;
    const q = search?.toLowerCase();
    return allRows?.filter((r) =>
      (r.studentFullName as string)?.toLowerCase().includes(q),
    );
  }, [allRows, search]);

  // ── Per-student average ───────────────────────────────────────────
  const getStudentAvg = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (row: Record<string, any>): number | null => {
      const pcts = subjects
        ?.map((s) => parsePct(row[s.subjectId]))
        ?.filter((v): v is number => v !== null);
      return pcts.length > 0
        ? pcts.reduce((a, b) => a + b, 0) / pcts.length
        : null;
    },
    [subjects],
  );

  // ── Per-subject class averages ────────────────────────────────────
  const subjectAvgs = useMemo<Record<string, number | null>>(() => {
    const out: Record<string, number | null> = {};
    subjects?.forEach((s) => {
      const pcts = allRows
        ?.map((row) => parsePct(row[s.subjectId]))
        ?.filter((v): v is number => v !== null);
      out[s.subjectId] =
        pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;
    });
    return out;
  }, [allRows, subjects]);

  // ── Global stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!allRows.length || !subjects.length) return null;
    const avgs = allRows
      ?.map(getStudentAvg)
      ?.filter((v): v is number => v !== null);
    if (!avgs.length) return null;
    const classAvg = avgs?.reduce((a, b) => a + b, 0) / avgs.length;
    return {
      students: allRows.length,
      subjects: subjects.length,
      classAvg,
      highest: Math.max(...avgs),
      lowest: Math.min(...avgs),
    };
  }, [allRows, getStudentAvg, subjects.length]);

  // ── State flags ───────────────────────────────────────────────────
  const hasData = !loadingRecords && !!assessment && allRows.length > 0;
  const showPrompt = !sublevel;
  const showPick = !!sublevel && !assessment;
  const showEmpty = !!assessment && !loadingRecords && allRows.length === 0;

  // minimum table width = # col + name col + subjects + avg col
  // const tableMinW = 40 + 200 + subjects.length * 106 + 72;
  const tableMinW = 40 + 200 + subjects.length * 106 + 72;

  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5"
      >
        <h1
          className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Class Records
        </h1>
        <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium flex-wrap">
          <span className="text-[#1E3A5F] font-semibold">Academic Records</span>
          <ChevronRight className="w-3 h-3" />
          <span>View Class Record</span>
          {sublevel && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#0D1B2E] font-semibold">
                {sublevel.label}
              </span>
            </>
          )}
          {assessment && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-500">{assessment.label}</span>
            </>
          )}
        </nav>
      </MotionDiv>

      {/* ── FILTER CARD ──────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <CardHeader
          icon={<Filter className="w-4 h-4" />}
          title="Select Class &amp; Assessment"
          badge={assessment ? assessment.label : undefined}
        />

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Class / Sub-level */}
          <div>
            <p className="mb-1.5">
              <FL>Class / Sub-Level</FL>
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
              placeholder="Select your class…"
              className="w-full"
              options={subLevelOptions}
              loading={loadingMapping}
              disabled={loadingMapping}
              value={sublevel ?? undefined}
              onChange={(opt) => {
                setSublevel({
                  value: opt.value,
                  label: opt.label as string,
                });
                setAssessment(null);
                setSearch("");
              }}
            />
          </div>

          {/* Assessment */}
          <div>
            <p className="mb-1.5">
              <FL>Assessment Type</FL>
            </p>
            <Select
              size="large"
              labelInValue
              placeholder={
                sublevel ? "Select assessment…" : "Pick a class first"
              }
              className="w-full"
              options={assessmentOptions}
              loading={loadingAssessments}
              disabled={loadingAssessments || !sublevel}
              value={assessment ?? undefined}
              onChange={(opt) =>
                setAssessment({
                  value: opt.value,
                  label: opt.label as string,
                })
              }
            />
          </div>
        </div>
      </MotionDiv>

      {/* ── STAT CHIPS ───────────────────────────────────────── */}
      <AnimatePresence>
        {stats && (
          <MotionDiv
            key="stats"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4"
          >
            <StatChip
              icon={<Users className="w-4 h-4" />}
              label="Students"
              value={stats.students}
              sub="in class"
              accent="navy"
            />
            <StatChip
              icon={<BookOpen className="w-4 h-4" />}
              label="Subjects"
              value={stats.subjects}
              sub="assessed"
              accent="navy"
            />
            <StatChip
              icon={<BarChart2 className="w-4 h-4" />}
              label="Class Avg"
              value={`${stats.classAvg.toFixed(1)}%`}
              sub="across all subjects"
              accent={
                stats.classAvg >= 70
                  ? "green"
                  : stats.classAvg >= 50
                    ? "amber"
                    : "rose"
              }
            />
            <StatChip
              icon={<TrendingUp className="w-4 h-4" />}
              label="Highest Avg"
              value={`${stats.highest.toFixed(1)}%`}
              sub="top student"
              accent="green"
            />
            <StatChip
              icon={<TrendingDown className="w-4 h-4" />}
              label="Lowest Avg"
              value={`${stats.lowest.toFixed(1)}%`}
              sub="needs support"
              accent="rose"
            />
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* ── MAIN TABLE CARD ──────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 16px rgba(13,27,46,0.07)" }}
      >
        <CardHeader
          icon={<ClipboardList className="w-4 h-4" />}
          title={
            sublevel && assessment
              ? `${sublevel.label} — ${assessment.label}`
              : "Class Records"
          }
          badge={hasData ? `${allRows.length} students` : undefined}
        />

        {/* Search bar — visible only with data */}
        {hasData && (
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/40 flex items-center gap-x-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search student name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-sm text-[#0D1B2E] placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all w-56 md:w-1/3"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer text-base leading-none"
                >
                  ×
                </button>
              )}
            </div>
            {search && (
              <span className="text-[11px] text-slate-400 font-medium">
                {dataSource.length} of {allRows.length} students
              </span>
            )}
          </div>
        )}

        {/* ── State slots ── */}
        {loadingRecords && <TableSkeleton />}

        {showPrompt && !loadingRecords && (
          <EmptyState
            icon={<GraduationCap className="w-7 h-7" />}
            message="Select a class to get started"
            sub="Choose a sub-level from the filter bar above"
          />
        )}

        {showPick && !loadingRecords && (
          <EmptyState
            icon={<Hash className="w-7 h-7" />}
            message="Select an assessment type"
            sub="Choose which assessment you want to view records for"
          />
        )}

        {showEmpty && (
          <EmptyState
            icon={<ClipboardList className="w-7 h-7" />}
            message="No records found"
            sub={`No academic records for ${sublevel?.label} — ${assessment?.label}`}
          />
        )}

        {/* ══════════════════════════════════════════════════════
            THE TABLE
            Sticky left:  # + student name cols
            Scrollable:   subject score cols
            Sticky right: student average col
        ═══════════════════════════════════════════════════════ */}
        {hasData && !loadingRecords && (
          <div
            className={cn(
              "overflow-x-auto",
              !isMobile ? (collapsed ? "max-w-[93dvw]" : "max-w-[81dvw]") : "",
            )}
          >
            <table
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: tableMinW,
                width: "100%",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
              }}
            >
              {/* ─── HEAD ─── */}
              <thead>
                <tr>
                  {/* # */}
                  <th
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 4,
                      background: "#F4F6FA",
                      borderBottom: "2px solid #E2E8F0",
                      borderRight: "1px solid #E2E8F0",
                      padding: "10px 8px",
                      textAlign: "center",
                      width: 40,
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#94A3B8",
                    }}
                  >
                    #
                  </th>

                  {/* Student name */}
                  <th
                    style={{
                      position: "sticky",
                      left: 30,
                      zIndex: 4,
                      background: "#F4F6FA",
                      borderBottom: "2px solid #E2E8F0",
                      borderRight: "2px solid #D0DCF0",
                      padding: "10px 14px",
                      textAlign: "left",
                      minWidth: 200,
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#475569",
                    }}
                  >
                    Student Name
                  </th>

                  {/* One column per subject */}
                  {subjects.map((s) => (
                    <th
                      key={s.subjectId}
                      style={{
                        background: "#F4F6FA",
                        borderBottom: "2px solid #E2E8F0",
                        borderRight: "1px solid #E2E8F0",
                        padding: "8px 8px",
                        textAlign: "center",
                        minWidth: 106,
                        fontWeight: 700,
                        color: "#1E3A5F",
                        fontSize: "11px",
                        lineHeight: 1.35,
                      }}
                    >
                      {s.subjectName}
                      {/* Class avg hint under each subject header */}
                      {subjectAvgs[s.subjectId] !== null && (
                        <div
                          style={{
                            fontSize: "9px",
                            fontWeight: 500,
                            color: "#94A3B8",
                            fontStyle: "italic",
                            marginTop: 3,
                          }}
                        >
                          avg {subjectAvgs[s.subjectId]?.toFixed(0)}%
                        </div>
                      )}
                    </th>
                  ))}

                  {/* Sticky right: Avg% */}
                  <th
                    style={{
                      position: "sticky",
                      right: 0,
                      zIndex: 4,
                      background: "#EEF2F8",
                      borderBottom: "2px solid #E2E8F0",
                      borderLeft: "2px solid #D0DCF0",
                      padding: "10px 10px",
                      textAlign: "center",
                      minWidth: 72,
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#1E3A5F",
                    }}
                  >
                    Avg %
                  </th>
                </tr>
              </thead>

              {/* ─── BODY ─── */}
              <tbody>
                {dataSource.map((row, ri) => {
                  const avg = getStudentAvg(row);
                  const rowBg = ri % 2 === 0 ? "#fff" : "#FAFBFD";

                  return (
                    <tr key={row.key} style={{ background: rowBg }}>
                      {/* # */}
                      <td
                        style={{
                          position: "sticky",
                          left: 0,
                          zIndex: 2,
                          background: rowBg,
                          borderBottom: "1px solid #F1F5F9",
                          borderRight: "1px solid #E2E8F0",
                          padding: "10px 8px",
                          textAlign: "center",
                          fontSize: "11px",
                          color: "#94A3B8",
                          fontWeight: 600,
                          minWidth: "fit-content"
                        }}
                      >
                        {ri + 1}
                      </td>

                      {/* Student name */}
                      <td
                        style={{
                          position: "sticky",
                          left: 30,
                          zIndex: 2,
                          background: rowBg,
                          borderBottom: "1px solid #F1F5F9",
                          borderRight: "2px solid #D0DCF0",
                          padding: "10px 14px",
                          whiteSpace: "nowrap",
                          minWidth: 200,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          {/* Initial avatar */}
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              flexShrink: 0,
                              background:
                                "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
                              color: "#C9A84C",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {(row.studentFullName as string)
                              ?.charAt(0)
                              ?.toUpperCase() ?? "?"}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#0D1B2E",
                            }}
                          >
                            {row.studentFullName}
                          </span>
                        </div>
                      </td>

                      {/* Score cells */}
                      {subjects.map((s) => (
                        <td
                          key={s.subjectId}
                          style={{
                            borderBottom: "1px solid #F1F5F9",
                            borderRight: "1px solid #F1F5F9",
                            padding: "6px 8px",
                            textAlign: "center",
                          }}
                        >
                          <ScoreCell raw={row[s.subjectId]} />
                        </td>
                      ))}

                      {/* Student avg */}
                      <td
                        style={{
                          position: "sticky",
                          right: 0,
                          zIndex: 2,
                          background: ri % 2 === 0 ? "#EEF2F8" : "#E8EDF5",
                          borderBottom: "1px solid #DDE4EF",
                          borderLeft: "2px solid #D0DCF0",
                          padding: "10px 10px",
                          textAlign: "center",
                        }}
                      >
                        <AvgBadge avg={avg} />
                      </td>
                    </tr>
                  );
                })}

                {/* ─── FOOTER: class averages per subject ─── */}
                <tr>
                  {/* # cell */}
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                      background: "#0D1B2E",
                      borderTop: "2px solid #0D1B2E",
                      borderRight: "1px solid #1E3A5F",
                      padding: "10px 8px",
                    }}
                  />

                  {/* "Class Average" label */}
                  <td
                    style={{
                      position: "sticky",
                      left: 40,
                      zIndex: 2,
                      background: "#0D1B2E",
                      borderTop: "2px solid #0D1B2E",
                      borderRight: "2px solid #1E3A5F",
                      padding: "10px 14px",
                      fontWeight: 700,
                      color: "#C9A84C",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Class Average
                  </td>

                  {/* Per-subject averages */}
                  {subjects.map((s) => {
                    const avg = subjectAvgs[s.subjectId];
                    const colour =
                      avg === null
                        ? "#6B7280"
                        : avg >= 70
                          ? "#10B981"
                          : avg >= 50
                            ? "#F59E0B"
                            : "#EF4444";
                    return (
                      <td
                        key={s.subjectId}
                        style={{
                          background: "#0D1B2E",
                          borderTop: "2px solid #0D1B2E",
                          borderRight: "1px solid #1E3A5F",
                          padding: "10px 8px",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: "12px",
                          color: colour,
                        }}
                      >
                        {avg !== null ? `${avg.toFixed(1)}%` : "—"}
                      </td>
                    );
                  })}

                  {/* Overall avg */}
                  <td
                    style={{
                      position: "sticky",
                      right: 0,
                      zIndex: 2,
                      background: "#0D1B2E",
                      borderTop: "2px solid #0D1B2E",
                      borderLeft: "2px solid #1E3A5F",
                      padding: "10px 10px",
                      textAlign: "center",
                      fontWeight: 800,
                      fontSize: "13px",
                      color: "#C9A84C",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stats ? `${stats.classAvg.toFixed(1)}%` : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Legend ─────────────────────────────────────────── */}
        {hasData && (
          <div className="flex items-center flex-wrap gap-x-5 gap-y-2 px-5 py-3 border-t border-slate-100 bg-slate-50/60">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Score:
            </span>
            {[
              { dot: "bg-emerald-500", label: "≥ 70% — Good" },
              { dot: "bg-amber-500", label: "50–69% — Fair" },
              { dot: "bg-rose-500", label: "< 50% — Needs attention" },
            ].map(({ dot, label }) => (
              <div
                key={label}
                className="flex items-center gap-x-1.5 text-xs text-slate-500 font-medium"
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                {label}
              </div>
            ))}
            <div className="ml-auto flex items-center gap-x-1.5 text-[11px] text-slate-400 font-medium">
              <Layers className="w-3 h-3" />
              Scroll right to see all subjects
            </div>
          </div>
        )}
      </MotionDiv>
    </div>
  );
};
export default ViewRecords;
