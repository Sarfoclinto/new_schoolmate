/**
 * MarkAttendance.tsx  (Teacher view)
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  PAGE HEADER + breadcrumb                                        │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  CONTEXT BAR   class select  ·  date picker  ·  day badge       │
 * ├────────────────────────────┬─────────────────────────────────────┤
 * │  UNMARKED PANEL (left)     │  MARKED PANEL (right)              │
 * │  search · checkbox-select  │  search · mark-absent action       │
 * │  per-row "Mark Present"    │  status badge per student          │
 * │  bulk "Mark All Selected"  │                                    │
 * └────────────────────────────┴─────────────────────────────────────┘
 *
 * Design tokens: navy #0D1B2E × gold #C9A84C · DM Sans + Playfair
 * Icons:   lucide-react only
 * Toasts:  sonner
 * No AntD Spin, no AntD Breadcrumb, no AntD Form
 */

import dayjs, { type Dayjs } from "@/lib/dayjs";
import { useState, useMemo } from "react";
import {
  ChevronRight,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Users,
  Search,
  CheckCheck,
  UserCheck,
  UserX,
  Layers,
  TriangleAlert,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useAuth } from "@/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import type { SelectTypes } from "@/types/ui";
import useFetch from "@/hooks/api/use-fetch";
import { getTeachersSublevelsFn } from "@/services/staff";
import {
  attendanceKeys,
  educationKeys,
  studentKeys,
} from "@/config/query-keys";
import { getAllSubLevelStuFn } from "@/services/student";
import {
  getSublevelAttendanceFn,
  markAttendanceFn,
  updateAttendanceFn,
} from "@/services/attendance";
import usePost from "@/hooks/api/use-post";
import { toast } from "sonner";
import useUpdate from "@/hooks/api/use-update";
import type { AttendancePost } from "@/types/api/attendance";
import type { SubLevelStudentsGet } from "@/types/api/student";
import { formatDate, getDayOfWeek } from "@/utils/date-n-time";
import { MotionDiv } from "@/components/custom/motion";
import { FL } from "@/features/admins/components/util-components";
import { DatePicker, Popconfirm, Select } from "antd";

// Gradient card header — matches system-wide pattern
const CardHeader = ({
  icon,
  title,
  badge,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string | number;
  right?: React.ReactNode;
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
      <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">
        {badge}
      </span>
    )}
    {right}
  </div>
);

// Empty / prompt state
const EmptyState = ({
  icon,
  message,
  sub,
}: {
  icon: React.ReactNode;
  message: string;
  sub?: string;
}) => (
  <div className="flex flex-col items-center py-10 gap-2.5">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
      {icon}
    </div>
    <p className="text-sm font-semibold text-slate-400 text-center">
      {message}
    </p>
    {sub && (
      <p className="text-xs text-slate-300 text-center max-w-55">{sub}</p>
    )}
  </div>
);

// Status pill
const StatusPill = ({ status }: { status: string }) => {
  const isPresent = status === "Present";
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border
        ${
          isPresent
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-rose-50 border-rose-200 text-rose-700"
        }`}
    >
      {isPresent ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {status}
    </span>
  );
};

// Initial avatar — matches system pattern
const InitialAvatar = ({ name }: { name: string }) => (
  <span
    style={{
      width: 28,
      height: 28,
      borderRadius: 8,
      flexShrink: 0,
      background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
      color: "#C9A84C",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "11px",
      fontWeight: 700,
    }}
  >
    {name?.charAt(0)?.toUpperCase() ?? "?"}
  </span>
);

// Skeleton row
const SkeletonRows = ({ n = 5 }: { n?: number }) => (
  <div className="w-full flex flex-col gap-y-2 p-4">
    {Array.from({ length: n }).map((_, i) => (
      <div
        key={i}
        className="h-12 rounded-xl bg-slate-100 animate-pulse"
        style={{ opacity: 1 - i * 0.12 }}
      />
    ))}
  </div>
);

// Day-of-week badge colours
const DAY_COLOURS: Record<string, string> = {
  Monday: "bg-blue-50 text-blue-700 border-blue-200",
  Tuesday: "bg-violet-50 text-violet-700 border-violet-200",
  Wednesday: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Thursday: "bg-amber-50 text-amber-700 border-amber-200",
  Friday: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const MarkAttendance = () => {
  const user = useAuth((s) => s.user);
  const teacherId = user?.userId;
  const qc = useQueryClient();

  const [selectedSubLevel, setSelectedSubLevel] = useState<SelectTypes | null>(
    null,
  );
  const subLevelId = selectedSubLevel?.value;
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  // Set of studentIds checked in the unmarked panel
  const [checked, setChecked] = useState<Set<string>>(new Set());
  // Search queries for each panel
  const [searchUnmarked, setSearchUnmarked] = useState("");
  const [searchMarked, setSearchMarked] = useState("");

  const selectedDate = useMemo(
    () => (date ? date.format("YYYY-MM-DD") : null),
    [date],
  );
  const isReady = !!selectedDate && !!subLevelId;

  // ── Queries ──────────────────────────────────────────────────────
  const { data: teacherSubLevels, isLoading: loadingSubLevels } = useFetch({
    queryFn: () => getTeachersSublevelsFn(teacherId!),
    queryKeys: educationKeys.custom("teacher-sublevels", { teacherId }),
    enabled: !!teacherId,
  });

  const { data: subStudents, isLoading: subStuLoading } = useFetch({
    queryFn: () => getAllSubLevelStuFn(subLevelId!),
    queryKeys: studentKeys.custom("by-sub-level", {
      subLevelId,
    }),
    enabled: !!subLevelId,
  });

  const { data: markedStudents, isLoading: loadingMarked } = useFetch({
    queryKeys: attendanceKeys.custom("sublevel-date", {
      subLevelId,
      selectedDate,
    }),
    queryFn: () => getSublevelAttendanceFn(subLevelId!, selectedDate!),
    enabled: isReady,
  });


  //   mutations
  const { mutate: mark, isPending: marking } = usePost({
    postFn: markAttendanceFn,
    mutationOptions: { mutationKey: ["attendance", "mark"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();

        toast.success(responseMessage);
        reset();
      } else {
        // Format warning messages if they exist (separated by semicolons)
        if (responseMessage?.toLowerCase().includes("warnings:")) {
          const formattedMsg = responseMessage
            .replace(/Warnings:\s*/i, "")
            .split(";")
            .map((s) => s.trim())
            .join("\n• ");
          toast.warning("Some records already exist", {
            description: "• " + formattedMsg,
          });
        } else {
          toast.success(responseMessage);
        }
        // toast.info(responseMessage);
      }
    },
    onError: (err) => {
      toast.error("Failed to mark attendance!", {
        description: err.message,
      });
    },
  });

  const { mutate: markAbsent, isPending: updating } = useUpdate({
    updateFn: updateAttendanceFn,
    mutationOptions: { mutationKey: ["attendance", "update"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();
        toast.success(responseMessage);
        reset();
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (err) => {
      toast.error("Failed to mark as absent!", {
        description: err.message,
      });
    },
  });

  //   fns
  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: attendanceKeys.all });
  };

  const reset = async () => {
    setSearchUnmarked("");
    setSearchMarked("");
  };

  // ── Derived data ─────────────────────────────────────────────────
  const subLevelOptions = useMemo(
    () =>
      teacherSubLevels?.subLevels?.map((s) => ({
        label: s.subLevelName,
        value: s.subLevelId,
      })) ?? [],
    [teacherSubLevels],
  );

  const markedIds = useMemo(
    () => new Set(markedStudents?.map((s) => s.studentId) ?? []),
    [markedStudents],
  );

  /** Students NOT yet marked today */
  const unmarkedStudents = useMemo(
    () => (subStudents ?? []).filter((s) => !markedIds.has(s.studentId)),
    [subStudents, markedIds],
  );

  /** Filtered unmarked */
  const filteredUnmarked = useMemo(() => {
    if (!searchUnmarked) return unmarkedStudents;
    const q = searchUnmarked.toLowerCase();
    return unmarkedStudents?.filter((s) =>
      s.fullName?.toLowerCase().includes(q),
    );
  }, [unmarkedStudents, searchUnmarked]);

  /** Filtered marked */
  const filteredMarked = useMemo(() => {
    if (!searchMarked) return markedStudents ?? [];
    const q = searchMarked.toLowerCase();
    return (markedStudents ?? []).filter((s) =>
      s.studentFullName?.toLowerCase().includes(q),
    );
  }, [markedStudents, searchMarked]);

  // ── Handlers ─────────────────────────────────────────────────────
  const toggleCheck = (studentId: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      //   next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  };

  const toggleAll = () => {
    if (checked.size === filteredUnmarked.length) {
      setChecked(new Set());
    } else {
      setChecked(new Set(filteredUnmarked.map((s) => s.studentId)));
    }
  };

  const buildPayload = (ids: string[]): AttendancePost[] =>
    ids?.map((id) => {
      const s = subStudents!.find((x) => x.studentId === id)!;
      return {
        AttendanceDate: selectedDate!,
        Status: "Present",
        StudentId: id,
        SubLevelId: s.subLevelId,
        UserId: user?.userId ?? "",
      };
    });

  /** Mark a single student present */
  const markOne = (student: SubLevelStudentsGet) => {
    if (!isReady) {
      toast.warning("Select a class and date first.");
      return;
    }
    mark([
      {
        AttendanceDate: selectedDate!,
        Status: "Present",
        StudentId: student.studentId,
        SubLevelId: student.subLevelId,
        UserId: user?.userId ?? "",
      },
    ]);
  };

  /** Bulk mark all checked students */
  const markBulk = () => {
    if (!isReady) {
      toast.warning("Select a class and date first.");
      return;
    }
    if (checked.size === 0) {
      toast.warning("No students selected.");
      return;
    }
    mark(buildPayload(Array.from(checked)));
  };

  /** Mark ALL unmarked students at once */
  const markAll = () => {
    if (!isReady) {
      toast.warning("Select a class and date first.");
      return;
    }
    if (!unmarkedStudents.length) {
      toast.info("All students already marked.");
      return;
    }
    mark(buildPayload(unmarkedStudents.map((s) => s.studentId)));
  };

  const disableFuture = (d: Dayjs) =>
    d.day() === 0 || d.day() === 6 || d.isAfter(dayjs(), "day");

  // Stats
  const totalStudents = subStudents?.length ?? 0;
  const totalMarked = markedStudents?.length ?? 0;
  const totalUnmarked = unmarkedStudents.length;
  const presentCount = (markedStudents ?? []).filter(
    (s) => s.status === "Present",
  ).length;
  const absentCount = totalMarked - presentCount;
  const allChecked =
    filteredUnmarked.length > 0 && checked.size === filteredUnmarked.length;
  const someChecked = checked.size > 0 && !allChecked;

  const dayName = selectedDate ? getDayOfWeek(selectedDate) : null;
  const dayBadgeClass = dayName
    ? (DAY_COLOURS[dayName] ?? "bg-slate-100 text-slate-600 border-slate-200")
    : "";

  const isPending = marking || updating;

  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
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
            Mark Attendance
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Attendance</span>
            <ChevronRight className="w-3 h-3" />
            <span>Mark Attendance</span>
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

        {/* Pending indicator */}
        <AnimatePresence>
          {isPending && (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-x-2 px-3.5 py-2 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl"
            >
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#1E3A5F]/30 border-t-[#1E3A5F] animate-spin" />
              <span className="text-xs font-bold text-[#0D1B2E]">
                {marking ? "Marking present…" : "Marking absent…"}
              </span>
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionDiv>

      {/* ── CONTEXT BAR ──────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <CardHeader
          icon={<CalendarDays className="w-4 h-4" />}
          title="Class &amp; Date"
          badge={selectedDate ? formatDate(selectedDate) : undefined}
          right={
            dayName && (
              <span
                className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${dayBadgeClass}`}
              >
                {dayName}
              </span>
            )
          }
        />

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Class select */}
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
              loading={loadingSubLevels}
              disabled={loadingSubLevels}
              onChange={(opt) => {
                setSelectedSubLevel({
                  value: opt.value,
                  label: opt.label as string,
                });
                setChecked(new Set());
              }}
              value={selectedSubLevel ?? undefined}
            />
          </div>

          {/* Date picker */}
          <div>
            <p className="mb-1.5">
              <FL>Date</FL>
            </p>
            <DatePicker
              size="large"
              className="w-full"
              disabledDate={disableFuture}
              value={date}
              onChange={(d) => {
                setDate(d);
                setChecked(new Set());
              }}
              format="DD MMM YYYY"
            />
          </div>
        </div>

        {/* Summary chips — shown once data loads */}
        {isReady && !subStuLoading && totalStudents > 0 && (
          <div className="px-5 pb-4 flex flex-wrap gap-2.5">
            {[
              {
                label: "Total",
                value: totalStudents,
                col: "bg-slate-100 text-slate-700",
              },
              {
                label: "Marked",
                value: totalMarked,
                col: "bg-[#EEF2F8] text-[#1E3A5F]",
              },
              {
                label: "Pending",
                value: totalUnmarked,
                col:
                  totalUnmarked > 0
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700",
              },
              {
                label: "Present",
                value: presentCount,
                col: "bg-emerald-50 text-emerald-700",
              },
              {
                label: "Absent",
                value: absentCount,
                col:
                  absentCount > 0
                    ? "bg-rose-50 text-rose-700"
                    : "bg-slate-100 text-slate-400",
              },
            ].map(({ label, value, col }) => (
              <div
                key={label}
                className={`flex items-center gap-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${col}`}
              >
                <span className="opacity-60">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}
      </MotionDiv>

      {/* ── PROMPT: nothing selected ─────────────────────────── */}
      {!isReady && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <EmptyState
            icon={<Layers className="w-7 h-7" />}
            message="Select a class and date to begin"
            sub="Use the context bar above to choose your sub-level and the attendance date"
          />
        </MotionDiv>
      )}

      {/* ── TWO-PANEL GRID ───────────────────────────────────── */}
      {isReady && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ════ LEFT: UNMARKED STUDENTS ════════════════════ */}
          <MotionDiv
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col"
            style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
          >
            <CardHeader
              icon={<UserCheck className="w-4 h-4" />}
              title="Unmarked Students"
              badge={
                subStuLoading
                  ? "…"
                  : totalUnmarked > 0
                    ? `${totalUnmarked} pending`
                    : "All marked ✓"
              }
            />

            {/* Search + select-all bar */}
            {!subStuLoading && unmarkedStudents.length > 0 && (
              <div className="px-4 pt-3.5 pb-2 flex items-center gap-x-3 border-b border-slate-100">
                {/* Custom checkbox (select all) */}
                <button
                  type="button"
                  onClick={toggleAll}
                  className="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    borderColor: allChecked
                      ? "#0D1B2E"
                      : someChecked
                        ? "#1E3A5F"
                        : "#CBD5E1",
                    background: allChecked
                      ? "#0D1B2E"
                      : someChecked
                        ? "#EEF2F8"
                        : "white",
                  }}
                  title={allChecked ? "Deselect all" : "Select all"}
                >
                  {allChecked && (
                    <CheckCheck className="w-3 h-3 text-[#C9A84C]" />
                  )}
                  {someChecked && !allChecked && (
                    <span className="w-2 h-0.5 rounded-full bg-[#1E3A5F] block" />
                  )}
                </button>

                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search student…"
                    value={searchUnmarked}
                    onChange={(e) => setSearchUnmarked(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-[#0D1B2E] placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] transition-all"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>

                {/* Checked count */}
                {checked.size > 0 && (
                  <span className="text-[11px] font-bold text-[#1E3A5F] whitespace-nowrap">
                    {checked.size} selected
                  </span>
                )}
              </div>
            )}

            {/* Student list */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 440 }}>
              {subStuLoading && <SkeletonRows />}

              {!subStuLoading && !selectedSubLevel && (
                <EmptyState
                  icon={<Users className="w-6 h-6" />}
                  message="No class selected"
                />
              )}

              {!subStuLoading &&
                unmarkedStudents.length === 0 &&
                !!selectedSubLevel && (
                  <EmptyState
                    icon={<CheckCircle2 className="w-6 h-6" />}
                    message="All students marked!"
                    sub="Every student in this class has been marked for today."
                  />
                )}

              {!subStuLoading &&
                filteredUnmarked.length === 0 &&
                searchUnmarked && (
                  <EmptyState
                    icon={<Search className="w-6 h-6" />}
                    message="No match found"
                    sub={`No student named "${searchUnmarked}"`}
                  />
                )}

              <AnimatePresence>
                {filteredUnmarked.map((student, i) => {
                  const isChecked = checked.has(student.studentId);
                  return (
                    <MotionDiv
                      key={student.studentId}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.025 }}
                      className={`flex items-center gap-x-3 px-4 py-3 border-b border-slate-100 transition-colors
                        ${isChecked ? "bg-[#EEF2F8]" : i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleCheck(student.studentId)}
                        className="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer"
                        style={{
                          borderColor: isChecked ? "#0D1B2E" : "#CBD5E1",
                          background: isChecked ? "#0D1B2E" : "white",
                        }}
                      >
                        {isChecked && (
                          <CheckCheck className="w-3 h-3 text-[#C9A84C]" />
                        )}
                      </button>

                      {/* Avatar + name */}
                      <div className="flex items-center gap-x-2.5 flex-1 min-w-0">
                        <InitialAvatar name={student.fullName} />
                        <span
                          className="text-sm font-semibold text-[#0D1B2E] truncate"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {student.fullName}
                        </span>
                      </div>

                      {/* Per-row "Mark Present" button */}
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => markOne(student)}
                        className="shrink-0 flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#1E3A5F] bg-[#EEF2F8] hover:bg-[#1E3A5F] hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark
                      </button>
                    </MotionDiv>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer actions */}
            {!subStuLoading && unmarkedStudents.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex gap-x-3">
                {/* Bulk mark selected */}
                <button
                  type="button"
                  disabled={checked.size === 0 || isPending}
                  onClick={markBulk}
                  className="flex-1 h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
                  }}
                >
                  {isPending && marking ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Marking…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A84C]" />
                      Mark Selected ({checked.size})
                    </>
                  )}
                </button>

                {/* Mark ALL */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={markAll}
                  className="h-10 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-x-2 transition-all disabled:opacity-40 cursor-pointer text-[#1E3A5F] bg-[#EEF2F8] hover:bg-[#1E3A5F] hover:text-white"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark All
                </button>
              </div>
            )}
          </MotionDiv>

          {/* ════ RIGHT: MARKED STUDENTS ═════════════════════ */}
          <MotionDiv
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col"
            style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
          >
            <CardHeader
              icon={<UserX className="w-4 h-4" />}
              title="Marked Students"
              badge={loadingMarked ? "…" : `${totalMarked} marked`}
            />

            {/* Date + search bar */}
            <div className="px-4 pt-3.5 pb-2 flex items-center gap-x-3 border-b border-slate-100">
              {/* Date display */}
              {selectedDate && (
                <div className="flex items-center gap-x-1.5 text-[11px] text-slate-500 font-bold shrink-0">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-300" />
                  {formatDate(selectedDate)}
                  {dayName && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full border text-[10px] ${dayBadgeClass}`}
                    >
                      {dayName}
                    </span>
                  )}
                </div>
              )}

              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search marked…"
                  value={searchMarked}
                  onChange={(e) => setSearchMarked(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-[#0D1B2E] placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
            </div>

            {/* Marked student list */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 440 }}>
              {loadingMarked && <SkeletonRows />}

              {!loadingMarked && totalMarked === 0 && (
                <EmptyState
                  icon={<TriangleAlert className="w-6 h-6" />}
                  message="No students marked yet"
                  sub="Students marked present will appear here"
                />
              )}

              {!loadingMarked &&
                filteredMarked.length === 0 &&
                searchMarked && (
                  <EmptyState
                    icon={<Search className="w-6 h-6" />}
                    message="No match"
                    sub={`No marked student named "${searchMarked}"`}
                  />
                )}

              <AnimatePresence>
                {filteredMarked.map((student, i) => (
                  <MotionDiv
                    key={student.studentAttendanceId}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.025 }}
                    className={`flex items-center gap-x-3 px-4 py-3 border-b border-slate-100
                      ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-x-2.5 flex-1 min-w-0">
                      <InitialAvatar name={student.studentFullName} />
                      <span
                        className="text-sm font-semibold text-[#0D1B2E] truncate"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {student.studentFullName}
                      </span>
                    </div>

                    {/* Status pill */}
                    <StatusPill status={student.status} />

                    {/* Mark Absent action */}
                    {student.status === "Present" && (
                      <Popconfirm
                        title="Mark this student absent?"
                        description="This will change their status from Present to Absent."
                        okText="Mark Absent"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true, size: "small" }}
                        cancelButtonProps={{ size: "small" }}
                        onConfirm={() =>
                          markAbsent(student.studentAttendanceId)
                        }
                      >
                        <button
                          type="button"
                          disabled={isPending}
                          className="shrink-0 flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Absent
                        </button>
                      </Popconfirm>
                    )}
                  </MotionDiv>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer: present / absent tally */}
            {!loadingMarked && totalMarked > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center gap-x-4">
                <div className="flex items-center gap-x-1.5 text-xs font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {presentCount} present
                </div>
                <div className="flex items-center gap-x-1.5 text-xs font-bold text-rose-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {absentCount} absent
                </div>
                <div className="ml-auto text-[11px] text-slate-400 font-medium">
                  {totalStudents > 0
                    ? `${Math.round((presentCount / totalStudents) * 100)}% present`
                    : ""}
                </div>
              </div>
            )}
          </MotionDiv>
        </div>
      )}
    </div>
  );
};
export default MarkAttendance;
