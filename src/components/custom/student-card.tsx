/* eslint-disable react-hooks/static-components */
/**
 * StudentCard.tsx
 *
 * Self-contained, printable student ID card component.
 * Three sizes:
 *   sm  — credit-card (85.6 × 53.98 mm) — portable student ID
 *   md  — badge card  (105 × 74 mm)     — desk / lanyard badge
 *   lg  — A5 half     (148 × 105 mm)    — file / noticeboard copy
 *
 * ALL card styles are 100% inline — zero Tailwind on the card surface.
 * This avoids the oklch() crash that Tailwind causes with html2canvas.
 *
 * The outer chrome (size picker, print buttons) uses Tailwind — it is
 * never captured or sent to the printer.
 *
 * Usage:
 *    With studentId (fetches internally)
 *   <StudentCard studentId="STU-001" schoolName="Greenfield Academy" schoolLogo="/logo.png" />
 *
 *    With pre-fetched data
 *   <StudentCard data={studentData} schoolName="Greenfield Academy" schoolLogo="/logo.png" />
 *
 *    In a modal / drawer — just drop it anywhere
 *   <StudentCard studentId={id} schoolName={name} schoolLogo={logo} />
 */

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Printer,
  Download,
  Loader2,
  CreditCard,
  LayoutTemplate,
  FileText,
  ChevronDown,
} from "lucide-react";
// ── Replace with your real imports ──────────────────────────────────────────
import useFetch from "@/hooks/api/use-fetch";
import { getStuByIdFn } from "@/services/student";
import { studentKeys } from "@/config/query-keys";
import { buildMediaUrl } from "@/utils/media";
import type { StudentGet } from "@/types/api/student";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type CardSize = "sm" | "md" | "lg";

interface StudentCardProps {
  /** Fetch internally when provided */
  studentId?: string;
  /** Or pass pre-fetched data directly */
  data?: StudentGet;
  /** Shown on the card */
  schoolName: string;
  /** Absolute URL or imported asset */
  schoolLogo: string;
  /** Hide the size/action chrome — useful when embedded in a read-only context */
  hideControls?: boolean;
  /** For size side-effect handling */
  onSizeChange?: (newSize: CardSize) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIZE DEFINITIONS  (all in px at 96dpi — html2canvas works in px)
// ═══════════════════════════════════════════════════════════════════════════════

const SIZES: Record<
  CardSize,
  {
    label: string;
    icon: React.ReactNode;
    desc: string;
    /** Pixel dimensions of the rendered card (at screen resolution) */
    w: number;
    h: number;
    /** mm dimensions for the PDF page */
    mmW: number;
    mmH: number;
    /** Internal layout scale factor */
    scale: number;
  }
> = {
  sm: {
    label: "Small",
    icon: <CreditCard className="w-4 h-4" />,
    desc: "Credit-card size — portable student ID",
    w: 324,
    h: 204,
    mmW: 85.6,
    mmH: 53.98,
    scale: 1,
  },
  md: {
    label: "Medium",
    icon: <LayoutTemplate className="w-4 h-4" />,
    desc: "Badge card — lanyard / desk copy",
    w: 400,
    h: 283,
    mmW: 105,
    mmH: 74,
    scale: 1.24,
  },
  lg: {
    label: "Large",
    icon: <FileText className="w-4 h-4" />,
    desc: "A5 half-sheet — file / noticeboard",
    w: 560,
    h: 396,
    mmW: 148,
    mmH: 105,
    scale: 1.73,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS  (inline style values — no Tailwind)
// ═══════════════════════════════════════════════════════════════════════════════

const NAVY = "#0D1B2E";
const NAVY_MID = "#1E3A5F";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C76A";
const WHITE = "#FFFFFF";
const SLATE_100 = "#F1F5F9";
const SLATE_500 = "#64748B";
const FONT = "'DM Sans', 'Segoe UI', Arial, sans-serif";
const FONT_SERIF = "'Playfair Display', Georgia, serif";

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const initials = (s: StudentGet) =>
  [s.firstName[0], s.surname[0]].filter(Boolean).join("").toUpperCase();

const fullName = (s: StudentGet) =>
  [s.firstName, s.otherName, s.surname].filter(Boolean).join(" ");

function formatDob(raw: string): string {
  try {
    return new Date(raw).toLocaleDateString("en-GH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD FACES  (pure inline-styled, zero Tailwind)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── SMALL card (credit-card) ────────────────────────────────────────────────
const SmCard = ({
  s,
  schoolName,
  schoolLogo,
}: {
  s: StudentGet;
  schoolName: string;
  schoolLogo: string;
}) => {
  const photoUrl = s.studentImage ? buildMediaUrl(s.studentImage) : null;
  const logoUrl = schoolLogo;

  return (
    <div
      style={{
        width: 324,
        height: 204,
        background: `linear-gradient(145deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
        borderRadius: 12,
        fontFamily: FONT,
        position: "relative",
        overflow: "hidden",
        color: WHITE,
        boxSizing: "border-box",
      }}
    >
      {/* Decorative circle top-right */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(201,168,76,0.12)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: `1.5px solid rgba(201,168,76,0.2)`,
          pointerEvents: "none",
        }}
      />

      {/* Gold top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 14px 0",
        }}
      >
        {/* Logo */}
        <img
          src={logoUrl}
          alt="logo"
          style={{
            width: 28,
            height: 28,
            objectFit: "contain",
            borderRadius: 4,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: GOLD,
              lineHeight: 1,
            }}
          >
            Student ID
          </div>
          <div
            style={{
              fontSize: 8,
              color: "rgba(255,255,255,0.55)",
              marginTop: 2.8,
            }}
          >
            {schoolName}
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "10px 14px 0",
        }}
      >
        {/* Photo */}
        <div
          style={{
            width: 60,
            height: 72,
            flexShrink: 0,
            borderRadius: 8,
            background: photoUrl
              ? "transparent"
              : `linear-gradient(135deg,${NAVY_MID},${GOLD})`,
            overflow: "hidden",
            border: `2px solid ${GOLD}`,
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="student"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 800,
                color: WHITE,
                fontFamily: FONT_SERIF,
              }}
            >
              {initials(s)}
            </div>
          )}
        </div>

        {/* Info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              lineHeight: 1.2,
              color: WHITE,
              marginBottom: 4,
              fontFamily: FONT_SERIF,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fullName(s)}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "fit-content",
            }}
          >
            {(
              [
                ["Class", s.subLevelName],
                ["ID", s.studentId],
                ["DOB", formatDob(s.dateOfBirth)],
                ["Gender", s.gender],
              ] as [string, string][]
            ).map(([lbl, val]) => (
              <div
                key={lbl}
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: "20px",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    color: "rgba(255,255,255,0.45)",
                    minWidth: 34,
                  }}
                >
                  {lbl}:
                </span>
                <span
                  style={{
                    fontSize: 8,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    minHeight: "fit-content",
                    height: "100%",
                  }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(201,168,76,0.12)",
          borderTop: `1px solid rgba(201,168,76,0.2)`,
          padding: "5px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 7,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.06em",
          }}
        >
          {s.academicYearName} · {s.academicTermName}
        </span>
        <span
          style={{
            fontSize: 7,
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 4,
            background:
              s.status?.toLowerCase() === "active"
                ? "rgba(16,185,129,0.2)"
                : "rgba(239,68,68,0.2)",
            color: s.status?.toLowerCase() === "active" ? "#34D399" : "#F87171",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {s.status}
        </span>
      </div>
    </div>
  );
};

// ─── MEDIUM card (badge) ──────────────────────────────────────────────────────
const MdCard = ({
  s,
  schoolName,
  schoolLogo,
}: {
  s: StudentGet;
  schoolName: string;
  schoolLogo: string;
}) => {
  const photoUrl = s.studentImage ? buildMediaUrl(s.studentImage) : null;

  return (
    <div
      style={{
        width: 400,
        height: 283,
        background: WHITE,
        borderRadius: 14,
        fontFamily: FONT,
        overflow: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <img
          src={schoolLogo}
          alt="logo"
          style={{
            width: 36,
            height: 36,
            objectFit: "contain",
            borderRadius: 6,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: WHITE,
              fontFamily: FONT_SERIF,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {schoolName}
          </div>
          <div
            style={{
              fontSize: 9,
              color: GOLD,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              marginTop: 1,
            }}
          >
            Student Identification Card
          </div>
        </div>
        <div
          style={{
            fontSize: 7,
            color: "rgba(255,255,255,0.35)",
            fontWeight: 700,
            textAlign: "right",
          }}
        >
          {s.academicYearName}
          <br />
          {s.academicTermName}
        </div>
      </div>

      {/* Gold divider line */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
          flexShrink: 0,
        }}
      />

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 0,
          overflow: "hidden",
        }}
      >
        {/* Left panel */}
        <div
          style={{
            width: 110,
            flexShrink: 0,
            background: SLATE_100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 8px",
          }}
        >
          {/* Photo */}
          <div
            style={{
              width: 72,
              height: 86,
              borderRadius: 8,
              border: `2.5px solid ${GOLD}`,
              overflow: "hidden",
              background: photoUrl
                ? "transparent"
                : `linear-gradient(135deg,${NAVY},${NAVY_MID})`,
              flexShrink: 0,
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="student"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 800,
                  color: WHITE,
                  fontFamily: FONT_SERIF,
                }}
              >
                {initials(s)}
              </div>
            )}
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 8,
              color: SLATE_500,
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontWeight: 800, color: NAVY, fontSize: 9 }}>
              {s.subLevelName}
            </div>
            <div>{s.educationalLevelName}</div>
          </div>
          <div
            style={{
              background:
                s.status?.toLowerCase() === "active"
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(239,68,68,0.12)",
              border: `1px solid ${s.status?.toLowerCase() === "active" ? "#10B981" : "#EF4444"}`,
              borderRadius: 20,
              padding: "2px 8px",
              fontSize: 7,
              fontWeight: 800,
              color:
                s.status?.toLowerCase() === "active" ? "#059669" : "#DC2626",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {s.status}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, padding: "14px 16px", minWidth: 0 }}>
          {/* Name */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: NAVY,
              fontFamily: FONT_SERIF,
              lineHeight: 1.2,
              marginBottom: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fullName(s)}
          </div>

          {/* ID badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 10,
              background: `rgba(13,27,46,0.06)`,
              padding: "3px 8px",
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 8, color: SLATE_500, fontWeight: 600 }}>
              ID
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: NAVY,
                fontFamily: "monospace",
              }}
            >
              {s.studentId}
            </span>
          </div>

          {/* Detail grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "5px 8px",
            }}
          >
            {(
              [
                ["Date of Birth", formatDob(s.dateOfBirth)],
                ["Gender", s.gender],
                ["Nationality", s.nationality],
                ["Religion", s.religion],
                ["Programme", s.programName],
                ["Guardian", s.guardianFullName],
              ] as [string, string][]
            ).map(([lbl, val]) => (
              <div
                key={lbl}
                style={{
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: 7.5,
                    color: SLATE_500,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {lbl}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: NAVY,
                    marginTop: 1,
                    // overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {val || "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Guardian contact */}
          {s.guardianContact && (
            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px dashed rgba(13,27,46,0.1)",
                fontSize: 8,
                color: SLATE_500,
              }}
            >
              <span style={{ fontWeight: 700 }}>Emergency: </span>
              <span style={{ color: NAVY, fontWeight: 600 }}>
                {s.guardianContact}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── LARGE card (A5 half) ─────────────────────────────────────────────────────
const LgCard = ({
  s,
  schoolName,
  schoolLogo,
}: {
  s: StudentGet;
  schoolName: string;
  schoolLogo: string;
}) => {
  const photoUrl = s.studentImage ? buildMediaUrl(s.studentImage) : null;

  const Row = ({ label, value }: { label: string; value?: string }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid rgba(13,27,46,0.07)",
        paddingBottom: 5,
        marginBottom: 5,
      }}
    >
      <span
        style={{
          fontSize: 9.5,
          color: SLATE_500,
          fontWeight: 700,
          minWidth: 90,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 9.5,
          color: NAVY,
          fontWeight: 600,
          flex: 1,
          //   overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          minHeight: "15px",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div
      style={{
        width: 560,
        height: 396,
        background: WHITE,
        borderRadius: 16,
        fontFamily: FONT,
        overflow: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top stripe */}
      <div
        style={{
          height: 5,
          background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY_MID} 50%, ${GOLD} 100%)`,
          flexShrink: 0,
        }}
      />

      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexShrink: 0,
        }}
      >
        <img
          src={schoolLogo}
          alt="logo"
          style={{
            width: 48,
            height: 48,
            objectFit: "contain",
            borderRadius: 8,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: WHITE,
              fontFamily: FONT_SERIF,
              lineHeight: 1.1,
            }}
          >
            {schoolName}
          </div>
          <div
            style={{
              fontSize: 10,
              color: GOLD,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginTop: 10,
            }}
          >
            Official Student Identification Card
          </div>
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: 8,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700 }}>{s.academicYearName}</div>
          <div>{s.academicTermName}</div>
          <div
            style={{
              marginTop: 4,
              padding: "2px 8px",
              borderRadius: 20,
              background:
                s.status?.toLowerCase() === "active"
                  ? "rgba(16,185,129,0.25)"
                  : "rgba(239,68,68,0.25)",
              color:
                s.status?.toLowerCase() === "active" ? "#34D399" : "#F87171",
              fontSize: 8,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {s.status}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", gap: 0, overflow: "hidden" }}>
        {/* Left — photo + ID */}
        <div
          style={{
            width: 150,
            flexShrink: 0,
            background: "linear-gradient(180deg,#F8FAFC 0%,#EEF2F8 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 12px 12px",
            gap: 10,
            borderRight: "1px solid rgba(13,27,46,0.07)",
          }}
        >
          <div
            style={{
              width: 96,
              height: 114,
              borderRadius: 10,
              border: `3px solid ${GOLD}`,
              overflow: "hidden",
              background: `linear-gradient(135deg,${NAVY},${NAVY_MID})`,
              boxShadow: "0 4px 16px rgba(13,27,46,0.2)",
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="student"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  fontWeight: 800,
                  color: WHITE,
                  fontFamily: FONT_SERIF,
                }}
              >
                {initials(s)}
              </div>
            )}
          </div>

          {/* Student ID */}
          <div
            style={{
              background: NAVY,
              borderRadius: 8,
              padding: "10px 10px",
              textAlign: "center",
              width: "100%",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              rowGap: 7,
            }}
          >
            <div
              style={{
                fontSize: 7.5,
                color: GOLD,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: 2,
              }}
            >
              Student ID
            </div>
            <div
              style={{
                fontSize: 10,
                color: WHITE,
                fontWeight: 800,
                fontFamily: "monospace",
                letterSpacing: "0.04em",
              }}
            >
              {s.studentId}
            </div>
          </div>

          {/* Class info */}
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              rowGap: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: NAVY,
                fontFamily: FONT_SERIF,
              }}
            >
              {s.subLevelName}
            </div>
            <div style={{ fontSize: 8.5, color: SLATE_500, marginTop: 2 }}>
              {s.educationalLevelName}
            </div>
            <div style={{ fontSize: 8, color: SLATE_500 }}>{s.programName}</div>
          </div>
        </div>

        {/* Right — details */}
        <div style={{ flex: 1, padding: "14px 18px", overflow: "hidden" }}>
          {/* Full name */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: NAVY,
              fontFamily: FONT_SERIF,
              lineHeight: 1.1,
              marginBottom: 12,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fullName(s)}
          </div>

          {/* Personal details section */}
          <div
            style={{
              fontSize: 8.5,
              fontWeight: 800,
              color: GOLD,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 5,
            }}
          >
            Personal Information
          </div>
          <Row label="Date of Birth" value={formatDob(s.dateOfBirth)} />
          <Row label="Gender" value={s.gender} />
          <Row label="Nationality" value={s.nationality} />
          <Row label="Religion" value={s.religion} />
          <Row label="Address" value={s.address} />

          {/* Guardian / emergency */}
          <div
            style={{
              fontSize: 8.5,
              fontWeight: 800,
              color: GOLD,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginTop: 10,
              marginBottom: 5,
            }}
          >
            Guardian / Emergency Contact
          </div>
          <Row label="Full Name" value={s.guardianFullName} />
          <Row label="Relationship" value={s.relationship} />
          <Row label="Contact" value={s.guardianContact} />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          background: "rgba(13,27,46,0.04)",
          borderTop: "1px solid rgba(13,27,46,0.08)",
          padding: "6px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 8,
            color: "rgba(13,27,46,0.35)",
            fontStyle: "italic",
          }}
        >
          This card is the property of {schoolName}. Return if found.
        </span>
        <span style={{ fontSize: 8, color: "rgba(13,27,46,0.35)" }}>
          {s.startYear} — {s.endYear}
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CARD ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

const CardFace = ({
  size,
  s,
  schoolName,
  schoolLogo,
}: {
  size: CardSize;
  s: StudentGet;
  schoolName: string;
  schoolLogo: string;
}) => {
  if (size === "sm")
    return <SmCard s={s} schoolName={schoolName} schoolLogo={schoolLogo} />;
  if (size === "md")
    return <MdCard s={s} schoolName={schoolName} schoolLogo={schoolLogo} />;
  return <LgCard s={s} schoolName={schoolName} schoolLogo={schoolLogo} />;
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRINT / PDF UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

async function captureCard(
  ref: React.RefObject<HTMLDivElement | null>,
  scale = 3,
): Promise<HTMLCanvasElement> {
  if (!ref.current) throw new Error("Card not mounted");
  return html2canvas(ref.current, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
  });
}

async function downloadCardPdf(
  ref: React.RefObject<HTMLDivElement | null>,
  size: CardSize,
  filename: string,
): Promise<void> {
  const canvas = await captureCard(ref);
  const imgData = canvas.toDataURL("image/png");
  const { mmW, mmH } = SIZES[size];
  const pdf = new jsPDF({
    orientation: mmW > mmH ? "landscape" : "portrait",
    unit: "mm",
    format: [mmW, mmH],
  });
  pdf.addImage(imgData, "PNG", 0, 0, mmW, mmH);
  pdf.save(filename);
}

function printCard(
  ref: React.RefObject<HTMLDivElement | null>,
  size: CardSize,
): void {
  const node = ref.current;
  if (!node) return;
  const { mmW, mmH } = SIZES[size];
  const win = window.open("", "_blank", "width=900,height=600");
  if (!win) {
    alert("Pop-up blocked — allow pop-ups and try again.");
    return;
  }
  win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Student Card</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; }
  @page { size: ${mmW}mm ${mmH}mm; margin: 0; }
  @media print {
    html, body {
      width: ${mmW}mm; height: ${mmH}mm;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .card-wrap { transform: scale(1); transform-origin: top left; }
  }
  .card-wrap {
    display: flex; align-items: center; justify-content: center;
    width: ${mmW}mm; height: ${mmH}mm;
  }
</style>
</head><body>
<div class="card-wrap">${node.outerHTML}</div>
</body></html>`);
  win.document.close();
  const imgs = Array.from(win.document.images);
  if (!imgs.length) {
    setTimeout(() => {
      win.focus();
      win.print();
    }, 400);
    return;
  }
  let loaded = 0;
  const tryPrint = () => {
    if (++loaded >= imgs.length)
      setTimeout(() => {
        win.focus();
        win.print();
      }, 200);
  };
  imgs.forEach((img) => {
    if (img.complete) tryPrint();
    else {
      img.onload = tryPrint;
      img.onerror = tryPrint;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const StudentCard = ({
  studentId,
  data: externalData,
  schoolName,
  schoolLogo,
  hideControls = false,
  onSizeChange,
}: StudentCardProps) => {
  const [size, setSize] = useState<CardSize>("sm");
  const [sizeDropOpen, setSizeDropOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Internal fetch (only when studentId is provided and no externalData) ──
  const { data: fetchedData, isLoading } = useFetch({
    queryFn: () => getStuByIdFn(studentId!),
    queryKeys: studentKeys.detail(studentId!),
    enabled: !!studentId && !externalData,
  });

  const student = externalData ?? fetchedData;

  // ── Actions ──────────────────────────────────────────────────────────────
  const handlePdf = useCallback(async () => {
    if (!student) return;
    setPdfLoading(true);
    try {
      const name = `${student.firstName}_${student.surname}_ID_${size.toUpperCase()}.pdf`;
      await downloadCardPdf(cardRef, size, name);
    } catch (e) {
      console.error(e);
    } finally {
      setPdfLoading(false);
    }
  }, [student, size]);

  const handlePrint = useCallback(() => {
    if (!student) return;
    setPrintLoading(true);
    printCard(cardRef, size);
    setTimeout(() => setPrintLoading(false), 800);
  }, [student, size]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading || !student) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl border-2 border-slate-200 animate-pulse bg-slate-100" />
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-sm text-slate-400 font-medium">
          Loading student data…
        </p>
      </div>
    );
  }

  const cfg = SIZES[size];

  return (
    <div
      className="flex flex-col items-center gap-y-5"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── CONTROLS (Tailwind OK — never captured) ── */}
      {!hideControls && (
        <div className="w-full max-w-lg flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Size selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSizeDropOpen((v) => !v)}
              className="flex items-center gap-x-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
              style={{ boxShadow: "0 1px 4px rgba(13,27,46,0.05)" }}
            >
              {cfg.icon}
              {cfg.label}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${sizeDropOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {sizeDropOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1.5 bg-white rounded-2xl border border-slate-100 overflow-hidden z-20"
                  style={{
                    boxShadow: "0 8px 32px rgba(13,27,46,0.12)",
                    minWidth: 240,
                  }}
                >
                  {(["sm", "md", "lg"] as CardSize[]).map((s) => {
                    const c = SIZES[s];
                    const active = size === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          onSizeChange?.(s);
                          setSize(s);
                          setSizeDropOpen(false);
                        }}
                        className={`w-full flex items-start gap-x-3 px-4 py-3 text-left transition-all cursor-pointer
                          ${active ? "bg-[#EEF2F8]" : "hover:bg-slate-50"}`}
                      >
                        <div
                          className={`mt-0.5 shrink-0 ${active ? "text-[#1E3A5F]" : "text-slate-400"}`}
                        >
                          {c.icon}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold ${active ? "text-[#0D1B2E]" : "text-slate-700"}`}
                          >
                            {c.label}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {c.desc}
                          </p>
                        </div>
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex items-center gap-x-2">
            <button
              type="button"
              onClick={handlePdf}
              disabled={pdfLoading}
              className={`flex items-center gap-x-2 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all border
                ${
                  pdfLoading
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-white text-[#1E3A5F] border-[#D0DCF0] hover:border-[#1E3A5F] hover:shadow-sm cursor-pointer"
                }`}
              style={
                !pdfLoading
                  ? { boxShadow: "0 1px 4px rgba(13,27,46,0.06)" }
                  : {}
              }
            >
              {pdfLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              PDF
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={printLoading}
              className={`flex items-center gap-x-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-white transition-all
                ${printLoading ? "bg-slate-300 cursor-not-allowed" : "cursor-pointer hover:opacity-90 active:scale-[0.98]"}`}
              style={
                !printLoading
                  ? {
                      background:
                        "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                      boxShadow: "0 4px 14px rgba(13,27,46,0.25)",
                    }
                  : {}
              }
            >
              {printLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
              ) : (
                <Printer className="w-4 h-4 text-[#C9A84C]" />
              )}
              Print
            </button>
          </div>
        </div>
      )}

      {/* ── CARD PREVIEW ── */}
      <motion.div
        key={size}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative"
        style={{ filter: "drop-shadow(0 8px 32px rgba(13,27,46,0.18))" }}
      >
        {/* The ref wraps exactly the card — nothing else */}
        <div ref={cardRef} style={{ display: "inline-block", lineHeight: 0 }}>
          <CardFace
            size={size}
            s={student}
            schoolName={schoolName}
            schoolLogo={schoolLogo}
          />
        </div>
      </motion.div>

      {/* Dimension label */}
      {!hideControls && (
        <p className="text-[11px] text-slate-400 font-medium">
          {cfg.mmW} × {cfg.mmH} mm · {cfg.w} × {cfg.h} px preview
        </p>
      )}
    </div>
  );
};

export default StudentCard;
