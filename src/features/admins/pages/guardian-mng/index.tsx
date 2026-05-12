import { MotionDiv } from "@/components/custom/motion";
import {
  ChevronRight,
  ShieldAlert,
  Users,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Heart,
  Search,
  Filter,
  Link2,
  CircleDot,
} from "lucide-react";
import {
  CardHeader,
  EmptyState,
} from "../../components/teacher-util-components";
import useFetch from "@/hooks/api/use-fetch";
import { getAllGuardiansWithWardsFn } from "@/services/guardian";
import { guardianKeys } from "@/config/query-keys";
import type { GuardianWithWard, GuardianWard } from "@/types/api/guardian";
import { Image } from "antd";
import { buildMediaUrl } from "@/utils/media";
import { getInitials } from "@/utils/string";
import { useDisclosure } from "@/hooks/use-disclosure";
import GuardianMap from "./map-guardian";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Avatar ──────────────────────────────────────────────────────────────────
const GuardianAvatar = ({
  image,
  name,
  size = 44,
}: {
  image?: string;
  name: string;
  size?: number;
}) => {
  const [imgError, setImgError] = useState(false);
  const url = image ? buildMediaUrl(image) : null;
  const initials = getInitials(name);

  if (url && !imgError) {
    return (
      <div
        className="rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-md"
        style={{
          width: size,
          height: size,
          boxShadow: "0 2px 8px rgba(13,27,46,0.15)",
        }}
      >
        <Image
          src={url}
          alt={name}
          width={size}
          height={size}
          style={{ objectFit: "cover", objectPosition: "center" }}
          onError={() => setImgError(true)}
          preview={false}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl flex items-center justify-center font-bold text-[#C9A84C] shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.3,
        background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
        boxShadow: "0 2px 8px rgba(13,27,46,0.2)",
      }}
    >
      {initials}
    </div>
  );
};

// ─── Relationship badge ───────────────────────────────────────────────────────
const RELATIONSHIP_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  parent: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  spouse: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  sibling: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  relative: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  other: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

const RelationshipBadge = ({ rel }: { rel: string }) => {
  const cfg =
    RELATIONSHIP_COLORS[rel.toLowerCase()] ?? RELATIONSHIP_COLORS.other;
  return (
    <span
      className={`inline-flex items-center gap-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Heart className="w-2.5 h-2.5" />
      {rel}
    </span>
  );
};

// ─── Living status dot ────────────────────────────────────────────────────────
const LivingStatusDot = ({ status }: { status: string }) => {
  const alive = status.toLowerCase() === "alive";
  return (
    <span
      className={`inline-flex items-center gap-x-1 text-[10px] font-bold
      ${alive ? "text-emerald-600" : "text-slate-400"}`}
    >
      <CircleDot className="w-2.5 h-2.5" />
      {alive ? "Alive" : "Deceased"}
    </span>
  );
};

// ─── Ward chip ────────────────────────────────────────────────────────────────
const WardChip = ({ ward }: { ward: GuardianWard }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.18 }}
    className="flex items-center gap-x-2.5 px-3 py-2.5 rounded-xl bg-white border border-slate-100"
    style={{ boxShadow: "0 1px 4px rgba(13,27,46,0.05)" }}
  >
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#C9A84C] font-bold text-[10px] shrink-0"
      style={{ background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)" }}
    >
      {getInitials(ward.wardName)}
    </div>
    <div className="min-w-0">
      <p
        className="text-xs font-bold text-[#0D1B2E] truncate"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {ward.wardName}
      </p>
      <div className="flex items-center gap-x-1.5 mt-0.5 flex-wrap">
        <span className="flex items-center gap-x-1 text-[10px] text-slate-400">
          <GraduationCap className="w-2.5 h-2.5" />
          {ward.subLevelName}
        </span>
        <span className="text-slate-300 text-[10px]">·</span>
        <span className="text-[10px] text-slate-400">
          {ward.educationalLevelName}
        </span>
      </div>
    </div>
  </motion.div>
);

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value?: string;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-x-1.5 text-[11px] text-slate-500 min-w-0">
      <span className="text-slate-300 shrink-0">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// GUARDIAN CARD
// ═══════════════════════════════════════════════════════════════════════════════

const GuardianCard = ({
  guardian,
  index,
}: {
  guardian: GuardianWithWard;
  index: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasWards = guardian.wards && guardian.wards.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: "0 2px 10px rgba(13,27,46,0.05)" }}
    >
      {/* ── Main row ── */}
      <div className="p-4">
        <div className="flex items-start gap-x-3.5">
          {/* Avatar + index */}
          <div className="relative shrink-0">
            <GuardianAvatar
              image={guardian.guardianImage}
              name={guardian.guardianName}
              size={48}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[9px] font-black text-slate-500">
              {index + 1}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name + badges */}
            <div className="flex items-start justify-between gap-x-2 flex-wrap gap-y-1 mb-1.5">
              <div className="min-w-0">
                <p
                  className="font-bold text-sm text-[#0D1B2E] leading-tight"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {guardian.guardianName}
                </p>
              </div>
              <div className="flex items-center gap-x-1.5 flex-wrap gap-y-1 shrink-0">
                <RelationshipBadge rel={guardian.guardianRelationship} />
                <LivingStatusDot status={guardian.guardianLivingStatus} />
              </div>
            </div>

            {/* Info rows */}
            <div className="flex flex-col gap-y-1 mb-2.5">
              <InfoRow
                icon={<Phone className="w-3 h-3" />}
                value={guardian.guardianContact}
              />
              <InfoRow
                icon={<Mail className="w-3 h-3" />}
                value={guardian.guardianEmail}
              />
              <InfoRow
                icon={<Briefcase className="w-3 h-3" />}
                value={guardian.guardianOccupation}
              />
              <InfoRow
                icon={<MapPin className="w-3 h-3" />}
                value={guardian.guardianAddress}
              />
            </div>

            {/* Ward count + expand toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer
                  ${
                    hasWards
                      ? "text-[#1E3A5F] bg-[#EEF2F8] border-[#D0DCF0] hover:bg-[#1E3A5F] hover:text-white hover:border-[#1E3A5F]"
                      : "text-slate-400 bg-slate-50 border-slate-200 cursor-default"
                  }`}
              >
                <Users className="w-3 h-3" />
                {guardian.guardianWardsCount > 0
                  ? `${guardian.guardianWardsCount} ward${guardian.guardianWardsCount !== 1 ? "s" : ""}`
                  : "No wards"}
                {hasWards &&
                  (expanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  ))}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expandable wards section ── */}
      <AnimatePresence>
        {expanded && hasWards && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-3 mb-2.5 flex items-center gap-x-1.5">
                <GraduationCap className="w-3 h-3" />
                Wards ({guardian.wards.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <AnimatePresence>
                  {guardian.wards.map((ward) => (
                    <WardChip key={ward.wardId} ward={ward} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY STAT CHIP
// ═══════════════════════════════════════════════════════════════════════════════
const StatPill = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) => (
  <div
    className="flex items-center gap-x-2 px-3.5 py-2 bg-white border border-slate-100 rounded-xl"
    style={{ boxShadow: "0 1px 4px rgba(13,27,46,0.05)" }}
  >
    <div className="w-7 h-7 rounded-lg bg-[#EEF2F8] flex items-center justify-center text-[#1E3A5F] shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">
        {label}
      </p>
      <p
        className="text-sm font-bold text-[#0D1B2E] leading-tight mt-0.5"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {value}
      </p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON CARD
// ═══════════════════════════════════════════════════════════════════════════════
const SkeletonCard = ({ i }: { i: number }) => (
  <div
    className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-x-3.5 animate-pulse"
    style={{ opacity: 1 - i * 0.1 }}
  >
    <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0" />
    <div className="flex-1 flex flex-col gap-y-2">
      <div className="h-4 bg-slate-100 rounded-lg w-2/5" />
      <div className="h-3 bg-slate-100 rounded-lg w-3/5" />
      <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
      <div className="h-7 bg-slate-100 rounded-xl w-20 mt-1" />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const GuardianManagement = () => {
  const { data: guardians = [], isLoading } = useFetch({
    queryFn: getAllGuardiansWithWardsFn,
    queryKeys: guardianKeys.custom("with-wards"),
  });
  const { isOpen, open, close } = useDisclosure(false);

  const [search, setSearch] = useState("");
  const [filterRel, setFilterRel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const count = guardians.length;
  const withWards = guardians.filter(
    (g) => g.wards && g.wards.length > 0,
  ).length;
  const noWards = count - withWards;

  // Unique relationships for filter
  const relationships = useMemo(() => {
    const set = new Set(
      guardians.map((g) => g.guardianRelationship.toLowerCase()),
    );
    return Array.from(set);
  }, [guardians]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = guardians;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) =>
          g.guardianName.toLowerCase().includes(q) ||
          g.guardianContact.toLowerCase().includes(q) ||
          g.guardianEmail?.toLowerCase().includes(q) ||
          g.wards?.some((w) => w.wardName.toLowerCase().includes(q)),
      );
    }
    if (filterRel !== "all") {
      list = list.filter(
        (g) => g.guardianRelationship.toLowerCase() === filterRel,
      );
    }
    if (filterStatus === "with_wards") {
      list = list.filter((g) => g.wards && g.wards.length > 0);
    } else if (filterStatus === "no_wards") {
      list = list.filter((g) => !g.wards || g.wards.length === 0);
    }
    return list;
  }, [guardians, search, filterRel, filterStatus]);

  return (
    <>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
        {/* ── PAGE HEADER ── */}
        <MotionDiv
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-5 flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <h1
              className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Guardian Management
            </h1>
            <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
              <span className="text-[#1E3A5F] font-semibold">Guardian</span>
              <ChevronRight className="w-3 h-3" />
              <span>Guardians</span>
            </nav>
          </div>

          {/* Map button */}
          <button
            type="button"
            onClick={open}
            className="flex items-center gap-x-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            style={{
              background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
              boxShadow: "0 4px 14px rgba(13,27,46,0.25)",
            }}
          >
            <Link2 className="w-4 h-4 text-[#C9A84C]" />
            Map Students to Guardian
          </button>
        </MotionDiv>

        <div className="flex flex-col gap-y-4">
          {/* ── CARD HEADER + STATS ── */}
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
          >
            <CardHeader
              icon={<ShieldAlert className="w-4 h-4" />}
              title="Guardians"
              badge={count ? `${count} total` : undefined}
            />
            {/* Stats strip */}
            {!isLoading && count > 0 && (
              <div className="flex flex-wrap gap-2.5 px-4 py-3.5 border-t border-slate-100 bg-slate-50/50">
                <StatPill
                  icon={<Users className="w-3.5 h-3.5" />}
                  label="Total"
                  value={count}
                />
                <StatPill
                  icon={<GraduationCap className="w-3.5 h-3.5" />}
                  label="With Wards"
                  value={withWards}
                />
                <StatPill
                  icon={<ShieldAlert className="w-3.5 h-3.5" />}
                  label="No Wards"
                  value={noWards}
                />
              </div>
            )}
          </MotionDiv>

          {/* ── SEARCH + FILTER BAR ── */}
          {!isLoading && count > 0 && (
            <MotionDiv
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or ward…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              {/* Relationship filter */}
              <div className="flex items-center gap-x-1.5 flex-wrap gap-y-1.5">
                <span className="text-[11px] text-slate-400 flex items-center gap-x-1 shrink-0">
                  <Filter className="w-3 h-3" />
                </span>
                {["all", ...relationships].map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setFilterRel(rel)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer capitalize
                      ${
                        filterRel === rel
                          ? "text-[#C9A84C] border-[#0D1B2E]"
                          : "text-slate-500 bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    style={
                      filterRel === rel
                        ? {
                            background:
                              "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                          }
                        : {}
                    }
                  >
                    {rel === "all" ? "All types" : rel}
                  </button>
                ))}
                <div className="w-px h-5 bg-slate-200 mx-0.5 hidden sm:block" />
                {[
                  { key: "all", label: "All" },
                  { key: "with_wards", label: "Has wards" },
                  { key: "no_wards", label: "No wards" },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilterStatus(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer
                      ${
                        filterStatus === f.key
                          ? "bg-[#EEF2F8] text-[#1E3A5F] border-[#D0DCF0]"
                          : "text-slate-500 bg-white border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </MotionDiv>
          )}

          {/* ── LIST ── */}
          {isLoading ? (
            <div className="flex flex-col gap-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} i={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <EmptyState
                icon={<ShieldAlert className="w-6 h-6" />}
                message={
                  search || filterRel !== "all" || filterStatus !== "all"
                    ? "No guardians match your filters"
                    : "No guardians found"
                }
                sub={
                  search || filterRel !== "all" || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Map students to their guardians to get started"
                }
              />
            </MotionDiv>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((guardian, i) => (
                  <GuardianCard
                    key={guardian.guardianId}
                    guardian={guardian}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Result count when filtering */}
          {!isLoading &&
            (search || filterRel !== "all" || filterStatus !== "all") &&
            filtered.length > 0 && (
              <p className="text-center text-xs text-slate-400">
                Showing {filtered.length} of {count} guardian
                {count !== 1 ? "s" : ""}
              </p>
            )}
        </div>

        <GuardianMap isOpen={isOpen} close={close} count={count} />
      </div>
    </>
  );
};

export default GuardianManagement;
