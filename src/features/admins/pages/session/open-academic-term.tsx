/**
 * OpenAcademicTerm.tsx
 *
 * Onboarding-style wizard for re-opening a new academic term.
 *
 * Steps:
 *  1. Context      — shows the recently closed term + auto-detected re-opening term
 *  2. Settings     — only shows settings NOT already handled during close
 *  3. Review       — full summary before submission
 *
 * Key behaviours:
 * - Fetches the most-recently-closed term record for the selected edu level.
 *   That record contains: { closedTermId, nextTermId, settingsApplied: { publishReport, billStudents, … } }
 * - Settings that were already applied at close are omitted (with a subtle
 *   "Already done at close ✓" chip so the admin can see what was pre-handled).
 * - If ALL settings were applied at close, step 2 is collapsed / skipped-label
 *   but still navigable so the admin can optionally override.
 * - Progress bar has animated fill + step labels.
 *
 * Reuses primitives from CloseAcademicTerm:
 *   Section, FL, TextInput, TextArea, SettingToggle, ReviewPill
 * — they are copy-imported here so the file is self-contained, but you
 *   can extract them to a shared file and import instead.
 */

import { AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Settings2,
  FileText,
  Receipt,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Info,
  Hash,
  CalendarX,
  Sparkles,
  RefreshCw,
  Check,
  ArrowRight,
} from "lucide-react";
import { MotionDiv } from "@/components/custom/motion";
import { useAuth } from "@/store/auth.store";
import useFetch from "@/hooks/api/use-fetch";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { eduKeys, termKeys } from "@/config/query-keys";
import {
  getLastClosedTermFn,
  getTermsFromStateByEduId,
  openAcademicTermFn,
} from "@/services/setup/year-n-term";
import { signalRSelectors, useSignalRStore } from "@/store/signalr.store";
import {
  FL,
  ReviewPill,
  SettingToggle,
  TextArea,
  TextInput,
} from "./close-academic-term";
import { Modal, Select } from "antd";
import type { OpenTermPayload } from "@/types/api/setup/year-n-term";
import usePost from "@/hooks/api/use-post";
import { Link } from "react-router-dom";
import paths from "@/config/routes";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface OpenSettings {
  publishReport: boolean;
  billStudents: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WIZARD-SPECIFIC PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

const STEPS = [
  { id: 1, label: "Context", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { id: 2, label: "Settings", icon: <Settings2 className="w-3.5 h-3.5" /> },
  { id: 3, label: "Review", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// ─── Segmented progress bar ────────────────────────────────────────────────────
const ProgressBar = ({
  current,
  completed,
}: {
  current: StepId;
  completed: Set<StepId>;
}) => (
  <div className="mb-7">
    {/* Step labels row */}
    <div className="grid grid-cols-3 mb-2.5">
      {STEPS.map((step) => {
        const done = completed.has(step.id);
        const active = step.id === current;
        const future = !done && !active;
        return (
          <div
            key={step.id}
            className={`flex flex-col items-center gap-y-1.5 transition-all
            ${step.id === 1 ? "items-start" : step.id === STEPS.length ? "items-end" : "items-center"}`}
          >
            {/* Circle */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300
              ${done ? "text-[#C9A84C]" : ""}
              ${active ? "text-white" : ""}
              ${future ? "bg-slate-100 text-slate-300" : ""}`}
              style={
                done
                  ? {
                      background:
                        "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                    }
                  : active
                    ? {
                        background:
                          "linear-gradient(135deg,#1E3A5F 0%,#2C5282 100%)",
                        boxShadow: "0 0 0 4px rgba(30,58,95,0.15)",
                      }
                    : {}
              }
            >
              {done ? <Check className="w-3.5 h-3.5" /> : step.icon}
            </div>
            {/* Label */}
            <span
              className={`text-[11px] font-bold leading-none transition-all
              ${active ? "text-[#1E3A5F]" : done ? "text-[#0D1B2E]" : "text-slate-300"}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>

    {/* Bar track */}
    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mx-0">
      <MotionDiv
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: "linear-gradient(90deg, #0D1B2E 0%, #C9A84C 100%)",
        }}
        animate={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      />
      {/* Step notches */}
      {STEPS.slice(1, -1).map((step) => (
        <div
          key={step.id}
          className="absolute top-0 bottom-0 w-0.5 bg-white/60"
          style={{ left: `${((step.id - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      ))}
    </div>

    {/* Step numbers below bar */}
    <div className="grid grid-cols-3 mt-1">
      {STEPS.map((step, i) => (
        <span
          key={step.id}
          className={`text-[10px] font-black uppercase tracking-widest transition-colors
            ${step.id === current ? "text-[#1E3A5F]" : "text-slate-300"}
            ${i === 0 ? "text-left" : i === STEPS.length - 1 ? "text-right" : "text-center"}`}
        >
          Step {step.id}
        </span>
      ))}
    </div>
  </div>
);

// ─── "Already done" chip (setting handled during close) ──────────────────────
const AlreadyDoneChip = ({ label }: { label: string }) => (
  <div className="flex items-center gap-x-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
      <Check className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p
        className="text-sm font-bold text-emerald-800"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </p>
      <p className="text-[11px] text-emerald-600 mt-0.5">
        Already applied when the previous term was closed — no action needed.
      </p>
    </div>
    <span className="shrink-0 text-[10px] font-black text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
      Done ✓
    </span>
  </div>
);

// ─── Nav buttons ─────────────────────────────────────────────────────────────
const NavRow = ({
  step,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  canNext,
  isSubmitting,
  isLastStep,
}: {
  step: StepId;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canNext: boolean;
  isSubmitting: boolean;
  isLastStep: boolean;
}) => (
  <div className="flex items-center justify-between gap-x-3 pt-5 border-t border-slate-100 mt-6">
    {/* Back */}
    <button
      type="button"
      onClick={onBack}
      disabled={step === 1 || isSubmitting}
      className="flex items-center gap-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200
        disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
    >
      <ChevronLeft className="w-3.5 h-3.5" />
      Back
    </button>

    {/* Step pill */}
    <span className="text-[11px] font-bold text-slate-400">
      {step} / {totalSteps}
    </span>

    {/* Next / Submit */}
    {isLastStep ? (
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`flex items-center gap-x-2.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all
          ${isSubmitting ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-[0_4px_16px_rgba(13,27,46,0.2)]"}`}
        style={
          !isSubmitting
            ? { background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)" }
            : {}
        }
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
            Opening Term…
          </>
        ) : (
          <>
            <CalendarCheck className="w-4 h-4 text-[#C9A84C]" />
            <span style={{ fontFamily: "'Playfair Display', serif" }}>
              Open Academic Term
            </span>
          </>
        )}
      </button>
    ) : (
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext || isSubmitting}
        className={`flex items-center gap-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all
          ${!canNext || isSubmitting ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "hover:opacity-90 active:scale-[0.98] cursor-pointer"}`}
        style={
          canNext && !isSubmitting
            ? { background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)" }
            : {}
        }
      >
        Continue
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

const OpenAcademicTerm = () => {
  const userId = useAuth((s) => s.user?.userId);
  const year = useSignalRStore(signalRSelectors.academicYear);
  const academicYearId = year?.academicYearId;

  // ── Wizard state ───────────────────────────────────────────────────────────
  const [step, setStep] = useState<StepId>(1);
  const [completed, setCompleted] = useState<Set<StepId>>(new Set());

  // ref
  const noTermForYearRef = useRef(false);

  // ── Step 1: Context ────────────────────────────────────────────────────────
  const [selectedEduLevelId, setSelectedEduLevelId] = useState<string | null>(
    null,
  );
  // These will be pre-filled from the backend but editable
  const [closedTermId, setClosedTermId] = useState<string | null>(null);
  const [openingTermId, setOpeningTermId] = useState<string | null>(null);
  const [vacationName, setVacationName] = useState("");

  // ── Step 2: Settings ───────────────────────────────────────────────────────
  const [settings, setSettings] = useState<OpenSettings>({
    publishReport: false,
    billStudents: false,
  });

  // Which settings were already done at close — from API
  const [alreadyApplied, setAlreadyApplied] = useState<Partial<OpenSettings>>(
    {},
  );

  // ── Step 3: Optional fields ────────────────────────────────────────────────
  const [headmasterRemarks, setHeadmasterRemarks] = useState("");
  const [notice, setNotice] = useState("");

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: eduLevels = [], isLoading: loadingEdu } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });

  // Fetch last closed term record for selected edu level
  const { data: lastClosed, isLoading: loadingLastClosed } = useFetch({
    queryKeys: termKeys.custom("last-closed", { eduId: selectedEduLevelId }),
    queryFn: () => getLastClosedTermFn(selectedEduLevelId!),
    enabled: !!selectedEduLevelId,
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

  useEffect(() => {
    if (
      !loadingTerms &&
      allTerms !== undefined &&
      allTerms.length === 0 &&
      !!selectedEduLevelId
    ) {
      noTermForYearRef.current = true;
    }
  }, [allTerms, loadingTerms, selectedEduLevelId]);


  
  useEffect(() => {
    if (lastClosed) {
      setClosedTermId(lastClosed.closedTermId);
      setOpeningTermId(lastClosed.nextTermId);
      setVacationName(lastClosed.vacationName);
      setHeadmasterRemarks(lastClosed.headMasterRemarks);
      setNotice(lastClosed.notice);
      // Track what was already applied
      setAlreadyApplied(lastClosed.settingsApplied ?? {});
      // Init settings to OFF for already-applied, ON for not yet applied
      setSettings({
        publishReport: lastClosed.settingsApplied?.publishReport,
        billStudents: lastClosed.settingsApplied?.billStudents,
      });
    }
  }, [lastClosed]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const { mutate: openTerm, isPending } = usePost({
    postFn: openAcademicTermFn,
    mutationOptions: { mutationKey: ["terms", "open"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
        // Reset wizard
        setStep(1);
        setCompleted(new Set());
        setSelectedEduLevelId(null);
        setClosedTermId(null);
        setOpeningTermId(null);
        setVacationName("");
        setSettings({ publishReport: false, billStudents: false });
        setAlreadyApplied({});
        setHeadmasterRemarks("");
        setNotice("");
      } else {
        toast.warning(responseMessage);
      }
    },
    onError: (err) =>
      toast.error("Sorry, an error occurred!", { description: err.message }),
  });

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedEduLevel = useMemo(
    () => eduLevels.find((e) => e.educationalLevelId === selectedEduLevelId),
    [eduLevels, selectedEduLevelId],
  );
  const selectedClosedTerm = useMemo(
    () => ({
      academicTermId: lastClosed?.closedTermId,
      academicTermName: lastClosed?.closedTermName,
    }),
    [lastClosed],
  );
  const selectedOpeningTerm = useMemo(
    () => ({
      academicTermId: lastClosed?.nextTermId,
      academicTermName: lastClosed?.nextTermName,
    }),
    [lastClosed],
  );

  // Term options excluding the one used as "closed"
  const openingTermOptions = useMemo(
    () => [
      {
        label: lastClosed?.nextTermName,
        value: lastClosed?.nextTermId,
      },
    ],
    [lastClosed],
  );

  const closedTermOptions = useMemo(
    () => [
      {
        label: lastClosed?.closedTermName,
        value: lastClosed?.closedTermId,
      },
    ],
    [lastClosed],
  );

  // Are all settings handled at close?
  const allSettingsDone = Object.values(alreadyApplied).every(Boolean);

  // Validate each step
  const step1Valid = !!selectedEduLevelId && !!closedTermId && !!openingTermId;
  const step2Valid = true; // settings step is always passable
  const step3Valid = step1Valid; // review just needs step 1

  const canGoNext: Record<StepId, boolean> = {
    1: step1Valid,
    2: step2Valid,
    3: step3Valid,
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goNext = () => {
    setCompleted((prev) => new Set([...prev, step]));
    setStep((prev) => Math.min(3, prev + 1) as StepId);
  };

  const goBack = () => setStep((prev) => Math.max(1, prev - 1) as StepId);

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!step1Valid || !userId || !academicYearId) {
      toast.warning("Please complete all required fields.");
      return;
    }
    if (!lastClosed || !lastClosed.vacationId) {
      toast.warning("No vacation found to re-open");
      return;
    }
    const payload: OpenTermPayload = {
      VacationId: lastClosed?.vacationId,
      ReOpeningYearName: lastClosed?.reOpeningYearName,
      UserId: userId,
      Settings: {
        PublishReport: settings.publishReport,
        BillStudents: settings.billStudents,
      },
      ...(headmasterRemarks.trim() && {
        HeadMasterRemarks: headmasterRemarks.trim(),
      }),
      ...(notice.trim() && { Notice: notice.trim() }),
    };

    
    openTerm(payload);
  };

  // ── Step content ───────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <MotionDiv
      key="step1"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
    >
      {/* Intro banner */}
      <div className="flex items-start gap-x-3 p-3.5 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl mb-5">
        <Info className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" />
        <p className="text-xs text-[#1E3A5F] font-medium leading-relaxed">
          The term to close and the term to open are pre-filled from your most
          recent close operation. You can adjust them here if needed.
        </p>
      </div>

      {/* Educational level */}
      <div className="mb-4">
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
            setClosedTermId(null);
            setOpeningTermId(null);
            setVacationName("");
            setAlreadyApplied({});
          }}
          value={selectedEduLevelId ?? undefined}
        />
      </div>

      {/* Loading skeleton for last-closed */}
      {selectedEduLevelId && loadingLastClosed && (
        <div className="flex flex-col gap-y-3 mt-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-14 bg-slate-100 rounded-xl animate-pulse"
              style={{ opacity: 1 - i * 0.2 }}
            />
          ))}
        </div>
      )}

      {/* Term selects — shown once data loaded */}
      {selectedEduLevelId && !loadingLastClosed && (
        <MotionDiv
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-y-4"
        >
          {/* Term being re-opened (the "next" term from the last close) */}
          <div>
            <FL>Term Being Opened</FL>
            <Select
              size="large"
              className="w-full"
              placeholder={
                loadingLastClosed
                  ? "Loading terms…"
                  : "Select the term being opened…"
              }
              loading={loadingLastClosed}
              disabled={loadingLastClosed || isPending || true}
              options={openingTermOptions}
              onChange={setOpeningTermId}
              value={openingTermId ?? undefined}
              notFoundContent={
                <div className="py-4 flex flex-col items-center gap-1.5">
                  <Hash className="w-5 h-5 text-slate-300" />
                  <span className="text-xs text-slate-400">
                    No terms available
                  </span>
                </div>
              }
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              This is the term that will become{" "}
              <span className="font-bold text-[#1E3A5F]">Active</span> after
              opening.
            </p>
          </div>

          {/* Term being closed / preceding term */}
          <div>
            <FL>Preceding Closed Term</FL>
            <Select
              size="large"
              className="w-full"
              placeholder="Select the term that was closed…"
              loading={loadingLastClosed}
              disabled={loadingLastClosed || isPending || true}
              options={closedTermOptions}
              onChange={setClosedTermId}
              value={closedTermId ?? undefined}
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              The term that was most recently closed before this re-opening.
            </p>
          </div>

          {/* Re-opening year */}
          <div className="grid items-center gap-x-2 grid-cols-2">
            <div>
              <FL>
                Previous Year{" "}
                <span className="text-[10px] font-normal normal-case text-slate-400">
                  (from previous close)
                </span>
              </FL>
              <TextInput
                value={lastClosed?.currentYearName ?? ""}
                onChange={() => {}}
                placeholder="2026-2027"
                maxLength={100}
                disabled={isPending || !!lastClosed?.reOpeningYearName || true}
              />
            </div>

            <div>
              <FL>
                Re-Opening Year{" "}
                <span className="text-[10px] font-normal normal-case text-slate-400">
                  (from previous close)
                </span>
              </FL>
              <TextInput
                value={lastClosed?.reOpeningYearName ?? ""}
                onChange={() => {}}
                placeholder="2026-2027"
                maxLength={100}
                disabled={isPending || !!lastClosed?.reOpeningYearName || true}
              />
            </div>
          </div>

          {/* Vacation name */}
          <div>
            <FL>
              Vacation Name{" "}
              <span className="text-[10px] font-normal normal-case text-slate-400">
                (from previous close)
              </span>
            </FL>
            <TextInput
              value={vacationName}
              onChange={setVacationName}
              placeholder="e.g. Mid-Year Vacation 2025"
              maxLength={100}
              disabled={isPending || true}
            />
          </div>

          {/* Pre-fill confirmation chip */}
          {lastClosed && (
            <div className="flex items-center gap-x-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <p className="text-[11px] text-slate-500">
                Pre-filled from the most recent close:{" "}
                <span className="font-bold text-[#0D1B2E]">
                  {/* {lastClosed.closedTermName} */} closedTerm
                </span>
                {" → "}
                <span className="font-bold text-[#0D1B2E]">
                  {/* {lastClosed.nextTermName} */} nextTerm
                </span>
              </p>
            </div>
          )}
        </MotionDiv>
      )}

      {/* Empty prompt when no edu selected */}
      {!selectedEduLevelId && (
        <div className="flex flex-col items-center py-10 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
            <GraduationCap className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-400">
            Select an educational level to begin
          </p>
          <p className="text-xs text-slate-300 text-center max-w-55">
            The most recently closed term details will load automatically.
          </p>
        </div>
      )}
    </MotionDiv>
  );

  const renderStep2 = () => (
    <MotionDiv
      key="step2"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
    >
      {/* Explanation */}
      <div className="flex items-start gap-x-3 p-3.5 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl mb-5">
        <Info className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" />
        <p className="text-xs text-[#1E3A5F] font-medium leading-relaxed">
          Settings already applied when the previous term was closed are shown
          as completed. Only the remaining settings are shown here for you to
          configure.
        </p>
      </div>

      <div className="flex flex-col gap-y-3">
        {/* Publish reports */}
        {alreadyApplied.publishReport ? (
          <AlreadyDoneChip label="Publish Student Reports" />
        ) : (
          <SettingToggle
            icon={<FileText className="w-4 h-4" />}
            label="Publish Student Reports"
            description="Automatically publish terminal reports for all students in this level. Reports become accessible to parents and students immediately after opening."
            value={settings.publishReport}
            onChange={(v) => setSettings((s) => ({ ...s, publishReport: v }))}
            // disabled={isPending}
          />
        )}

        {/* Bill students */}
        {alreadyApplied.billStudents ? (
          <AlreadyDoneChip label="Bill Students for This Term" />
        ) : (
          <SettingToggle
            icon={<Receipt className="w-4 h-4" />}
            label="Bill Students for This Term"
            description="Generate fee invoices for this newly opened term. Students will see the outstanding bill on their dashboard."
            value={settings.billStudents}
            onChange={(v) => setSettings((s) => ({ ...s, billStudents: v }))}
            accent
            // disabled={isPending}
          />
        )}

        {/* Add future SettingToggles here */}
      </div>

      {/* All-done callout */}
      {allSettingsDone && (
        <MotionDiv
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mt-4"
        >
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p
              className="text-sm font-bold text-emerald-800"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              All settings were handled at close
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5 leading-relaxed">
              No additional settings are required for this re-opening. You can
              proceed to the review step.
            </p>
          </div>
        </MotionDiv>
      )}

      {/* Optional — headmaster remarks & notice */}
      <div className="mt-5 pt-5 border-t border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Optional Messages
        </p>
        <div className="flex flex-col gap-y-4">
          {/* <div>
            <FL optional>Headmaster Remarks</FL>
            <TextArea
              value={headmasterRemarks}
              onChange={setHeadmasterRemarks}
              placeholder="e.g. Welcome back to a new and exciting term…"
              maxLength={500}
              rows={3}
              disabled={isPending}
            />
          </div> */}
          <div>
            <FL optional>Notice to Students / Parents</FL>
            <TextArea
              value={notice}
              onChange={setNotice}
              placeholder="e.g. All students must report by 7:30 AM on the first day…"
              maxLength={500}
              rows={3}
              disabled={isPending}
            />
          </div>
        </div>
      </div>
    </MotionDiv>
  );

  const renderStep3 = () => (
    <MotionDiv
      key="step3"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
    >
      {/* Warning */}
      <div className="flex items-start gap-x-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl mb-5">
        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-rose-700 leading-relaxed">
          Review carefully before opening. This will activate the selected term
          and may generate reports and billing records.
        </p>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
        <ReviewPill
          icon={<GraduationCap className="w-3.5 h-3.5" />}
          label="Educational Level"
          value={selectedEduLevel?.educationalLevelName}
        />
        <ReviewPill
          icon={<CalendarX className="w-3.5 h-3.5 text-[#8b6914]" />}
          label="Preceding Term"
          value={selectedClosedTerm?.academicTermName}
        />
        <ReviewPill
          icon={<CalendarCheck className="w-3.5 h-3.5 text-[#8b6914]" />}
          label="Opening Term"
          value={selectedOpeningTerm?.academicTermName}
        />
        <ReviewPill
          icon={<BookOpen className="w-3.5 h-3.5" />}
          label="Vacation Name"
          value={vacationName || undefined}
        />
        <ReviewPill
          icon={<FileText className="w-3.5 h-3.5" />}
          label="Publish Reports"
          value={
            alreadyApplied.publishReport
              ? "Done at close ✓"
              : settings.publishReport
                ? "Yes ✓"
                : "No"
          }
        />
        <ReviewPill
          icon={<Receipt className="w-3.5 h-3.5" />}
          label="Bill Students"
          value={
            alreadyApplied.billStudents
              ? "Done at close ✓"
              : settings.billStudents
                ? "Yes ✓"
                : "No"
          }
        />
        <ReviewPill
          icon={<CalendarX className="w-3.5 h-3.5 text-[#8b6914]" />}
          label="Preceding Year"
          value={lastClosed?.currentYearName}
        />
        <ReviewPill
          icon={<CalendarCheck className="w-3.5 h-3.5 text-[#8b6914]" />}
          label="Opening Year"
          value={lastClosed?.reOpeningYearName}
        />
      </div>

      {/* Optional messages summary */}
      {(headmasterRemarks || notice) && (
        <div className="flex flex-col gap-y-2 mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Messages
          </p>
          {headmasterRemarks && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Remarks
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {headmasterRemarks}
              </p>
            </div>
          )}
          {notice && (
            <div
              className={
                headmasterRemarks ? "pt-2 border-t border-slate-200" : ""
              }
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Notice
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">{notice}</p>
            </div>
          )}
        </div>
      )}

      {/* Inline validation errors */}
      {!step1Valid && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {!selectedEduLevelId && (
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
              Select educational level
            </span>
          )}
          {!openingTermId && (
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
              Select term to open
            </span>
          )}
          {!closedTermId && (
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
              Select preceding closed term
            </span>
          )}
          {!academicYearId && (
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
              No active academic year in session
            </span>
          )}
        </div>
      )}

      {/* Completion confirmation */}
      {step1Valid && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-x-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-xs font-bold text-emerald-700">
            All required fields are complete. Click "Open Academic Term" to
            proceed.
          </p>
        </MotionDiv>
      )}
    </MotionDiv>
  );

  const stepContent: Record<StepId, React.ReactNode> = {
    1: renderStep1(),
    2: renderStep2(),
    3: renderStep3(),
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="max-w-2xl mx-auto p-3"
    >
      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 mt-3"
      >
        <div className="flex items-start gap-x-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
              boxShadow: "0 4px 16px rgba(13,27,46,0.2)",
            }}
          >
            <CalendarCheck className="w-5 h-5 text-[#C9A84C]" />
          </div>
          <div>
            <h1
              className="text-xl font-bold text-[#0D1B2E] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Open Academic Term
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-lg">
              Re-activate a new academic term for an educational level.
              Pre-filled from your most recent close operation — adjust as
              needed.
            </p>
          </div>
        </div>
      </MotionDiv>

      {/* ── WIZARD CARD ──────────────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.06 }}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_4px_24px_rgba(13,27,46,0.08)]"
      >
        {/* Gradient top strip */}
        <div
          className="h-1 w-full"
          style={{
            background: "linear-gradient(90deg,#0D1B2E 0%,#C9A84C 100%)",
          }}
        />

        <div className="p-6 sm:p-8">
          {/* Progress bar */}
          <ProgressBar current={step} completed={completed} />

          {/* Step content with exit/enter animation */}
          <div className="min-h-80">
            <AnimatePresence mode="wait">{stepContent[step]}</AnimatePresence>
          </div>

          {/* Navigation */}
          <NavRow
            step={step}
            totalSteps={STEPS.length}
            onBack={goBack}
            onNext={goNext}
            onSubmit={handleSubmit}
            canNext={canGoNext[step]}
            isSubmitting={isPending}
            isLastStep={step === STEPS.length}
          />
        </div>
      </MotionDiv>

      {/* Step-specific hint below card */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <MotionDiv
            key="hint1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-x-2 mt-3 px-1"
          >
            <Info className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <p className="text-[11px] text-slate-400">
              The term details are fetched from the backend and pre-filled. You
              can override them if the auto-detection is incorrect.
            </p>
          </MotionDiv>
        )}
        {step === 2 && !allSettingsDone && (
          <MotionDiv
            key="hint2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-x-2 mt-3 px-1"
          >
            <Info className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <p className="text-[11px] text-slate-400">
              Settings already applied at term close are shown with a green
              "Done ✓" indicator — no need to re-apply them.
            </p>
          </MotionDiv>
        )}
        {step === 3 && (
          <MotionDiv
            key="hint3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-x-2 mt-3 px-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="text-[11px] text-slate-400">
              Opening a term is a significant operation. Confirm the details
              above match your intent before proceeding.
            </p>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* No Terms for Year Modal */}
      <Modal
        closable={false}
        centered
        footer={null}
        // eslint-disable-next-line react-hooks/refs
        open={noTermForYearRef.current}
        mask={{ closable: false, blur: true, enabled: true }}
        keyboard={false}
        width={440}
        className="custom-modal"
      >
        <div className="py-6 px-2 text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-100">
            <CalendarX className="w-8 h-8 text-rose-500" />
          </div>

          <h2
            className="text-xl font-bold text-[#0D1B2E] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Configuration Missing
          </h2>

          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            We couldn't find any defined{" "}
            <span className="font-bold text-[#1E3A5F]">Start or End dates</span>{" "}
            for academic terms under this educational level for the current
            year.{" "}
            {year && (
              <span
                className="text-[10px] px-2.5 py-0.5 bg-[#0D1B2E] text-[#C9A84C] rounded-md font-bold tracking-wider uppercase flex items-center justify-center"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {year.startYear} — {year.endYear}
              </span>
            )}
            <br />
            <br />
            Please set up the term durations in the Academic Setup before you
            can proceed with opening a term.
          </p>

          <Link
            to={{
              pathname: paths.admin.yearsNTerms.href,
              search: `academicYearId=${academicYearId}&tab=terms_update&eduLevelId=${selectedEduLevelId}`,
            }}
            className="w-full h-12 rounded-xl bg-[#0D1B2E] text-white font-bold flex items-center justify-center gap-x-2 hover:opacity-90 transition-all shadow-lg shadow-slate-200"
          >
            Go to Academic Setup
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="mt-6 flex items-center justify-center gap-x-2 py-2 px-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Action Required to Continue
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default OpenAcademicTerm;
