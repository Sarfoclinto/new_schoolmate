/**
 * Unauthorized.tsx
 *
 * Shown when a user navigates to a route they don't have permission to access.
 *
 * Design direction:
 * ─ Deep navy background (#0D1B2E) — the whole screen.
 *   This is deliberately inverted from the rest of the app (which is white)
 *   so the page feels like a "wall" — intentionally different, unmistakable.
 * ─ The unauthorized.svg illustration floats on the left (desktop) / top (mobile).
 * ─ The text content anchors right with layered typographic hierarchy:
 *     giant "403" in Playfair Display, gold-tinted, very low opacity — decorative
 *     "Access Restricted" headline in white Playfair Display
 *     body copy in DM Sans
 * ─ Two CTAs: "Go to Dashboard" (primary, gold) and a subtle "Request Access"
 *   mailto / copy-to-clipboard link.
 * ─ Animated: staggered fade-up on mount via motion/react.
 * ─ Floating geometric orbs in the background for depth (CSS-only, no library).
 */

import { Link, useLocation, useSearchParams } from "react-router-dom"; // adjust to your router
import { MotionDiv } from "@/components/custom/motion";
import { Home, ShieldOff, Mail, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Variants } from "motion/react";
import { getUserDashboardRoute } from "@/utils/auth";

// ── Floating orb (pure CSS background decoration) ────────────────────────────
const Orb = ({
  size,
  top,
  left,
  right,
  bottom,
  delay,
  opacity,
}: {
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: number;
  opacity?: number;
}) => (
  <div
    className="absolute rounded-full pointer-events-none animate-pulse"
    style={{
      width: size,
      height: size,
      top,
      left,
      right,
      bottom,
      background:
        "radial-gradient(circle, rgba(201,168,76,0.18) 0%, rgba(30,58,95,0.08) 60%, transparent 100%)",
      animationDelay: `${delay ?? 0}s`,
      animationDuration: "4s",
      opacity: opacity ?? 0.7,
      filter: "blur(2px)",
    }}
  />
);

// ── Thin gold rule ─────────────────────────────────────────────────────────────
const GoldRule = ({ className = "" }: { className?: string }) => (
  <div
    className={`h-px w-16 rounded-full ${className}`}
    style={{
      background: "linear-gradient(90deg, #C9A84C 0%, transparent 100%)",
    }}
  />
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const Unauthorized = () => {
  const location = useLocation();
  const [searchParam] = useSearchParams();
  const [copied, setCopied] = useState(false);

  const routePath = searchParam.get("reason") ?? location.pathname;

  const copyRoute = () => {
    navigator.clipboard.writeText(routePath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Animation variants (staggered fade-up) ──────────────────────────────
  const fade = (delay: number): Variants => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    //@ts-expect-error Not really an error
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-6 py-12"
      style={{ background: "#0D1B2E" }}
    >
      {/* ── Background texture — subtle noise-like grid ──────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(201,168,76,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Floating orbs ──────────────────────────────────────────────── */}
      <Orb size={420} top="-80px" left="-120px" delay={0} opacity={0.5} />
      <Orb size={300} bottom="0" right="-80px" delay={1.5} opacity={0.4} />
      <Orb size={180} top="40%" right="20%" delay={0.8} opacity={0.3} />
      <Orb size={120} bottom="15%" left="15%" delay={2} opacity={0.25} />

      {/* ── Diagonal accent line ─────────────────────────────────────── */}
      <div
        className="absolute top-0 right-0 w-px h-[60vh] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.25) 40%, rgba(201,168,76,0.08) 100%)",
          right: "calc(50% - 10px)",
          opacity: 0.6,
        }}
      />

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT  —  two-column on lg, stacked on mobile
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* ── LEFT: SVG illustration ─────────────────────────────────── */}
        <MotionDiv
          {...fade(0)}
          className="w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg shrink-0"
        >
          {/* Glow beneath illustration */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(201,168,76,0.12) 0%, transparent 70%)",
              transform: "translateY(20px)",
              filter: "blur(24px)",
            }}
          />
          <img
            src="/unauthorized.svg"
            alt="Unauthorized access illustration"
            className="w-full h-auto relative z-10 drop-shadow-2xl"
            style={{ filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.4))" }}
          />
        </MotionDiv>

        {/* ── RIGHT: Text + CTAs ─────────────────────────────────────── */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1">
          {/* Giant decorative 403 */}
          <MotionDiv
            {...fade(0.05)}
            className="relative mb-2 select-none overflow-hidden"
          >
            <span
              className="text-[7rem] sm:text-[9rem] lg:text-[11rem] font-black leading-none"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(201,168,76,0.18)",
                letterSpacing: "-0.04em",
              }}
            >
              403
            </span>
            {/* Gradient overlay that fades the number downward */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, transparent 40%, #0D1B2E 100%)",
              }}
            />
          </MotionDiv>

          {/* Gold eyebrow pill */}
          <MotionDiv {...fade(0.12)}>
            <div
              className="inline-flex items-center gap-x-2 px-3.5 py-1.5 rounded-full border mb-5"
              style={{
                borderColor: "rgba(201,168,76,0.35)",
                background: "rgba(201,168,76,0.08)",
              }}
            >
              <ShieldOff className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} />
              <span
                className="text-[11px] font-black uppercase tracking-widest"
                style={{
                  color: "#C9A84C",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Access Restricted
              </span>
            </div>
          </MotionDiv>

          {/* Headline */}
          <MotionDiv {...fade(0.18)}>
            <h1
              className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight mb-3"
              style={{
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "-0.02em",
              }}
            >
              You don't have
              <br />
              <span style={{ color: "#C9A84C" }}>permission</span> to view
              <br />
              this page.
            </h1>
          </MotionDiv>

          {/* Gold rule */}
          <MotionDiv {...fade(0.22)}>
            <GoldRule className="mb-5 mx-auto lg:mx-0" />
          </MotionDiv>

          {/* Body copy */}
          <MotionDiv {...fade(0.26)}>
            <p
              className="text-sm leading-relaxed mb-2 max-w-md"
              style={{
                color: "rgba(255,255,255,0.55)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Your account doesn't currently include access to this section. If
              you believe this is a mistake or you need access to perform your
              duties, please contact your system administrator to have the
              appropriate permissions assigned to your profile.
            </p>
          </MotionDiv>

          {/* Route path chip */}
          <MotionDiv {...fade(0.3)} className="mb-7">
            <button
              type="button"
              onClick={copyRoute}
              className="inline-flex items-center gap-x-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer group"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
              }}
              title="Copy route path"
            >
              <span
                className="text-[11px] font-mono"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {routePath}
              </span>
              <span
                className="transition-all"
                style={{ color: copied ? "#10B981" : "rgba(201,168,76,0.5)" }}
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </span>
            </button>
          </MotionDiv>

          {/* CTA buttons */}
          <MotionDiv
            {...fade(0.34)}
            className="flex flex-col sm:flex-row items-center lg:items-start gap-3 w-full sm:w-auto"
          >
            {/* Primary: Go to Dashboard */}
            <Link
              to={getUserDashboardRoute()}
              className="inline-flex items-center justify-center gap-x-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              style={{
                background: "linear-gradient(135deg, #C9A84C 0%, #E8C76A 100%)",
                color: "#0D1B2E",
                boxShadow:
                  "0 8px 32px rgba(201,168,76,0.30), 0 2px 8px rgba(0,0,0,0.3)",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
              }}
            >
              <Home className="w-4 h-4 shrink-0" />
              Go to Dashboard
            </Link>

            {/* Secondary: Request access */}
            <a
              href={`mailto:admin@school.edu?subject=Permission Request — ${routePath}&body=Hello,%0D%0A%0D%0AI would like to request access to: ${window.location.href}%0D%0A%0D%0APlease assign the necessary permissions to my account.%0D%0A%0D%0AThank you.`}
              className="inline-flex items-center justify-center gap-x-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] border w-full sm:w-auto"
              style={{
                borderColor: "rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.75)",
                fontFamily: "'DM Sans', sans-serif",
                backdropFilter: "blur(8px)",
              }}
            >
              <Mail className="w-4 h-4 shrink-0" />
              Request Access
            </a>
          </MotionDiv>

          {/* Footer note */}
          <MotionDiv {...fade(0.4)} className="mt-8">
            <p
              className="text-[11px] leading-relaxed"
              style={{
                color: "rgba(255,255,255,0.22)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              If you were recently granted access, try refreshing or logging out
              and back in.
            </p>
          </MotionDiv>
        </div>
      </div>

      {/* ── Bottom branding strip ─────────────────────────────────────── */}
      <MotionDiv
        {...fade(0.48)}
        className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-x-3 pointer-events-none"
      >
        <div
          className="h-px w-12 rounded-full"
          style={{ background: "rgba(201,168,76,0.2)" }}
        />
        <span
          className="text-[10px] font-black uppercase tracking-[0.2em]"
          style={{
            color: "rgba(201,168,76,0.25)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          School Management System
        </span>
        <div
          className="h-px w-12 rounded-full"
          style={{ background: "rgba(201,168,76,0.2)" }}
        />
      </MotionDiv>
    </div>
  );
};

export default Unauthorized;
