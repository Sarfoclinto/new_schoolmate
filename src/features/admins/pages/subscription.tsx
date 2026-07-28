// ─────────────────────────────────────────────────────────────────────────────
//  Types & constants
// ─────────────────────────────────────────────────────────────────────────────

import { MotionDiv } from "@/components/custom/motion";
import { useDebit } from "@/hooks/payment/use-debit";
import useVerifyPhone from "@/hooks/payment/use-phone-verify";
import { useSaveSubscription } from "@/hooks/payment/use-save-payment";
import { fmt } from "@/services/currency";
import { useAuth } from "@/store/auth.store";
import { generateReference } from "@/utils/string";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

type Step = "summary" | "phone" | "confirm" | "processing" | "result";

type PayResult = "success" | "failed" | "timeout";

type Network = "MTN" | "Vodafone" | "AirtelTigo";

// ── Theme tokens (Deep Navy × Slate Navy × Gold) ────────────────────────────
const NAVY_900 = "#0D1B2E";
const NAVY_700 = "#1E3A5F";
const GOLD = "#C9A84C";
const GOLD_DIM = "rgba(201, 168, 76, 0.12)";
const GOLD_TEXT = "#8B6914";

const GOLD_GRADIENT = `linear-gradient(135deg, ${GOLD}, #A8863A)`;
const NAVY_GRADIENT = `linear-gradient(135deg, ${NAVY_900}, ${NAVY_700})`;

// ── Fixed subscription fee ───────────────────────────────────────────────────
// const SUBSCRIPTION_FEE = 4999;
const SUBSCRIPTION_FEE = 8000;
const FEE_LABEL = "Service & Maintenance";
const FEE_CADENCE = "Subscription";

const COVERAGE_ITEMS: { icon: typeof Wrench; label: string }[] = [
  // { icon: Wrench, label: "Facility upkeep & repairs" },
  { icon: Zap, label: "IT infrastructure & utilities" },
  // { icon: ShieldCheck, label: "Campus security & safety" },
  // { icon: Building2, label: "Building & grounds maintenance" },
];

const NETWORKS: {
  id: Network;
  label: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    id: "MTN",
    label: "MTN",
    color: "text-yellow-700",
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    border: "border-yellow-300 dark:border-yellow-700",
  },
  {
    id: "Vodafone",
    label: "Vodafone",
    color: "text-rose-700",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-300 dark:border-rose-700",
  },
  {
    id: "AirtelTigo",
    label: "AirtelTigo",
    color: "text-red-700",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-300 dark:border-red-700",
  },
];

// Sanitise to E.164 Ghana format: "0241234567" → "233241234567"
function sanitisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0")) return "233" + digits.slice(1);
  return "233" + digits;
}

function isValidGhPhone(raw: string) {
  return sanitisePhone(raw).length === 12;
}

function PageHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      <div>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col gap-4"
    >
      {children}
    </MotionDiv>
  );
}

// Visual progress dots
function StepProgress({ current }: { current: Step }) {
  const ORDERED: Step[] = [
    "summary",
    "phone",
    "confirm",
    "processing",
    "result",
  ];
  const activeIdx = ORDERED.indexOf(current);
  const visibleSteps = ORDERED.slice(0, 3); // summary → phone → confirm

  return (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {visibleSteps.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div
            key={s}
            className="rounded-full transition-all duration-300"
            style={{
              width: active ? 20 : 6,
              height: 6,
              background: active
                ? GOLD
                : done
                  ? "rgba(201, 168, 76, 0.4)"
                  : undefined,
              backgroundColor: !active && !done ? "#e2e8f0" : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Step 1 — Summary (fixed fee)
// ─────────────────────────────────────────────────────────────────────────────

function StepSummary({ onNext }: { onNext: () => void }) {
  return (
    <StepCard>
      <PageHeader
        title="Subscription"
        subtitle="Review your fee before paying"
      />

      {/* Signature card — navy field, gold foil seal, serif amount */}
      <div
        className="relative overflow-hidden rounded-3xl p-7"
        style={{ background: NAVY_GRADIENT }}
      >
        {/* subtle diagonal sheen */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 14px)",
          }}
        />

        <div className="relative flex items-start justify-between mb-8">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              {FEE_CADENCE}
            </p>
            <p className="text-sm font-semibold text-white/70 mt-1">
              {FEE_LABEL} Fee
            </p>
          </div>

          {/* gold seal */}
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: GOLD_GRADIENT }}
          >
            <Sparkles className="w-5 h-5" style={{ color: NAVY_900 }} />
          </div>
        </div>

        <div className="relative flex items-baseline gap-1.5">
          <span
            className="text-2xl font-black text-white/50"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            ₵
          </span>
          <span
            className="text-5xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {SUBSCRIPTION_FEE.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-white/40 ml-1">.00</span>
        </div>

        <div className="relative mt-2 flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: GOLD }}
          />
          <p className="text-[11px] font-medium text-white/60">
            Fixed amount — payable via Mobile Money
          </p>
        </div>
      </div>

      {/* Coverage breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
          What this covers
        </p>
        <div className="flex flex-col gap-3">
          {COVERAGE_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: GOLD_DIM }}
              >
                <Icon className="w-4 h-4" style={{ color: GOLD_TEXT }} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.99]"
        style={{ background: GOLD_GRADIENT, color: NAVY_900 }}
      >
        Pay to subscribe
        <ChevronRight className="w-4 h-4" />
      </button>

      <p className="text-center text-[10px] text-slate-400 px-6">
        You'll confirm your Mobile Money number on the next step before any
        prompt is sent.
      </p>
    </StepCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Step 2 — Phone + network
// ─────────────────────────────────────────────────────────────────────────────

function StepPhone({
  phone,
  network,
  onPhoneChange,
  onNetworkChange,
  onNext,
  onBack,
}: {
  phone: string;
  network: Network | "";
  onPhoneChange: (v: string) => void;
  onNetworkChange: (v: Network) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const sanitised = sanitisePhone(phone);
  const phoneReady = isValidGhPhone(phone) && network !== "";

  const {
    name: verifiedName,
    isLoading: verifying,
    isError: verifyErr,
  } = useVerifyPhone({
    network: network || "MTN",
    phone: sanitised,
  });

  const canProceed = phoneReady && !verifying && !!verifiedName;

  return (
    <StepCard>
      <PageHeader
        title="MoMo details"
        subtitle="Enter the number to debit"
        onBack={onBack}
      />

      {/* Network picker */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
          Network
        </p>
        <div className="grid grid-cols-3 gap-2">
          {NETWORKS.map((n) => {
            const active = network === n.id;
            return (
              <button
                key={n.id}
                onClick={() => onNetworkChange(n.id)}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  active
                    ? `${n.bg} ${n.color} ${n.border} shadow-sm`
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400"
                }`}
                style={active ? { boxShadow: `0 0 0 1px ${GOLD_DIM}` } : {}}
              >
                {n.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone input */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
          Phone number
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 shrink-0">
            +233
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) =>
              onPhoneChange(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="24 000 0000"
            className="flex-1 text-lg font-bold text-slate-800 dark:text-slate-100 bg-transparent outline-none placeholder:text-slate-200 dark:placeholder:text-slate-600 tracking-widest"
          />
          {verifying && (
            <Loader2 className="w-4 h-4 animate-spin text-slate-300 shrink-0" />
          )}
          {verifiedName && (
            <CheckCircle2
              className="w-4 h-4 shrink-0"
              style={{ color: GOLD_TEXT }}
            />
          )}
          {verifyErr && phoneReady && (
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
        </div>
      </div>

      {/* Verified name chip */}
      <AnimatePresence mode="wait">
        {verifiedName && (
          <MotionDiv
            key="name"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border"
            style={{
              background: GOLD_DIM,
              borderColor: "rgba(201,168,76,0.35)",
            }}
          >
            <ShieldCheck
              className="w-4 h-4 shrink-0"
              style={{ color: GOLD_TEXT }}
            />
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: GOLD_TEXT }}
              >
                Verified
              </p>
              <p className="text-sm font-semibold" style={{ color: NAVY_900 }}>
                {verifiedName}
              </p>
            </div>
          </MotionDiv>
        )}
        {verifyErr && phoneReady && !verifying && (
          <MotionDiv
            key="err"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-400">
              Could not verify this number. Please check and try again.
            </p>
          </MotionDiv>
        )}
      </AnimatePresence>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: canProceed ? GOLD_GRADIENT : "#f1f5f9",
          color: canProceed ? NAVY_900 : undefined,
        }}
      >
        Review payment
      </button>
    </StepCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Step 3 — Confirm
// ─────────────────────────────────────────────────────────────────────────────

function StepConfirm({
  phone,
  network,
  verifiedName,
  onConfirm,
  onBack,
  isSubmitting,
}: {
  phone: string;
  network: Network | "";
  verifiedName: string | null;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const rows: { label: string; value: string; accent?: boolean }[] = [
    { label: "Fee type", value: `${FEE_LABEL} (${FEE_CADENCE})` },
    { label: "Amount", value: fmt(SUBSCRIPTION_FEE), accent: true },
    { label: "Network", value: network },
    { label: "Phone", value: `+233 ${phone}` },
    ...(verifiedName ? [{ label: "Account name", value: verifiedName }] : []),
  ];

  return (
    <StepCard>
      <PageHeader title="Review & confirm" onBack={onBack} />

      {/* Summary card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-4 py-3 ${
              i < rows.length - 1
                ? "border-b border-slate-50 dark:border-slate-800"
                : ""
            }`}
          >
            <span className="text-xs text-slate-400">{row.label}</span>
            <span
              className="text-sm font-semibold text-right max-w-[60%]"
              style={{
                color: row.accent ? GOLD_TEXT : undefined,
                fontFamily: row.accent
                  ? "'Playfair Display', serif"
                  : undefined,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-slate-400 px-4">
        By confirming, a MoMo prompt will be sent to{" "}
        <span className="font-semibold">+233 {phone}</span>. Approve it on your
        phone to complete payment.
      </p>

      <button
        onClick={onConfirm}
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: NAVY_GRADIENT, color: "#fff" }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending prompt…
          </>
        ) : (
          <>
            <Smartphone className="w-4 h-4" />
            Send MoMo prompt
          </>
        )}
      </button>
    </StepCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Step 4 — Processing (polling)
// ─────────────────────────────────────────────────────────────────────────────

function StepProcessing({
  pollAttempt,
  isChecking,
  pollError,
  phone,
  onStop,
}: {
  pollAttempt: number;
  isChecking: boolean;
  pollError: Error | null;
  phone: string;
  onStop: () => void;
}) {
  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-6 py-8"
    >
      {/* Animated ring */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
        <div
          className="absolute inset-0 rounded-full border-4 animate-spin"
          style={{
            borderTopColor: GOLD,
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {isChecking ? (
            <RefreshCw
              className="w-6 h-6 animate-pulse"
              style={{ color: GOLD_TEXT }}
            />
          ) : (
            <Clock className="w-6 h-6 text-slate-400" />
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
          Waiting for approval
        </p>
        <p className="text-xs text-slate-400 mb-1">
          Approve the MoMo prompt on{" "}
          <span className="font-semibold">+233 {phone}</span>
        </p>
        <p className="text-xs text-slate-400">
          Amount:{" "}
          <span className="font-bold text-slate-600 dark:text-slate-200">
            {fmt(SUBSCRIPTION_FEE)}
          </span>
        </p>
      </div>

      {/* Attempt counter */}
      {pollAttempt > 0 && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: GOLD_DIM }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: GOLD }}
          />
          <p className="text-[11px] font-medium" style={{ color: GOLD_TEXT }}>
            Check {pollAttempt}
          </p>
        </div>
      )}

      {/* Transient poll error (non-fatal — still retrying) */}
      {pollError && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 w-full">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {pollError.message}
          </p>
        </div>
      )}

      <button
        onClick={onStop}
        className="text-xs text-slate-400 underline underline-offset-2 hover:text-slate-600 transition-colors"
      >
        Cancel
      </button>
    </MotionDiv>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Step 5 — Result
// ─────────────────────────────────────────────────────────────────────────────

function StepResult({
  result,
  onRetry,
  onDone,
}: {
  result: PayResult;
  onRetry: () => void;
  onDone: () => void;
}) {
  const isSuccess = result === "success";
  const isTimeout = result === "timeout";

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex flex-col items-center justify-center gap-5 py-10"
    >
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: isSuccess ? GOLD_DIM : undefined }}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-10 h-10" style={{ color: GOLD_TEXT }} />
        ) : (
          <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
        )}
      </div>

      {/* Copy */}
      <div className="text-center">
        <p
          className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {isSuccess
            ? "Payment successful"
            : isTimeout
              ? "Request timed out"
              : "Payment failed"}
        </p>
        {isSuccess && (
          <p className="text-sm text-slate-500">
            {fmt(SUBSCRIPTION_FEE)} paid for{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {FEE_LABEL}
            </span>
          </p>
        )}
        {!isSuccess && (
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {isTimeout
              ? "The request took too long. Your money was not deducted. Please try again."
              : "The transaction could not be completed. No funds were deducted."}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 w-full">
        {!isSuccess && (
          <button
            onClick={onRetry}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: NAVY_GRADIENT }}
          >
            Try again
          </button>
        )}
        <button
          onClick={onDone}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-colors"
          style={
            isSuccess
              ? { background: GOLD_GRADIENT, color: NAVY_900 }
              : { background: "#f1f5f9", color: "#475569" }
          }
        >
          {isSuccess ? "Done" : "Back to fees"}
        </button>
      </div>
    </MotionDiv>
  );
}

const Subscription = () => {
  const { user } = useAuth();
  // const userId = user?.userId;

  // ── Reference — generated once ────────────────────────────────────────────
  const [reference, setReference] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!reference) setReference(generateReference());
  }, [reference]);

  // ── Step machine ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("summary");
  const [payResult, setPayResult] = useState<PayResult | null>(null);

  // ── Form fields ───────────────────────────────────────────────────────────
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState<Network | "">("");

  // ── Derived phone for verify ───────────────────────────────────────────────
  const sanitisedPhone = sanitisePhone(phone);
  const { name: verifiedName } = useVerifyPhone({
    network: network || "MTN",
    phone: sanitisedPhone,
  });

  // ── Debit hook ────────────────────────────────────────────────────────────
  const {
    mutate: debit,
    isDebiting,
    isChecking,
    isPolling,
    transRes,
    pollAttempt,
    pollError,
    hasExceededTimeout,
    hasExceededMaxAttempts,
    stopPolling,
    reset: resetDebit,
  } = useDebit({
    refNo: reference,
    onSuccessFn: () => {
      setStep("processing");
    },
  });

  // ── Save payment ──────────────────────────────────────────────────────────
  const shouldSave =
    transRes?.responseMessage.toLowerCase().includes("successfully") || false;
  console.log("treaansres: ", transRes);
  console.log("should: ", shouldSave);

  useSaveSubscription({
    save: shouldSave,
    payload: {
      userId: user?.userId ?? "",
      amount: SUBSCRIPTION_FEE,
      reference,
      description: FEE_LABEL,
      accountHolderName: verifiedName ?? "",
      network,
      phone: sanitisedPhone,
    },
    onSuccessSave: ({ subscriptionHistoryId }) => {
      if (subscriptionHistoryId) {
        setPayResult("success");
        setStep("result");
      } else {
        setPayResult("failed");
        setStep("result");
      }
    },
  });

  // ── Timeout / exceeded attempts → failed result ───────────────────────────
  useEffect(() => {
    if ((hasExceededTimeout || hasExceededMaxAttempts) && !isPolling) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPayResult("timeout");
      setStep("result");
    }
  }, [hasExceededTimeout, hasExceededMaxAttempts, isPolling]);

  // ── Full reset ────────────────────────────────────────────────────────────
  function fullReset() {
    setStep("summary");
    setPayResult(null);
    setPhone("");
    setNetwork("");
    setReference(generateReference());
    resetDebit();
  }

  // ── Step handlers ─────────────────────────────────────────────────────────
  function handleSummaryNext() {
    setStep("phone");
  }

  function handlePhoneNext() {
    setStep("confirm");
  }

  function handleConfirm() {
    debit({
      refNo: reference,
      msisdn: sanitisedPhone,
      amount: SUBSCRIPTION_FEE,
      network: network as string,
      narration: FEE_LABEL,
    });
    setStep("processing");
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* ── Page header ─────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5 flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1
            className="text-xl font-bold leading-none mb-1"
            style={{ fontFamily: "'Playfair Display', serif", color: NAVY_900 }}
          >
            Subscription
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span style={{ color: NAVY_700 }} className="font-semibold">
              Subscription
            </span>
            <ChevronRight className="w-3 h-3" />
            <span>Make Subscription</span>
          </nav>
        </div>
      </MotionDiv>

      {/* Step indicator — hidden during processing/result */}
      {step !== "processing" && step !== "result" && (
        <StepProgress current={step} />
      )}

      {/* Step content */}
      <div className="flex-1 mx-auto w-[50dvw]">
        <AnimatePresence mode="wait">
          {step === "summary" && (
            <StepSummary key="summary" onNext={handleSummaryNext} />
          )}

          {step === "phone" && (
            <StepPhone
              key="phone"
              phone={phone}
              network={network}
              onPhoneChange={setPhone}
              onNetworkChange={setNetwork}
              onNext={handlePhoneNext}
              onBack={() => setStep("summary")}
            />
          )}

          {step === "confirm" && (
            <StepConfirm
              key="confirm"
              phone={phone}
              network={network}
              verifiedName={verifiedName}
              onConfirm={handleConfirm}
              onBack={() => setStep("phone")}
              isSubmitting={isDebiting}
            />
          )}

          {step === "processing" && (
            <StepProcessing
              key="processing"
              pollAttempt={pollAttempt}
              isChecking={isChecking}
              pollError={pollError}
              phone={phone}
              onStop={() => {
                stopPolling();
                setPayResult("failed");
                setStep("result");
              }}
            />
          )}

          {step === "result" && payResult && (
            <StepResult
              key="result"
              result={payResult}
              onRetry={() => {
                setReference(generateReference());
                resetDebit();
                setStep("confirm");
              }}
              onDone={fullReset}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default Subscription;
