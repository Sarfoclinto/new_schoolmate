/**
 * FinanceDashboardSection.tsx
 *
 * Self-contained finance section for the admin dashboard.
 * Drop it directly into AdminDashboard.tsx below the stat cards grid.
 *
 * Usage:
 *   import { FinanceDashboardSection } from "@/features/admins/components/finance-dashboard-section";
 *
 *   // Inside AdminDashboard return:
 *   <FinanceDashboardSection
 *     data={data?.financeDashboard}
 *     loading={isLoading}
 *   />
 *
 * Charts use shadcn/ui chart primitives (recharts under the hood).
 * All colours match the existing navy × gold design system.
 */

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  //   Legend,
} from "recharts";
import { MotionDiv } from "@/components/custom/motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Smartphone,
  Banknote,
  Clock,
  BarChart3,
  PieChartIcon,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import type {
  FinanceDashboardData,
  PaymentMethodStat,
  PaymentStatusStat,
} from "@/types/api/setup/admin";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const fmtShort = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `GH₵${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `GH₵${(n / 1_000).toFixed(1)}K`;
  return `GH₵${n.toFixed(0)}`;
};

const pctColor = (pct: number) =>
  pct >= 90 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";

// ─────────────────────────────────────────────────────────────────────────────
// Colour palettes (navy × gold × semantic)
// ─────────────────────────────────────────────────────────────────────────────

// const NAVY = "#0D1B2E";
const NAVY_MID = "#1E3A5F";
const GOLD = "#C9A84C";
// const GOLD_LIGHT = "#E8C76A";

const METHOD_COLORS: Record<string, string> = {
  cash: "#10B981",
  momo: "#7C3AED",
  cheque: "#3B82F6",
};

const STATUS_COLORS: Record<string, string> = {
  paid: "#10B981",
  pending: "#F59E0B",
  failed: "#EF4444",
  cancelled: "#94A3B8",
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  momo: "Mobile Money",
  cheque: "Cheque",
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  cash: <Banknote className="w-3.5 h-3.5" />,
  momo: <Smartphone className="w-3.5 h-3.5" />,
  cheque: <FileCheck className="w-3.5 h-3.5" />,
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-slate-100 rounded-xl animate-pulse ${className}`} />
);

// ─────────────────────────────────────────────────────────────────────────────
// Finance KPI Card
// ─────────────────────────────────────────────────────────────────────────────

const FinanceKpiCard = ({
  icon,
  label,
  value,
  sub,
  accent,
  link,
  index,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
  accent: string;
  link?: string;
  index: number;
  loading: boolean;
}) => (
  <MotionDiv
    custom={index}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.06 }}
    className="bg-white rounded-xl border border-slate-100 p-5 group"
    style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
  >
    <div className="flex items-center justify-between mb-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
      >
        {icon}
      </div>
      {loading ? (
        <Skeleton className="w-20 h-7" />
      ) : (
        <span
          className="text-xl font-bold text-[#0D1B2E]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {value}
        </span>
      )}
    </div>

    {loading ? (
      <Skeleton className="w-32 h-4 mt-1" />
    ) : (
      <div className="flex items-center justify-between mt-1">
        <div>
          <p
            className="text-sm font-semibold text-slate-600"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {label}
          </p>
          {sub && (
            <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
          )}
        </div>
        {link && (
          <Link
            to={link}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 text-[11px] font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-all"
          >
            View <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    )}
  </MotionDiv>
);

// ─────────────────────────────────────────────────────────────────────────────
// Collection Rate Ring
// ─────────────────────────────────────────────────────────────────────────────

const CollectionRateRing = ({
  rate,
  loading,
}: {
  rate: number;
  loading: boolean;
}) => {
  const clampedRate = Math.min(100, Math.max(0, rate));
  const ringData = [
    { name: "collected", value: clampedRate, fill: pctColor(clampedRate) },
    { name: "remaining", value: 100 - clampedRate, fill: "#F1F5F9" },
  ];

  return (
    <div
      className="bg-white rounded-xl border border-slate-100 p-5"
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
    >
      <div className="flex items-center gap-x-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#EEF2F8] flex items-center justify-center text-[#1E3A5F]">
          <BarChart3 className="w-4 h-4" />
        </div>
        <p
          className="text-sm font-bold text-[#0D1B2E]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Collection Rate
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-y-3 py-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="w-16 h-4" />
        </div>
      ) : (
        <div className="relative flex flex-col items-center">
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={ringData}
                cx="50%"
                cy="70%"
                innerRadius={48}
                outerRadius={64}
                startAngle={180}
                endAngle={0}
                dataKey="value"
                strokeWidth={0}
              >
                {ringData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Centre label */}
          <div className="absolute bottom-8 text-center pointer-events-none">
            <p
              className="text-2xl font-black text-[#0D1B2E]"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: pctColor(clampedRate),
              }}
            >
              {clampedRate.toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-0.5">
              collected
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-around mt-1 text-[11px] text-slate-500">
        <div className="flex items-center gap-x-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: pctColor(clampedRate) }}
          />
          Collected
        </div>
        <div className="flex items-center gap-x-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-200" />
          Outstanding
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Revenue Area Chart (billed vs collected by month)
// ─────────────────────────────────────────────────────────────────────────────

const RevenueChart = ({
  data,
  loading,
}: {
  data: FinanceDashboardData["revenueByMonth"];
  loading: boolean;
}) => (
  <div
    className="bg-white rounded-xl border border-slate-100 p-5"
    style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-x-2">
        <div className="w-7 h-7 rounded-lg bg-[#EEF2F8] flex items-center justify-center text-[#1E3A5F]">
          <TrendingUp className="w-4 h-4" />
        </div>
        <p
          className="text-sm font-bold text-[#0D1B2E]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Revenue Trend
        </p>
      </div>
      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
        Last 6 months
      </span>
    </div>

    {loading ? (
      <Skeleton className="w-full h-48" />
    ) : (
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
        >
          <defs>
            <linearGradient id="billedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={NAVY_MID} stopOpacity={0.15} />
              <stop offset="95%" stopColor={NAVY_MID} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
              <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F1F5F9"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtShort}
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            formatter={(v, name) => [
              fmt(v as number),
              name === "billed" ? "Billed" : "Collected",
            ]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <Area
            type="monotone"
            dataKey="billed"
            stroke={NAVY_MID}
            strokeWidth={2}
            fill="url(#billedGrad)"
            dot={false}
            name="billed"
          />
          <Area
            type="monotone"
            dataKey="collected"
            stroke={GOLD}
            strokeWidth={2.5}
            fill="url(#collectedGrad)"
            dot={{ r: 3, fill: GOLD, strokeWidth: 0 }}
            name="collected"
          />
        </AreaChart>
      </ResponsiveContainer>
    )}

    <div className="flex items-center gap-x-4 mt-2 text-[11px] text-slate-500">
      <div className="flex items-center gap-x-1.5">
        <div
          className="w-5 h-0.5 rounded-full"
          style={{ background: NAVY_MID }}
        />
        Billed
      </div>
      <div className="flex items-center gap-x-1.5">
        <div className="w-5 h-0.5 rounded-full" style={{ background: GOLD }} />
        Collected
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Payment Method Pie Chart
// ─────────────────────────────────────────────────────────────────────────────

const PaymentMethodChart = ({
  data,
  loading,
}: {
  data: PaymentMethodStat[];
  loading: boolean;
}) => {
  const total = data.reduce((s, d) => s + d.totalAmount, 0);

  return (
    <div
      className="bg-white rounded-xl border border-slate-100 p-5"
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
    >
      <div className="flex items-center gap-x-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#EEF2F8] flex items-center justify-center text-[#1E3A5F]">
          <PieChartIcon className="w-4 h-4" />
        </div>
        <p
          className="text-sm font-bold text-[#0D1B2E]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Payment Methods
        </p>
      </div>

      {loading ? (
        <Skeleton className="w-full h-40" />
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2 text-slate-300">
          <PieChartIcon className="w-8 h-8" />
          <p className="text-xs">No payment data</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                dataKey="totalAmount"
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.method}
                    fill={METHOD_COLORS[entry.method] ?? "#94A3B8"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [fmt(v as number), "Amount"]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend rows */}
          <div className="flex flex-col gap-y-1.5 mt-2">
            {data.map((d) => {
              const pct =
                total > 0 ? ((d.totalAmount / total) * 100).toFixed(1) : "0";
              return (
                <div
                  key={d.method}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-x-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        background: METHOD_COLORS[d.method] ?? "#94A3B8",
                      }}
                    />
                    <span className="flex items-center gap-x-1 text-slate-600 font-medium">
                      {METHOD_ICONS[d.method]}
                      {METHOD_LABELS[d.method] ?? d.method}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <span className="text-slate-400">{d.count} txns</span>
                    <span className="font-bold text-[#0D1B2E]">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Payment Status Donut
// ─────────────────────────────────────────────────────────────────────────────

const PaymentStatusChart = ({
  data,
  loading,
}: {
  data: PaymentStatusStat[];
  loading: boolean;
}) => {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div
      className="bg-white rounded-xl border border-slate-100 p-5"
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
    >
      <div className="flex items-center gap-x-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
          <Clock className="w-4 h-4" />
        </div>
        <p
          className="text-sm font-bold text-[#0D1B2E]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Payment Status
        </p>
      </div>

      {loading ? (
        <Skeleton className="w-full h-40" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                dataKey="count"
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? "#94A3B8"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, _name, props) => [
                  `${v} transactions (${fmt(props.payload?.totalAmount ?? 0)})`,
                  props.payload?.status,
                ]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
            {data.map((d) => {
              const pct =
                total > 0 ? ((d.count / total) * 100).toFixed(0) : "0";
              return (
                <div
                  key={d.status}
                  className="flex items-center gap-x-1.5 text-[11px]"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: STATUS_COLORS[d.status] ?? "#94A3B8" }}
                  />
                  <span className="capitalize text-slate-500 font-medium">
                    {d.status}
                  </span>
                  <span className="font-bold text-[#0D1B2E] ml-auto">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Outstanding by Sub-Ledger (Horizontal Bar)
// ─────────────────────────────────────────────────────────────────────────────

const OutstandingBySubLedger = ({
  data,
  loading,
}: {
  data: FinanceDashboardData["outstandingBySubLedger"];
  loading: boolean;
}) => (
  <div
    className="bg-white rounded-xl border border-slate-100 p-5"
    style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
  >
    <div className="flex items-center gap-x-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
        <TrendingDown className="w-4 h-4" />
      </div>
      <p
        className="text-sm font-bold text-[#0D1B2E]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Outstanding by Fee Type
      </p>
    </div>

    {loading ? (
      <Skeleton className="w-full h-44" />
    ) : data.length === 0 ? (
      <div className="flex flex-col items-center py-8 gap-2 text-slate-300">
        <CheckCircle2 className="w-8 h-8 text-emerald-300" />
        <p className="text-xs text-emerald-500 font-medium">
          All fees collected!
        </p>
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={data.length * 42 + 16}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F1F5F9"
            horizontal={false}
          />
          <XAxis
            type="number"
            tickFormatter={fmtShort}
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="sl"
            width={90}
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [fmt(v as number)]}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              fontSize: 11,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <Bar
            dataKey="totalBilled"
            fill={`${NAVY_MID}30`}
            radius={[0, 4, 4, 0]}
            name="Billed"
          />
          <Bar
            dataKey="outstanding"
            fill="#EF4444"
            radius={[0, 4, 4, 0]}
            name="Outstanding"
          />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Billed vs Collected by Educational Level (Grouped Bar)
// ─────────────────────────────────────────────────────────────────────────────

const LevelFinanceChart = ({
  data,
  loading,
}: {
  data: FinanceDashboardData["billedVsCollectedByLevel"];
  loading: boolean;
}) => (
  <div
    className="bg-white rounded-xl border border-slate-100 p-5"
    style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
  >
    <div className="flex items-center gap-x-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-[#EEF2F8] flex items-center justify-center text-[#1E3A5F]">
        <BarChart3 className="w-4 h-4" />
      </div>
      <p
        className="text-sm font-bold text-[#0D1B2E]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Billed vs Collected — by Level
      </p>
    </div>

    {loading ? (
      <Skeleton className="w-full h-52" />
    ) : (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
          barCategoryGap="25%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F1F5F9"
            vertical={false}
          />
          <XAxis
            dataKey="educationalLevelName"
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tickFormatter={fmtShort}
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            formatter={(v, name) => [
              fmt(v as number),
              name === "totalBilled" ? "Billed" : "Collected",
            ]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <Bar
            dataKey="totalBilled"
            fill={`${NAVY_MID}50`}
            radius={[4, 4, 0, 0]}
            name="totalBilled"
          />
          <Bar
            dataKey="totalCollected"
            fill={GOLD}
            radius={[4, 4, 0, 0]}
            name="totalCollected"
          />
        </BarChart>
      </ResponsiveContainer>
    )}

    <div className="flex items-center gap-x-4 mt-2 text-[11px] text-slate-500">
      <div className="flex items-center gap-x-1.5">
        <div
          className="w-4 h-2.5 rounded-sm"
          style={{ background: `${NAVY_MID}50` }}
        />
        Billed
      </div>
      <div className="flex items-center gap-x-1.5">
        <div className="w-4 h-2.5 rounded-sm" style={{ background: GOLD }} />
        Collected
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  data?: FinanceDashboardData;
  loading: boolean;
}

export const FinanceDashboardSection = ({ data, loading }: Props) => {
  // Fallback empty shapes so charts don't crash while loading
  const kpis = data?.kpis;
  const revenue = data?.revenueByMonth ?? [];
  const methods = data?.paymentMethodBreakdown ?? [];
  const statuses = data?.paymentStatusBreakdown ?? [];
  const subledgers = data?.outstandingBySubLedger ?? [];
  const levels = data?.billedVsCollectedByLevel ?? [];

  const collectionRate = kpis?.collectionRate ?? 0;

  return (
    <section style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Section header ─────────────────────────────────────────── */}
      {/* <MotionDiv
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#EEF2F8] flex items-center justify-center text-[#1E3A5F]">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h2
              className="text-base font-bold text-[#0D1B2E] leading-none"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Finance Overview
            </h2>
            {kpis?.scopeLabel && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {kpis.scopeLabel}
              </p>
            )}
          </div>
        </div>

        <Link
          // to="/admin/finance/fees-overview"
          to=""
          className="flex items-center gap-x-1.5 text-xs font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-colors"
        >
          Full Finance View <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </MotionDiv> */}

      {/* ── KPI cards row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <FinanceKpiCard
          index={0}
          loading={loading}
          icon={<TrendingDown className="w-5 h-5 text-[#1E3A5F]" />}
          label="Total Billed"
          accent="bg-[#EEF2F8]"
          value={loading ? "—" : fmtShort(kpis?.totalBilled ?? 0)}
          // link="/admin/finance/billing-center"
        />

        <FinanceKpiCard
          index={1}
          loading={loading}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          label="Collected"
          accent="bg-emerald-50"
          value={loading ? "—" : fmtShort(kpis?.totalCollected ?? 0)}
          sub={
            !loading && kpis
              ? `${kpis.collectionRate.toFixed(1)}% rate`
              : undefined
          }
        />

        <FinanceKpiCard
          index={2}
          loading={loading}
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
          label="Outstanding"
          accent="bg-rose-50"
          value={loading ? "—" : fmtShort(kpis?.outstanding ?? 0)}
          // link="/admin/finance/fees-overview"
        />

        <FinanceKpiCard
          index={3}
          loading={loading}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          label="Fully Paid"
          accent="bg-emerald-50"
          value={loading ? "—" : String(kpis?.fullyPaidStudents ?? 0)}
          sub={
            !loading && kpis
              ? `of ${kpis.fullyPaidStudents + kpis.studentsWithBalance} students`
              : undefined
          }
        />

        <FinanceKpiCard
          index={4}
          loading={loading}
          icon={<Wallet className="w-5 h-5 text-amber-600" />}
          label="With Balance"
          accent="bg-amber-50"
          value={loading ? "—" : String(kpis?.studentsWithBalance ?? 0)}
          // link="/admin/finance/fees-overview"
        />

        <FinanceKpiCard
          index={5}
          loading={loading}
          icon={<FileCheck className="w-5 h-5 text-blue-600" />}
          label="Pending Cheques"
          accent="bg-blue-50"
          value={loading ? "—" : String(kpis?.pendingCheques ?? 0)}
          sub={
            !loading && kpis && kpis.pendingCheques > 0
              ? fmtShort(kpis.pendingChequeAmount)
              : undefined
          }
        />
      </div>

      {/* ── Charts row 1: Area + Collection ring + Method pie ───────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_180px_1fr] gap-4 mb-4">
        <RevenueChart data={revenue} loading={loading} />
        <CollectionRateRing rate={collectionRate} loading={loading} />
        <PaymentMethodChart data={methods} loading={loading} />
      </div>

      {/* ── Charts row 2: Status donut + Outstanding bar + Level bar ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <PaymentStatusChart data={statuses} loading={loading} />
        <OutstandingBySubLedger data={subledgers} loading={loading} />
        <LevelFinanceChart data={levels} loading={loading} />
      </div>
    </section>
  );
};

export default FinanceDashboardSection;
