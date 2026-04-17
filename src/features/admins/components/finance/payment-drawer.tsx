/**
 * StudentPaymentDrawer.tsx
 *
 * Drawer that slides in from the right showing a student's full payment
 * history as a custom timeline. Clicking any event opens a detail modal.
 * Cheque payments in "pending" status show Mark as Paid / Cancel buttons.
 *
 * Usage (drop into ClassFeesOverview action column):
 *
 *   const [drawerStudent, setDrawerStudent] = useState<StudentBill | null>(null);
 *
 *   // Replace the Eye button's onClick:
 *   onClick={() => setDrawerStudent(student)}
 *
 *   // Render at the bottom of the page:
 *   <StudentPaymentDrawer
 *     student={drawerStudent}
 *     open={!!drawerStudent}
 *     onClose={() => setDrawerStudent(null)}
 *   />
 *
 * Optionally forward the current yearId / termId as defaultYearId / defaultTermId
 * so the drawer opens pre-filtered to the same period the admin was viewing.
 */

import { Modal, Select, Tooltip } from "antd";
import { useState, useMemo } from "react";
// import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Banknote,
  Smartphone,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Receipt,
  User,
  Info,
  Layers,
  BadgeCheck,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { MotionButton } from "@/components/custom/motion";
import type {
  PaymentGet,
  PaymentMode,
  PaymentStatus,
  StudentBillRef,
} from "@/types/api/finance";
import usePost from "@/hooks/api/use-post";
import {
  getStudentPaymentHistoryFn,
  updatePaymentStatusFn,
} from "@/services/finance";
import useFetch from "@/hooks/api/use-fetch";
import { yearKeys } from "@/config/query-keys";
import { getAllYearsFn } from "@/services/setup/year-n-term";

// ─── Currency ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(n);

// ─── Relative time ────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-GH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG MAPS
// ═══════════════════════════════════════════════════════════════════════════════

const MODE_CONFIG: Record<
  PaymentMode,
  {
    label: string;
    icon: React.ReactNode;
    bg: string;
    text: string;
    border: string;
  }
> = {
  cash: {
    label: "Cash",
    icon: <Banknote className="w-3.5 h-3.5" />,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  momo: {
    label: "Mobile Money",
    icon: <Smartphone className="w-3.5 h-3.5" />,
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  cheque: {
    label: "Cheque",
    icon: <FileCheck className="w-3.5 h-3.5" />,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
};

const STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    icon: React.ReactNode;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  paid: {
    label: "Paid",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "#10B981",
  },
  pending: {
    label: "Pending",
    icon: <Clock className="w-3.5 h-3.5" />,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "#F59E0B",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="w-3.5 h-3.5" />,
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "#EF4444",
  },
  cancelled: {
    label: "Cancelled",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
    dot: "#94A3B8",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const DetailRow = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-x-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mt-0.5">
        {label}
      </span>
      <span
        className={`text-sm font-semibold text-[#0D1B2E] text-right ${mono ? "font-mono" : ""}`}
        style={{ fontFamily: mono ? "monospace" : "'DM Sans', sans-serif" }}
      >
        {value}
      </span>
    </div>
  );
};

const PaymentDetailModal = ({
  payment,
  open,
  onClose,
  onStatusUpdate,
}: {
  payment: PaymentGet | null;
  open: boolean;
  onClose: () => void;
  onStatusUpdate: (paymentId: string, status: "paid" | "cancelled") => void;
}) => {
  //   const qc = useQueryClient();

  const updateStatus = usePost({
    postFn: updatePaymentStatusFn,
    onSuccess: (res) => {
      if (res.responseCode === 1) {
        toast.success(res.responseMessage);
      } else {
        toast.info(res.responseMessage);
      }
      onStatusUpdate(payment!.paymentId, updateStatus.variables!.status);
      onClose();
    },
    onError: (e: AxiosError) => toast.error(e.message),
  });

  if (!payment) return null;

  const statusCfg = STATUS_CONFIG[payment.status];
  const modeCfg = MODE_CONFIG[payment.paymentMode];
  const isCheque = payment.paymentMode === "cheque";
  const isActionable = isCheque && payment.status === "pending";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={460}
      centered
      destroyOnHidden
      closeIcon={
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <X className="w-3.5 h-3.5 text-slate-500" />
        </div>
      }
      styles={{
        container: { padding: 0, borderRadius: 20, overflow: "hidden" },
        body: { padding: 0 },
      }}
    >
      {/* Modal header */}
      <div
        className="flex items-center gap-x-3 px-5 py-4"
        style={{
          background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
        }}
      >
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
          <Receipt className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-white font-bold text-sm truncate"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {payment.label}
          </p>
          <p className="text-white/50 text-[11px] mt-0.5 font-mono truncate">
            {payment.paymentId}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-x-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
        >
          {statusCfg.icon}
          {statusCfg.label}
        </span>
      </div>

      <div className="p-5">
        {/* Amount — hero */}
        <div className="flex items-center justify-between mb-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Amount
            </p>
            <p
              className="text-2xl font-black text-[#0D1B2E]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {fmt(payment.amount)}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-x-1.5 text-xs font-bold px-3 py-2 rounded-xl border ${modeCfg.bg} ${modeCfg.text} ${modeCfg.border}`}
          >
            {modeCfg.icon}
            {modeCfg.label}
          </span>
        </div>

        {/* Detail rows */}
        <div
          className="bg-white border border-slate-100 rounded-2xl px-4 mb-4"
          style={{ boxShadow: "0 1px 4px rgba(13,27,46,0.04)" }}
        >
          <DetailRow label="Payer" value={payment.payer} />
          <DetailRow label="Description" value={payment.description} />
          <DetailRow
            label="Sub-Ledger"
            value={
              payment.sl ? `${payment.sl.sl} (${payment.sl.slCode})` : undefined
            }
          />
          <DetailRow label="Reference" value={payment.reference} mono />
          <DetailRow label="Account No." value={payment.accountNumber} mono />
          <DetailRow label="Cheque No." value={payment.chequeNumber} mono />
          <DetailRow label="Created" value={fullDate(payment.createdOn)} />
          {payment.updatedOn !== payment.createdOn && (
            <DetailRow label="Updated" value={fullDate(payment.updatedOn)} />
          )}
        </div>

        {/* Cheque pending actions */}
        {isActionable && (
          <div className="flex flex-col gap-y-3">
            <div className="flex items-start gap-x-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                This cheque payment is awaiting clearance. Mark as{" "}
                <strong>Paid</strong> once the cheque clears, or{" "}
                <strong>Cancel</strong> if it bounces or is withdrawn.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-3">
              {/* Mark as Paid */}
              <button
                type="button"
                disabled={updateStatus.isPending}
                onClick={() =>
                  updateStatus.mutate({
                    paymentId: payment.paymentId,
                    status: "paid",
                  })
                }
                className={`flex items-center justify-center gap-x-2 h-11 rounded-xl font-bold text-sm transition-all
                  ${
                    updateStatus.isPending
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "text-white hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-[0_4px_12px_rgba(13,27,46,0.2)]"
                  }`}
                style={
                  !updateStatus.isPending
                    ? {
                        background:
                          "linear-gradient(135deg,#059669 0%,#10B981 100%)",
                      }
                    : {}
                }
              >
                {updateStatus.isPending &&
                updateStatus.variables?.status === "paid" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BadgeCheck className="w-4 h-4" />
                )}
                Mark Paid
              </button>

              {/* Cancel */}
              <button
                type="button"
                disabled={updateStatus.isPending}
                onClick={() =>
                  updateStatus.mutate({
                    paymentId: payment.paymentId,
                    status: "cancelled",
                  })
                }
                className={`flex items-center justify-center gap-x-2 h-11 rounded-xl font-bold text-sm transition-all border
                  ${
                    updateStatus.isPending
                      ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
                      : "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500 active:scale-[0.98] cursor-pointer"
                  }`}
              >
                {updateStatus.isPending &&
                updateStatus.variables?.status === "cancelled" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════

const TimelineItem = ({
  payment,
  isLast,
  onClick,
}: {
  payment: PaymentGet;
  isLast: boolean;
  onClick: () => void;
}) => {
  const statusCfg = STATUS_CONFIG[payment.status];
  const modeCfg = MODE_CONFIG[payment.paymentMode];

  return (
    <div className="flex gap-x-3 relative">
      {/* Vertical connector line */}
      {!isLast && (
        <div className="absolute left-4.5 top-9 bottom-0 w-0.5 bg-slate-100 z-0" />
      )}

      {/* Timeline dot — clickable */}
      <button
        type="button"
        onClick={onClick}
        className="relative z-10 shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-sm"
        style={{
          borderColor: statusCfg.dot,
          backgroundColor: `${statusCfg.dot}18`,
          boxShadow: `0 0 0 3px ${statusCfg.dot}18`,
        }}
        title="Click to view details"
      >
        <span style={{ color: statusCfg.dot }}>{statusCfg.icon}</span>
      </button>

      {/* Content card */}
      <MotionButton
        type="button"
        onClick={onClick}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.12 }}
        className="flex-1 text-left mb-4 p-3.5 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-slate-200 hover:shadow-sm transition-all"
        style={{ boxShadow: "0 1px 4px rgba(13,27,46,0.04)" }}
      >
        <div className="flex items-start justify-between gap-x-3 mb-2">
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-bold text-[#0D1B2E] leading-tight truncate"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {payment.label}
            </p>
            {payment.sl && (
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {payment.sl.sl}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p
              className="text-sm font-black text-[#0D1B2E]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {fmt(payment.amount)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {timeAgo(payment.createdOn)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-x-2 flex-wrap gap-y-1.5">
          {/* Status pill */}
          <span
            className={`inline-flex items-center gap-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
          >
            {statusCfg.icon}
            {statusCfg.label}
          </span>

          {/* Mode pill */}
          <span
            className={`inline-flex items-center gap-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${modeCfg.bg} ${modeCfg.text} ${modeCfg.border}`}
          >
            {modeCfg.icon}
            {modeCfg.label}
          </span>

          {/* Payer */}
          <span className="inline-flex items-center gap-x-1 text-[10px] text-slate-400">
            <User className="w-3 h-3" />
            {payment.payer}
          </span>

          {/* Cheque pending badge */}
          {payment.paymentMode === "cheque" && payment.status === "pending" && (
            <span className="inline-flex items-center gap-x-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" />
              Awaiting clearance
            </span>
          )}
        </div>
      </MotionButton>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY STRIP
// ═══════════════════════════════════════════════════════════════════════════════

const SummaryStrip = ({ payments }: { payments: PaymentGet[] }) => {
  const paid = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const pending = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);
  const cancelled = payments.filter((p) => p.status === "cancelled").length;
  const failed = payments.filter((p) => p.status === "failed").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 py-4 bg-slate-50/60 border-b border-slate-100">
      {[
        {
          label: "Paid",
          value: fmt(paid),
          color: "text-emerald-700",
          bg: "bg-emerald-50 border-emerald-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        },
        {
          label: "Pending",
          value: fmt(pending),
          color: "text-amber-700",
          bg: "bg-amber-50 border-amber-200",
          icon: <Clock className="w-3.5 h-3.5" />,
        },
        {
          label: "Cancelled",
          value: `${cancelled} record${cancelled !== 1 ? "s" : ""}`,
          color: "text-slate-500",
          bg: "bg-slate-100 border-slate-200",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        },
        {
          label: "Failed",
          value: `${failed} record${failed !== 1 ? "s" : ""}`,
          color: "text-rose-600",
          bg: "bg-rose-50 border-rose-200",
          icon: <XCircle className="w-3.5 h-3.5" />,
        },
      ].map((s) => (
        <Tooltip title={s.value} key={s.label}>
          <div
            key={s.label}
            className={`flex items-center gap-x-2.5 px-3 py-2.5 rounded-xl border ${s.bg}`}
          >
            <span className={s.color}>{s.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">
                {s.label}
              </p>
              <p
                className={`text-xs font-bold mt-0.5 truncate ${s.color}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {s.value}
              </p>
            </div>
          </div>
        </Tooltip>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DRAWER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface StudentPaymentDrawerProps {
  student: StudentBillRef | null;
  open: boolean;
  onClose: () => void;
  /** Pre-fill the year filter (pass the year the admin was viewing) */
  defaultYearId?: string;
  /** Pre-fill the term filter */
  defaultTermId?: string;
}

export const StudentPaymentDrawer = ({
  student,
  open,
  onClose,
  defaultYearId,
  defaultTermId,
}: StudentPaymentDrawerProps) => {
  const [yearId, setYearId] = useState<string | null>(defaultYearId ?? null);
  const [termId, setTermId] = useState<string | null>(defaultTermId ?? null);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentGet | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: years = [] } = useFetch({
    queryKeys: yearKeys.list(),
    queryFn: getAllYearsFn,
  });

  const {
    data: payments = [],
    isLoading,
    refetch,
    isFetching,
  } = useFetch({
    queryKeys: ["paymentHistory", student?.studentId, yearId, termId],
    queryFn: () =>
      getStudentPaymentHistoryFn({
        studentId: student!.studentId,
        academicYearId: yearId ?? undefined,
        academicTermId: termId ?? undefined,
      }),
    enabled: !!student?.studentId && open,
  });

  // ── Local payment state (optimistic after status updates) ─────────────────
  const [localOverrides, setLocalOverrides] = useState<
    Record<string, PaymentStatus>
  >({});

  const resolvedPayments: PaymentGet[] = useMemo(
    () =>
      payments.map((p) => ({
        ...p,
        status: (localOverrides[p.paymentId] ?? p.status) as PaymentStatus,
      })),
    [payments, localOverrides],
  );

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return resolvedPayments;
    const q = search.toLowerCase();
    return resolvedPayments.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.payer.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sl?.sl.toLowerCase().includes(q) ||
        p.reference?.toLowerCase().includes(q),
    );
  }, [resolvedPayments, search]);

  // Group by date for timeline sections
  const grouped = useMemo(() => {
    const groups: { date: string; items: PaymentGet[] }[] = [];
    const seen = new Map<string, PaymentGet[]>();
    filtered.forEach((p) => {
      const d = new Date(p.createdOn).toLocaleDateString("en-GH", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      if (!seen.has(d)) {
        seen.set(d, []);
        groups.push({ date: d, items: seen.get(d)! });
      }
      seen.get(d)!.push(p);
    });
    return groups;
  }, [filtered]);

  const initials =
    student?.fullName
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("") ?? "?";

  const handleStatusUpdate = (
    paymentId: string,
    status: "paid" | "cancelled",
  ) => {
    setLocalOverrides((prev) => ({ ...prev, [paymentId]: status }));
    setModalOpen(false);
  };

  const handleOpenModal = (p: PaymentGet) => {
    setSelectedPayment(p);
    setModalOpen(true);
  };

  // Resolve modal payment with overrides
  const resolvedModalPayment = selectedPayment
    ? {
        ...selectedPayment,
        status: (localOverrides[selectedPayment.paymentId] ??
          selectedPayment.status) as PaymentStatus,
      }
    : null;

  if (!student) return null;

  return (
    <>
      {/* ── DRAWER (custom implementation using fixed overlay) ───────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(13,27,46,0.35)",
                backdropFilter: "blur(2px)",
              }}
              onClick={onClose}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 bg-white flex flex-col"
              style={{
                width: "min(570px, 100vw)",
                boxShadow: "-8px 0 40px rgba(13,27,46,0.15)",
              }}
            >
              {/* ── Drawer header ─── */}
              <div
                className="flex items-center gap-x-3 px-5 py-4 shrink-0"
                style={{
                  background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                }}
              >
                {/* Student avatar */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[#C9A84C] text-sm shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1.5px solid rgba(201,168,76,0.4)",
                  }}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-white font-bold text-sm leading-tight truncate"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {student.fullName}
                  </p>
                  <div className="flex items-center gap-x-2 mt-0.5 flex-wrap gap-y-0.5">
                    {student.subLevelName && (
                      <span className="flex items-center gap-x-1 text-white/50 text-[10px]">
                        <Layers className="w-3 h-3" />
                        {student.subLevelName}
                      </span>
                    )}
                    <span
                      className={`flex items-center gap-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full
                      ${
                        student.balance <= 0
                          ? "bg-emerald-400/20 text-emerald-300"
                          : "bg-rose-400/20 text-rose-300"
                      }`}
                    >
                      {student.balance <= 0 ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Cleared
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          Bal: {fmt(student.balance)}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Filters row ─── */}
              <div className="flex flex-col sm:flex-row gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
                <Select
                  size="middle"
                  className="flex-1"
                  allowClear
                  placeholder="All years…"
                  options={years.map((y) => ({
                    label: `${y.startYear}-${y.endYear}`,
                    value: y.academicYearId,
                  }))}
                  value={yearId ?? undefined}
                  onChange={(v) => {
                    setYearId(v ?? null);
                    setTermId(null);
                  }}
                />
                <Select
                  size="middle"
                  className="flex-1"
                  allowClear
                  placeholder={yearId ? "All terms…" : "Select year first"}
                  disabled={!yearId}
                  value={termId ?? undefined}
                  onChange={(v) => setTermId(v ?? null)}
                />
              </div>

              {/* ── Summary strip ─── */}
              {!isLoading && resolvedPayments.length > 0 && (
                <SummaryStrip payments={resolvedPayments} />
              )}

              {/* ── Search ─── */}
              {!isLoading && resolvedPayments.length > 0 && (
                <div className="px-5 py-3 border-b border-slate-100 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search payments…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </div>
                </div>
              )}

              {/* ── Timeline ─── */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                {/* Loading skeleton */}
                {isLoading && (
                  <div className="flex flex-col gap-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
                        <div
                          className="flex-1 h-20 bg-slate-100 rounded-2xl animate-pulse"
                          style={{ opacity: 1 - i * 0.12 }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!isLoading && resolvedPayments.length === 0 && (
                  <div className="flex flex-col items-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                      <Receipt className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-semibold text-slate-400">
                      No payment records found
                    </p>
                    <p className="text-xs text-slate-300 text-center max-w-55 leading-relaxed">
                      {yearId
                        ? "No payments for the selected period."
                        : "This student has no payment history yet."}
                    </p>
                  </div>
                )}

                {/* Search empty */}
                {!isLoading &&
                  resolvedPayments.length > 0 &&
                  filtered.length === 0 && (
                    <div className="flex flex-col items-center py-10 gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-400">
                        No matches
                      </p>
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="text-xs font-bold text-[#1E3A5F] hover:text-[#C9A84C] cursor-pointer transition-colors"
                      >
                        Clear search
                      </button>
                    </div>
                  )}

                {/* Timeline groups */}
                {!isLoading &&
                  grouped.map((group) => (
                    <div key={group.date} className="mb-6">
                      {/* Date section label */}
                      <div className="flex items-center gap-x-3 mb-4">
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 bg-white border border-slate-200 rounded-full whitespace-nowrap">
                          {group.date}
                        </span>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>

                      {/* Items */}
                      <div>
                        {group.items.map((payment, i) => (
                          <TimelineItem
                            key={payment.paymentId}
                            payment={payment}
                            isLast={
                              i === group.items.length - 1 &&
                              group === grouped[grouped.length - 1]
                            }
                            onClick={() => handleOpenModal(payment)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                {/* Total count footer */}
                {!isLoading && filtered.length > 0 && (
                  <p className="text-center text-[11px] text-slate-300 mt-4 pb-2">
                    {filtered.length} payment{filtered.length !== 1 ? "s" : ""}
                    {search && ` matching "${search}"`}
                    {(yearId || termId) && " in selected period"}
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Payment detail modal ─────────────────────────────────────── */}
      <PaymentDetailModal
        payment={resolvedModalPayment}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

export default StudentPaymentDrawer;
