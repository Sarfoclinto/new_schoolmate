import { Construction, Sparkles, Lock } from "lucide-react";
import { MotionDiv } from "./motion";

interface Props {
  title: string;
  description: string;
  icon?: React.ReactNode;
  showTag?: boolean;
  variant?: "construction" | "unavailable";
  action?: React.ReactNode;
}

const UnderConstruction = ({
  title,
  description,
  icon,
  showTag = true,
  variant = "construction",
  action,
}: Props) => {
  const isUnavailable = variant === "unavailable";

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative mt-5 overflow-hidden rounded-4xl border border-(--slate-100) bg-white"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {/* Top accent line */}
      <div className="h-h-0.75 w-full bg-[--gold]" />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[--gold-dim] blur-3xl" />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-[--gold-dim] blur-xl" />

            <div
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-white"
              style={{
                borderColor: "rgba(201,168,76,0.22)",
                boxShadow: "0 2px 10px rgba(13,27,46,0.05)",
              }}
            >
              {icon ??
                (isUnavailable ? (
                  <Lock className="h-5 w-5 text-[--gold]" />
                ) : (
                  <Construction className="h-5 w-5 text-[--gold]" />
                ))}
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="text-[15px] sm:text-[16px] font-bold text-[--navy-900] tracking-tight"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {title}
              </h3>

              {showTag && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border"
                  style={{
                    color: "var(--gold-text)",
                    background: "var(--gold-dim)",
                    borderColor: "rgba(201,168,76,0.22)",
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  {isUnavailable ? "Unavailable" : "Coming Soon"}
                </span>
              )}
            </div>

            <p
              className="mt-2 text-[13px] leading-6 text-[--slate-600]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {description}
            </p>

            {/* Progress / status */}
            <div className="mt-4 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[--slate-100]">
                <MotionDiv
                  initial={{ width: 0 }}
                  animate={{ width: isUnavailable ? "100%" : "68%" }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: isUnavailable
                      ? "var(--slate-400)"
                      : "linear-gradient(90deg, var(--gold), #b89532)",
                  }}
                />
              </div>

              <span className="text-[11px] font-medium text-[--slate-400] whitespace-nowrap">
                {isUnavailable ? "Access blocked" : "In progress"}
              </span>
            </div>

            {action && <div className="mt-5">{action}</div>}
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default UnderConstruction;
