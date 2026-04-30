import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  BadgeDollarSign,
  Receipt,
  X,
} from "lucide-react";
import {
  MotionButton,
  MotionDiv,
  //   MotionSpan,
} from "@/components/custom/motion";
import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import useFetch from "@/hooks/api/use-fetch";
import type { SelectTypes } from "@/types/ui";
import { Select, Modal, Table, Tooltip } from "antd";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { getAllYearsFn, getTermsByEduIdFn } from "@/services/setup/year-n-term";
import { eduKeys, financeKeys, termKeys, yearKeys } from "@/config/query-keys";
import { getFeesFn } from "@/services/finance";
import { formatCurrency } from "@/services/currency";
import type { TuitionGet } from "@/types/api/finance";
import type { ColumnsType } from "antd/es/table";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface FeeCard {
  academicLevelId: string;
  academicLevelName: string;
  educationalLevelName: string;
  totalAmount: number;
  items: TuitionGet[];
}

// ─────────────────────────────────────────────────────────
// Label Component
// ─────────────────────────────────────────────────────────
const FL = ({ children }: { children: React.ReactNode }) => (
  <span
    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    {children}
  </span>
);

// ─────────────────────────────────────────────────────────
// Fee Card Component
// ─────────────────────────────────────────────────────────
const FeeCard = ({ card, onClick }: { card: FeeCard; onClick: () => void }) => {
  return (
    <MotionButton
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.22 }}
      className="w-full text-left bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer group"
      style={{ boxShadow: "0 2px 10px rgba(13,27,46,0.06)" }}
    >
      {/* Colored top strip - gradient based on level */}
      <div
        className="h-1.5 w-full"
        style={{
          background: "linear-gradient(135deg, #1E3A5F 0%, #0D1B2E 100%)",
        }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-x-3 mb-3">
          <div className="flex items-center gap-x-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#1E3A5F] to-[#0D1B2E] flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4 text-[#C9A84C]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-[#0D1B2E] text-sm leading-snug truncate"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                title={card.academicLevelName}
              >
                {card.academicLevelName}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {card.educationalLevelName}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors" />
        </div>

        {/* Amount */}
        <div className="mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Total Amount
          </p>
          <p
            className="text-2xl font-bold text-[#1E3A5F]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {formatCurrency(card.totalAmount, "GHS", { type: "currency" })}
          </p>
        </div>

        {/* Item count */}
        <p className="text-xs text-slate-400 font-semibold">
          {card.items.length} ledger item{card.items.length !== 1 ? "s" : ""}
        </p>
      </div>
    </MotionButton>
  );
};

// ─────────────────────────────────────────────────────────
// Detail Modal
// ─────────────────────────────────────────────────────────
const FeeDetailModal = ({
  card,
  open,
  onClose,
}: {
  card: FeeCard | null;
  open: boolean;
  onClose: () => void;
}) => {
  if (!card) return null;

  const columns: ColumnsType<TuitionGet> = [
    {
      key: "sn",
      title: "S/N",
      width: 5,
      render: (_, __, index) => index + 1,
    },
    {
      key: "sl",
      title: "Ledger Item",
      dataIndex: "sl",
      width: 200,
      render: (v: string) => (
        <Tooltip title={v}>
          <span className="font-semibold text-xs text-[#0D1B2E] truncate block">
            {v}
          </span>
        </Tooltip>
      ),
    },
    // {
    //   key: "academicLevelName",
    //   title: "Level",
    //   dataIndex: "academicLevelName",
    //   width: 120,
    //   render: (v: string) => (
    //     <span className="font-semibold text-xs text-[#0D1B2E]">{v}</span>
    //   ),
    // },
    // {
    //   key: "academicTermName",
    //   title: "Term",
    //   dataIndex: "academicTerm",
    //   width: 140,
    //   render: (_, record) => (
    //     <span className="font-semibold text-xs text-[#0D1B2E]">
    //       {record.academicTerm.academicTermName}
    //     </span>
    //   ),
    // },
    // {
    //   key: "academicYearName",
    //   title: "Year",
    //   dataIndex: "academicYear",
    //   width: 100,
    //   render: (_, record) => (
    //     <span className="font-semibold text-xs text-[#0D1B2E]">
    //       {record.academicYear.startYear}-{record.academicYear.endYear}
    //     </span>
    //   ),
    // },
    {
      key: "amount",
      title: "Amount",
      dataIndex: "amount",
      width: 120,
      align: "right" as const,
      render: (v) => (
        <span className="font-bold text-xs text-[#1E3A5F]">
          {formatCurrency(v, "GHS", { type: "currency" })}
        </span>
      ),
    },
  ];

  console.log(card.items);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      closeIcon={
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <X className="w-3.5 h-3.5 text-slate-500" />
        </div>
      }
      styles={{
        wrapper: { padding: 0, borderRadius: 20, overflow: "hidden" },
        container: {
          padding: 1,
          maxHeight: "90vh",
          overflow: "auto",
        },
        body: { padding: 0 },
      }}
    >
      {/* Modal header */}
      <div
        className="px-5 py-4 rounded-t-lg"
        style={{
          background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
        }}
      >
        <div className="flex items-center gap-x-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-[#C9A84C]">
            <Receipt className="w-4 h-4" />
          </div>
          <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
            Fee Details
          </span>
        </div>
        <h2
          className="text-white font-bold text-lg leading-snug mt-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {card.academicLevelName} — {card.educationalLevelName}
        </h2>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Summary */}
        <div className="flex items-center gap-x-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 mb-5">
          <BadgeDollarSign className="w-5 h-5 text-[#1E3A5F] shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Total Amount
            </p>
            <p
              className="text-xl font-bold text-[#0D1B2E]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {formatCurrency(card.totalAmount, "GHS", { type: "currency" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Items
            </p>
            <p className="text-xl font-bold text-[#0D1B2E]">
              {card.items.length}
            </p>
          </div>
        </div>

        {/* Table */}
        <Table<TuitionGet>
          rowKey={(r) => r.id}
          dataSource={card.items}
          columns={columns}
          pagination={{ showSizeChanger: true }}
          size="small"
          bordered={false}
          styles={{
            header: {
              cell: {
                // color: "#1E3A5F",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "11px",
                textTransform: "uppercase",
                backgroundColor: "#F8FAFC",
              },
            },
          }}
        />
      </div>
    </Modal>
  );
};

const ViewFees = () => {
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [selectedYear, setSelectedYear] = useState<SelectTypes | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<SelectTypes | null>(null);
  const [detailCard, setDetailCard] = useState<FeeCard | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const eduId = selectedEdu?.value;
  const yearId = selectedYear?.value;
  const termId = selectedTerm?.value;

  // ── Queries ──────────────────────────────────────────
  const { data: eduLevels, isLoading: edusLoading } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });

  const { data: years, isLoading: yearsLoading } = useFetch({
    queryFn: getAllYearsFn,
    queryKeys: yearKeys.list(),
  });

  const { data: terms, isLoading: termsLoading } = useFetch({
    queryFn: () => getTermsByEduIdFn(eduId!),
    queryKeys: termKeys.custom("edu-terms", { eduId }),
    enabled: !!eduId,
  });

  const { data: feesData, isLoading: feesLoading } = useFetch({
    queryFn: () =>
      getFeesFn({
        educationalLevelId: eduId,
        academicYearId: yearId,
        academicTermId: termId,
      }),
    queryKeys: financeKeys.custom("fees-view", {
      eduId,
      yearId,
      termId,
    }),
    enabled: !!eduId && !!yearId && !!termId,
  });

  // ── Memoized options ─────────────────────────────────
  const eduOptions = useMemo(
    () =>
      eduLevels?.map((l) => ({
        label: l.educationalLevelName,
        value: l.educationalLevelId,
      })) ?? [],
    [eduLevels],
  );

  const yearOptions = useMemo(
    () =>
      years?.map((y) => ({
        label: `${y.startYear}-${y.endYear}`,
        value: y.academicYearId,
      })) ?? [],
    [years],
  );

  const termOptions = useMemo(
    () =>
      terms?.map((t) => ({
        label: t.academicTermName,
        value: t.academicTermId,
      })) ?? [],
    [terms],
  );

  // ── Group fees by academic level ────────────────────
  const feeCards = useMemo((): FeeCard[] => {
    if (!feesData) return [];

    const grouped = new Map<string, FeeCard>();

    feesData.forEach((fee) => {
      const key = fee.academicLevelId;
      if (!grouped.has(key)) {
        grouped.set(key, {
          academicLevelId: fee.academicLevelId,
          academicLevelName: fee.academicLevelName,
          educationalLevelName: fee.educationalLevelName,
          totalAmount: 0,
          items: [],
        });
      }

      const card = grouped.get(key)!;
      card.totalAmount += fee.amount;
      card.items.push(fee);
    });

    return Array.from(grouped.values());
  }, [feesData]);

  // ── Total across all levels ──────────────────────────
  const totalAmount = useMemo(
    () => feeCards.reduce((sum, card) => sum + card.totalAmount, 0),
    [feeCards],
  );

  const hasFilters = !!selectedEdu && !!selectedYear && !!selectedTerm;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="px-2">
      {/* ── Filter card ──────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <FL>Educational Level</FL>
            </p>
            <Select
              size="large"
              labelInValue
              placeholder="Select level"
              className="w-full"
              options={eduOptions}
              loading={edusLoading}
              onChange={(opt) => {
                setSelectedEdu({
                  value: opt.value,
                  label: opt.label as string,
                });
                setSelectedTerm(null);
              }}
              value={selectedEdu}
              allowClear
            />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <FL>Academic Year</FL>
            </p>
            <Select
              size="large"
              labelInValue
              placeholder="Select year"
              className="w-full"
              options={yearOptions}
              loading={yearsLoading}
              onChange={(opt) =>
                setSelectedYear({
                  value: opt.value,
                  label: opt.label as string,
                })
              }
              value={selectedYear}
              allowClear
            />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <FL>Academic Term</FL>
            </p>
            <Select
              size="large"
              labelInValue
              placeholder={selectedEdu ? "Select term" : "Pick level first"}
              className="w-full"
              options={termOptions}
              loading={termsLoading}
              disabled={!selectedEdu || termsLoading}
              onChange={(opt) =>
                setSelectedTerm({
                  value: opt.value,
                  label: opt.label as string,
                })
              }
              value={selectedTerm}
              allowClear
            />
          </div>
        </div>
      </MotionDiv>

      {/* ── Stats (shown when filters are selected) ── */}
      <AnimatePresence>
        {hasFilters && feeCards.length > 0 && (
          <MotionDiv
            key="stats"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4"
          >
            <div
              className="flex items-center gap-x-3 rounded-2xl px-4 py-3 border border-white flex-1"
              style={{
                background: "linear-gradient(135deg, #1E3A5F 0%, #0D1B2E 100%)",
                boxShadow: "0 2px 8px rgba(13,27,46,0.04)",
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#C9A84C]">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 leading-none mb-0.5">
                  Total
                </p>
                <p
                  className="text-lg font-bold text-[#C9A84C] leading-tight"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {formatCurrency(totalAmount, "GHS", { type: "currency" })}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-x-3 rounded-2xl px-4 py-3 border border-white flex-1"
              style={{
                background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
                boxShadow: "0 2px 8px rgba(13,27,46,0.04)",
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#C9A84C]">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 leading-none mb-0.5">
                  Levels
                </p>
                <p
                  className="text-lg font-bold text-[#C9A84C] leading-tight"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {feeCards.length}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-x-3 rounded-2xl px-4 py-3 border border-white flex-1"
              style={{
                background: "linear-gradient(135deg, #1E3A5F 0%, #0D1B2E 100%)",
                boxShadow: "0 2px 8px rgba(13,27,46,0.04)",
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#C9A84C]">
                <BadgeDollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 leading-none mb-0.5">
                  Items
                </p>
                <p
                  className="text-lg font-bold text-[#C9A84C] leading-tight"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {feesData?.length ?? 0}
                </p>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            {selectedEdu && (
              <span className="text-[#0D1B2E] font-semibold">
                {selectedEdu.label} ({feeCards.length} level
                {feeCards.length !== 1 ? "s" : ""})
              </span>
            )}
          </nav>
        </div>

        {/* View toggle */}
        {hasFilters && feeCards.length > 0 && (
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            {(
              [
                ["grid", <LayoutGrid className="w-3.5 h-3.5" />],
                ["list", <List className="w-3.5 h-3.5" />],
              ] as const
            ).map(([mode, icon]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                  ${viewMode === mode ? "bg-white text-[#0D1B2E] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {icon}
                <span className="capitalize">{mode}</span>
              </button>
            ))}
          </div>
        )}
      </MotionDiv>

      {/* ── Main card ────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 16px rgba(13,27,46,0.07)" }}
      >
        {/* Card header */}
        <div
          className="flex items-center gap-x-3 px-5 py-3.5 border-b border-slate-100"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <span className="text-white font-semibold text-sm flex-1">
            {selectedEdu ? `${selectedEdu.label} — Academic Levels` : "Fees"}
          </span>
        </div>

        {/* Prompt: no filters selected */}
        {!hasFilters && (
          <div className="flex flex-col items-center py-16 gap-3 text-slate-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Receipt className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-400">
              Select filters to view fees
            </p>
            <p className="text-xs text-slate-300 text-center max-w-60">
              Choose educational level, academic year and term in the filter bar
              above
            </p>
          </div>
        )}

        {/* Loading */}
        {hasFilters && feesLoading && (
          <div
            className={`p-5 ${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}`}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-slate-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty: filters selected but no fees */}
        {hasFilters && !feesLoading && feeCards.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3 text-slate-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Receipt className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-400">
              No fees found for this selection
            </p>
          </div>
        )}

        {/* Grid view */}
        {hasFilters &&
          !feesLoading &&
          feeCards.length > 0 &&
          viewMode === "grid" && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feeCards.map((card, i) => (
                <MotionDiv
                  key={card.academicLevelId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <FeeCard card={card} onClick={() => setDetailCard(card)} />
                </MotionDiv>
              ))}
            </div>
          )}

        {/* List view */}
        {hasFilters &&
          !feesLoading &&
          feeCards.length > 0 &&
          viewMode === "list" && (
            <div className="p-5 space-y-3">
              {feeCards.map((card, i) => (
                <MotionDiv
                  key={card.academicLevelId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button
                    type="button"
                    onClick={() => setDetailCard(card)}
                    className="w-full p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50 transition-all text-left flex items-center justify-between gap-x-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0D1B2E] text-sm">
                        {card.academicLevelName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {card.educationalLevelName} • {card.items.length} item
                        {card.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-[#1E3A5F]">
                        {formatCurrency(card.totalAmount, "GHS", {
                          type: "currency",
                        })}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                </MotionDiv>
              ))}
            </div>
          )}
      </MotionDiv>

      {/* ── Detail Modal ─────────────────────────────── */}
      <FeeDetailModal
        card={detailCard}
        open={!!detailCard}
        onClose={() => setDetailCard(null)}
      />
    </div>
  );
};

export default ViewFees;
