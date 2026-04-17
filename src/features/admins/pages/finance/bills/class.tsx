/**
 * ClassFeesOverview.tsx  (Admin)
 *
 * Enterprise-grade fees payment overview for a class.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  PAGE HEADER  +  scope badge (overall vs term-filtered)                 │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │  FILTER CARD                                                             │
 * │  Edu Level → Sub-Level  |  Year (opt) → Term (opt)  |  search          │
 * │  Balance status filter  |  Sub-ledger spotlight      |  sort controls   │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │  SUMMARY CHIPS (animated)                                                │
 * │  Students · Total Billed · Total Paid · Outstanding · Fully Paid count  │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │  COLLECTION BAR  (visual progress of overall collection rate)            │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │  FEES TABLE                                                              │
 * │  Sticky #/Name cols │ dynamic sub-ledger cols │ sticky Debit/Credit/Bal │
 * │  Sort any col · heat balance cells · action → detail page               │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Data contract:
 *   GET /GetClassBill?subLevelId=&academicYearId=&academicTermId=
 *   Returns ClassBill (StudentBill[])
 *
 * When year/term not provided the backend returns overall figures.
 * The UI shows a "Overall" vs "Term-scoped" scope badge accordingly.
 */

import { Select, Button } from "antd";
import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useDisclosure } from "@/hooks/use-disclosure";
import {
  ChevronRight,
  Wallet,
  Users,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GraduationCap,
  X,
  CalendarDays,
  BookOpen,
  Filter,
  Eye,
  Receipt,
  BadgeCheck,
  BadgeAlert,
  CircleDollarSign,
  BarChart3,
  Hash,
  Info,
} from "lucide-react";
import { MotionDiv } from "@/components/custom/motion";
import useFetch from "@/hooks/api/use-fetch";
import { getAllSubLevelsFn } from "@/services/setup/sublevel";
import { eduKeys, financeKeys, termKeys, yearKeys } from "@/config/query-keys";
import { getAllYearsFn, getTermsBySubIdFn } from "@/services/setup/year-n-term";
import { getClassBillFn } from "@/services/finance";
import type { StudentBill } from "@/types/api/finance";
import PaymentModal from "@/features/admins/components/finance/payment-modal";
import { usePayment } from "@/store/payment.store";
import { useShallow } from "zustand/react/shallow";
import StudentPaymentDrawer from "@/features/admins/components/finance/payment-drawer";
import PendingPaymentsDrawer from "@/features/admins/components/finance/pending-payments-drawer";

// ─── Currency formatter ────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(n);

const fmtShort = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `GH₵ ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `GH₵ ${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

const FL = ({ children }: { children: React.ReactNode }) => (
  <span
    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    {children}
  </span>
);

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
      className="text-white font-semibold text-sm flex-1"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {title}
    </span>
    {badge !== undefined && (
      <span className="text-[10px] font-bold text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">
        {badge}
      </span>
    )}
    {right}
  </div>
);

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
  color?: "navy" | "green" | "amber" | "rose" | "violet";
}) => {
  const palettes = {
    navy: { bg: "bg-[#EEF2F8]", text: "text-[#1E3A5F]" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    rose: { bg: "bg-rose-50", text: "text-rose-600" },
    violet: { bg: "bg-violet-50", text: "text-violet-600" },
  };
  const { bg, text } = palettes[color];
  return (
    <div
      className="flex items-center gap-x-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 flex-1 min-w-35"
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.04)" }}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg} ${text}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-0.5">
          {label}
        </p>
        <p
          className="text-sm font-bold text-[#0D1B2E] leading-tight truncate"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {value}
        </p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

const SortIcon = ({
  col,
  active,
  dir,
}: {
  col: string;
  active: string;
  dir: "asc" | "desc";
}) => {
  if (active !== col)
    return (
      <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline-block shrink-0" />
    );
  return dir === "asc" ? (
    <ArrowUp className="w-3 h-3 text-[#C9A84C] ml-1 inline-block shrink-0" />
  ) : (
    <ArrowDown className="w-3 h-3 text-[#C9A84C] ml-1 inline-block shrink-0" />
  );
};

const EmptyState = ({
  icon,
  message,
  sub,
}: {
  icon: React.ReactNode;
  message: string;
  sub?: string;
}) => (
  <div className="flex flex-col items-center py-14 gap-3">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
      {icon}
    </div>
    <p className="text-sm font-semibold text-slate-400">{message}</p>
    {sub && (
      <p className="text-xs text-slate-300 text-center max-w-65 leading-relaxed">
        {sub}
      </p>
    )}
  </div>
);

const SkeletonRows = ({ n = 7 }: { n?: number }) => (
  <div className="flex flex-col gap-y-2 p-4">
    {Array.from({ length: n }).map((_, i) => (
      <div
        key={i}
        className="h-12 rounded-xl bg-slate-100 animate-pulse"
        style={{ opacity: 1 - i * 0.1 }}
      />
    ))}
  </div>
);

// Balance cell — colour by whether owed (balance > 0), clear (= 0), overpaid (< 0)
function balanceColor(balance: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (balance <= 0)
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    };
  if (balance <= 200)
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    };
  return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
}

// ─── Balance status filter options ────────────────────────────────────────────
type BalanceFilter =
  | "all"
  | "fully_paid"
  | "partial"
  | "outstanding"
  | "overpaid";

const BALANCE_OPTIONS: {
  label: string;
  value: BalanceFilter;
  icon: React.ReactNode;
  col: string;
}[] = [
  {
    label: "All",
    value: "all",
    icon: <Users className="w-3.5 h-3.5" />,
    col: "text-slate-500",
  },
  {
    label: "Fully Paid",
    value: "fully_paid",
    icon: <BadgeCheck className="w-3.5 h-3.5" />,
    col: "text-emerald-600",
  },
  {
    label: "Partial",
    value: "partial",
    icon: <BadgeAlert className="w-3.5 h-3.5" />,
    col: "text-amber-600",
  },
  {
    label: "Outstanding",
    value: "outstanding",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    col: "text-rose-600",
  },
  {
    label: "Overpaid",
    value: "overpaid",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    col: "text-violet-600",
  },
];

// ─── Collection progress bar ───────────────────────────────────────────────────
const CollectionBar = ({
  totalDebit,
  totalCredit,
}: {
  totalDebit: number;
  totalCredit: number;
}) => {
  const pct =
    totalDebit > 0 ? Math.min(100, (totalCredit / totalDebit) * 100) : 0;
  const over = totalCredit > totalDebit;
  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 p-4"
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.04)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-x-2">
          <BarChart3 className="w-4 h-4 text-[#1E3A5F]" />
          <span
            className="text-xs font-bold text-[#0D1B2E]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Collection Rate
          </span>
        </div>
        <div className="flex items-center gap-x-3">
          <span className="text-xs font-bold text-slate-400">
            {fmtShort(totalCredit)} of {fmtShort(totalDebit)}
          </span>
          <span
            className={`text-xs font-black px-2 py-0.5 rounded-full
            ${
              over
                ? "bg-violet-50 text-violet-700 border border-violet-200"
                : pct >= 90
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : pct >= 60
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {pct.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <MotionDiv
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: over
              ? "linear-gradient(90deg,#7C3AED,#9333EA)"
              : pct >= 90
                ? "linear-gradient(90deg,#059669,#10B981)"
                : pct >= 60
                  ? "linear-gradient(90deg,#D97706,#F59E0B)"
                  : "linear-gradient(90deg,#DC2626,#EF4444)",
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
        <span>0%</span>
        <div className="flex items-center gap-x-3">
          <span className="flex items-center gap-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            ≥90% Good
          </span>
          <span className="flex items-center gap-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            60–89% Fair
          </span>
          <span className="flex items-center gap-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            &lt;60% Poor
          </span>
        </div>
        <span>100%</span>
      </div>
    </div>
  );
};

// ─── Scope badge ───────────────────────────────────────────────────────────────
const ScopeBadge = ({
  isFiltered,
  termName,
  yearName,
}: {
  isFiltered: boolean;
  termName?: string;
  yearName?: string;
}) => (
  <div
    className={`inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold
    ${
      isFiltered
        ? "bg-[#EEF2F8] border-[#D0DCF0] text-[#1E3A5F]"
        : "bg-amber-50 border-amber-200 text-amber-700"
    }`}
  >
    {isFiltered ? (
      <>
        <CalendarDays className="w-3.5 h-3.5" />
        {termName} · {yearName}
      </>
    ) : (
      <>
        <Info className="w-3.5 h-3.5" />
        Overall (no term filter)
      </>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

type SortDir = "asc" | "desc";

const ClassFeesOverview = () => {
  const {
    open,
    setStudentId,
    setStudentName,
    setAmount,
    setStudentSubLedgers,
  } = usePayment(
    useShallow((s) => ({
      open: s.open,
      setStudentId: s.setStudentId,
      setStudentName: s.setStudentName,
      setAmount: s.setAmount,
      setStudentSubLedgers: s.setStudentSubLedgers,
    })),
  );

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [selectedSubId, setSelectedSubId] = useState<string | undefined>(
    undefined,
  );
  const [selectedYearId, setSelectedYearId] = useState<string | undefined>(
    undefined,
  );
  const [selectedTermId, setSelectedTermId] = useState<string | undefined>(
    undefined,
  );
  const [drawerStudent, setDrawerStudent] = useState<StudentBill | null>(null);
  const {isOpen, open: openPending, close: closePending } = useDisclosure()

  // Secondary filters
  const [search, setSearch] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>("all");
  const [slSpotlight, setSlSpotlight] = useState<string | null>(null); // sub-ledger code
  const [minBalance, setMinBalance] = useState<string>("");
  const [maxBalance, setMaxBalance] = useState<string>("");

  // Sort
  const [sortCol, setSortCol] = useState<string>("fullName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // ── Queries ───────────────────────────────────────────────────────────────────
  const { data: subLevels = [], isLoading: loadingSubs } = useFetch({
    queryFn: getAllSubLevelsFn,
    queryKeys: eduKeys.sublevels(),
  });

  const { data: years = [], isLoading: loadingYears } = useFetch({
    queryFn: getAllYearsFn,
    queryKeys: yearKeys.list(),
  });

  const { data: terms = [], isLoading: loadingTerms } = useFetch({
    queryKeys: termKeys.list({ selectedSublevel: selectedSubId }),
    queryFn: () => getTermsBySubIdFn(selectedSubId!),
    enabled: !!selectedSubId,
  });

  const {
    data: classBill = [],
    isLoading: loadingBill,
    isFetching,
  } = useFetch({
    queryKeys: financeKeys.custom("classBill", {
      selectedSubId,
      selectedYearId,
      selectedTermId,
    }),
    queryFn: () =>
      getClassBillFn({
        subLevelId: selectedSubId!,
        academicYearId: selectedYearId ?? undefined,
        academicTermId: selectedTermId ?? undefined,
      }),
    enabled: !!selectedSubId,
  });

  // ── Derived data ──────────────────────────────────────────────────────────────

  // Union of all sub-ledgers across all students
  const allSubLedgers = useMemo((): { code: string; name: string }[] => {
    const map = new Map<string, string>();
    classBill.forEach((s) =>
      s.subLedgerBill.forEach((sl) => map.set(sl.slCode, sl.sl)),
    );
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [classBill]);

  // Summary totals
  const totals = useMemo(() => {
    if (!classBill.length) return null;
    const totalDebit = classBill.reduce((a, s) => a + s.totalDebit, 0);
    const totalCredit = classBill.reduce((a, s) => a + s.totalCredit, 0);
    const totalBalance = classBill.reduce((a, s) => a + s.balance, 0);
    const fullyPaid = classBill.filter((s) => s.balance <= 0).length;
    const outstanding = classBill.filter((s) => s.balance > 0).length;
    const highestOwing = [...classBill].sort(
      (a, b) => b.balance - a.balance,
    )[0];
    return {
      totalDebit,
      totalCredit,
      totalBalance,
      fullyPaid,
      outstanding,
      highestOwing,
      count: classBill.length,
    };
  }, [classBill]);

  // ── Filtered + sorted rows ────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let rows = [...classBill];

    // Name search
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.otherName?.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q),
      );
    }

    // Balance status
    if (balanceFilter === "fully_paid")
      rows = rows.filter((s) => s.balance === 0);
    if (balanceFilter === "partial")
      rows = rows.filter((s) => s.balance > 0 && s.balance < s.totalDebit);
    if (balanceFilter === "outstanding")
      rows = rows.filter((s) => s.balance > 0);
    if (balanceFilter === "overpaid") rows = rows.filter((s) => s.balance < 0);

    // Min/Max balance range
    if (minBalance !== "" && !isNaN(Number(minBalance))) {
      rows = rows.filter((s) => s.balance >= Number(minBalance));
    }
    if (maxBalance !== "" && !isNaN(Number(maxBalance))) {
      rows = rows.filter((s) => s.balance <= Number(maxBalance));
    }

    // Sort
    rows.sort((a, b) => {
      let av: number | string, bv: number | string;
      if (sortCol === "fullName") {
        av = a.fullName;
        bv = b.fullName;
      } else if (sortCol === "totalDebit") {
        av = a.totalDebit;
        bv = b.totalDebit;
      } else if (sortCol === "totalCredit") {
        av = a.totalCredit;
        bv = b.totalCredit;
      } else if (sortCol === "balance") {
        av = a.balance;
        bv = b.balance;
      } else {
        // Sub-ledger column
        const asl = a.subLedgerBill.find((sl) => sl.slCode === sortCol);
        const bsl = b.subLedgerBill.find((sl) => sl.slCode === sortCol);
        av = asl?.balance ?? Infinity;
        bv = bsl?.balance ?? Infinity;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = av as number,
        bn = bv as number;
      return sortDir === "asc" ? an - bn : bn - an;
    });

    return rows;
  }, [
    classBill,
    search,
    balanceFilter,
    minBalance,
    maxBalance,
    sortCol,
    sortDir,
  ]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const isTermScoped = !!selectedYearId && !!selectedTermId;
  const hasData = !loadingBill && classBill.length > 0;
  const isLoading = loadingBill || isFetching;
  const hasFilters =
    search ||
    balanceFilter !== "all" ||
    slSpotlight ||
    minBalance ||
    maxBalance;
  const subLevelName = subLevels.find(
    (s) => s.subLevelId === selectedSubId,
  )?.subLevelName;
  const termName = terms.find(
    (t) => t.academicTermId === selectedTermId,
  )?.academicTermName;
  const year = years.find((y) => y.academicYearId === selectedYearId);
  const yearName = `${year?.startYear}-${year?.endYear}`;

  const clearFilters = () => {
    setSearch("");
    setBalanceFilter("all");
    setSlSpotlight(null);
    setMinBalance("");
    setMaxBalance("");
  };

  const handlePayment = (student: StudentBill) => {
    setStudentSubLedgers(student.subLedgerBill);
    setStudentId(student.studentId);
    setStudentName(student.fullName);
    setAmount(student.balance);
    open();
  };

  // Table min width (+56 --> +86)
  const actionCoWidth = 56 + 30;
  const tableMinW =
    44 + 200 + allSubLedgers.length * 120 + 100 + 100 + 100 + actionCoWidth;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <MotionDiv
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
            Fees Overview
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Finance</span>
            <ChevronRight className="w-3 h-3" />
            <span>Class Fees</span>
            {subLevelName && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#0D1B2E] font-semibold">
                  {subLevelName}
                </span>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-x-2 flex-wrap gap-y-2">
          <Button type="primary" onClick={openPending}>Pending Payments</Button>
          {hasData && (
            <ScopeBadge
              isFiltered={isTermScoped}
              termName={termName}
              yearName={yearName}
            />
          )}
          {hasData && (
            <div className="flex items-center gap-x-2 px-3.5 py-2 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl">
              <Wallet className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-sm font-bold text-[#0D1B2E]">
                {classBill.length} students
              </span>
            </div>
          )}
        </div>
      </MotionDiv>

      {/* ── FILTER CARD ──────────────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.04 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <CardHeader
          icon={<Filter className="w-4 h-4" />}
          title="Filters &amp; Configuration"
          badge={!selectedSubId ? "Select class to load data" : undefined}
        />

        <div className="p-5 flex flex-col gap-y-5">
          {/* ─ Primary: Edu level, Sub-level, Year (optional), Term (optional) ─ */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="">
                  <FL>Class / Sub-Level</FL>
                </p>
                <Select
                  size="large"
                  className="w-full"
                  showSearch={{
                    filterOption: (i, o) =>
                      String(o?.label ?? "")
                        .toLowerCase()
                        .includes(i.toLowerCase()),
                  }}
                  placeholder="Select class…"
                  loading={loadingSubs}
                  disabled={loadingSubs}
                  options={subLevels.map((s) => ({
                    label: s.subLevelName,
                    value: s.subLevelId,
                  }))}
                  value={selectedSubId ?? undefined}
                  onChange={setSelectedSubId}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-1.5 mb-1.5">
                  <FL>Academic Term</FL>
                  <span className="text-[10px] text-slate-300 italic font-medium">
                    optional
                  </span>
                </div>
                <Select
                  size="large"
                  className="w-full"
                  showSearch={{
                    filterOption: (i, o) =>
                      String(o?.label ?? "")
                        .toLowerCase()
                        .includes(i.toLowerCase()),
                  }}
                  allowClear
                  placeholder={
                    selectedSubId ? "All terms…" : "Select class first"
                  }
                  loading={loadingTerms}
                  disabled={!selectedSubId || loadingTerms}
                  options={terms.map((t) => ({
                    label: t.academicTermName,
                    value: t.academicTermId,
                  }))}
                  value={selectedTermId ?? undefined}
                  onChange={(id) => setSelectedTermId(id ?? null)}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-1.5 mb-1.5">
                  <FL>Academic Year</FL>
                  <span className="text-[10px] text-slate-300 italic font-medium">
                    optional
                  </span>
                </div>
                <Select
                  size="large"
                  className="w-full"
                  showSearch
                  allowClear
                  filterOption={(i, o) =>
                    String(o?.label ?? "")
                      .toLowerCase()
                      .includes(i.toLowerCase())
                  }
                  placeholder="All years…"
                  loading={loadingYears}
                  disabled={loadingYears}
                  options={years.map((y) => ({
                    label: `${y.startYear}-${y.endYear}`,
                    value: y.academicYearId,
                  }))}
                  value={selectedYearId ?? undefined}
                  onChange={(id) => {
                    setSelectedYearId(id ?? null);
                    setSelectedTermId(undefined);
                  }}
                />
              </div>
            </div>

            {/* Scope note */}
            {selectedSubId && (
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-x-2.5 mt-3 p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60"
              >
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {isTermScoped
                    ? `Showing fees for ${termName} (${yearName}) only. Clear year/term to see overall balances.`
                    : "No year or term selected — showing overall (cumulative) balances for all time."}
                </p>
              </MotionDiv>
            )}
          </div>

          {/* ─ Secondary filters (only when data loaded) ─ */}
          <AnimatePresence>
            {hasData && (
              <MotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Table Filters &amp; Sorting
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Name search */}
                    <div>
                      <p className="mb-1.5">
                        <FL>Search Student</FL>
                      </p>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Name or student ID…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        />
                      </div>
                    </div>

                    {/* Sub-ledger spotlight */}
                    <div>
                      <p className="mb-1.5">
                        <FL>Spotlight Sub-Ledger</FL>
                      </p>
                      <Select
                        size="middle"
                        className="w-full"
                        allowClear
                        placeholder="Highlight one fee type…"
                        options={allSubLedgers.map((sl) => ({
                          label: sl.name,
                          value: sl.code,
                        }))}
                        value={slSpotlight ?? undefined}
                        onChange={(v) => setSlSpotlight(v ?? null)}
                      />
                    </div>

                    {/* Min balance */}
                    <div>
                      <p className="mb-1.5">
                        <FL>Min Balance (GH₵)</FL>
                      </p>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={minBalance}
                        onChange={(e) => setMinBalance(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                    </div>

                    {/* Max balance */}
                    <div>
                      <p className="mb-1.5">
                        <FL>Max Balance (GH₵)</FL>
                      </p>
                      <div className="flex items-center gap-x-2">
                        <input
                          type="number"
                          placeholder="e.g. 500"
                          value={maxBalance}
                          onChange={(e) => setMaxBalance(e.target.value)}
                          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        />
                        {hasFilters && (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="flex items-center gap-x-1 px-3 h-10 rounded-xl text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Balance status tabs */}
                  <div>
                    <p className="mb-2">
                      <FL>Balance Status</FL>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {BALANCE_OPTIONS.map((opt) => {
                        const active = balanceFilter === opt.value;
                        const counts: Record<BalanceFilter, number> = {
                          all: classBill.length,
                          fully_paid: classBill.filter((s) => s.balance === 0)
                            .length,
                          partial: classBill.filter(
                            (s) => s.balance > 0 && s.balance < s.totalDebit,
                          ).length,
                          outstanding: classBill.filter((s) => s.balance > 0)
                            .length,
                          overpaid: classBill.filter((s) => s.balance < 0)
                            .length,
                        };
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setBalanceFilter(opt.value)}
                            className={`inline-flex items-center gap-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer
                              ${
                                active
                                  ? "text-[#C9A84C] border-[#0D1B2E]"
                                  : "text-slate-500 bg-white border-slate-200 hover:border-slate-300 hover:text-slate-700"
                              }`}
                            style={
                              active
                                ? {
                                    background:
                                      "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                                  }
                                : {}
                            }
                          >
                            <span
                              className={active ? "text-[#C9A84C]" : opt.col}
                            >
                              {opt.icon}
                            </span>
                            {opt.label}
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
                              ${active ? "bg-white/10 text-[#C9A84C]" : "bg-slate-100 text-slate-500"}`}
                            >
                              {counts[opt.value]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </MotionDiv>

      {/* ── STAT CHIPS ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasData && totals && (
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-3 mb-4"
          >
            <StatChip
              icon={<Users className="w-4 h-4" />}
              label="Students"
              value={totals.count}
              sub={`${totals.fullyPaid} fully paid · ${totals.outstanding} outstanding`}
            />
            <StatChip
              icon={<TrendingDown className="w-4 h-4" />}
              label="Total Billed"
              value={fmtShort(totals.totalDebit)}
              color="navy"
            />
            <StatChip
              icon={<CircleDollarSign className="w-4 h-4" />}
              label="Total Collected"
              value={fmtShort(totals.totalCredit)}
              color="green"
              sub={`${((totals.totalCredit / totals.totalDebit) * 100).toFixed(1)}% collection rate`}
            />
            <StatChip
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Outstanding"
              value={fmtShort(
                totals.totalBalance > 0 ? totals.totalBalance : 0,
              )}
              color={totals.totalBalance > 0 ? "rose" : "green"}
            />
            <StatChip
              icon={<BadgeCheck className="w-4 h-4" />}
              label="Fully Paid"
              value={`${totals.fullyPaid} / ${totals.count}`}
              color="green"
              sub={`${((totals.fullyPaid / totals.count) * 100).toFixed(0)}% of class`}
            />
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* ── COLLECTION BAR ─────────────────────────────────────────── */}
      <AnimatePresence>
        {hasData && totals && (
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mb-4"
          >
            <CollectionBar
              totalDebit={totals.totalDebit}
              totalCredit={totals.totalCredit}
            />
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* ── EMPTY / PROMPT ─────────────────────────────────────────── */}
      {!selectedSubId && (
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <EmptyState
            icon={<Wallet className="w-7 h-7" />}
            message="Select a class to view fees"
            sub="Choose an educational level and class from the filter card above. Year and term are optional — omit for cumulative balances."
          />
        </div>
      )}

      {selectedSubId && isLoading && (
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <SkeletonRows n={8} />
        </div>
      )}

      {selectedSubId && !isLoading && classBill.length === 0 && (
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <EmptyState
            icon={<Receipt className="w-7 h-7" />}
            message="No billing data found"
            sub="There are no fee records for this class and the selected period."
          />
        </div>
      )}

      {/* ── FEES TABLE ─────────────────────────────────────────────── */}
      {hasData && (
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <CardHeader
            icon={<GraduationCap className="w-4 h-4" />}
            title={`${subLevelName ?? "Class"} — Fees Overview`}
            badge={
              filteredRows.length !== classBill.length
                ? `${filteredRows.length} of ${classBill.length}`
                : `${classBill.length} students`
            }
            right={
              isFetching ? (
                <span className="flex items-center gap-x-1.5 text-[11px] text-white/60 ml-2">
                  <span className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Refreshing…
                </span>
              ) : undefined
            }
          />

          {/* Active filter strip */}
          <AnimatePresence>
            {hasFilters && (
              <MotionDiv
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-slate-100 bg-slate-50/60"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-4 py-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Filters:
                  </span>
                  {search && (
                    <span className="flex items-center gap-x-1 text-[11px] font-bold text-[#1E3A5F] bg-[#EEF2F8] border border-[#D0DCF0] px-2.5 py-0.5 rounded-full">
                      <Search className="w-3 h-3" />"{search}"
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="ml-1 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {balanceFilter !== "all" && (
                    <span className="flex items-center gap-x-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      {
                        BALANCE_OPTIONS.find((o) => o.value === balanceFilter)
                          ?.label
                      }
                      <button
                        type="button"
                        onClick={() => setBalanceFilter("all")}
                        className="ml-1 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {slSpotlight && (
                    <span className="flex items-center gap-x-1 text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">
                      <BookOpen className="w-3 h-3" />
                      {
                        allSubLedgers.find((sl) => sl.code === slSpotlight)
                          ?.name
                      }
                      <button
                        type="button"
                        onClick={() => setSlSpotlight(null)}
                        className="ml-1 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {(minBalance || maxBalance) && (
                    <span className="flex items-center gap-x-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                      <Hash className="w-3 h-3" />
                      Balance {minBalance ? `≥${minBalance}` : ""}
                      {minBalance && maxBalance ? " & " : ""}
                      {maxBalance ? `≤${maxBalance}` : ""}
                      <button
                        type="button"
                        onClick={() => {
                          setMinBalance("");
                          setMaxBalance("");
                        }}
                        className="ml-1 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                  >
                    Clear all
                  </button>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

          {/* Table */}
          <div className="overflow-x-auto">
            <table
              style={{
                minWidth: `${tableMinW}px`,
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              {/* ─ THEAD ─ */}
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {/* # sticky */}
                  <th
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 3,
                      background: "#F8FAFC",
                      width: 44,
                      minWidth: 44,
                      padding: "10px 8px",
                      borderBottom: "1px solid #E2E8F0",
                      borderRight: "1px solid #E2E8F0",
                      textAlign: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748B",
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    #
                  </th>

                  {/* Name sticky */}
                  <th
                    onClick={() => toggleSort("fullName")}
                    style={{
                      position: "sticky",
                      left: 44,
                      zIndex: 3,
                      background: "#F8FAFC",
                      minWidth: 200,
                      padding: "10px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid #E2E8F0",
                      borderRight: "1px solid #E2E8F0",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748B",
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Student{" "}
                    <SortIcon col="fullName" active={sortCol} dir={sortDir} />
                  </th>

                  {/* Sub-ledger columns */}
                  {allSubLedgers.map((sl) => (
                    <th
                      key={sl.code}
                      onClick={() => toggleSort(sl.code)}
                      style={{
                        minWidth: 120,
                        padding: "10px 10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #E2E8F0",
                        borderRight: "1px solid #EEF2F8",
                        textAlign: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: slSpotlight === sl.code ? "#1E3A5F" : "#94A3B8",
                        background:
                          slSpotlight === sl.code ? "#EEF2F8" : "#F8FAFC",
                        fontFamily: "'DM Sans', sans-serif",
                        whiteSpace: "nowrap",
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {sl.name.length > 14
                        ? sl.name.slice(0, 13) + "…"
                        : sl.name}
                      <br />
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: "9px",
                          color: "#CBD5E1",
                        }}
                      >
                        balance
                      </span>
                      <SortIcon col={sl.code} active={sortCol} dir={sortDir} />
                    </th>
                  ))}

                  {/* Sticky right: Debit / Credit / Balance */}
                  {[
                    { key: "totalDebit", label: "Billed", sub: "total debit" },
                    { key: "totalCredit", label: "Paid", sub: "total credit" },
                    { key: "balance", label: "Balance", sub: "outstanding" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      style={{
                        position: col.key === "balance" ? "sticky" : undefined,
                        right: col.key === "balance" ? 56 : undefined,
                        zIndex: col.key === "balance" ? 3 : 1,
                        background: "#EEF2F8",
                        minWidth: 100,
                        padding: "10px 10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #E2E8F0",
                        borderLeft: "1px solid #D0DCF0",
                        textAlign: "center",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#1E3A5F",
                        fontFamily: "'DM Sans', sans-serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.label}
                      <br />
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: "9px",
                          color: "#94A3B8",
                        }}
                      >
                        {col.sub}
                      </span>
                      <SortIcon col={col.key} active={sortCol} dir={sortDir} />
                    </th>
                  ))}

                  {/* Action sticky far-right */}
                  <th
                    style={{
                      position: "sticky",
                      right: 0,
                      zIndex: 3,
                      background: "#EEF2F8",
                      width: actionCoWidth,
                      minWidth: actionCoWidth,
                      padding: "10px 8px",
                      borderBottom: "1px solid #E2E8F0",
                      borderLeft: "1px solid #D0DCF0",
                      textAlign: "center",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#94A3B8",
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Pay / View
                  </th>
                </tr>
              </thead>

              {/* ─ TBODY ─ */}
              <tbody>
                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={3 + allSubLedgers.length + 3}
                      style={{
                        padding: "32px",
                        textAlign: "center",
                        color: "#94A3B8",
                        fontSize: "13px",
                      }}
                    >
                      No students match the active filters.
                    </td>
                  </tr>
                )}

                {filteredRows.map((student, idx) => {
                  const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#FAFBFD";
                  const balHeat = balanceColor(student.balance);
                  const isFullyPaid = student.balance <= 0;
                  const isOverpaid = student.balance < 0;
                  const overrideCollors = isFullyPaid || isOverpaid;
                  const initials = student.fullName
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0]?.toUpperCase() ?? "")
                    .join("");
                  const creditPct =
                    student.totalDebit > 0
                      ? Math.min(
                          100,
                          (student.totalCredit / student.totalDebit) * 100,
                        )
                      : 0;

                  return (
                    <tr key={student.studentId}>
                      {/* # */}
                      <td
                        style={{
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                          background: rowBg,
                          width: 44,
                          padding: "9px 6px",
                          borderBottom: "1px solid #F1F5F9",
                          borderRight: "1px solid #E2E8F0",
                          textAlign: "center",
                          fontSize: "12px",
                          color: "#94A3B8",
                          fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td
                        style={{
                          position: "sticky",
                          left: 44,
                          zIndex: 1,
                          background: rowBg,
                          minWidth: 200,
                          padding: "8px 14px",
                          borderBottom: "1px solid #F1F5F9",
                          borderRight: "1px solid #E2E8F0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#C9A84C",
                              background:
                                "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                            }}
                          >
                            {initials}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#0D1B2E",
                                fontFamily: "'DM Sans', sans-serif",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {student.fullName}
                            </div>
                            {student.otherName && (
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#94A3B8",
                                  marginTop: 1,
                                }}
                              >
                                {student.otherName}
                              </div>
                            )}
                            {/* Mini progress bar */}
                            <div
                              style={{
                                height: 2,
                                background: "#EEF2F8",
                                borderRadius: 4,
                                marginTop: 3,
                                overflow: "hidden",
                                width: "100%",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: 4,
                                  width: `${creditPct}%`,
                                  background:
                                    creditPct >= 100
                                      ? "#10B981"
                                      : creditPct >= 60
                                        ? "#F59E0B"
                                        : "#EF4444",
                                  transition: "width 0.6s ease",
                                }}
                              />
                            </div>
                          </div>
                          {/* Status icon */}
                          {isOverpaid && (
                            <span
                              title="Overpaid"
                              style={{ color: "#7C3AED", flexShrink: 0 }}
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {isFullyPaid && !isOverpaid && (
                            <span
                              title="Fully Paid"
                              style={{ color: "#059669", flexShrink: 0 }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sub-ledger balance cells */}
                      {allSubLedgers.map((sl) => {
                        const found = student.subLedgerBill.find(
                          (s) => s.slCode === sl.code,
                        );
                        const bal = found?.balance;
                        const isSpot = slSpotlight === sl.code;
                        const heat =
                          typeof bal === "number" ? balanceColor(bal) : null;
                        const barPct =
                          found && found.debit > 0
                            ? Math.min(100, (found.credit / found.debit) * 100)
                            : 0;

                        return (
                          <td
                            key={sl.code}
                            style={{
                              minWidth: 120,
                              padding: "7px 10px",
                              borderBottom: "1px solid #F1F5F9",
                              borderRight: "1px solid #EEF2F8",
                              textAlign: "center",
                              background: isSpot ? "#EEF2F8" : rowBg,
                            }}
                          >
                            {found && typeof bal === "number" ? (
                              <div>
                                <span
                                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${overrideCollors ? "bg-emerald-50" : heat!.bg} ${overrideCollors ? "text-emerald-700" : heat!.text} ${overrideCollors ? "border-emerald-200" : heat!.border}`}
                                >
                                  {fmt(bal)}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "4px",
                                    marginTop: 2,
                                    justifyContent: "center",
                                    fontSize: "9px",
                                    color: "#94A3B8",
                                  }}
                                >
                                  <span>Dr:{found.debit.toFixed(0)}</span>
                                  <span>Cr:{found.credit.toFixed(0)}</span>
                                </div>
                                <div
                                  style={{
                                    height: 2,
                                    background: "#E2E8F0",
                                    borderRadius: 4,
                                    marginTop: 2,
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      borderRadius: 4,
                                      width: overrideCollors
                                        ? "100%"
                                        : `${barPct}%`,
                                      background: overrideCollors
                                        ? "#10B981"
                                        : barPct >= 100
                                          ? "#10B981"
                                          : barPct >= 60
                                            ? "#F59E0B"
                                            : "#EF4444",
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span
                                style={{ color: "#E2E8F0", fontSize: "11px" }}
                              >
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Billed (Debit) */}
                      <td
                        style={{
                          minWidth: 100,
                          padding: "8px 10px",
                          borderBottom: "1px solid #F1F5F9",
                          borderLeft: "1px solid #D0DCF0",
                          textAlign: "right",
                          background: "#F8FAFC",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#0D1B2E",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {fmt(student.totalDebit)}
                        </span>
                      </td>

                      {/* Paid (Credit) */}
                      <td
                        style={{
                          minWidth: 100,
                          padding: "8px 10px",
                          borderBottom: "1px solid #F1F5F9",
                          borderLeft: "1px solid #D0DCF0",
                          textAlign: "right",
                          background: "#F8FAFC",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color:
                              student.totalCredit > 0 ? "#059669" : "#94A3B8",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {fmt(student.totalCredit)}
                        </span>
                      </td>

                      {/* Balance — sticky right, heat-coloured */}
                      <td
                        style={{
                          position: "sticky",
                          right: 56,
                          zIndex: 1,
                          minWidth: 100,
                          padding: "8px 10px",
                          borderBottom: "1px solid #D0DCF0",
                          borderLeft: "1px solid #D0DCF0",
                          textAlign: "right",
                          background: rowBg,
                        }}
                      >
                        <div
                          className={`inline-flex items-center justify-center flex-col gap-1. px-2.5 py-1.5. rounded-lg border ${balHeat.bg} ${balHeat.text} ${balHeat.border}`}
                          style={{
                            minWidth: "80px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 800,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {fmt(student.balance)}
                          </span>
                          {isOverpaid && (
                            <div
                              style={{
                                fontSize: "9px",
                                fontWeight: 600,
                              }}
                            >
                              overpaid
                            </div>
                          )}
                          {isFullyPaid && !isOverpaid && (
                            <div
                              style={{
                                fontSize: "9px",
                                fontWeight: 600,
                              }}
                            >
                              cleared
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td
                        style={{
                          position: "sticky",
                          right: 0,
                          zIndex: 1,
                          background: rowBg,
                          width: actionCoWidth,
                          minWidth: actionCoWidth,
                          padding: "8px 3px",
                          borderBottom: "1px solid #F1F5F9",
                          borderLeft: "1px solid #D0DCF0",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "60px",
                          columnGap: "2px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setDrawerStudent(student)}
                          title={`View ${student.fullName}'s ledger`}
                          className="w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                          style={{
                            background:
                              "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C9A84C]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePayment(student)}
                          title={`Pay ${student.fullName}'s ledger`}
                          className="w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                          style={{
                            background:
                              "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                          }}
                        >
                          <CircleDollarSign className="w-3.5 h-3.5 text-[#C9A84C]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* ─ FOOTER ROW ─ */}
              {filteredRows.length > 0 && (
                <tfoot>
                  <tr
                    style={{
                      background:
                        "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                    }}
                  >
                    <td
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                        background:
                          "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                        padding: "10px 8px",
                        textAlign: "center",
                        borderTop: "1px solid #1E3A5F",
                      }}
                    />
                    <td
                      style={{
                        position: "sticky",
                        left: 44,
                        zIndex: 2,
                        background:
                          "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                        padding: "10px 14px",
                        borderTop: "1px solid #1E3A5F",
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#C9A84C",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Class Total
                    </td>
                    {allSubLedgers.map((sl) => {
                      const total = filteredRows.reduce((sum, s) => {
                        const found = s.subLedgerBill.find(
                          (sl2) => sl2.slCode === sl.code,
                        );
                        return sum + (found?.balance ?? 0);
                      }, 0);
                      const heat = balanceColor(total);
                      return (
                        <td
                          key={sl.code}
                          style={{
                            minWidth: 120,
                            padding: "10px 10px",
                            borderTop: "1px solid #1E3A5F",
                            textAlign: "center",
                            background:
                              slSpotlight === sl.code
                                ? "rgba(255,255,255,0.08)"
                                : "transparent",
                          }}
                        >
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${heat.bg} ${heat.text} ${heat.border}`}
                          >
                            {fmt(total)}
                          </span>
                        </td>
                      );
                    })}
                    {/* Billed total */}
                    <td
                      style={{
                        minWidth: 100,
                        padding: "10px 10px",
                        borderTop: "1px solid #1E3A5F",
                        borderLeft: "1px solid rgba(255,255,255,0.1)",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#fff",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {fmt(filteredRows.reduce((s, r) => s + r.totalDebit, 0))}
                    </td>
                    {/* Paid total */}
                    <td
                      style={{
                        minWidth: 100,
                        padding: "10px 10px",
                        borderTop: "1px solid #1E3A5F",
                        borderLeft: "1px solid rgba(255,255,255,0.1)",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#C9A84C",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {fmt(filteredRows.reduce((s, r) => s + r.totalCredit, 0))}
                    </td>
                    {/* Balance total sticky */}
                    <td
                      style={{
                        position: "sticky",
                        right: 56,
                        zIndex: 2,
                        minWidth: 100,
                        padding: "10px 10px",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        borderLeft: "1px solid rgba(255,255,255,0.1)",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: 800,
                        color:
                          filteredRows.reduce((s, r) => s + r.balance, 0) <= 0
                            ? "#10B981"
                            : "#F87171",
                        background:
                          "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {fmt(filteredRows.reduce((s, r) => s + r.balance, 0))}
                    </td>
                    {/* Action col spacer */}
                    <td
                      style={{
                        position: "sticky",
                        right: 0,
                        zIndex: 2,
                        background:
                          "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        borderLeft: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Table footer meta */}
          {filteredRows.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex-wrap gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                {filteredRows.length} of {classBill.length} students
                {subLevelName && ` · ${subLevelName}`}
                {isTermScoped ? ` · ${termName} (${yearName})` : " · All time"}
              </span>
              <div className="flex items-center gap-x-3 text-[10px] text-slate-400 flex-wrap gap-y-1">
                <span className="flex items-center gap-x-1">
                  <span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" />
                  Balance cleared
                </span>
                <span className="flex items-center gap-x-1">
                  <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
                  Balance ≤ 200
                </span>
                <span className="flex items-center gap-x-1">
                  <span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" />
                  Balance &gt; 200
                </span>
                <span className="flex items-center gap-x-1">
                  <span className="w-2 h-2 rounded-sm bg-violet-400 inline-block" />
                  Overpaid
                </span>
              </div>
            </div>
          )}
        </MotionDiv>
      )}

      <PaymentModal
        selectedSubId={selectedSubId!}
        selectedYearId={selectedTermId}
        selectedTermId={selectedTermId}
      />

      <StudentPaymentDrawer
        student={drawerStudent}
        open={!!drawerStudent}
        onClose={() => setDrawerStudent(null)}
      />

      <PendingPaymentsDrawer isOpen={isOpen} close={closePending} />
    </div>
  );
};

export default ClassFeesOverview;
