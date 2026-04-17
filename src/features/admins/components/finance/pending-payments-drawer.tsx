import { MotionDiv } from "@/components/custom/motion";
import { yearKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getPendingPaymentFn } from "@/services/finance";
import { getAllYearsFn } from "@/services/setup/year-n-term";
import { Select } from "antd";
import { AlertCircle, Receipt, RefreshCw, Search, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { PaymentDetailModal, TimelineItem } from "./payment-drawer";
import type { PaymentGet } from "@/types/api/finance";

type Props = {
  isOpen: boolean;
  close: () => void;
  /** Pre-fill the year filter (pass the year the admin was viewing) */
  defaultYearId?: string;
  /** Pre-fill the term filter */
  defaultTermId?: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(n);

const PendingPaymentsDrawer = ({
  isOpen,
  close,
  defaultTermId,
  defaultYearId,
}: Props) => {
  const [yearId, setYearId] = useState<string | null>(defaultYearId ?? null);
  const [termId, setTermId] = useState<string | null>(defaultTermId ?? null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentGet | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: years = [] } = useFetch({
    queryKeys: yearKeys.list(),
    queryFn: getAllYearsFn,
  });

  const {
    data: pendings = [],
    refetch,
    isFetching,
    isLoading,
  } = useFetch({
    queryKeys: ["pendingPaymentHistory", yearId, termId],
    queryFn: () =>
      getPendingPaymentFn({
        academicYearId: yearId ?? undefined,
        academicTermId: termId ?? undefined,
      }),
    enabled: isOpen,
  });

  const handleOpenModal = (p: PaymentGet) => {
    setSelectedPayment(p);
    setModalOpen(true);
  };

  const totals = useMemo(() => {
    if (!pendings.length) return { pendings: 0, students: pendings.length };
    const tots = { pendings: 0, students: pendings.length };
    pendings.forEach((p) => {
      p.pendingPayments.forEach((ph) => {
        tots.pendings += ph.amount;
      });
    });
    return tots;
  }, [pendings]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* backdrop */}
            <MotionDiv
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
              onClick={close}
            />

            {/* drawer panel */}
            <MotionDiv
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-x-2 mt-0.5 flex-wrap gap-y-0.5">
                    <div className="text-slate-200 font-medium">
                      Pendings ({totals.students})
                    </div>
                    <span
                      className={`flex items-center gap-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full
                                   bg-emerald-400/20 text-emerald-300`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      Bal: {fmt(totals.pendings)}
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
                    onClick={close}
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

              {/* ── Search ─── */}
              {!isLoading && pendings.length > 0 && (
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
                {!isLoading && pendings.length === 0 && (
                  <div className="flex flex-col items-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                      <Receipt className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-semibold text-slate-400">
                      No pending records found
                    </p>
                    <p className="text-xs text-slate-300 text-center max-w-55 leading-relaxed">
                      {yearId
                        ? "No pending payments for the selected period."
                        : "There is no pending payment yet."}
                    </p>
                  </div>
                )}

                {/* Timeline groups */}
                {!isLoading &&
                  pendings.map((student) => (
                    <div key={student.studentId} className="mb-6">
                      {/* Date section label */}
                      <div className="flex items-center gap-x-3 mb-4">
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 bg-white border border-slate-200 rounded-full whitespace-nowrap">
                          {student.studentName}
                        </span>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>

                      {/* Items */}
                      <div>
                        {student.pendingPayments.map((payment, i) => (
                          <TimelineItem
                            key={payment.paymentId}
                            payment={payment}
                            isLast={
                              i === student.pendingPayments.length - 1 &&
                              student === pendings[pendings.length - 1]
                            }
                            onClick={() => handleOpenModal(payment)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
      {/* ── Payment detail modal ─────────────────────────────────────── */}
      <PaymentDetailModal
        payment={selectedPayment}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfter={true}
        // onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

export default PendingPaymentsDrawer;
