import { MotionDiv } from "@/components/custom/motion";
import { useAuth } from "@/store/auth.store";
import {
  GraduationCap,
  CalendarX,
  CalendarCheck,
  BookOpen,
  FileText,
  Settings2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Info,
  Hash,
  BadgeCheck,
  Receipt,
  ChevronDown,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useActiveTerm } from "@/hooks/use-active-term";
import useFetch from "@/hooks/api/use-fetch";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { eduKeys, termKeys, yearKeys } from "@/config/query-keys";
import {
  closeAcademicTermFn,
  getAllYearsFn,
  getTermsFromStateByEduId,
} from "@/services/setup/year-n-term";
import { Checkbox, Select } from "antd";
import { AnimatePresence } from "motion/react";
import type { CloseTermPayload } from "@/types/api/setup/year-n-term";
import usePost from "@/hooks/api/use-post";
import { signalRSelectors, useSignalRStore } from "@/store/signalr.store";
import { redactString } from "@/utils/string";

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

/** Section card with gradient header and step badge */
const Section = ({
  step,
  icon,
  title,
  subtitle,
  children,
  locked,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  locked?: boolean;
}) => (
  <MotionDiv
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: step * 0.06 }}
    className={`bg-white rounded-2xl border overflow-hidden transition-all
      ${
        locked
          ? "border-slate-100 opacity-60 shadow-none"
          : "border-slate-200 shadow-[0_2px_12px_rgba(13,27,46,0.06)]"
      }`}
  >
    <div
      className="flex items-center gap-x-3 px-5 py-3.5"
      style={{
        background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
      }}
    >
      <div className="w-6 h-6 rounded-full border-2 border-[#C9A84C]/60 flex items-center justify-center text-[#C9A84C] text-[10px] font-black shrink-0">
        {step}
      </div>
      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p
          className="text-white font-semibold text-sm leading-tight"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-white/50 text-[11px] mt-0.5">{subtitle}</p>
        )}
      </div>
      {locked && <Lock className="w-3.5 h-3.5 text-white/30" />}
    </div>
    <div className="p-5">{children}</div>
  </MotionDiv>
);

/** Field label */
export const FL = ({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) => (
  <div className="flex items-center justify-between mb-1.5">
    <label
      className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </label>
    {optional && (
      <span className="text-[10px] font-medium text-slate-300 italic">
        Optional
      </span>
    )}
  </div>
);

/** Styled text input */
export const TextInput = ({
  value,
  onChange,
  placeholder,
  maxLength,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    maxLength={maxLength}
    disabled={disabled}
    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0D1B2E] placeholder:text-slate-300
      focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  />
);

/** Styled textarea */
export const TextArea = ({
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 3,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
}) => (
  <div className="relative">
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={rows}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#0D1B2E] placeholder:text-slate-300
        focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    />
    {maxLength && (
      <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-300 font-medium pointer-events-none">
        {value?.length || 0}/{maxLength}
      </span>
    )}
  </div>
);

/** Chip showing the active term that will be closed */
const ActiveTermChip = ({
  termName,
  termId,
  yearName,
}: {
  termName: string;
  termId: string;
  yearName?: string;
}) => (
  <MotionDiv
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center gap-x-3 p-3.5 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl"
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)" }}
    >
      <BadgeCheck className="w-4 h-4 text-[#C9A84C]" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-x-2 flex-wrap">
        <p
          className="text-sm font-bold text-[#0D1B2E] truncate"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {termName}
        </p>
        <span className="text-[9px] font-black tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full uppercase shrink-0">
          Active
        </span>
      </div>
      {yearName && (
        <p className="text-[11px] text-slate-500 mt-0.5">{yearName}</p>
      )}
      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
        {redactString(termId, { visibleStart: 5 })}
      </p>
    </div>
  </MotionDiv>
);

/** Warning when no active term exists for selected edu level */
const NoActiveTerm = () => (
  <MotionDiv
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-start gap-x-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl"
  >
    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
    <div>
      <p className="text-xs font-bold text-amber-700">No active term found</p>
      <p className="text-[11px] text-amber-600 mt-0.5 leading-relaxed">
        This educational level has no active academic term. Please activate a
        term for it before you can close one.
      </p>
    </div>
  </MotionDiv>
);

/** Toggle setting row */
export const SettingToggle = ({
  icon,
  label,
  description,
  value,
  onChange,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  accent?: boolean;
}) => (
  <div
    onClick={() => onChange(!value)}
    className={`flex items-center gap-x-4 p-4 rounded-xl border transition-all cursor-pointer select-none
      ${
        value
          ? accent
            ? "bg-amber-50 border-amber-200"
            : "bg-[#EEF2F8] border-[#D0DCF0]"
          : "bg-slate-50 border-slate-200 hover:border-slate-300"
      }`}
  >
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all
      ${
        value
          ? accent
            ? "bg-amber-100 text-amber-600"
            : "text-[#C9A84C]"
          : "bg-white border border-slate-200 text-slate-400"
      }`}
      style={
        value && !accent
          ? { background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)" }
          : {}
      }
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className={`text-sm font-bold ${value ? (accent ? "text-amber-700" : "text-[#0D1B2E]") : "text-slate-500"}`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
        {description}
      </p>
    </div>
    <div className="shrink-0">
      {value ? (
        <ToggleRight
          className={`w-7 h-7 ${accent ? "text-amber-500" : "text-[#1E3A5F]"}`}
        />
      ) : (
        <ToggleLeft className="w-7 h-7 text-slate-300" />
      )}
    </div>
  </div>
);

/** Review summary pill */
export const ReviewPill = ({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center gap-x-2.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl min-w-0">
    <span className="text-slate-400 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">
        {label}
      </p>
      <p
        className="text-xs font-bold text-[#0D1B2E] truncate mt-0.5"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {value ?? (
          <span className="text-slate-300 font-normal italic">Not set</span>
        )}
      </p>
    </div>
  </div>
);

const CloseAcademicTerm = () => {
  const year = useSignalRStore(signalRSelectors.academicYear);
  const academicYearId = year?.academicYearId;
  const userId = useAuth((s) => s.user?.userId);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [selectedEduLevelId, setSelectedEduLevelId] = useState<string | null>(
    null,
  );
  const [vacationName, setVacationName] = useState("");
  const [useActiveYear, SetUseActiveyear] = useState(true);
  const [reOpeningYearId, setReOpeningYearId] = useState(academicYearId);
  const [reOpeningTermId, setReOpeningTermId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [notice, setNotice] = useState("");
  const [optionalOpen, setOptionalOpen] = useState(true);
  const [settings, setSettings] = useState({
    publishReport: true,
    billStudents: false,
  });

  // ── Active term (auto-detected) ────────────────────────────────────────────
  const activeTerm = useActiveTerm(selectedEduLevelId);

  const reset = () => {
    setVacationName("");
    setReOpeningTermId(null);
    setSelectedEduLevelId(null);
    setRemarks("");
    setNotice("");
    setSettings({
      publishReport: true,
      billStudents: false,
    });
    SetUseActiveyear(true);
    setReOpeningYearId(academicYearId);
  };

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: eduLevels = [], isLoading: loadingEdu } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });

  const { data: allTerms = [], isLoading: loadingTerms } = useFetch({
    queryKeys: termKeys.custom("edu-terms-from-state", {
      eduId: selectedEduLevelId,
      yearId: academicYearId,
    }),
    queryFn: () =>
      getTermsFromStateByEduId(selectedEduLevelId!, academicYearId!),
    enabled: !!selectedEduLevelId && !!academicYearId,
  });

  const { data: academicYears = [], isLoading: loadingYears } = useFetch({
    queryFn: getAllYearsFn,
    queryKeys: yearKeys.list(),
  });

  // Terms for re-opening select — exclude the currently active term
  const reOpeningOptions = useMemo(
    () =>
      allTerms
        .filter((t) => t.academicTermId !== activeTerm?.academicTermId)
        .map((t) => ({ label: t.academicTermName, value: t.academicTermId })),
    [allTerms, activeTerm],
  );

  const yearOptions = useMemo(
    () =>
      academicYears
        .filter((y) => y.academicYearId !== academicYearId)
        .map((y) => ({
          label: `${y.startYear}-${y.endYear}`,
          value: y.academicYearId,
        })),
    [academicYearId, academicYears],
  );

  const selectedEduLevel = useMemo(
    () => eduLevels.find((e) => e.educationalLevelId === selectedEduLevelId),
    [eduLevels, selectedEduLevelId],
  );
  const selectedReOpenTerm = useMemo(
    () => allTerms.find((t) => t.academicTermId === reOpeningTermId),
    [allTerms, reOpeningTermId],
  );

  // ── Validation ─────────────────────────────────────────────────────────────
  const isValid = useMemo(
    () =>
      !!selectedEduLevelId &&
      !!activeTerm?.academicTermId &&
      !!academicYearId &&
      !!reOpeningTermId &&
      vacationName.trim().length > 0,
    [
      selectedEduLevelId,
      activeTerm,
      academicYearId,
      reOpeningTermId,
      vacationName,
    ],
  );

  const { mutate: closeTerms, isPending } = usePost({
    postFn: closeAcademicTermFn,
    mutationOptions: { mutationKey: ["terms", "close"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
        reset();
      } else {
        toast.warning(responseMessage);
      }
    },
    onError: (err) =>
      toast.error("Sorry an error occurred!", { description: err.message }),
  });

  const handleVacate = () => {
    if (
      !isValid ||
      !selectedEduLevelId ||
      !activeTerm?.academicTermId ||
      !academicYearId ||
      !reOpeningTermId ||
      !reOpeningYearId
    ) {
      toast.warning("Please complete all required fields.");
      return;
    }
    if (!userId) {
      toast.error("Please log in to proceed.");
      return;
    }
    const payload: CloseTermPayload = {
      VacationName: vacationName.trim(),
      UserId: userId,
      CurrentAcademicTermId: activeTerm.academicTermId,
      NextAcademicTermId: reOpeningTermId,
      AcademicYearId: academicYearId,
      ReOpeningYearId: reOpeningYearId,
      EducationalLevelId: selectedEduLevelId,
      settings,
      ...(remarks.trim() && { HeadMasterRemarks: remarks.trim() }),
      ...(notice.trim() && { Notice: notice.trim() }),
    };
    closeTerms(payload);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="max-w-3xl. mx-auto. p-3"
    >
      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6! mt-3!"
      >
        {/* <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium mb-3">
          <span className="text-[#1E3A5F] font-semibold">Academic Year</span>
          <ChevronRight className="w-3 h-3" />
          <span>Close Academic Term</span>
        </nav> */}

        <div className="flex items-start gap-x-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
              boxShadow: "0 4px 16px rgba(13,27,46,0.2)",
            }}
          >
            <CalendarX className="w-5 h-5 text-[#C9A84C]" />
          </div>
          <div>
            <h1
              className="text-xl font-bold text-[#0D1B2E] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Close Academic Term
            </h1>
            <p className="text-xs font-mono! text-slate-500 mt-1 leading-relaxed max-w-xl">
              Officially close the active term for an educational level.
              Students will be vacated and reports will be processed based on
              the settings below.
            </p>
          </div>
        </div>

        {/* Warning banner */}
        <div className="flex items-start gap-x-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl mt-4">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs font-mono text-rose-700 leading-relaxed font-medium">
            This action closes the active academic term permanently. It cannot
            be undone. Review all details carefully before clicking Vacate.
          </p>
        </div>
      </MotionDiv>

      {/* ── SECTIONS ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-y-4">
        <div className="w-full grid md:grid-cols-2 gap-3">
          {/* ─── STEP 1: Educational Level ──────────────────────────────── */}
          <Section
            step={1}
            icon={<GraduationCap className="w-4 h-4" />}
            title="Educational Level"
            subtitle="Select which level you are closing a term for"
          >
            <div className="flex flex-col gap-y-3">
              <div>
                <FL>Educational Level</FL>
                <Select
                  size="large"
                  className="w-full"
                  showSearch={{
                    filterOption: (input, opt) =>
                      String(opt?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase()),
                  }}
                  placeholder="Select educational level…"
                  loading={loadingEdu}
                  disabled={loadingEdu || isPending}
                  options={eduLevels.map((e) => ({
                    label: e.educationalLevelName,
                    value: e.educationalLevelId,
                  }))}
                  onChange={(id) => {
                    setSelectedEduLevelId(id);
                    setReOpeningTermId(null);
                  }}
                  value={selectedEduLevelId ?? undefined}
                />
              </div>

              {/* Active term auto-detection */}
              <AnimatePresence mode="wait">
                {selectedEduLevelId && (
                  <MotionDiv
                    key="term-status"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <FL>Term Being Closed</FL>
                    {activeTerm ? (
                      <ActiveTermChip
                        termName={activeTerm.academicTermName}
                        termId={activeTerm.academicTermId}
                        //   yearName={(activeTerm as any)?.academicYearName}
                      />
                    ) : (
                      <NoActiveTerm />
                    )}
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>
          </Section>

          {/* ─── STEP 2: Vacation Details ────────────────────────────────── */}
          <Section
            step={2}
            icon={<BookOpen className="w-4 h-4" />}
            title="Vacation Details"
            subtitle="Name this vacation and choose the term that opens next"
            locked={!activeTerm}
          >
            <div className="flex flex-col gap-y-4">
              <div>
                <FL>Vacation Name</FL>
                <TextInput
                  value={vacationName}
                  onChange={setVacationName}
                  placeholder="e.g. Mid-Year Vacation 2025"
                  maxLength={100}
                  disabled={!activeTerm || isPending}
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  This name will appear on student terminal reports for this
                  term.
                </p>
              </div>

              {/* re-opeing academic term */}

              <div>
                <FL>Re-opening Academic Term</FL>
                <Select
                  size="large"
                  className="w-full"
                  placeholder={
                    !selectedEduLevelId
                      ? "Select an educational level first"
                      : reOpeningOptions.length === 0
                        ? "No other terms available for this level"
                        : "Select the term students return to…"
                  }
                  loading={loadingTerms}
                  disabled={
                    !activeTerm ||
                    loadingTerms ||
                    reOpeningOptions.length === 0 ||
                    isPending
                  }
                  options={reOpeningOptions}
                  onChange={setReOpeningTermId}
                  value={reOpeningTermId ?? undefined}
                  notFoundContent={
                    <div className="py-4 flex flex-col items-center gap-1.5">
                      <Hash className="w-5 h-5 text-slate-300" />
                      <span className="text-xs text-slate-400">
                        No other terms available
                      </span>
                    </div>
                  }
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  The term that becomes active when the school re-opens after
                  this vacation.
                </p>
              </div>
              {/* re-opeing academic year */}
              {useActiveYear && year ? (
                <div className="flex flex-col">
                  <FL>Re-Opening Year</FL>
                  <Checkbox
                    checked={useActiveYear}
                    onChange={(e) => {
                      SetUseActiveyear(e.target.checked);
                      if (!e.target.checked) {
                        setReOpeningYearId(undefined);
                      } else {
                        setReOpeningYearId(academicYearId);
                      }
                    }}
                  >
                    <div className="flex items-center gap-x-2">
                      <span>Use Current Active Year</span>
                      <span
                        className="text-[10px] px-2.5 py-0.5 bg-[#0D1B2E] text-[#C9A84C] rounded-md font-bold tracking-wider uppercase flex items-center justify-center"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {year.startYear} — {year.endYear}
                      </span>
                    </div>
                  </Checkbox>
                  <span className="text-xs font-mono px-2 py-0.5. mt-0.5 ml-5 rounded bg-slate-200 w-fit">
                    Uncheck to select a different year
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 items-center gap-x-2">
                  <div>
                    <FL>Re-opening Academic Year</FL>
                    <Select
                      size="large"
                      className="w-full"
                      placeholder="Select the year students return to…"
                      loading={loadingYears}
                      disabled={loadingYears || isPending}
                      options={yearOptions}
                      onChange={setReOpeningYearId}
                      value={reOpeningYearId ?? undefined}
                      notFoundContent={
                        <div className="py-4 flex flex-col items-center gap-1.5">
                          <Hash className="w-5 h-5 text-slate-300" />
                          <span className="text-xs text-slate-400">
                            No other year available
                          </span>
                        </div>
                      }
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      The year that becomes active when the school re-opens
                      after this vacation.
                    </p>
                  </div>
                  {year && (
                    <div className="mb-4! ml-auto">
                      <Checkbox
                        checked={useActiveYear}
                        onChange={(e) => {
                          SetUseActiveyear(e.target.checked);
                          if (!e.target.checked) {
                            setReOpeningYearId(undefined);
                          } else {
                            setReOpeningYearId(academicYearId);
                          }
                        }}
                      >
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs">
                            Use Current Active Year
                          </span>
                          <span
                            className="text-[10px] px-2.5 py-0.5 bg-[#0D1B2E] text-[#C9A84C] rounded-md font-bold tracking-wider uppercase flex items-center justify-center"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {year.startYear} — {year.endYear}
                          </span>
                        </div>
                      </Checkbox>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>
        </div>
        <div className="w-full grid md:grid-cols-2 gap-3">
          {/* ─── STEP 3: Remarks & Notice (collapsible) ─────────────────── */}
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.18 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_2px_12px_rgba(13,27,46,0.06)]"
          >
            {/* Collapsible header */}
            <button
              type="button"
              className="w-full"
              onClick={() => setOptionalOpen((v) => !v)}
              disabled={isPending}
            >
              <div
                className="flex items-center gap-x-3 px-5 py-3.5"
                style={{
                  background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                }}
              >
                <div className="w-6 h-6 rounded-full border-2 border-[#C9A84C]/60 flex items-center justify-center text-[#C9A84C] text-[10px] font-black shrink-0">
                  3
                </div>
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className="text-white font-semibold text-sm"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Remarks &amp; Notice
                  </p>
                  <p className="text-white/50 text-[11px] mt-0.5">
                    Optional — will appear on student reports if provided
                  </p>
                </div>
                <div className="flex items-center gap-x-2">
                  {(remarks || notice) && (
                    <span className="text-[10px] font-bold text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full">
                      {[remarks && "Remarks", notice && "Notice"]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-white/60 transition-transform duration-200 ${optionalOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
            </button>

            <AnimatePresence>
              {optionalOpen && (
                <MotionDiv
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 flex flex-col gap-y-4">
                    {/* Remarks */}
                    <div>
                      <FL optional>Remarks</FL>
                      <TextArea
                        value={remarks}
                        onChange={setRemarks}
                        placeholder="e.g. This term was marked by the successful completion of the annual inter-house sports competition…"
                        maxLength={500}
                        rows={3}
                        disabled={isPending}
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        General remarks about this term. Printed in the remarks
                        section of the terminal report.
                      </p>
                    </div>

                    {/* Notice */}
                    <div>
                      <FL optional>Notice to Students / Parents</FL>
                      <TextArea
                        value={notice}
                        onChange={setNotice}
                        placeholder="e.g. School re-opens on 5th January 2026. All students must return with their full kit and new term fees paid…"
                        maxLength={500}
                        rows={3}
                        disabled={isPending}
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        Displayed prominently on the report as a message from
                        the school administration.
                      </p>
                    </div>
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>
          </MotionDiv>

          {/* ─── STEP 4: Settings ────────────────────────────────────────── */}
          <Section
            step={4}
            icon={<Settings2 className="w-4 h-4" />}
            title="Processing Settings"
            subtitle="Control what the server does when this term is closed"
          >
            <div className="flex flex-col gap-y-3">
              <div className="flex items-start gap-x-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  These settings are sent with the request and instruct the
                  backend on what to process automatically. You can adjust them
                  before sending.
                </p>
              </div>

              <SettingToggle
                icon={<FileText className="w-4 h-4" />}
                label="Publish Student Reports"
                description="Automatically publish terminal reports for all students in this level. Reports will be accessible to parents and students immediately after closing."
                value={settings.publishReport}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, publishReport: v }))
                }
              />

              <SettingToggle
                icon={<Receipt className="w-4 h-4" />}
                label="Bill Students for Next Term"
                description="Automatically generate fee invoices for the next academic term when closing this one. Students will see the outstanding bill on their dashboard."
                value={settings.billStudents}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, billStudents: v }))
                }
                accent
              />

              {/* ↓ Drop future SettingToggle rows here — they slot in automatically ↓ */}
            </div>
          </Section>
        </div>

        {/* ─── REVIEW + VACATE ─────────────────────────────────────────── */}
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.28 }}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_2px_12px_rgba(13,27,46,0.06)]"
        >
          {/* Summary grid */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Summary Review
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <ReviewPill
                icon={<GraduationCap className="w-3.5 h-3.5" />}
                label="Level"
                value={selectedEduLevel?.educationalLevelName}
              />
              <ReviewPill
                icon={<BadgeCheck className="w-3.5 h-3.5" />}
                label="Closing Term"
                value={activeTerm?.academicTermName}
              />
              <ReviewPill
                icon={<BookOpen className="w-3.5 h-3.5" />}
                label="Vacation Name"
                value={vacationName || undefined}
              />
              <ReviewPill
                icon={<CalendarCheck className="w-3.5 h-3.5" />}
                label="Re-opens To"
                value={selectedReOpenTerm?.academicTermName}
              />
              <ReviewPill
                icon={<FileText className="w-3.5 h-3.5" />}
                label="Publish Reports"
                value={settings.publishReport ? "Yes ✓" : "No"}
              />
              <ReviewPill
                icon={<Receipt className="w-3.5 h-3.5" />}
                label="Bill Students"
                value={settings.billStudents ? "Yes ✓" : "No"}
              />
            </div>
          </div>

          {/* Inline validation pills */}
          <AnimatePresence>
            {!isValid && (
              <MotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-1.5">
                  {!selectedEduLevelId && (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                      Select educational level
                    </span>
                  )}
                  {selectedEduLevelId && !activeTerm && (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      No active term found for this level
                    </span>
                  )}
                  {!vacationName.trim() && (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                      Enter a vacation name
                    </span>
                  )}
                  {!reOpeningTermId && (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                      Select re-opening term
                    </span>
                  )}
                  {!academicYearId && (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                      No active academic year in session
                    </span>
                  )}
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

          {/* Vacate button */}
          <div className="p-5">
            <button
              type="button"
              onClick={handleVacate}
              disabled={!isValid || isPending}
              className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-x-3 transition-all
                ${
                  isValid && !isPending
                    ? "text-white hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-[0_4px_20px_rgba(13,27,46,0.25)]"
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
                    Closing Term…
                  </span>
                </>
              ) : (
                <>
                  <CalendarX className="w-5 h-5 text-[#C9A84C]" />
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1rem",
                    }}
                  >
                    Vacate &amp; Close Term
                  </span>
                  {isValid && (
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]/70" />
                  )}
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 mt-2.5">
              {isValid
                ? "All required fields are complete. This action cannot be undone."
                : "Complete the required fields above to unlock the Vacate button."}
            </p>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
};
export default CloseAcademicTerm;
