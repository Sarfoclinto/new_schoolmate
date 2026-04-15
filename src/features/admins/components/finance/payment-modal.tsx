import { formatCurrency } from "@/services/currency";
import { usePayment } from "@/store/payment.store";
import type { DebitObj, PaymentMethod, SplitEntry } from "@/types/api/finance";
import { Button, Input, InputNumber, Modal, Select, Tooltip } from "antd";
import {
  ArrowLeft,
  Banknote,
  Smartphone,
  SplitSquareVertical,
  ReceiptText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader,
  Loader2,
  Trash2,
  Plus,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import NetworkSelector from "./network-selector";
import useVerifyPhone from "@/hooks/payment/use-phone-verify";
import { generateReference, sanitizePhone } from "@/utils/string";
import { useDebit } from "@/hooks/payment/use-debit";
import dayjs from "dayjs";
import useSavePayment from "@/hooks/payment/use-save-payment";
import { useAuth } from "@/store/auth.store";
import usePost from "@/hooks/api/use-post";
import { savePaymentFn } from "@/services/finance";
import SubledgerSelector from "./subLedger-selector";
import PayerNDescription from "./payer-n-description";

const buildPayload = () => {
  return {};
};

// ── Method tiles ──────────────────────────────────────────────────────────────
const METHOD_TILES: {
  key: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  color: string;
  disabled?: boolean;
}[] = [
  {
    key: "cash",
    label: "Cash",
    icon: <Banknote className="w-6 h-6" />,
    color: "#059669",
    disabled: false,
  },
  {
    key: "cheque",
    label: "Cheque",
    icon: <ReceiptText className="w-6 h-6" />,
    color: "#2563eb",
    disabled: true,
  },
  {
    key: "mobile_money",
    label: "Mobile Money",
    icon: <Smartphone className="w-6 h-6" />,
    color: "#7c3aed",
    disabled: true,
  },
  {
    key: "split",
    label: "Split",
    icon: <SplitSquareVertical className="w-6 h-6" />,
    color: "#C9A84C",
    disabled: true,
  },
];

// ── Cash Flow ─────────────────────────────────────────────────────────────────
const CashFlow = ({
  total,
  onConfirm,
  loading,
}: {
  total: number;
  onConfirm: (tendered: number) => void;
  loading: boolean;
}) => {
  const [tendered, setTendered] = useState<number>(total);

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex items-center justify-between px-5 py-4 rounded-2xl"
        style={{
          background: "rgba(5,150,105,0.07)",
          border: "1px solid rgba(5,150,105,0.15)",
        }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 m-0">
            Amount Due
          </p>
          <p
            className="text-3xl font-bold text-emerald-700 m-0 leading-none mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {formatCurrency<"GHS">(total, "GHS", { type: "currency" })}
          </p>
        </div>
        <Banknote className="w-10 h-10 text-emerald-300" strokeWidth={1} />
      </div>

      <div>
        <p
          className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Amount Tendered
        </p>
        <InputNumber
          className="w-full!"
          size="large"
          min={0}
          precision={2}
          value={tendered}
          onChange={(v) => setTendered(v ?? 0)}
        />
      </div>

      <SubledgerSelector />
      <PayerNDescription />

      <Button
        type="primary"
        size="large"
        className="w-full h-12! text-base! font-bold!"
        loading={loading}
        disabled={tendered < total}
        onClick={() => onConfirm(tendered)}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Save Transaction
      </Button>
      {tendered < total && (
        <p
          className="text-xs text-center text-red-400 -mt-3 m-0"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Tendered amount is less than total
        </p>
      )}
    </div>
  );
};

// ── Cheque Flow ─────────────────────────────────────────────────────────────────
const ChequeFlow = ({
  total,
  onConfirm,
  loading,
}: {
  total: number;
  onConfirm: (ref?: string) => void;
  loading: boolean;
}) => {
  const [ref, setRef] = useState("");

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex items-center justify-between px-5 py-4 rounded-2xl"
        style={{
          background: "rgba(37,99,235,0.06)",
          border: "1px solid rgba(37,99,235,0.12)",
        }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 m-0">
            Charge to Card
          </p>
          <p
            className="text-3xl font-bold text-blue-700 m-0 leading-none mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {formatCurrency<"GHS">(total, "GHS", { type: "currency" })}
          </p>
        </div>
        <ReceiptText className="w-10 h-10 text-blue-300" strokeWidth={1} />
      </div>

      <div>
        <p
          className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Reference Number (optional)
        </p>
        <Input
          size="large"
          placeholder="Card approval / reference number"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          onPressEnter={() => onConfirm(ref || undefined)}
        />
      </div>

      <Button
        type="primary"
        size="large"
        className="w-full h-12! text-base! font-bold!"
        loading={loading}
        onClick={() => onConfirm(ref || undefined)}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Confirm Debit
      </Button>
    </div>
  );
};

// ── MoMo Flow (Paystack) ──────────────────────────────────────────────────────
const MoMoFlow = ({
  total,
  onConfirmManual,
  loading,
}: {
  total: number;
  onSuccess?: (ref: string) => void;
  onConfirmManual: (ref?: string) => void;
  loading: boolean;
}) => {
  const userId = useAuth((s) => s.user?.userId);
  const {
    amount,
    network,
    phone,
    setPhone,
    studentId,
    setNetwork,
    setAmount,
    selectedSubLedger,
  } = usePayment();
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "failed"
  >("idle");
  const [description, setDescription] = useState("");
  const [payer, setPayer] = useState("");
  const ref = useMemo(() => generateReference(), []);

  const sanitizedPhone = useMemo(() => sanitizePhone(phone), [phone]);

  const {
    name: username,
    isLoading: verifying,
    // isError: vIsError,
    error: vErr,
  } = useVerifyPhone({ network, phone: sanitizedPhone });

  const {
    mutate: debit,
    isDebiting: debiting,
    isChecking,
    transRes,
    stopPolling,
    pollAttempt,
  } = useDebit({ refNo: ref });

  useSavePayment({
    save: transRes?.responseMessage === "Successfully Processed Transaction",
    payload: {
      studentId: studentId!,
      sl: selectedSubLedger,
      userId: userId!,
      amount: total,
      reference: ref,
      paymentMode: "mobile_money",
      description: description ?? ``,
      payer,
    },
  });

  const handleCharge = () => {
    const payload: DebitObj = {
      network: network,
      msisdn: sanitizePhone(phone),
      amount: amount,
      narration: `Debiting Customer ${sanitizedPhone} for Merchant ${username} on ${dayjs().format("DDMMYYY_HHmmss")}`,
      refNo: ref,
    };
    debit(payload);
  };

  if (status === "pending") {
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(124,58,237,0.1)" }}
        >
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
        <div className="text-center">
          <p
            className="text-sm font-bold text-[#0D1B2E] m-0"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Awaiting payment confirmation
          </p>
          <p
            className="text-xs text-slate-400 m-0 mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Customer should approve on their phone ·{" "}
            {formatCurrency<"GHS">(total, "GHS", { type: "currency" })}
          </p>
          <p className="text-[10px] text-slate-300 m-0 mt-2">
            Checking ({pollAttempt}/20)...
          </p>
        </div>
        <button
          onClick={() => {
            stopPolling();
            setStatus("idle");
            // clearInterval(pollRef.current);
          }}
          className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Cancel request
        </button>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-700 m-0">
            Payment confirmed!
          </p>
          <p className="text-xs text-slate-400 m-0 mt-1">Completing sale...</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-red-600 m-0">
            Payment failed or timed out
          </p>
          <p className="text-xs text-slate-400 m-0 mt-1">
            You can retry or confirm manually if payment was received.
          </p>
        </div>
        <div className="flex gap-2 w-full">
          <Button
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => {
              setStatus("idle");
            }}
            className="flex-1 flex items-center gap-1"
          >
            Retry
          </Button>
          <Button
            type="primary"
            onClick={() => onConfirmManual(ref || undefined)}
            loading={loading}
            className="flex-1"
          >
            Confirm Manually
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex items-center justify-between px-5 py-4 rounded-2xl"
        style={{
          background: "rgba(124,58,237,0.06)",
          border: "1px solid rgba(124,58,237,0.12)",
        }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600 m-0">
            Mobile Money
          </p>
          <p
            className="text-3xl font-bold text-purple-700 m-0 leading-none mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {formatCurrency<"GHS">(total, "GHS", { type: "currency" })}
          </p>
        </div>
        <Smartphone className="w-10 h-10 text-purple-300" strokeWidth={1} />
      </div>

      {/* Network Selector */}
      <NetworkSelector value={network} onChange={setNetwork} phone={phone} />

      <div className="flex flex-col w-full">
        <p
          className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Customer Phone Number
        </p>
        <Input
          size="large"
          placeholder="+233 20 000 0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <span className="flex flex-col md:flex-row md:items-center md:justify-between">
          <span className=" flex flex-col">
            {vErr ? (
              <span className="font-medium text-xs text-red-500">
                Error verifying phone number
              </span>
            ) : null}
          </span>
          {verifying ? (
            <span className="flex items-center gap-x-3">
              <span className="text-xs font-medium">Please wait</span>
              <Loader className="size-2.5 animate-spin" />
            </span>
          ) : (
            <span className="font-medium text-xs pt-1">
              Name: <span>{username ?? "N/A"}</span>
            </span>
          )}
        </span>
      </div>

      <SubledgerSelector />

      <div className="flex flex-col w-full">
        <p
          className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Amount
        </p>
        <InputNumber
          size="large"
          placeholder="0.00"
          value={phone}
          onChange={(e) => setAmount(Number(e))}
        />
      </div>

      <PayerNDescription />

      <Button
        type="primary"
        size="large"
        className="w-full h-12! text-base! font-bold!"
        disabled={verifying || !username || debiting || isChecking}
        loading={debiting || isChecking}
        onClick={handleCharge}
        style={{
          background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
          border: "none",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {debiting
          ? "Requesting..."
          : isChecking
            ? `Polling Transaction Status (Attempt #${pollAttempt})`
            : "Send Payment Request"}
      </Button>
    </div>
  );
};

// ── Split Flow ────────────────────────────────────────────────────────────────
const SplitFlow = ({
  total,
  onConfirm,
  loading,
}: {
  total: number;
  onConfirm: (splits: SplitEntry[]) => void;
  loading: boolean;
}) => {
  const [splits, setSplits] = useState<SplitEntry[]>([
    { method: "cash", amount: 0 },
    { method: "mobile_money", amount: 0 },
  ]);

  const allocated = splits.reduce((acc, s) => acc + (s.amount || 0), 0);
  const remaining = total - allocated;
  const isValid =
    splits.length >= 2 &&
    Math.abs(remaining) < 0.01 &&
    splits.every((s) => s.amount > 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateSplit = (idx: number, field: keyof SplitEntry, val: any) => {
    setSplits((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)),
    );
  };

  const addSplit = () =>
    setSplits((prev) => [...prev, { method: "cash", amount: 0 }]);

  const removeSplit = (idx: number) =>
    setSplits((prev) => prev.filter((_, i) => i !== idx));

  const fillRemaining = (idx: number) =>
    updateSplit(idx, "amount", splits[idx].amount + remaining);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold text-slate-500 uppercase tracking-wide"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Total: {formatCurrency<"GHS">(total, "GHS", { type: "currency" })}
        </span>
        <span
          className={`text-xs font-bold ${Math.abs(remaining) < 0.01 ? "text-emerald-600" : remaining > 0 ? "text-amber-600" : "text-red-500"}`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {Math.abs(remaining) < 0.01
            ? "✓ Fully allocated"
            : remaining > 0
              ? `${formatCurrency<"GHS">(remaining, "GHS", { type: "currency" })} remaining`
              : `${formatCurrency<"GHS">(Math.abs(remaining), "GHS", { type: "currency" })} over`}
        </span>
      </div>

      {/* Allocation bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, (allocated / total) * 100)}%`,
            background:
              Math.abs(remaining) < 0.01
                ? "#059669"
                : allocated > total
                  ? "#ef4444"
                  : "#C9A84C",
          }}
        />
      </div>

      {splits.map((split, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Select
            value={split.method}
            onChange={(v) => updateSplit(idx, "method", v)}
            style={{ width: 140 }}
            options={[
              { label: "Cash", value: "cash" },
              { label: "Card", value: "card" },
              { label: "Mobile Money", value: "mobile_money" },
              { label: "Other", value: "other" },
            ]}
          />
          <InputNumber
            className="flex-1! w-full!"
            min={0}
            precision={2}
            value={split.amount}
            onChange={(v) => updateSplit(idx, "amount", v ?? 0)}
            placeholder="0.00"
          />
          {remaining > 0 && (
            <Tooltip title="Fill remaining">
              <button
                onClick={() => fillRemaining(idx)}
                className="text-[10px] font-bold text-[#1E3A5F] hover:underline shrink-0 px-1"
              >
                Fill
              </button>
            </Tooltip>
          )}
          {splits.length > 2 && (
            <button
              onClick={() => removeSplit(idx)}
              className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addSplit}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] hover:text-[#0D1B2E] transition-colors"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Plus className="w-3.5 h-3.5" /> Add another method
      </button>

      <Button
        type="primary"
        size="large"
        className="w-full h-12! text-base! font-bold!"
        loading={loading}
        disabled={!isValid}
        onClick={() => onConfirm(splits)}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Confirm Split Payment
      </Button>
    </div>
  );
};

const PaymentModal = () => {
  const {
    isOpen,
    close,
    amount,
    studentName,
    studentId,
    selectedSubLedger,
    payer,
    setPayer,
    description,
    setDescription,
  } = usePayment();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const userId = useAuth((s) => s.user?.userId);

  const { mutate, isPending } = usePost({
    mutationOptions: { mutationKey: ["savepayment"] },
    postFn: savePaymentFn,
  });

  const handleClose = useCallback(() => {
    if (isPending) return;
    close();
    setMethod(null);
  }, [close, isPending]);

  const handleCash = (tendered: number) => {
    mutate({
      studentId: studentId!,
      sl: selectedSubLedger,
      amount: tendered,
      paymentMode: "cash",
      payer,
      description,
      userId: userId ?? "",
    });
  };

  const handleCheque = (ref?: string) => {
    //   saleMutation.mutate(
    //     buildPayload({
    //       method: "card",
    //       amount: totals.total,
    //       referenceNumber: ref,
    //     }),
    //   );
  };

  const handleMoMoSuccess = (ref: string) => {
    //   saleMutation.mutate(
    //     buildPayload({
    //       method: "mobile_money",
    //       amount: totals.total,
    //       referenceNumber: ref,
    //     }),
    //   );
  };

  const handleMoMoManual = (ref?: string) => {
    //   saleMutation.mutate(
    //     buildPayload({
    //       method: "mobile_money",
    //       amount: totals.total,
    //       referenceNumber: ref,
    //     }),
    //   );
  };

  const handleSplit = (splits: SplitEntry[]) => {
    //   saleMutation.mutate(
    //     buildPayload({
    //       method: "split",
    //       amount: totals.total,
    //       splits: splits as PaymentSplit[],
    //     }),
    //   );
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={480}
      centered
      closable={false}
      title={null}
      styles={{
        body: { padding: 0 },
        container: { padding: 0 },
      }}
    >
      {/* Modal header */}
      <div
        className="px-6 py-5 rounded-t-lg"
        style={{ background: "linear-gradient(135deg, #0D1B2E, #1E3A5F)" }}
      >
        <div className="flex items-center gap-3">
          {method && (
            <button
              onClick={() => setMethod(null)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2
              className="text-white font-bold text-base m-0"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {method
                ? `${METHOD_TILES.find((m) => m.key === method)?.label} ${studentName && ` for (${studentName})`}`
                : `Payment ${studentName && ` for (${studentName})`}`}
            </h2>
            <p
              className="text-white/40 text-xs m-0"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {method
                ? `Total: ${formatCurrency<"GHS">(amount, "GHS", { type: "currency" })}`
                : "Select payment method"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!method ? (
          /* Method selection */
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {METHOD_TILES.map((tile) => (
                <button
                  key={tile.key}
                  onClick={() => setMethod(tile.key)}
                  className="flex flex-col items-center gap-2.5 py-5 px-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-[#1E3A5F] hover:bg-[rgba(30,58,95,0.03)] transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ background: `${tile.color}15`, color: tile.color }}
                  >
                    {tile.icon}
                  </div>
                  <span
                    className="text-sm font-bold text-[#0D1B2E]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {tile.label}
                  </span>
                </button>
              ))}
            </div>
            {/* Total reminder */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "#f8fafd", border: "1px solid #e8edf5" }}
            >
              <span
                className="text-sm font-semibold text-slate-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Total Due
              </span>
              <span
                className="text-xl font-bold text-[#0D1B2E]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {formatCurrency<"GHS">(amount, "GHS", { type: "currency" })}
              </span>
            </div>
          </div>
        ) : method === "cash" ? (
          <CashFlow total={amount} onConfirm={handleCash} loading={false} />
        ) : method === "cheque" ? (
          <ChequeFlow total={amount} onConfirm={handleCheque} loading={false} />
        ) : method === "mobile_money" ? (
          <MoMoFlow
            total={amount}
            onSuccess={handleMoMoSuccess}
            onConfirmManual={handleMoMoManual}
            loading={false}
          />
        ) : (
          <SplitFlow total={amount} onConfirm={handleSplit} loading={false} />
        )}
      </div>
    </Modal>
  );
};
export default PaymentModal;
