import { formatCurrency } from "@/services/currency";
import { usePayment } from "@/store/payment.store";
import {
  validatePaymentPayload,
  type DebitObj,
  type PaymentMethod,
  type SplitEntry,
} from "@/types/api/finance";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Tooltip,
  type FormInstance,
} from "antd";
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
import { useCallback, useMemo, useState, useEffect } from "react";
import NetworkSelector from "./network-selector";
import useVerifyPhone from "@/hooks/payment/use-phone-verify";
import {
  capitalizeWords,
  generateReference,
  sanitizePhone,
} from "@/utils/string";
import { useDebit } from "@/hooks/payment/use-debit";
import dayjs from "dayjs";
import useSavePayment from "@/hooks/payment/use-save-payment";
import { useAuth } from "@/store/auth.store";
import usePost from "@/hooks/api/use-post";
import { savePaymentFn } from "@/services/finance";
import SubledgerSelector from "./subLedger-selector";
import PayerNDescription from "./payer-n-description";
import AmountTendered from "./amount-tendered";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/config/query-keys";

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
    disabled: false,
  },
  {
    key: "mobile_money",
    label: "Mobile Money",
    icon: <Smartphone className="w-6 h-6" />,
    color: "#7c3aed",
    disabled: false,
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
  form,
}: {
  total: number;
  onConfirm: (tendered: number) => void;
  loading: boolean;
  form?: FormInstance;
}) => {
  return (
    <Form
      form={form}
      onFinish={(values) => {
        onConfirm(values.tendered);
      }}
      layout="vertical"
      className="flex flex-col gap-5"
    >
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

      <AmountTendered required />
      <SubledgerSelector />
      <PayerNDescription />

      <Button
        type="primary"
        size="large"
        htmlType="submit"
        className="w-full h-12! text-base! font-bold!"
        loading={loading}
        disabled={loading}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Save Transaction
      </Button>
    </Form>
  );
};

// ── Cheque Flow ─────────────────────────────────────────────────────────────────
const ChequeFlow = ({
  onConfirm,
  loading,
  form,
}: {
  total: number;
  onConfirm: (
    chequeNumber: string,
    accountNumber: string,
    tendered: number,
  ) => void;
  loading: boolean;
  form: FormInstance;
}) => {
  return (
    <Form
      form={form}
      onFinish={(values) => {
        onConfirm(values.chequeNumber, values.accountNumber, values.tendered);
      }}
      layout="vertical"
      className="flex flex-col gap-5"
    >
      <AmountTendered />
      <Form.Item
        name="chequeNumber"
        labelCol={{ style: { paddingBottom: 0, marginBottom: 0 } }}
        className="my-0! py-0!"
        label={
          <p
            className="text-xs font-bold text-slate-500 uppercase tracking-wide"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Cheque Number
          </p>
        }
        rules={[
          { required: true, message: "Unique cheque number is required" },
        ]}
      >
        <Input.OTP length={6} size="large" />
      </Form.Item>
      <Form.Item
        name="accountNumber"
        labelCol={{ style: { paddingBottom: 0, marginBottom: 0 } }}
        className="my-0! py-0!"
        label={
          <p
            className="text-xs font-bold text-slate-500 uppercase tracking-wide"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Account Number
          </p>
        }
        rules={[{ required: true, message: "Account number is required" }]}
      >
        <Input size="large" placeholder="Account number" />
      </Form.Item>
      <SubledgerSelector />
      <PayerNDescription />

      <Button
        type="primary"
        size="large"
        className="w-full h-12! text-base! font-bold!"
        loading={loading}
        htmlType="submit"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Save Transaction
      </Button>
    </Form>
  );
};

// ── MoMo Flow (Paystack) ──────────────────────────────────────────────────────
const MoMoFlow = ({
  total,
  form,
}: {
  total: number;
  onConfirmManual: (ref?: string) => void;
  form: FormInstance;
}) => {
  const userId = useAuth((s) => s.user?.userId);
  const {
    network,
    phone,
    setPhone,
    studentId,
    setNetwork,
    selectedSubLedger,
    reference,
    setReference,
    reset,
    close,
  } = usePayment();
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "failed"
  >("idle");

  // Generate reference once when component mounts (if not already set)
  useEffect(() => {
    if (!reference) {
      setReference(generateReference());
    }
  }, [reference, setReference]);

  const payer = usePayment((s) => s.payer);
  const description = usePayment((s) => s.description);
  const sanitizedPhone = useMemo(() => sanitizePhone(phone), [phone]);
  const tendered = Form.useWatch("tendered", form);

  const {
    name: username,
    isLoading: verifying,
    error: vErr,
  } = useVerifyPhone({ network, phone: sanitizedPhone });

  const {
    mutate: debit,
    isDebiting: debiting,
    isChecking,
    isPolling,
    transRes,
    stopPolling,
    pollAttempt,
    pollError,
    hasExceededTimeout,
    hasExceededMaxAttempts,
  } = useDebit({
    refNo: reference,
    onSuccessFn: () => {
      setStatus("pending");
    },
  });

  useEffect(() => {
    if ((hasExceededTimeout || hasExceededMaxAttempts) && !isPolling) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("failed");
    }
  }, [hasExceededTimeout, hasExceededMaxAttempts, isPolling]);

  useSavePayment({
    save: transRes?.responseMessage === "Successfully Processed Transaction",
    payload: {
      studentId: studentId!,
      slCode: selectedSubLedger,
      userId: userId!,
      amount: tendered,
      reference: reference,
      paymentMode: "momo",
      description: description ?? ``,
      payer,
    },
    onSuccessSave: ({ responseCode }) => {
      if (responseCode === 1) {
        setStatus("success");
        setPhone("");
        reset();
        form.resetFields();
      } else {
        setStatus("failed");
      }
    },
  });

  const onFinish = (values: { tendered: number }) => {
    const payload: DebitObj = {
      network: capitalizeWords(network),
      msisdn: sanitizePhone(phone),
      amount: values.tendered,
      narration: `Debiting ${sanitizedPhone} on ${dayjs().format("Do MMM, YYYY")}`,
      refNo: reference,
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
          {pollError && (
            <p className="text-[10px] text-red-500 m-0 mt-1">
              ⚠️ {pollError.message}
            </p>
          )}
          {!hasExceededTimeout && !hasExceededMaxAttempts && (
            <p className="text-[10px] text-slate-300 m-0 mt-2">
              Checking ({pollAttempt}/20)...
            </p>
          )}
          {hasExceededTimeout && (
            <p className="text-[10px] text-red-500 m-0 mt-2 font-semibold">
              ⏱️ Polling timeout - payment may have been processed
            </p>
          )}
          {hasExceededMaxAttempts && (
            <p className="text-[10px] text-red-500 m-0 mt-2 font-semibold">
              ❌ Max polling attempts exceeded
            </p>
          )}
        </div>

        {/* Stop button only shown when actively polling */}
        {isPolling && (
          <button
            onClick={() => {
              stopPolling();
              setStatus("idle");
            }}
            className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            ✕ Stop polling
          </button>
        )}
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-700 m-0">
            Payment confirmed!
          </p>
          <Button onClick={close} className="mt-5 w-full!" block type="primary">
            Close
          </Button>
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
        </div>
        <div className="flex gap-2 w-full">
          <Button
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => {
              setPhone("");
              reset();
              form.resetFields();
              close();
            }}
            className="flex-1 flex items-center gap-1"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      className="flex flex-col gap-5"
    >
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
              <span className="font-medium text-[10px] text-red-500">
                Error verifying phone number
              </span>
            ) : null}
          </span>
          {verifying ? (
            <span className="flex items-center gap-x-3">
              <span className="text-[10px] font-medium">Please wait</span>
              <Loader className="size-2.5 animate-spin" />
            </span>
          ) : (
            <span className="font-medium text-[10px] pt-1">
              Name:{" "}
              <span className="text-emerald-500 text-[10px] font-medium">
                {username ?? "N/A"}
              </span>
            </span>
          )}
        </span>
      </div>

      <SubledgerSelector />

      <AmountTendered />

      <PayerNDescription />

      <Button
        type="primary"
        size="large"
        className="w-full h-12! text-base! font-bold!"
        disabled={verifying || !username || debiting || isPolling || isChecking}
        loading={debiting || isChecking}
        htmlType="submit"
        style={{
          background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
          border: "none",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {debiting
          ? "Requesting..."
          : isPolling || isChecking
            ? `Polling Transaction Status (Attempt #${pollAttempt})`
            : "Send Payment Request"}
      </Button>
    </Form>
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

type Props = {
  selectedSubId: string;
  selectedYearId?: string;
  selectedTermId?: string;
};

const PaymentModal = ({
  selectedSubId,
  selectedTermId,
  selectedYearId,
}: Props) => {
  const {
    isOpen,
    close,
    amount,
    studentName,
    studentId,
    selectedSubLedger,
    payer,
    description,
  } = usePayment();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const reset = usePayment((s) => s.reset);
  const userId = useAuth((s) => s.user?.userId);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { mutate, isPending } = usePost({
    mutationOptions: { mutationKey: ["savepayment"] },
    postFn: savePaymentFn,
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
        await qc.invalidateQueries({
          queryKey: financeKeys.custom("classBill", {
            selectedSubId,
            selectedYearId,
            selectedTermId,
          }),
        });
        setMethod(null);
        reset();
        form.resetFields();
        close();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error("Failed to save", { description: err.message });
    },
  });

  const handleClose = useCallback(() => {
    if (isPending) return;
    setMethod(null);
    reset();
    form.resetFields();
    close();
  }, [close, form, isPending, reset]);

  const handleCash = (tendered: number) => {
    const payload = {
      studentId: studentId!,
      slCode: selectedSubLedger,
      amount: tendered,
      paymentMode: "cash",
      payer,
      description,
      userId: userId ?? "",
    };
    const result = validatePaymentPayload(payload);
    if (result.success) {
      mutate(result.data);
    } else {
      toast.error(result.error.message);
    }
  };

  const handleCheque = (
    chequeNumber: string,
    accountNumber: string,
    tendered: number,
  ) => {
    const payload = {
      studentId: studentId!,
      slCode: selectedSubLedger,
      amount: tendered,
      paymentMode: "cheque",
      payer,
      description,
      userId: userId ?? "",
      chequeReference: {
        accountNumber,
        chequeNumber,
      },
    };
    const result = validatePaymentPayload(payload);
    if (result.success) {
      mutate(result.data);
    } else {
      toast.error(result.error.message);
    }
  };

  const handleMoMoManual = (ref?: string) => {
    mutate({
      studentId: studentId!,
      slCode: selectedSubLedger,
      amount,
      paymentMode: "momo",
      payer,
      description,
      userId: userId ?? "",
      reference: ref,
    });
  };

  const handleSplit = (splits: SplitEntry[]) => {
    console.log(splits);
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
                  disabled={tile.disabled}
                  className="flex flex-col items-center gap-2.5 py-5 px-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-[#1E3A5F] hover:bg-[rgba(30,58,95,0.03)] transition-all group disabled:opacity-35 disabled:cursor-not-allowed"
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
          <CashFlow
            total={amount}
            onConfirm={handleCash}
            form={form}
            loading={isPending}
          />
        ) : method === "cheque" ? (
          <ChequeFlow
            form={form}
            total={amount}
            onConfirm={handleCheque}
            loading={isPending}
          />
        ) : method === "mobile_money" ? (
          <MoMoFlow
            form={form}
            total={amount}
            onConfirmManual={handleMoMoManual}
          />
        ) : (
          <SplitFlow
            total={amount}
            onConfirm={handleSplit}
            loading={isPending}
          />
        )}
      </div>
    </Modal>
  );
};
export default PaymentModal;
