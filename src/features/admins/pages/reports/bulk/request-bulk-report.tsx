/**
 * BulkReportPrint.tsx  (Admin)
 *
 * Four print modes — the user selects one, fills its form, and fires the job:
 *
 *  1. ENTIRE SCHOOL  — academicYearId + academicTermId (no sub-level)
 *  2. ENTIRE CLASS   — academicYearId + academicTermId + subLevelId
 *  3. SELECTED CLASSES — academicYearId + academicTermId + subLevelIds[]
 *  4. SELECTED STUDENTS — academicYearId + academicTermId + studentIds[]
 *                          (students searchable/selectable from a sub-level)
 *
 * Backend contract:
 *  POST /reports/bulk
 *  Body: BulkReportPayload
 *  Response: Blob (application/pdf) — streamed PDF, saved as file download
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  PAGE HEADER + breadcrumb                                        │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  MODE SELECTOR  (4 large radio cards)                           │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  CONFIGURATION CARD  (changes per mode)                         │
 * │  Year → Term → [Sub-level / Students depending on mode]         │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  SUMMARY + GENERATE BUTTON                                       │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  JOB HISTORY (in-session list of completed / failed jobs)       │
 * └──────────────────────────────────────────────────────────────────┘
 */

import { Select, Popconfirm } from "antd";
import { useCallback, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  School,
  Layers,
  Users,
  UserCheck,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  X,
  Trash2,
  AlertTriangle,
  Hash,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import useFetch from "@/hooks/api/use-fetch";
import { eduKeys, termKeys, yearKeys } from "@/config/query-keys";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { getAllYearsFn, getTermsByEduIdFn } from "@/services/setup/year-n-term";
import { getAllSubLevelsFn } from "@/services/setup/sublevel";
import { getClassReport } from "@/services/report";

interface StudentOption {
  studentId: string;
  fullName: string;
  subLevelName?: string;
}

export interface BulkReportPayload {
  academicYearId: string;
  academicTermId: string;
  mode: PrintMode;
  subLevelIds?: string[];
  studentIds?: string[];
}

type PrintMode = "school" | "class" | "classes" | "students";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface JobRecord {
  id: string;
  mode: PrintMode;
  label: string;
  status: "pending" | "done" | "error";
  createdAt: Date;
  blobUrl?: string;
  error?: string;
  count?: number; // estimated student count
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const MODE_CONFIG: Record<
  PrintMode,
  {
    label: string;
    description: string;
    icon: React.ReactNode;
    color: {
      ring: string;
      iconBg: string;
      iconText: string;
      bg: string;
      border: string;
    };
    disabled?: boolean;
    warning?: string;
  }
> = {
  school: {
    label: "Entire School",
    description:
      "Generate reports for every student in the school for the selected term",
    icon: <School className="w-5 h-5" />,
    color: {
      ring: "ring-violet-400/60",
      iconBg: "bg-violet-100",
      iconText: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-300",
    },
    disabled: true,
    warning:
      "This may generate a very large PDF. Ensure you have a stable connection.",
  },
  class: {
    label: "Entire Class",
    description: "Generate reports for all students in one specific sub-level",
    icon: <Layers className="w-5 h-5" />,
    color: {
      ring: "ring-blue-400/60",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-300",
    },
  },
  classes: {
    label: "Selected Classes",
    description: "Choose multiple sub-levels and generate a combined report",
    icon: <Users className="w-5 h-5" />,
    color: {
      ring: "ring-cyan-400/60",
      iconBg: "bg-cyan-100",
      iconText: "text-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-300",
    },
    disabled: true,
  },
  students: {
    label: "Selected Students",
    description:
      "Hand-pick individual students across any class for their reports",
    icon: <UserCheck className="w-5 h-5" />,
    color: {
      ring: "ring-emerald-400/60",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-300",
    },
    disabled: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

const FL = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label
    className="flex items-center gap-x-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    {children}
    {required && <span className="text-rose-400 text-[10px]">*</span>}
  </label>
);

const CardHeader = ({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string | number;
}) => (
  <div
    className="flex items-center gap-x-3 px-5 py-3.5"
    style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)" }}
  >
    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
      {icon}
    </div>
    <span
      className="text-white font-semibold text-sm flex-1"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {title}
    </span>
    {badge !== undefined && (
      <span className="text-[10px] font-bold text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </div>
);

// ─── Mode selector card ───────────────────────────────────────────────────────
const ModeCard = ({
  mode,
  selected,
  onClick,
}: {
  mode: PrintMode;
  selected: boolean;
  onClick: () => void;
}) => {
  const cfg = MODE_CONFIG[mode];
  return (
    <button
      type="button"
      disabled={cfg.disabled}
      onClick={onClick}
      className={`flex flex-col items-start gap-y-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer w-full
        ${
          selected
            ? `${cfg.color.border} ${cfg.color.bg} ring-2 ${cfg.color.ring}`
            : `border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-45`
        }`}
      style={{
        boxShadow: selected ? "0 4px 16px rgba(13,27,46,0.08)" : undefined,
      }}
    >
      <div className="flex items-center gap-x-3 w-full">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all
          ${selected ? `${cfg.color.iconBg} ${cfg.color.iconText}` : "bg-slate-100 text-slate-400"}`}
        >
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`font-bold text-sm leading-tight transition-colors
            ${selected ? "text-[#0D1B2E]" : "text-slate-600"}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {cfg.label}
          </p>
        </div>
        {/* Radio dot */}
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
          ${selected ? "border-[#1E3A5F] bg-[#1E3A5F]" : "border-slate-300"}`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />}
        </div>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        {cfg.description}
      </p>
    </button>
  );
};

// ─── Student chip (for selected students list) ────────────────────────────────
const StudentChip = ({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) => (
  <span className="inline-flex items-center gap-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#EEF2F8] border border-[#D0DCF0] text-[11px] font-bold text-[#1E3A5F] max-w-50">
    <span className="truncate">{name}</span>
    <button
      type="button"
      onClick={onRemove}
      className="shrink-0 hover:text-rose-500 transition-colors cursor-pointer"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

// ─── Job status row ───────────────────────────────────────────────────────────
const JobRow = ({
  job,
  onDownload,
  onRemove,
}: {
  job: JobRecord;
  onDownload: (job: JobRecord) => void;
  onRemove: (id: string) => void;
}) => {
  const cfg = MODE_CONFIG[job.mode];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-x-3 p-3.5 rounded-xl border transition-all
        ${
          job.status === "done"
            ? "bg-emerald-50 border-emerald-200"
            : job.status === "error"
              ? "bg-rose-50 border-rose-200"
              : "bg-[#EEF2F8] border-[#D0DCF0]"
        }`}
    >
      {/* Mode icon */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.color.iconBg} ${cfg.color.iconText}`}
      >
        {cfg.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-bold text-[#0D1B2E] truncate"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {job.label}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {cfg.label} ·{" "}
          {job.createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {job.count !== undefined && ` · ${job.count} students`}
        </p>
      </div>

      {/* Status badge */}
      <span
        className={`flex items-center gap-x-1 text-[10px] font-bold px-2 py-1 rounded-full shrink-0
        ${
          job.status === "done"
            ? "bg-emerald-100 text-emerald-700"
            : job.status === "error"
              ? "bg-rose-100 text-rose-700"
              : "bg-[#EEF2F8] text-[#1E3A5F]"
        }`}
      >
        {job.status === "done" && (
          <>
            <CheckCircle2 className="w-3 h-3" />
            Ready
          </>
        )}
        {job.status === "error" && (
          <>
            <XCircle className="w-3 h-3" />
            Failed
          </>
        )}
        {job.status === "pending" && (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Working…
          </>
        )}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-x-1.5 shrink-0">
        {job.status === "done" && job.blobUrl && (
          <button
            type="button"
            onClick={() => onDownload(job)}
            className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer hover:opacity-90 transition-all"
            style={{
              background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
            }}
          >
            <Download className="w-3.5 h-3.5 text-[#C9A84C]" />
            Download
          </button>
        )}
        {job.status === "error" && job.error && (
          <span
            className="text-[10px] text-rose-600 max-w-40 truncate"
            title={job.error}
          >
            {job.error}
          </span>
        )}
        <button
          type="button"
          onClick={() => onRemove(job.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-rose-500 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const RequestBulkReport = () => {
  // ── Mode ──────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<PrintMode>("class");

  // ── Common selects ─────────────────────────────────────────────────────────
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedEduId, setSelectedEduId] = useState<string | null>(null);

  // Mode-specific
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null); // class mode
  const [selectedSubIds, setSelectedSubIds] = useState<Set<string>>(new Set()); // classes mode
  const [pickSubId, setPickSubId] = useState<string | null>(null); // students mode — which class to pick from
  const [selectedStudIds, setSelectedStudIds] = useState<Set<string>>(
    new Set(),
  ); // students mode
  const [studentSearch, setStudentSearch] = useState("");

  // ── Jobs ───────────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [configOpen, setConfigOpen] = useState(true);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: eduLevels = [], isLoading: loadingEdu } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  const { data: years = [], isLoading: loadingYears } = useFetch({
    queryKeys: yearKeys.list(),
    queryFn: getAllYearsFn,
  });

  const { data: terms = [], isLoading: loadingTerms } = useFetch({
    queryFn: () => getTermsByEduIdFn(selectedEduId!),
    queryKeys: termKeys.custom("edu-terms", { eduId: selectedEduId }),
    enabled: !!selectedEduId,
  });

  // Sub-levels — used for class, classes, and students modes
  const { data: subLevels = [], isLoading: loadingSubs } = useFetch({
    queryFn: getAllSubLevelsFn,
    queryKeys: eduKeys.sublevels(),
  });

  const allStudents: StudentOption[] = useMemo(() => [], []);
  const loadingStudents = false;

  // ── Mutation ───────────────────────────────────────────────────────────────
  const generateReports = useMutation({
    mutationFn: getClassReport,
    onMutate: ({ mode: m, academicTermId, subLevelIds, studentIds }) => {
      const termName =
        terms.find((t) => t.academicTermId === academicTermId)
          ?.academicTermName ?? "";
      const label =
        m === "school"
          ? `Entire School — ${termName}`
          : m === "class"
            ? `${subLevels.find((s) => s.subLevelId === selectedSubId)?.subLevelName ?? ""} — ${termName}`
            : m === "classes"
              ? `${subLevelIds?.length} classes — ${termName}`
              : `${studentIds?.length} students — ${termName}`;
      const jobId = crypto.randomUUID();
      const newJob: JobRecord = {
        id: jobId,
        mode: m,
        label,
        status: "pending",
        createdAt: new Date(),
        count: m === "students" ? studentIds?.length : undefined,
      };
      setJobs((prev) => [newJob, ...prev]);
      return { jobId };
    },
    onSuccess: (result, _vars, ctx) => {
      try {
        const { blob, fileName } = result;

        const url = URL.createObjectURL(blob);

        setJobs((prev) =>
          prev.map((j) =>
            j.id === ctx?.jobId
              ? {
                  ...j,
                  status: "done",
                  blobUrl: url,
                  fileName,
                }
              : j,
          ),
        );

        toast.success("Reports generated — click Download.");
      } catch (err) {
        console.error(err);
      }
    },
    onError: (err: AxiosError, _vars, ctx) => {
      const msg = err.message || "An error occurred";
      setJobs((prev) =>
        prev.map((j) =>
          j.id === ctx?.jobId ? { ...j, status: "error", error: msg } : j,
        ),
      );
      toast.error("Report generation failed", { description: msg });
    },
  });

  // ── Derived validation ─────────────────────────────────────────────────────
  const isTermReady = !!selectedYearId && !!selectedTermId;
  const isValid = useMemo(() => {
    if (!isTermReady) return false;
    if (mode === "school") return true;
    if (mode === "class") return !!selectedSubId;
    if (mode === "classes") return selectedSubIds.size > 0;
    if (mode === "students") return selectedStudIds.size > 0;
    return false;
  }, [isTermReady, mode, selectedSubId, selectedSubIds, selectedStudIds]);

  // ── Summary label ──────────────────────────────────────────────────────────
  const summaryText = useMemo(() => {
    const year = years.find((y) => y.academicYearId === selectedYearId);
    const yearName = year ? `${year?.startYear}-${year?.endYear}` : "-";
    const termName =
      terms.find((t) => t.academicTermId === selectedTermId)
        ?.academicTermName ?? "—";
    if (!isTermReady) return "Configure year and term first.";
    if (mode === "school") return `All students · ${yearName} · ${termName}`;
    if (mode === "class")
      return selectedSubId
        ? `${subLevels.find((s) => s.subLevelId === selectedSubId)?.subLevelName ?? "—"} · ${yearName} · ${termName}`
        : "Select a class.";
    if (mode === "classes")
      return selectedSubIds.size > 0
        ? `${selectedSubIds.size} class${selectedSubIds.size > 1 ? "es" : ""} · ${yearName} · ${termName}`
        : "Select at least one class.";
    if (mode === "students")
      return selectedStudIds.size > 0
        ? `${selectedStudIds.size} student${selectedStudIds.size > 1 ? "s" : ""} · ${yearName} · ${termName}`
        : "Select at least one student.";
    return "";
  }, [
    mode,
    selectedYearId,
    selectedTermId,
    selectedSubId,
    selectedSubIds,
    selectedStudIds,
    years,
    terms,
    subLevels,
    isTermReady,
  ]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!selectedYearId || !selectedTermId) return;
    const payload: BulkReportPayload = {
      academicYearId: selectedYearId,
      academicTermId: selectedTermId,
      mode,
      ...(mode === "class" && { subLevelIds: [selectedSubId!] }),
      ...(mode === "classes" && { subLevelIds: Array.from(selectedSubIds) }),
      ...(mode === "students" && { studentIds: Array.from(selectedStudIds) }),
    };
    generateReports.mutate(payload);
  };

  const handleDownload = useCallback((job: JobRecord) => {
    if (!job.blobUrl || !downloadLinkRef.current) return;

    const a = downloadLinkRef.current;

    a.href = job.blobUrl;

    a.download = `${job.label.replace(/[^a-zA-Z0-9_\-. ]/g, "_")}.pdf`;

    a.click();

    // Cleanup memory after download
    setTimeout(() => {
      URL.revokeObjectURL(job.blobUrl!);
    }, 1000);
  }, []);

  const removeJob = (id: string) => {
    setJobs((prev) => {
      const job = prev.find((j) => j.id === id);
      if (job?.blobUrl) URL.revokeObjectURL(job.blobUrl);
      return prev.filter((j) => j.id !== id);
    });
  };

  const resetSelections = () => {
    setSelectedYearId(null);
    setSelectedTermId(null);
    setSelectedEduId(null);
    setSelectedSubId(null);
    setSelectedSubIds(new Set());
    setPickSubId(null);
    setSelectedStudIds(new Set());
    setStudentSearch("");
  };

  // Toggle sub-level in multi-select
  const toggleSubLevel = (id: string) => {
    setSelectedSubIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle student
  const toggleStudent = (id: string) => {
    setSelectedStudIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return allStudents;
    const q = studentSearch.toLowerCase();
    return allStudents.filter((s) => s.fullName.toLowerCase().includes(q));
  }, [allStudents, studentSearch]);

  const pendingJob = jobs.find((j) => j.status === "pending");
  const isPending = generateReports.isPending || !!pendingJob;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* Hidden download anchor */}
      <a ref={downloadLinkRef} className="hidden" aria-hidden="true" />

      <div className="flex flex-col gap-y-5">
        {/* ── MODE SELECTOR ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <CardHeader
            icon={<Printer className="w-4 h-4" />}
            title="Select Print Mode"
          />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {(["school", "class", "classes", "students"] as PrintMode[]).map(
              (m) => (
                <ModeCard
                  key={m}
                  mode={m}
                  selected={mode === m}
                  onClick={() => {
                    setMode(m);
                    resetSelections();
                  }}
                />
              ),
            )}
          </div>
        </motion.div>

        {/* ── CONFIGURATION CARD ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          {/* Collapsible header */}
          <button
            type="button"
            className="w-full text-left"
            onClick={() => setConfigOpen((v) => !v)}
          >
            <div
              className="flex items-center gap-x-3 px-5 py-3.5"
              style={{
                background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
              }}
            >
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
                {MODE_CONFIG[mode].icon}
              </div>
              <span
                className="text-white font-semibold text-sm flex-1"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {MODE_CONFIG[mode].label} — Configuration
              </span>
              {!configOpen && isValid && (
                <span className="text-[10px] font-bold text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full">
                  Ready ✓
                </span>
              )}
              {configOpen ? (
                <ChevronUp className="w-4 h-4 text-white/50" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/50" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {configOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="p-5 flex flex-col gap-y-5">
                  {/* Warning banner (school mode) */}
                  {MODE_CONFIG[mode].warning && (
                    <div className="flex items-start gap-x-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-amber-700 leading-relaxed">
                        {MODE_CONFIG[mode].warning}
                      </p>
                    </div>
                  )}

                  {/* Step 1. Educational level (needed to load sub-levels) */}
                  <div>
                    <div className="flex items-center gap-x-2 mb-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#C9A84C] flex items-center justify-center text-[10px] font-black text-[#C9A84C] shrink-0">
                        1
                      </div>
                      <p className="text-xs font-bold text-[#0D1B2E] uppercase tracking-wider">
                        Educational Level
                      </p>
                    </div>
                    {(mode === "class" ||
                      mode === "classes" ||
                      mode === "students") && (
                      <div className="mb-4">
                        <Select
                          size="large"
                          className="w-full"
                          showSearch
                          filterOption={(inp, o) =>
                            String(o?.label ?? "")
                              .toLowerCase()
                              .includes(inp.toLowerCase())
                          }
                          placeholder="Select educational level…"
                          loading={loadingEdu}
                          disabled={loadingEdu || isPending}
                          options={eduLevels.map((e) => ({
                            label: e.educationalLevelName,
                            value: e.educationalLevelId,
                          }))}
                          value={selectedEduId ?? undefined}
                          onChange={(id) => {
                            setSelectedEduId(id);
                            setSelectedSubId(null);
                            setSelectedSubIds(new Set());
                            setPickSubId(null);
                            setSelectedStudIds(new Set());
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* ── Step 2: Academic Year + Term (all modes) ── */}
                  <div>
                    <div className="flex items-center gap-x-2 mb-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#C9A84C] flex items-center justify-center text-[10px] font-black text-[#C9A84C] shrink-0">
                        2
                      </div>
                      <p className="text-xs font-bold text-[#0D1B2E] uppercase tracking-wider">
                        Academic Period
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FL required>Academic Year</FL>
                        <Select
                          size="large"
                          className="w-full"
                          showSearch
                          filterOption={(inp, o) =>
                            String(o?.label ?? "")
                              .toLowerCase()
                              .includes(inp.toLowerCase())
                          }
                          placeholder="Select year…"
                          loading={loadingYears}
                          disabled={loadingYears || isPending}
                          options={years.map((y) => ({
                            label: `${y.startYear}-${y.endYear}`,
                            value: y.academicYearId,
                          }))}
                          value={selectedYearId ?? undefined}
                          onChange={(id) => {
                            setSelectedYearId(id);
                            setSelectedTermId(null);
                          }}
                        />
                      </div>
                      <div>
                        <FL required>Academic Term</FL>
                        <Select
                          size="large"
                          className="w-full"
                          showSearch
                          filterOption={(inp, o) =>
                            String(o?.label ?? "")
                              .toLowerCase()
                              .includes(inp.toLowerCase())
                          }
                          placeholder={
                            selectedEduId
                              ? "Select term…"
                              : "Select educational level first"
                          }
                          loading={loadingTerms}
                          disabled={!selectedEduId || loadingTerms || isPending}
                          options={terms.map((t) => ({
                            label: t.academicTermName,
                            value: t.academicTermId,
                          }))}
                          value={selectedTermId ?? undefined}
                          onChange={setSelectedTermId}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Step 2: Mode-specific fields ── */}
                  <AnimatePresence mode="wait">
                    {mode !== "school" && (
                      <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-x-2 mb-3">
                          <div className="w-5 h-5 rounded-full border-2 border-[#C9A84C] flex items-center justify-center text-[10px] font-black text-[#C9A84C] shrink-0">
                            3
                          </div>
                          <p className="text-xs font-bold text-[#0D1B2E] uppercase tracking-wider">
                            {mode === "class"
                              ? "Select Class"
                              : mode === "classes"
                                ? "Select Classes"
                                : "Select Students"}
                          </p>
                        </div>

                        {/* ─── CLASS mode: single sub-level ─── */}
                        {mode === "class" && (
                          <div>
                            <FL required>Class / Sub-Level</FL>
                            <Select
                              size="large"
                              className="w-full"
                              showSearch
                              filterOption={(inp, o) =>
                                String(o?.label ?? "")
                                  .toLowerCase()
                                  .includes(inp.toLowerCase())
                              }
                              placeholder={
                                selectedEduId
                                  ? "Select class…"
                                  : "Select level first"
                              }
                              loading={loadingSubs}
                              disabled={
                                !selectedEduId || loadingSubs || isPending
                              }
                              options={subLevels.map((s) => ({
                                label: s.subLevelName,
                                value: s.subLevelId,
                              }))}
                              value={selectedSubId ?? undefined}
                              onChange={setSelectedSubId}
                            />
                          </div>
                        )}

                        {/* ─── CLASSES mode: multi sub-level chip grid ─── */}
                        {mode === "classes" && selectedEduId && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <FL>
                                Classes{" "}
                                <span className="text-[10px] font-normal normal-case text-slate-300">
                                  ({selectedSubIds.size} selected)
                                </span>
                              </FL>
                              {subLevels.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      selectedSubIds.size === subLevels.length
                                    )
                                      setSelectedSubIds(new Set());
                                    else
                                      setSelectedSubIds(
                                        new Set(
                                          subLevels.map((s) => s.subLevelId),
                                        ),
                                      );
                                  }}
                                  className="text-[11px] font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-colors cursor-pointer"
                                >
                                  {selectedSubIds.size === subLevels.length
                                    ? "Deselect all"
                                    : "Select all"}
                                </button>
                              )}
                            </div>
                            {loadingSubs ? (
                              <div className="flex gap-x-2">
                                {[1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className="h-9 w-24 bg-slate-100 rounded-xl animate-pulse"
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {subLevels.map((sub) => {
                                  const sel = selectedSubIds.has(
                                    sub.subLevelId,
                                  );
                                  return (
                                    <button
                                      key={sub.subLevelId}
                                      type="button"
                                      onClick={() =>
                                        toggleSubLevel(sub.subLevelId)
                                      }
                                      disabled={isPending}
                                      className={`inline-flex items-center gap-x-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer
                                        ${
                                          sel
                                            ? "text-[#C9A84C] border-[#0D1B2E]"
                                            : "text-slate-600 bg-white border-slate-200 hover:border-slate-300"
                                        }`}
                                      style={
                                        sel
                                          ? {
                                              background:
                                                "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                                            }
                                          : {}
                                      }
                                    >
                                      {sel ? (
                                        <CheckCircle2 className="w-3 h-3" />
                                      ) : (
                                        <Hash className="w-3 h-3 opacity-40" />
                                      )}
                                      {sub.subLevelName}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* ─── STUDENTS mode: pick class → search + select ─── */}
                        {mode === "students" && selectedEduId && (
                          <div className="flex flex-col gap-y-4">
                            {/* Pick source class */}
                            <div>
                              <FL>Pick students from class</FL>
                              <Select
                                size="large"
                                className="w-full"
                                showSearch
                                filterOption={(inp, o) =>
                                  String(o?.label ?? "")
                                    .toLowerCase()
                                    .includes(inp.toLowerCase())
                                }
                                placeholder={
                                  selectedEduId
                                    ? "Select a class to browse students…"
                                    : "Select level first"
                                }
                                loading={loadingSubs}
                                disabled={
                                  !selectedEduId || loadingSubs || isPending
                                }
                                options={subLevels.map((s) => ({
                                  label: s.subLevelName,
                                  value: s.subLevelId,
                                }))}
                                value={pickSubId ?? undefined}
                                onChange={(id) => {
                                  setPickSubId(id);
                                  setStudentSearch("");
                                }}
                              />
                              <p className="text-[10px] text-slate-400 mt-1.5">
                                You can pick from multiple classes — switch
                                classes after selecting.
                              </p>
                            </div>

                            {/* Search + student list */}
                            {pickSubId && (
                              <div>
                                <div className="relative mb-2">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                  <input
                                    type="text"
                                    placeholder="Search student name…"
                                    value={studentSearch}
                                    onChange={(e) =>
                                      setStudentSearch(e.target.value)
                                    }
                                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
                                    style={{
                                      fontFamily: "'DM Sans', sans-serif",
                                    }}
                                  />
                                </div>

                                {loadingStudents ? (
                                  <div className="flex flex-col gap-y-2">
                                    {[1, 2, 3, 4].map((i) => (
                                      <div
                                        key={i}
                                        className="h-10 bg-slate-100 rounded-xl animate-pulse"
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="max-h-52 overflow-y-auto flex flex-col gap-y-1 rounded-xl border border-slate-200 p-1.5">
                                    {filteredStudents.length === 0 && (
                                      <p className="text-center text-xs text-slate-400 py-4">
                                        No students found
                                      </p>
                                    )}
                                    {filteredStudents.map((stu) => {
                                      const sel = selectedStudIds.has(
                                        stu.studentId,
                                      );
                                      return (
                                        <button
                                          key={stu.studentId}
                                          type="button"
                                          onClick={() =>
                                            toggleStudent(stu.studentId)
                                          }
                                          disabled={isPending}
                                          className={`flex items-center gap-x-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer w-full
                                            ${sel ? "bg-[#EEF2F8] border border-[#D0DCF0]" : "hover:bg-slate-50 border border-transparent"}`}
                                        >
                                          {/* Checkbox */}
                                          <div
                                            className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                                            ${sel ? "border-[#0D1B2E] bg-[#0D1B2E]" : "border-slate-300"}`}
                                            style={{
                                              width: 18,
                                              height: 18,
                                              borderRadius: 6,
                                            }}
                                          >
                                            {sel && (
                                              <CheckCircle2 className="w-3 h-3 text-[#C9A84C]" />
                                            )}
                                          </div>
                                          {/* Avatar */}
                                          <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#C9A84C] font-bold text-[10px] shrink-0"
                                            style={{
                                              background:
                                                "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                                            }}
                                          >
                                            {stu.fullName
                                              .split(" ")
                                              .slice(0, 2)
                                              .map(
                                                (n) =>
                                                  n[0]?.toUpperCase() ?? "",
                                              )
                                              .join("")}
                                          </div>
                                          <span className="text-sm font-semibold text-[#0D1B2E] truncate">
                                            {stu.fullName}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Selected students chips */}
                            {selectedStudIds.size > 0 && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <FL>
                                    {selectedStudIds.size} student
                                    {selectedStudIds.size !== 1 ? "s" : ""}{" "}
                                    selected
                                  </FL>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedStudIds(new Set())
                                    }
                                    className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                                  >
                                    Clear all
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {Array.from(selectedStudIds).map((id) => {
                                    const stu = allStudents.find(
                                      (s) => s.studentId === id,
                                    );
                                    return stu ? (
                                      <StudentChip
                                        key={id}
                                        name={stu.fullName}
                                        onRemove={() => toggleStudent(id)}
                                      />
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── SUMMARY + GENERATE ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <div
            className={`px-5 pt-5 pb-4 ${isValid ? "border-b border-slate-100" : ""}`}
          >
            {/* Summary */}
            <div className="flex items-start gap-x-3 mb-4">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${MODE_CONFIG[mode].color.iconBg} ${MODE_CONFIG[mode].color.iconText}`}
              >
                {MODE_CONFIG[mode].icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#0D1B2E] uppercase tracking-wider mb-0.5">
                  Print Summary
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {summaryText}
                </p>
              </div>
            </div>

            {/* Validation pills */}
            {!isValid && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {!selectedYearId && (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                    Select academic year
                  </span>
                )}
                {selectedYearId && !selectedTermId && (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                    Select term
                  </span>
                )}
                {mode === "class" && isTermReady && !selectedSubId && (
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    Select a class
                  </span>
                )}
                {mode === "classes" &&
                  isTermReady &&
                  selectedSubIds.size === 0 && (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      Select at least one class
                    </span>
                  )}
                {mode === "students" &&
                  isTermReady &&
                  selectedStudIds.size === 0 && (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      Select at least one student
                    </span>
                  )}
              </div>
            )}

            {/* Generate button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!isValid || isPending}
              className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-x-3 transition-all
                ${
                  isValid && !isPending
                    ? "text-white hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-[0_4px_20px_rgba(13,27,46,0.2)]"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              style={
                isValid && !isPending
                  ? {
                      background:
                        "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                    }
                  : {}
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#C9A84C]" />
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                    }}
                  >
                    Generating Reports…
                  </span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 text-[#C9A84C]" />
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1rem",
                    }}
                  >
                    Generate &amp; Download PDF
                  </span>
                  {isValid && (
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]/70" />
                  )}
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 mt-2.5">
              {isValid
                ? "The backend will compile all reports into a single PDF file."
                : "Complete the required fields above to enable generation."}
            </p>
          </div>
        </motion.div>

        {/* ── JOB HISTORY ──────────────────────────────────────────── */}
        {jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
          >
            <CardHeader
              icon={<Clock className="w-4 h-4" />}
              title="Job History"
              badge={`${jobs.length} job${jobs.length !== 1 ? "s" : ""}`}
            />
            <div className="p-4 flex flex-col gap-y-2">
              <AnimatePresence mode="popLayout">
                {jobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onDownload={handleDownload}
                    onRemove={removeJob}
                  />
                ))}
              </AnimatePresence>
            </div>
            {jobs.length > 0 && (
              <div className="px-4 pb-4">
                <Popconfirm
                  title="Clear all job history?"
                  okText="Clear all"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true, size: "small" }}
                  onConfirm={() => {
                    jobs.forEach((j) => {
                      if (j.blobUrl) URL.revokeObjectURL(j.blobUrl);
                    });
                    setJobs([]);
                  }}
                >
                  <button
                    type="button"
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    Clear all history
                  </button>
                </Popconfirm>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RequestBulkReport;
