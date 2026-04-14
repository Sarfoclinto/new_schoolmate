/**
 * BillingCenter.tsx  (Admin)
 *
 * Three-zone architecture:
 *
 * ZONE 1 — STATUS OVERVIEW
 *   Header + year/term selectors
 *   Summary chips: total levels · fully billed · partial · unbilled
 *   Level cards grid: one card per educational level, colour-coded by health
 *
 * ZONE 2 — LEVEL BILLING DRAWER  (slides in from right)
 *   Triggered by clicking any level card
 *   Shows: configured sub-ledgers, billed vs missing, sub-level breakdown
 *   Lets admin select which sub-ledgers to bill + which sub-levels to include
 *   Fire → ManualLevelBillingPayload
 *
 * ZONE 3 — INDIVIDUAL STUDENT BILLING  (collapsible section at bottom)
 *   Fetches unbilled students for the selected period
 *   Search + filter by sub-level / reason
 *   Checkbox multi-select + sub-ledger picker
 *   Fire → ManualStudentBillingPayload
 *
 * Backend APIs required (new — share with backend team):
 *   GET  /billing/status?academicYearId&academicTermId
 *   POST /billing/manual-level
 *   POST /billing/manual-student
 *   GET  /billing/unbilled-students?academicYearId&academicTermId&subLevelId?
 */

import { Drawer, Select, Popconfirm } from "antd";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  Wallet,
  AlertTriangle,
  XCircle,
  Users,
  Receipt,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Layers,
  ArrowRight,
  BadgeCheck,
  BadgeMinus,
  UserPlus,
  RefreshCw,
  Info,
  Send,
  Eye,
  CheckCheck,
  SquareMinus,
  CalendarDays,
  Loader2,
  Banknote,
  TriangleAlert,
  Sparkles,
} from "lucide-react";
import type {
  BillingHealth,
  BillingStatusReport,
  AcaLevelBillingStatus,
  ManualLevelBillingPayload,
  ManualStudentBillingPayload,
  SubLedgerConfig,
  UnbilledStudent,
} from "@/types/api/finance";
import {
  getBillingStatusFn,
  getUnbilledStudentsFn,
  manualLevelBillingFn,
  manualStudentBillingFn,
} from "@/services/finance";
import useFetch from "@/hooks/api/use-fetch";
import { getAllYearsFn, getTermsByEduIdFn } from "@/services/setup/year-n-term";
import { eduKeys, termKeys, yearKeys } from "@/config/query-keys";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { useAuth } from "@/store/auth.store";

// ─── Currency fmt ─────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(n);

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING HEALTH CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const HEALTH_CONFIG: Record<
  BillingHealth,
  {
    label: string;
    icon: React.ReactNode;
    bg: string;
    border: string;
    text: string;
    iconBg: string;
    iconText: string;
    badge: string;
  }
> = {
  fully_billed: {
    label: "Fully Billed",
    icon: <BadgeCheck className="w-4 h-4" />,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  partially_billed: {
    label: "Partially Billed",
    icon: <BadgeMinus className="w-4 h-4" />,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  not_billed: {
    label: "Not Billed",
    icon: <XCircle className="w-4 h-4" />,
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
  },
  not_configured: {
    label: "No Fees Set",
    icon: <TriangleAlert className="w-4 h-4" />,
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-500",
    iconBg: "bg-slate-100",
    iconText: "text-slate-400",
    badge: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

const FL = ({ children }: { children: React.ReactNode }) => (
  <label
    className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    {children}
  </label>
);

const CardHeader = ({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
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
    {badge}
  </div>
);

const StatChip = ({
  icon,
  label,
  value,
  color = "navy",
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "navy" | "green" | "amber" | "rose" | "slate";
}) => {
  const pal = {
    navy: { bg: "bg-[#EEF2F8]", text: "text-[#1E3A5F]" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    rose: { bg: "bg-rose-50", text: "text-rose-600" },
    slate: { bg: "bg-slate-100", text: "text-slate-500" },
  }[color];
  return (
    <div
      className="flex items-center gap-x-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 flex-1 min-w-32.5"
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.04)" }}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${pal?.bg} ${pal?.text}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-0.5">
          {label}
        </p>
        <p
          className="text-sm font-bold text-[#0D1B2E] leading-tight"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {value}
        </p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// Sub-ledger checkbox row
const SlCheckRow = ({
  sl,
  checked,
  onChange,
  showAmount = true,
}: {
  sl: SubLedgerConfig;
  checked: boolean;
  onChange: (v: boolean) => void;
  showAmount?: boolean;
}) => (
  <label
    className={`flex items-center gap-x-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all select-none
    ${checked ? "bg-[#EEF2F8] border-[#D0DCF0]" : "bg-white border-slate-200 hover:border-slate-300"}`}
  >
    <div
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
      ${checked ? "border-[#0D1B2E] bg-[#0D1B2E]" : "border-slate-300"}`}
      style={{ borderRadius: 6 }}
    >
      {checked && <CheckCheck className="w-3 h-3 text-[#C9A84C]" />}
    </div>
    <input
      type="checkbox"
      className="sr-only"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <div className="flex-1 min-w-0">
      <p
        className="text-sm font-semibold text-[#0D1B2E] truncate"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {sl.sl}
      </p>
      <p className="text-[10px] text-slate-400 font-mono">{sl.slCode}</p>
    </div>
    {showAmount && (
      <span className="text-xs font-bold text-[#1E3A5F] bg-[#EEF2F8] border border-[#D0DCF0] px-2 py-0.5 rounded-lg shrink-0">
        {fmt(sl.amount)}
      </span>
    )}
  </label>
);

// Progress bar mini
const MiniBar = ({
  value,
  max,
  color = "navy",
}: {
  value: number;
  max: number;
  color?: "navy" | "green" | "amber" | "rose";
}) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const bg = {
    navy: "#1E3A5F",
    green: "#10B981",
    amber: "#F59E0B",
    rose: "#EF4444",
  }[color];
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: bg }}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// LEVEL CARD
// ═══════════════════════════════════════════════════════════════════════════════

const LevelCard = ({
  level,
  onClick,
}: {
  level: AcaLevelBillingStatus;
  onClick: () => void;
}) => {
  const h = HEALTH_CONFIG[level.billingStatus];
  const billedPct =
    level.totalStudents > 0
      ? Math.round((level.billedStudents / level.totalStudents) * 100)
      : 0;
  const barColor: "green" | "amber" | "rose" =
    billedPct === 100 ? "green" : billedPct >= 50 ? "amber" : "rose";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`group w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer
        ${h?.bg} ${h?.border}`}
      style={{ boxShadow: "0 2px 10px rgba(13,27,46,0.06)" }}
    >
      {/* Top row */}
      <div className="flex items-start gap-x-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${h?.iconBg} ${h.iconText}`}
        >
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-bold text-sm text-[#0D1B2E] leading-tight truncate"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {level.academicLevelName}
          </p>
          <span
            className={`inline-flex items-center gap-x-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full border ${h.badge}`}
          >
            {h.icon}
            {h.label}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-x-2 mb-3">
        {[
          {
            label: "Students",
            value: level.totalStudents,
            icon: <Users className="w-3 h-3" />,
          },
          {
            label: "Billed",
            value: level.billedStudents,
            icon: <BadgeCheck className="w-3 h-3" />,
          },
          {
            label: "Pending",
            value: level.unbilledStudents,
            icon: <BadgeMinus className="w-3 h-3" />,
          },
        ]?.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center">
            <div
              className={`flex items-center gap-x-1 text-[10px] font-bold uppercase tracking-widest ${h.iconText} mb-0.5`}
            >
              {s.icon}
              <span>{s.label}</span>
            </div>
            <span
              className="text-base font-black text-[#0D1B2E]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <MiniBar
        value={level.billedStudents}
        max={level.totalStudents}
        color={barColor}
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-slate-400">{billedPct}% billed</span>
        {level.missingSubLedgers?.length > 0 && (
          <span className="text-[10px] font-bold text-amber-600">
            {level.missingSubLedgers?.length} sub-ledger
            {level.missingSubLedgers?.length > 1 ? "s" : ""} missing
          </span>
        )}
        {!level.feeConfigured && (
          <span className="text-[10px] font-bold text-slate-500">
            fees not configured
          </span>
        )}
      </div>
    </motion.button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// LEVEL BILLING DRAWER
// ═══════════════════════════════════════════════════════════════════════════════

const LevelBillingDrawer = ({
  level,
  yearId,
  termId,
  open,
  onClose,
  onSuccess,
  currentUserId,
}: {
  level: AcaLevelBillingStatus | null;
  yearId: string;
  termId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId?: string;
}) => {
  const [selectedSls, setSelectedSls] = useState<Set<string>>(new Set());
  // const [_, setSelectedSubs] = useState<Set<string>>(new Set());
  const [billScope, setBillScope] = useState<"missing" | "all" | "custom">(
    "missing",
  );
  const [activeTab, setActiveTab] = useState<"overview" | "action">("overview");

  const billLevel = useMutation({
    mutationFn: (p: ManualLevelBillingPayload) => manualLevelBillingFn(p),
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
      } else {
        toast.info(responseMessage);
      }

      onSuccess();
      onClose();
    },
    onError: (e: AxiosError) => toast.error(e.message),
  });

  if (!level) return null;

  const h = HEALTH_CONFIG[level.billingStatus];

  // Which sub-ledgers to show in the action tab depends on scope
  const actionSls: SubLedgerConfig[] =
    billScope === "missing"
      ? level.missingSubLedgers
      : billScope === "all"
        ? level.configuredSubLedgers
        : level.configuredSubLedgers;

  // Sync selected when scope changes
  const handleScopeChange = (scope: "missing" | "all" | "custom") => {
    setBillScope(scope);
    if (scope === "missing")
      setSelectedSls(new Set(level.missingSubLedgers?.map((sl) => sl.slCode)));
    else if (scope === "all")
      setSelectedSls(
        new Set(level.configuredSubLedgers?.map((sl) => sl.slCode)),
      );
    else setSelectedSls(new Set());
  };

  // Reset when drawer opens for a new level
  const handleOpen = () => {
    const defaultScope: "missing" | "all" | "custom" =
      level.billingStatus === "partially_billed"
        ? "missing"
        : level.billingStatus === "not_billed"
          ? "all"
          : "custom";
    setBillScope(defaultScope);
    setSelectedSls(
      defaultScope === "missing"
        ? new Set(level.missingSubLedgers?.map((sl) => sl.slCode))
        : defaultScope === "all"
          ? new Set(level.configuredSubLedgers?.map((sl) => sl.slCode))
          : new Set(),
    );
    // setSelectedSubs(new Set(level.subLevels.map((s) => s.subLevelId)));
    setActiveTab(
      level.billingStatus === "fully_billed" ? "overview" : "action",
    );
  };

  const handleFire = () => {
    if (!currentUserId) return;
    billLevel.mutate({
      academicYearId: yearId,
      academicTermId: termId,
      educationalLevelIds: [level.academicLevelId],
      subLedgerCodes: Array.from(selectedSls),
      userId: currentUserId,
    });
  };

  const totalToBill = Array.from(selectedSls).reduce((sum, code) => {
    const sl = level.configuredSubLedgers.find((s) => s.slCode === code);
    return sum + (sl?.amount ?? 0);
  }, 0);

  const estimatedTotal = totalToBill * level.unbilledStudents;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      afterOpenChange={(isOpen) => {
        if (isOpen) handleOpen();
      }}
      width={520}
      styles={{
        header: {
          background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
          borderBottom: "none",
          padding: "16px 20px",
        },
        body: { padding: 0, overflowX: "hidden" },
        mask: { backdropFilter: "blur(2px)" },
      }}
      title={
        <div className="flex items-center gap-x-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#C9A84C]">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              {level.academicLevelName}
            </p>
            <span
              className={`inline-flex items-center gap-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${h.badge}`}
            >
              {h.icon}
              {h.label}
            </span>
          </div>
        </div>
      }
      closeIcon={
        <X className="w-4 h-4 text-white/60 hover:text-white transition-colors" />
      }
    >
      {/* ── Drawer tabs ── */}
      <div className="flex border-b border-slate-100">
        {[
          {
            key: "overview",
            label: "Overview",
            icon: <Eye className="w-3.5 h-3.5" />,
          },
          {
            key: "action",
            label: "Bill Now",
            icon: <Send className="w-3.5 h-3.5" />,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-x-1.5 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex-1 justify-center
              ${activeTab === tab.key ? "border-[#0D1B2E] text-[#0D1B2E]. text-slate-500" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="p-5 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 160px)" }}
      >
        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-y-5">
            {/* Sub-ledgers billed */}
            {level.billedSubLedgers.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-x-2">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Billed Sub-Ledgers ({level.billedSubLedgers.length})
                </p>
                <div className="flex flex-col gap-y-2">
                  {level.billedSubLedgers?.map((sl) => (
                    <div
                      key={sl.slCode}
                      className="flex items-center gap-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl"
                    >
                      <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0D1B2E] truncate">
                          {sl.sl}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {sl.studentsCharged} students · {fmt(sl.totalCharged)}{" "}
                          total
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 shrink-0">
                        {fmt(sl.amount)} / student
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing sub-ledgers */}
            {level.missingSubLedgers?.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Missing Sub-Ledgers ({level.missingSubLedgers?.length})
                </p>
                <div className="flex flex-col gap-y-2">
                  {level.missingSubLedgers?.map((sl) => (
                    <div
                      key={sl.slCode}
                      className="flex items-center gap-x-3 p-3 bg-amber-50 border border-amber-200 rounded-xl"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0D1B2E] truncate">
                          {sl.sl}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {sl.slCode}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-amber-700 shrink-0">
                        {fmt(sl.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-levels breakdown */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-x-2">
                <Layers className="w-3.5 h-3.5 text-[#1E3A5F]" />
                Sub-Level Breakdown
              </p>
              <div className="flex flex-col gap-y-2">
                {level.subLevels?.map((sub) => {
                  const pct =
                    sub.totalStudents > 0
                      ? Math.round(
                          (sub.billedStudents / sub.totalStudents) * 100,
                        )
                      : 0;
                  return (
                    <div
                      key={sub.subLevelId}
                      className="p-3 bg-white border border-slate-200 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-[#0D1B2E]">
                          {sub.subLevelName}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                          ${
                            pct === 100
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : pct >= 50
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <MiniBar
                        value={sub.billedStudents}
                        max={sub.totalStudents}
                        color={
                          pct === 100 ? "green" : pct >= 50 ? "amber" : "rose"
                        }
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {sub.billedStudents} / {sub.totalStudents} billed ·{" "}
                        {sub.unbilledStudents} pending
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA if actionable */}
            {level.billingStatus !== "fully_billed" && level.feeConfigured && (
              <button
                type="button"
                onClick={() => setActiveTab("action")}
                className="w-full flex items-center justify-center gap-x-2 px-5 py-3 rounded-xl font-bold text-sm text-white cursor-pointer hover:opacity-90 transition-all"
                style={{
                  background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                }}
              >
                <Send className="w-4 h-4 text-[#C9A84C]" />
                Bill Missing Now
              </button>
            )}
          </div>
        )}

        {/* ── ACTION TAB ── */}
        {activeTab === "action" && (
          <div className="flex flex-col gap-y-5">
            {/* Not configured warning */}
            {!level.feeConfigured && (
              <div className="flex items-start gap-x-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-rose-700">
                    Fees not configured
                  </p>
                  <p className="text-xs text-rose-600 mt-0.5 leading-relaxed">
                    No fees have been set for this educational level. Go to the
                    fees setup page first to configure sub-ledger amounts.
                  </p>
                </div>
              </div>
            )}

            {level.feeConfigured && (
              <>
                {/* Scope selector */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    What to Bill
                  </p>
                  <div className="flex flex-col gap-y-2">
                    {[
                      {
                        key: "missing",
                        label: "Missing only",
                        desc: `${level.missingSubLedgers?.length} sub-ledger(s) not yet billed`,
                        disabled: level.missingSubLedgers?.length === 0,
                      },
                      {
                        key: "all",
                        label: "All configured",
                        desc: `All ${level.configuredSubLedgers.length} configured sub-ledgers`,
                        disabled: false,
                      },
                      {
                        key: "custom",
                        label: "Custom selection",
                        desc: "I'll pick exactly which sub-ledgers to bill",
                        disabled: false,
                      },
                    ].map((opt) => (
                      <label
                        key={opt.key}
                        className={`flex items-center gap-x-3 p-3 rounded-xl border cursor-pointer transition-all select-none
                          ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}
                          ${billScope === opt.key ? "bg-[#EEF2F8] border-[#D0DCF0]" : "bg-white border-slate-200 hover:border-slate-300"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                          ${billScope === opt.key ? "border-[#0D1B2E] bg-[#0D1B2E]" : "border-slate-300"}`}
                        >
                          {billScope === opt.key && (
                            <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                          )}
                        </div>
                        <input
                          type="radio"
                          className="sr-only"
                          checked={billScope === opt.key}
                          onChange={() =>
                            !opt.disabled &&
                            handleScopeChange(opt.key as typeof billScope)
                          }
                        />
                        <div>
                          <p className="text-sm font-bold text-[#0D1B2E]">
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {opt.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sub-ledger picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Sub-Ledgers to Bill ({selectedSls.size} selected)
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedSls.size === actionSls.length)
                          setSelectedSls(new Set());
                        else
                          setSelectedSls(
                            new Set(actionSls?.map((sl) => sl.slCode)),
                          );
                      }}
                      className="text-[11px] font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-colors cursor-pointer"
                    >
                      {selectedSls.size === actionSls.length
                        ? "Deselect all"
                        : "Select all"}
                    </button>
                  </div>
                  <div className="flex flex-col gap-y-1.5">
                    {actionSls?.map((sl) => (
                      <SlCheckRow
                        key={sl.slCode}
                        sl={sl}
                        checked={selectedSls.has(sl.slCode)}
                        onChange={(v) => {
                          const next = new Set(selectedSls);
                          if (v) {
                            next.add(sl.slCode);
                          } else {
                            next.delete(sl.slCode);
                          }
                          setSelectedSls(next);
                          setBillScope("custom");
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Estimate */}
                {selectedSls.size > 0 && level.unbilledStudents > 0 && (
                  <div className="flex items-center gap-x-3 p-3.5 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl">
                    <Banknote className="w-5 h-5 text-[#1E3A5F] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#0D1B2E]">
                        Estimated billing
                      </p>
                      <p className="text-xs text-slate-500">
                        {fmt(totalToBill)} × {level.unbilledStudents} unbilled
                        students = <strong>{fmt(estimatedTotal)}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Fire button */}
                <Popconfirm
                  title={`Bill ${level.academicLevelName}?`}
                  description={`This will charge ${level.unbilledStudents} students for ${selectedSls.size} sub-ledger(s). This action cannot be undone.`}
                  okText="Confirm & Bill"
                  cancelText="Cancel"
                  okButtonProps={{ size: "small" }}
                  cancelButtonProps={{ size: "small" }}
                  onConfirm={handleFire}
                  disabled={selectedSls.size === 0 || billLevel.isPending}
                >
                  <button
                    type="button"
                    disabled={
                      selectedSls.size === 0 ||
                      billLevel.isPending ||
                      level.unbilledStudents === 0
                    }
                    className={`w-full flex items-center justify-center gap-x-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all
                      ${
                        selectedSls.size > 0 &&
                        !billLevel.isPending &&
                        level.unbilledStudents > 0
                          ? "text-white hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-[0_4px_16px_rgba(13,27,46,0.2)]"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    style={
                      selectedSls.size > 0 &&
                      !billLevel.isPending &&
                      level.unbilledStudents > 0
                        ? {
                            background:
                              "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                          }
                        : {}
                    }
                  >
                    {billLevel.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
                        Billing…
                      </>
                    ) : level.unbilledStudents === 0 ? (
                      <>
                        <BadgeCheck className="w-4 h-4 text-[#C9A84C]" />
                        All students already billed
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#C9A84C]" />
                        Bill {level.unbilledStudents} Students Now
                      </>
                    )}
                  </button>
                </Popconfirm>
              </>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL STUDENT BILLING SECTION
// ═══════════════════════════════════════════════════════════════════════════════

const IndividualBillingSection = ({
  yearId,
  termId,
  allSubLedgers,
  currentUserId,
}: {
  yearId: string;
  termId: string;
  allSubLedgers: SubLedgerConfig[];
  currentUserId?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedSls, setSelectedSls] = useState<Set<string>>(new Set());
  const [slPickerOpen, setSlPickerOpen] = useState(false);

  const {
    data: unbilled = [],
    isLoading,
    refetch,
  } = useQuery<UnbilledStudent[], AxiosError>({
    queryKey: ["unbilledStudents", yearId, termId, subFilter],
    queryFn: () =>
      getUnbilledStudentsFn({
        yearId,
        termId,
        subLevelId: subFilter ?? undefined,
      }),
    enabled: !!yearId && !!termId && open,
  });

  const billStudents = useMutation({
    mutationFn: (p: ManualStudentBillingPayload) => manualStudentBillingFn(p),
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
      } else {
        toast.info(responseMessage);
      }
      setSelected(new Set());
      refetch();
    },
    onError: (e: AxiosError) => toast.error(e.message),
  });

  const uniqueSubLevels = useMemo(() => {
    const map = new Map<string, string>();
    unbilled.forEach((s) => map.set(s.subLevelId, s.subLevelName));
    return Array.from(map.entries())?.map(([id, name]) => ({ id, name }));
  }, [unbilled]);

  const REASON_LABELS: Record<string, string> = {
    new_admission: "New admission",
    omitted: "Omitted",
    unknown: "Unknown",
  };

  const filtered = useMemo(() => {
    let rows = unbilled;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.subLevelName.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [unbilled, search]);

  const toggleStudent = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === filtered.length
        ? new Set()
        : new Set(filtered?.map((s) => s.studentId)),
    );
  };

  const handleBill = () => {
    if (!currentUserId) return;
    billStudents.mutate({
      academicYearId: yearId,
      academicTermId: termId,
      studentIds: Array.from(selected),
      subLedgerCodes:
        selectedSls.size > 0 ? Array.from(selectedSls) : undefined,
      userId: currentUserId,
    });
  };

  const allChecked = filtered.length > 0 && selected.size === filtered.length;
  const someChecked = selected.size > 0 && !allChecked;

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
    >
      {/* Collapsible header */}
      <button
        type="button"
        className="w-full"
        onClick={() => setOpen((v) => !v)}
      >
        <div
          className="flex items-center gap-x-3 px-5 py-3.5"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
          <span
            className="text-white font-semibold text-sm flex-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Individual Student Billing
          </span>
          {unbilled.length > 0 && (
            <span className="text-[10px] font-bold text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full mr-2">
              {unbilled.length} unbilled
            </span>
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-white/50" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/50" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Info banner */}
            <div className="flex items-start gap-x-3 mx-5 mt-4 p-3.5 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl">
              <Info className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" />
              <p className="text-xs text-[#1E3A5F] font-medium leading-relaxed">
                These are students who have not been billed yet for the selected
                period — either new admissions or omissions. Select students and
                optionally pick specific sub-ledgers to charge.
              </p>
            </div>

            {/* Filters row */}
            <div className="flex flex-col sm:flex-row gap-3 p-5 pb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or class…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
              <Select
                size="middle"
                className="min-w-45"
                allowClear
                placeholder="All classes…"
                options={uniqueSubLevels?.map((s) => ({
                  label: s.name,
                  value: s.id,
                }))}
                value={subFilter ?? undefined}
                onChange={(v) => setSubFilter(v ?? null)}
              />
            </div>

            {/* Student list */}
            <div className="px-5 pb-3">
              {isLoading ? (
                <div className="flex flex-col gap-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 bg-slate-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">
                    All students are billed
                  </p>
                  <p className="text-xs text-slate-300">
                    No unbilled students found for this period.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Select all bar */}
                  <div className="flex items-center gap-x-3 mb-2 px-1">
                    <button
                      type="button"
                      onClick={toggleAll}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all
                        ${allChecked ? "border-[#0D1B2E] bg-[#0D1B2E]" : someChecked ? "border-[#1E3A5F] bg-[#EEF2F8]" : "border-slate-300 bg-white"}`}
                      style={{ borderRadius: 6 }}
                    >
                      {allChecked && (
                        <CheckCheck className="w-3 h-3 text-[#C9A84C]" />
                      )}
                      {someChecked && !allChecked && (
                        <SquareMinus className="w-3 h-3 text-[#1E3A5F]" />
                      )}
                    </button>
                    <span className="text-xs text-slate-400 font-medium">
                      {selected.size > 0
                        ? `${selected.size} of ${filtered.length} selected`
                        : `${filtered.length} unbilled students`}
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto flex flex-col gap-y-1">
                    {filtered?.map((stu) => {
                      const sel = selected.has(stu.studentId);
                      const initials = stu.fullName
                        .split(" ")
                        .slice(0, 2)
                        ?.map((n: string) => n[0]?.toUpperCase() ?? "")
                        .join("");
                      const reasonLabel = stu.reason
                        ? REASON_LABELS[stu.reason]
                        : "Unknown";
                      const reasonColor =
                        stu.reason === "new_admission"
                          ? "text-blue-500 bg-blue-50 border-blue-200"
                          : stu.reason === "omitted"
                            ? "text-amber-600 bg-amber-50 border-amber-200"
                            : "text-slate-400 bg-slate-50 border-slate-200";
                      return (
                        <button
                          key={stu.studentId}
                          type="button"
                          onClick={() => toggleStudent(stu.studentId)}
                          className={`flex items-center gap-x-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer w-full border
                            ${sel ? "bg-[#EEF2F8] border-[#D0DCF0]" : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"}`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                            ${sel ? "border-[#0D1B2E] bg-[#0D1B2E]" : "border-slate-300"}`}
                            style={{ borderRadius: 6 }}
                          >
                            {sel && (
                              <CheckCheck className="w-3 h-3 text-[#C9A84C]" />
                            )}
                          </div>
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#C9A84C] font-bold text-[10px] shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                            }}
                          >
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#0D1B2E] truncate">
                              {stu.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {stu.subLevelName}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${reasonColor}`}
                          >
                            {reasonLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sub-ledger picker + bill button */}
            {selected.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-5 mb-5 mt-1"
              >
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#0D1B2E]">
                      Bill {selected.size} student{selected.size > 1 ? "s" : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSlPickerOpen((v) => !v)}
                      className="flex items-center gap-x-1.5 text-[11px] font-bold text-[#1E3A5F] hover:text-[#C9A84C] cursor-pointer transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      {selectedSls.size > 0
                        ? `${selectedSls.size} sub-ledger(s) selected`
                        : "All configured sub-ledgers"}
                      {slPickerOpen ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {slPickerOpen && allSubLedgers.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-y-1.5 pt-1">
                          {allSubLedgers?.map((sl) => (
                            <SlCheckRow
                              key={sl.slCode}
                              sl={sl}
                              checked={selectedSls.has(sl.slCode)}
                              onChange={(v) => {
                                const n = new Set(selectedSls);
                                if (v) {
                                  n.add(sl.slCode);
                                } else {
                                  n.delete(sl.slCode);
                                }
                                setSelectedSls(n);
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Popconfirm
                    title={`Bill ${selected.size} students?`}
                    description={
                      selectedSls.size > 0
                        ? `Charge ${selectedSls.size} sub-ledger(s) to ${selected.size} student(s). Cannot be undone.`
                        : `Apply all configured fees to ${selected.size} student(s). Cannot be undone.`
                    }
                    okText="Confirm & Bill"
                    cancelText="Cancel"
                    okButtonProps={{ size: "small" }}
                    cancelButtonProps={{ size: "small" }}
                    onConfirm={handleBill}
                  >
                    <button
                      type="button"
                      disabled={billStudents.isPending}
                      className={`w-full flex items-center justify-center gap-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all
                        ${billStudents.isPending ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "text-white hover:opacity-90 cursor-pointer"}`}
                      style={
                        !billStudents.isPending
                          ? {
                              background:
                                "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                            }
                          : {}
                      }
                    >
                      {billStudents.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
                          Billing…
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#C9A84C]" />
                          Bill {selected.size} Student
                          {selected.size > 1 ? "s" : ""}
                          {selectedSls.size > 0 &&
                            ` · ${selectedSls.size} fee${selectedSls.size > 1 ? "s" : ""}`}
                        </>
                      )}
                    </button>
                  </Popconfirm>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const BillingCenter = () => {
  const qc = useQueryClient();
  const currentUserId = useAuth((s) => s?.user?.userId);

  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedEduId, setSelectedEduId] = useState<string | null>(null);
  const [drawerLevel, setDrawerLevel] = useState<AcaLevelBillingStatus | null>(
    null,
  );
  const [healthFilter, setHealthFilter] = useState<BillingHealth | "all">(
    "all",
  );

  const { data: eduLevels = [], isLoading: loadingEdu } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });

  const { data: years = [], isLoading: loadingYears } = useFetch({
    queryFn: getAllYearsFn,
    queryKeys: yearKeys.list(),
  });

  const { data: terms = [], isLoading: loadingTerms } = useFetch({
    queryFn: () => getTermsByEduIdFn(selectedEduId!),
    queryKeys: termKeys.custom("edu-terms", { eduId: selectedEduId }),
    enabled: !!selectedEduId,
  });

  const {
    data: report,
    isLoading: loadingReport,
    refetch,
  } = useQuery<BillingStatusReport, AxiosError>({
    queryKey: ["billingStatus", selectedYearId, selectedTermId, selectedEduId],
    queryFn: () =>
      getBillingStatusFn({
        yearId: selectedYearId!,
        termId: selectedTermId!,
        eduId: selectedEduId,
      }),
    enabled: !!selectedYearId && !!selectedTermId && !!selectedEduId,
  });

  const levels = useMemo(
    () => report?.academicLevels ?? [],
    [report?.academicLevels],
  );

  const eduOptions = useMemo(() => {
    return eduLevels?.map((e) => ({
      label: e.educationalLevelName,
      value: e.educationalLevelId,
    }));
  }, [eduLevels]);

  const stats = useMemo(() => {
    if (!levels.length) return null;
    return {
      total: levels.length,
      fullyBilled: levels.filter((l) => l.billingStatus === "fully_billed")
        .length,
      partial: levels.filter((l) => l.billingStatus === "partially_billed")
        .length,
      notBilled: levels.filter((l) => l.billingStatus === "not_billed").length,
      notConfigured: levels.filter((l) => l.billingStatus === "not_configured")
        .length,
      totalStudents: levels.reduce((s, l) => s + l.totalStudents, 0),
      unbilled: levels.reduce((s, l) => s + l.unbilledStudents, 0),
    };
  }, [levels]);

  // All configured sub-ledgers across all levels (for individual billing)
  const allSubLedgers = useMemo((): SubLedgerConfig[] => {
    const map = new Map<string, SubLedgerConfig>();
    levels.forEach((l) =>
      l.configuredSubLedgers.forEach((sl) => map.set(sl.slCode, sl)),
    );
    return Array.from(map.values());
  }, [levels]);

  const filteredLevels = useMemo(
    () =>
      healthFilter === "all"
        ? levels
        : levels.filter((l) => l.billingStatus === healthFilter),
    [levels, healthFilter],
  );

  const isReady = !!selectedYearId && !!selectedTermId;
  const termName = terms.find(
    (t) => t.academicTermId === selectedTermId,
  )?.academicTermName;
  const year = years.find((y) => y.academicYearId === selectedYearId);
  const yearName = `${year?.startYear}-${year?.endYear}`;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* ── PAGE HEADER ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5 flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1
            className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Billing Center
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Finance</span>
            <ChevronRight className="w-3 h-3" />
            <span>Billing Center</span>
            {isReady && termName && yearName && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#0D1B2E] font-semibold">
                  {termName} · {yearName}
                </span>
              </>
            )}
          </nav>
        </div>

        {isReady && (
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#1E3A5F] bg-[#EEF2F8] border border-[#D0DCF0] hover:bg-[#1E3A5F] hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        )}
      </motion.div>

      {/* ── PERIOD SELECTOR ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.04 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <CardHeader
          icon={<CalendarDays className="w-4 h-4" />}
          title="Billing Period"
        />
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FL>Educational Level</FL>
            <Select
              size="large"
              className="w-full"
              showSearch={{
                filterOption: (i, o) =>
                  String(o?.label ?? "")
                    .toLowerCase()
                    .includes(i.toLowerCase()),
              }}
              placeholder="Select educational level…"
              loading={loadingEdu}
              disabled={loadingEdu}
              options={eduOptions}
              value={selectedEduId ?? undefined}
              onChange={(id) => {
                setSelectedEduId(id);
                setSelectedTermId(null);
              }}
            />
          </div>
          <div>
            <FL>Academic Year</FL>
            <Select
              size="large"
              className="w-full"
              showSearch={{
                filterOption: (i, o) =>
                  String(o?.label ?? "")
                    .toLowerCase()
                    .includes(i.toLowerCase()),
              }}
              placeholder="Select year…"
              loading={loadingYears}
              disabled={loadingYears}
              options={years?.map((y) => ({
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
            <FL>Academic Term</FL>
            <Select
              size="large"
              className="w-full"
              showSearch={{
                filterOption: (i, o) =>
                  String(o?.label ?? "")
                    .toLowerCase()
                    .includes(i.toLowerCase()),
              }}
              placeholder={
                selectedEduId ? "Select term…" : "Select ediu level first"
              }
              loading={loadingTerms}
              disabled={!selectedEduId || loadingTerms}
              options={terms.map((t) => ({
                label: t.academicTermName,
                value: t.academicTermId,
              }))}
              value={selectedTermId ?? undefined}
              onChange={setSelectedTermId}
            />
          </div>
        </div>
      </motion.div>

      {/* ── EMPTY STATE ─────────────────────────────────────────────── */}
      {!isReady && (
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
              <Wallet className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-400">
              Select a year and term to view billing status
            </p>
            <p className="text-xs text-slate-300 text-center max-w-65 leading-relaxed">
              The billing center will show which educational levels have been
              charged and which are pending.
            </p>
          </div>
        </div>
      )}

      {isReady && loadingReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 bg-slate-100 rounded-2xl animate-pulse"
              style={{ opacity: 1 - i * 0.08 }}
            />
          ))}
        </div>
      )}

      {isReady && !loadingReport && levels.length > 0 && (
        <>
          {/* ── STAT CHIPS ──────────────────────────────────────────── */}
          <AnimatePresence>
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap gap-3 mb-4"
              >
                <StatChip
                  icon={<GraduationCap className="w-4 h-4" />}
                  label="Levels"
                  value={stats.total}
                  color="navy"
                />
                <StatChip
                  icon={<BadgeCheck className="w-4 h-4" />}
                  label="Fully Billed"
                  value={stats.fullyBilled}
                  color="green"
                />
                <StatChip
                  icon={<BadgeMinus className="w-4 h-4" />}
                  label="Partial"
                  value={stats.partial}
                  color="amber"
                />
                <StatChip
                  icon={<XCircle className="w-4 h-4" />}
                  label="Not Billed"
                  value={stats.notBilled}
                  color="rose"
                />
                <StatChip
                  icon={<Users className="w-4 h-4" />}
                  label="Unbilled Students"
                  value={stats.unbilled}
                  color={stats.unbilled > 0 ? "rose" : "green"}
                  sub={`of ${stats.totalStudents} total`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── HEALTH FILTER TABS ────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: "all", label: "All Levels", count: levels.length },
              {
                key: "fully_billed",
                label: "Fully Billed",
                count: stats?.fullyBilled,
              },
              {
                key: "partially_billed",
                label: "Partial",
                count: stats?.partial,
              },
              {
                key: "not_billed",
                label: "Not Billed",
                count: stats?.notBilled,
              },
              {
                key: "not_configured",
                label: "No Fees Set",
                count: stats?.notConfigured,
              },
            ].map((tab) => {
              const active = healthFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() =>
                    setHealthFilter(tab.key as typeof healthFilter)
                  }
                  className={`inline-flex items-center gap-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer
                    ${active ? "text-[#C9A84C] border-[#0D1B2E]" : "text-slate-500 bg-white border-slate-200 hover:border-slate-300"}`}
                  style={
                    active
                      ? {
                          background:
                            "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                        }
                      : {}
                  }
                >
                  {tab.label}
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
                    ${active ? "bg-white/10 text-[#C9A84C]" : "bg-slate-100 text-slate-500"}`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── LEVEL CARDS GRID ─────────────────────────────────────── */}
          {filteredLevels.length === 0 ? (
            <div
              className="bg-white rounded-2xl border border-slate-100 py-12 flex flex-col items-center gap-3"
              style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-400">
                No levels in this category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
              {filteredLevels?.map((level, i) => (
                <motion.div
                  key={level.academicLevelId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <LevelCard
                    level={level}
                    onClick={() => setDrawerLevel(level)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* ── ZONE 3: INDIVIDUAL STUDENT BILLING ───────────────────── */}
          <IndividualBillingSection
            yearId={selectedYearId!}
            termId={selectedTermId!}
            allSubLedgers={allSubLedgers}
            currentUserId={currentUserId}
          />
        </>
      )}

      {/* ── LEVEL BILLING DRAWER ─────────────────────────────────────── */}
      <LevelBillingDrawer
        level={drawerLevel}
        currentUserId={currentUserId}
        yearId={selectedYearId ?? ""}
        termId={selectedTermId ?? ""}
        open={!!drawerLevel}
        onClose={() => setDrawerLevel(null)}
        onSuccess={() => {
          refetch();
          qc.invalidateQueries({ queryKey: ["unbilledStudents"] });
        }}
      />
    </div>
  );
};

export default BillingCenter;
