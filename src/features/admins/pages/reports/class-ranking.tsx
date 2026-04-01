// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

import { MotionDiv } from "@/components/custom/motion";
import { academicRecordsKeys, eduKeys, termKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getClassRankingFn } from "@/services/academic-records";
import { getAllSubLevelsFn } from "@/services/setup/sublevel";
import { getTermsBySubIdFn } from "@/services/setup/year-n-term";
import type { StudentRank } from "@/types/api/academic-records";
import { Select } from "antd";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Award,
  BarChart2,
  BookOpen,
  ChevronRight,
  Filter,
  GraduationCap,
  Hash,
  Medal,
  Printer,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";

const FL = ({ children }: { children: React.ReactNode }) => (
  <span
    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    {children}
  </span>
);

const CardHeader = ({
  icon,
  title,
  badge,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string | number;
  right?: React.ReactNode;
}) => (
  <div
    className="flex items-center gap-x-3 px-5 py-3.5"
    style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)" }}
  >
    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
      {icon}
    </div>
    <span
      className="text-white font-semibold text-sm flex-1"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {title}
    </span>
    {badge !== undefined && (
      <span className="text-[10px] font-bold text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
    {right}
  </div>
);

const StatChip = ({
  icon,
  label,
  value,
  color = "navy",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: "navy" | "green" | "amber" | "rose";
}) => {
  const bg = {
    navy: "bg-[#EEF2F8]",
    green: "bg-emerald-50",
    amber: "bg-amber-50",
    rose: "bg-rose-50",
  }[color];
  const text = {
    navy: "text-[#1E3A5F]",
    green: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
  }[color];
  return (
    <div
      className="flex items-center gap-x-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 flex-1 min-w-32.5"
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.04)" }}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg} ${text}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-0.5">
          {label}
        </p>
        <p
          className="text-sm font-bold text-[#0D1B2E] leading-tight"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

const EmptyState = ({
  icon,
  message,
  sub,
}: {
  icon: React.ReactNode;
  message: string;
  sub?: string;
}) => (
  <div className="flex flex-col items-center py-16 gap-3">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
      {icon}
    </div>
    <p className="text-sm font-semibold text-slate-400">{message}</p>
    {sub && (
      <p className="text-xs text-slate-300 text-center max-w-60">{sub}</p>
    )}
  </div>
);

const SkeletonRows = ({ n = 6 }: { n?: number }) => (
  <div className="flex flex-col gap-y-2 p-4">
    {Array.from({ length: n }).map((_, i) => (
      <div
        key={i}
        className="h-12 rounded-xl bg-slate-100 animate-pulse"
        style={{ opacity: 1 - i * 0.1 }}
      />
    ))}
  </div>
);

// ─── Score heat colour ────────────────────────────────────────────────────────
function scoreColor(pct: number): { bg: string; text: string; border: string } {
  if (pct >= 70)
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    };
  if (pct >= 50)
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    };
  return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
}

// ─── Sort indicator ───────────────────────────────────────────────────────────
const SortIcon = ({
  col,
  active,
  dir,
}: {
  col: string;
  active: string;
  dir: "asc" | "desc";
}) => {
  if (active !== col)
    return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline-block" />;
  return dir === "asc" ? (
    <ArrowUp className="w-3 h-3 text-[#C9A84C] ml-1 inline-block" />
  ) : (
    <ArrowDown className="w-3 h-3 text-[#C9A84C] ml-1 inline-block" />
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOP-3 PODIUM
// ═══════════════════════════════════════════════════════════════════════════════

const MEDAL_CONFIG = [
  {
    place: 1,
    icon: <Trophy className="w-5 h-5" />,
    label: "1st Place",
    ring: "ring-2 ring-yellow-400/60",
    bg: "from-yellow-50 to-amber-50",
    border: "border-yellow-300",
    iconBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    textCol: "text-yellow-700",
    barH: "h-24",
  },
  {
    place: 2,
    icon: <Medal className="w-5 h-5" />,
    label: "2nd Place",
    ring: "ring-2 ring-slate-300/60",
    bg: "from-slate-50 to-slate-100",
    border: "border-slate-300",
    iconBg: "bg-gradient-to-br from-slate-400 to-slate-500",
    textCol: "text-slate-600",
    barH: "h-16",
  },
  {
    place: 3,
    icon: <Award className="w-5 h-5" />,
    label: "3rd Place",
    ring: "ring-2 ring-orange-300/60",
    bg: "from-orange-50 to-amber-50",
    border: "border-orange-300",
    iconBg: "bg-gradient-to-br from-orange-400 to-amber-600",
    textCol: "text-orange-700",
    barH: "h-12",
  },
];

const PodiumCard = ({
  student,
  config,
  delay,
}: {
  student: StudentRank;
  config: (typeof MEDAL_CONFIG)[0];
  delay: number;
}) => {
  const initials = student.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`flex flex-col items-center gap-y-3 p-5 rounded-2xl border bg-linear-to-b ${config.bg} ${config.border} ${config.ring} flex-1 min-w-0`}
      style={{ boxShadow: "0 4px 16px rgba(13,27,46,0.08)" }}
    >
      {/* Medal icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${config.iconBg}`}
        style={{ boxShadow: "0 3px 10px rgba(0,0,0,0.2)" }}
      >
        {config.icon}
      </div>

      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-[#C9A84C] text-lg shrink-0"
        style={{
          background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
          boxShadow: "0 4px 12px rgba(13,27,46,0.25)",
        }}
      >
        {initials}
      </div>

      {/* Name + rank label */}
      <div className="text-center min-w-0 w-full">
        <p
          className="font-bold text-sm text-[#0D1B2E] truncate"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {student.fullName}
        </p>
        {student.otherName && (
          <p className="text-[11px] text-slate-400 truncate">
            {student.otherName}
          </p>
        )}
        <p
          className={`text-[11px] font-black uppercase tracking-widest mt-1 ${config.textCol}`}
        >
          {config.label}
        </p>
      </div>

      {/* Score + subject count */}
      <div className="flex items-center gap-x-3 w-full">
        <div className="flex-1 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Total
          </p>
          <p
            className="text-lg font-black text-[#0D1B2E]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {student.assessmentsTotal?.toFixed(1)}
          </p>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex-1 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Subjects
          </p>
          <p
            className="text-lg font-black text-[#0D1B2E]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {student.assessment.length}
          </p>
        </div>
      </div>

      {/* Bar height visual (decorative) */}
      <div
        className={`w-full rounded-xl ${config.iconBg} opacity-20 ${config.barH}`}
      />
    </MotionDiv>
  );
};

type SortDir = "asc" | "desc";

const ClassRanking = () => {
  // ── Filter state ────────────────────────────────────────────────────────────
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ── Table state ─────────────────────────────────────────────────────────────
  const [sortCol, setSortCol] = useState<string>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null); // highlight a subject
  const [rankRange, setRankRange] = useState<[number, number] | null>(null); // top-N filter
  const [showPodium, setShowPodium] = useState(true);

  const { data: sublevels = [], isLoading: loadingSubs } = useFetch({
    queryFn: getAllSubLevelsFn,
    queryKeys: eduKeys.sublevels(),
  });
  const { data: terms = [], isLoading: loadingTerms } = useFetch({
    queryKeys: termKeys.list({ selectedSublevel: selectedSubId }),
    queryFn: () => getTermsBySubIdFn(selectedSubId!),
    enabled: !!selectedSubId,
  });
  const { data: ranking = [], isLoading: loadingRanking } = useFetch({
    queryFn: () => getClassRankingFn(selectedSubId!, selectedTermId!),
    queryKeys: academicRecordsKeys.custom("class-ranking", {
      sublevelId: selectedSubId,
      termId: selectedTermId,
    }),
    enabled: !!selectedSubId && !!selectedTermId,
  });

  // ── Subject columns (union of all subjects across all students) ──────────────
  const allSubjects = useMemo((): { id: string; name: string }[] => {
    const map = new Map<string, string>();
    ranking?.forEach((student) =>
      student.assessment?.forEach((a) => map.set(a.subjectId, a.subjectName)),
    );
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [ranking]);

  // ── Sort ─────────────────────────────────────────────────────────────────────
  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  // ── Filtered + sorted rows ───────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let rows = [...ranking];

    // Name search
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.otherName?.toLowerCase().includes(q),
      );
    }

    // Top-N filter
    if (rankRange) {
      rows = rows.filter(
        (s) => s.rank >= rankRange[0] && s.rank <= rankRange[1],
      );
    }

    // Sort
    rows.sort((a, b) => {
      let aVal: number, bVal: number;
      if (sortCol === "rank") {
        aVal = a.rank;
        bVal = b.rank;
      } else if (sortCol === "total") {
        aVal = a.assessmentsTotal;
        bVal = b.assessmentsTotal;
      } else {
        // Subject column sort
        const aA = a.assessment.find((x) => x.subjectId === sortCol);
        const bA = b.assessment.find((x) => x.subjectId === sortCol);
        aVal = aA?.subjectTotalAssessment ?? -1;
        bVal = bA?.subjectTotalAssessment ?? -1;
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

    return rows;
  }, [ranking, search, rankRange, sortCol, sortDir]);

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!ranking.length) return null;
    const totals = ranking.map((s) => s.assessmentsTotal);
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const top = ranking.find((s) => s.rank === 1);
    const bottom = [...ranking].sort((a, b) => b.rank - a.rank)[0];
    return {
      count: ranking.length,
      subjects: allSubjects.length,
      avg,
      top,
      bottom,
    };
  }, [ranking, allSubjects]);

  // ── Top 3 podium ──────────────────────────────────────────────────────────────
  const top3 = useMemo(() => {
    const byRank = [...ranking].sort((a, b) => a.rank - b.rank);
    const first = byRank.find((s) => s.rank === 1);
    const second = byRank.find((s) => s.rank === 2);
    const third = byRank.find((s) => s.rank === 3);
    return [second, first, third].filter(Boolean) as StudentRank[];
    // Render order: 2nd | 1st | 3rd  (classic podium visual)
  }, [ranking]);

  // ── Podium config order matches [2nd, 1st, 3rd] ──────────────────────────────
  const podiumOrder = [MEDAL_CONFIG[1], MEDAL_CONFIG[0], MEDAL_CONFIG[2]];

  const isReady = !!selectedTermId && !!selectedSubId;
  const hasData = !loadingRanking && ranking.length > 0;

  const selectedSubLevelName = sublevels?.find(
    (s) => s.subLevelId === selectedSubId,
  )?.subLevelName;
  const selectedTermName = terms?.find(
    (t) => t.academicTermId === selectedTermId,
  )?.academicTermName;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* ── PAGE HEADER ────────────────────────────────────────────── */}
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
            Class Ranking
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">
              Academic Records
            </span>
            <ChevronRight className="w-3 h-3" />
            <span>Class Ranking</span>
            {selectedSubLevelName && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#0D1B2E] font-semibold">
                  {selectedSubLevelName}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Context pill */}
        {hasData && (
          <div className="flex items-center gap-x-2 px-3.5 py-2 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl">
            <Trophy className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-sm font-bold text-[#0D1B2E]">
              {ranking.length} students ranked
            </span>
            {selectedTermName && (
              <span className="text-[11px] text-slate-400">
                · {selectedTermName}
              </span>
            )}
          </div>
        )}
      </MotionDiv>

      {/* ── FILTER CARD ─────────────────────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <CardHeader
          icon={<Filter className="w-4 h-4" />}
          title="Filters"
          badge={isReady ? "Ready" : "Configure below"}
        />

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Educational Level */}
            {/* <div>
              <p className="mb-1.5">
                <FL>Educational Level</FL>
              </p>
              <Select
                size="large"
                className="w-full"
                showSearch
                filterOption={(inp, o) =>
                  String(o?.label ?? "")
                    .toLowerCase()
                    .includes(inp.toLowerCase())
                }
                placeholder="Select level…"
                loading={loadingEdu}
                disabled={loadingEdu}
                options={eduLevels.map((e) => ({
                  label: e.educationalLevelName,
                  value: e.educationalLevelId,
                }))}
                value={selectedEduId ?? undefined}
                onChange={(id) => {
                  setSelectedEduId(id);
                  setSelectedTermId(null);
                  setSelectedSubId(null);
                }}
              />
            </div> */}

            {/* Sub-Level */}
            <div>
              <p className="mb-1.5">
                <FL>Class / Sub-Level</FL>
              </p>
              <Select
                size="large"
                className="w-full"
                showSearch={{
                  filterOption: (inp, o) =>
                    String(o?.label ?? "")
                      .toLowerCase()
                      .includes(inp.toLowerCase()),
                }}
                placeholder="Select class…"
                loading={loadingSubs}
                disabled={loadingSubs}
                options={sublevels.map((s) => ({
                  label: s.subLevelName,
                  value: s.subLevelId,
                }))}
                value={selectedSubId ?? undefined}
                onChange={setSelectedSubId}
              />
            </div>

            {/* Term */}
            <div>
              <p className="mb-1.5">
                <FL>Academic Term</FL>
              </p>
              <Select
                size="large"
                className="w-full"
                showSearch={{
                  filterOption: (inp, o) =>
                    String(o?.label ?? "")
                      .toLowerCase()
                      .includes(inp.toLowerCase()),
                }}
                placeholder={
                  selectedSubId ? "Select term…" : "Select class first"
                }
                loading={loadingTerms}
                disabled={!selectedSubId || loadingTerms}
                options={terms.map((t) => ({
                  label: t.academicTermName,
                  value: t.academicTermId,
                }))}
                value={selectedTermId ?? undefined}
                onChange={(id) => {
                  setSelectedTermId(id);
                }}
              />
            </div>
          </div>

          {/* Secondary filters — only shown when data loaded */}
          <AnimatePresence>
            {hasData && (
              <MotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Name search */}
                  <div>
                    <p className="mb-1.5">
                      <FL>Search Student</FL>
                    </p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Name or other name…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                    </div>
                  </div>

                  {/* Subject spotlight */}
                  <div>
                    <p className="mb-1.5">
                      <FL>Spotlight Subject</FL>
                    </p>
                    <Select
                      size="middle"
                      className="w-full"
                      allowClear
                      placeholder="Highlight a subject…"
                      options={allSubjects.map((s) => ({
                        label: s.name,
                        value: s.id,
                      }))}
                      value={subjectFilter ?? undefined}
                      onChange={(v) => setSubjectFilter(v ?? null)}
                    />
                  </div>

                  {/* Rank range */}
                  <div>
                    <p className="mb-1.5">
                      <FL>Rank Range</FL>
                    </p>
                    <Select
                      size="middle"
                      className="w-full"
                      allowClear
                      placeholder="e.g. Top 10…"
                      options={[
                        { label: "Top 3", value: "1-3" },
                        { label: "Top 5", value: "1-5" },
                        { label: "Top 10", value: "1-10" },
                        { label: "Top 20", value: "1-20" },
                        {
                          label: "Bottom 10",
                          value: `${Math.max(1, ranking.length - 9)}-${ranking.length}`,
                        },
                      ]}
                      value={
                        rankRange
                          ? `${rankRange[0]}-${rankRange[1]}`
                          : undefined
                      }
                      onChange={(v) => {
                        if (!v) {
                          setRankRange(null);
                          return;
                        }
                        const [a, b] = v.split("-").map(Number);
                        setRankRange([a, b]);
                      }}
                    />
                  </div>

                  {/* Podium toggle + clear all */}
                  <div className="flex flex-col gap-y-2">
                    <p className="mb-1.5">
                      <FL>Display</FL>
                    </p>
                    <div className="flex items-center gap-x-2">
                      <button
                        type="button"
                        onClick={() => setShowPodium((v) => !v)}
                        className={`flex items-center gap-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer
                          ${
                            showPodium
                              ? "text-[#C9A84C] border-[#1E3A5F]"
                              : "text-slate-500 border-slate-200 hover:border-slate-300"
                          }`}
                        style={
                          showPodium
                            ? {
                                background:
                                  "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                              }
                            : {}
                        }
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        Podium
                      </button>
                      {(search || subjectFilter || rankRange) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setSubjectFilter(null);
                            setRankRange(null);
                          }}
                          className="flex items-center gap-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </MotionDiv>

      {/* ── STAT CHIPS ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasData && stats && (
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-3 mb-4"
          >
            <StatChip
              icon={<Users className="w-4 h-4" />}
              label="Students"
              value={stats.count}
            />
            <StatChip
              icon={<BookOpen className="w-4 h-4" />}
              label="Subjects"
              value={stats.subjects}
            />
            <StatChip
              icon={<BarChart2 className="w-4 h-4" />}
              label="Class Avg"
              value={`${stats.avg?.toFixed(1)}`}
              color={
                stats.avg >= 70 ? "green" : stats.avg >= 50 ? "amber" : "rose"
              }
            />
            <StatChip
              icon={<TrendingUp className="w-4 h-4" />}
              label="Top Score"
              value={
                stats.top
                  ? `${stats.top.assessmentsTotal?.toFixed(1)} · ${stats.top.fullName}`
                  : "—"
              }
              color="green"
            />
            <StatChip
              icon={<TrendingDown className="w-4 h-4" />}
              label="Lowest Score"
              value={
                stats.bottom
                  ? `${stats.bottom.assessmentsTotal?.toFixed(1)} · ${stats.bottom.fullName}`
                  : "—"
              }
              color="rose"
            />
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* ── EMPTY / PROMPT ─────────────────────────────────────────── */}
      {!isReady && (
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <EmptyState
            icon={<Trophy className="w-7 h-7" />}
            message="Select a term and class to view rankings"
            sub="Use the filter card above to configure the level, term and class."
          />
        </div>
      )}

      {isReady && loadingRanking && (
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <SkeletonRows n={8} />
        </div>
      )}

      {isReady && !loadingRanking && ranking.length === 0 && (
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <EmptyState
            icon={<Hash className="w-7 h-7" />}
            message="No ranking data found"
            sub="There are no academic records for this class and term yet."
          />
        </div>
      )}

      {/* ── TOP-3 PODIUM ────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasData && showPodium && top3.length > 0 && !search && !rankRange && (
          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-4"
          >
            <div
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
            >
              <CardHeader
                icon={<Star className="w-4 h-4" />}
                title="Top 3 — Podium"
                badge={`${selectedSubLevelName ?? "Class"}`}
              />
              <div className="p-5">
                <div className="flex gap-x-4 items-end">
                  {top3.map((student, i) => (
                    <PodiumCard
                      key={student.studentId}
                      student={student}
                      config={podiumOrder[i]}
                      delay={i * 0.08}
                    />
                  ))}
                </div>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* ── RANKING TABLE ───────────────────────────────────────────── */}
      {hasData && (
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <CardHeader
            icon={<GraduationCap className="w-4 h-4" />}
            title="Full Rankings"
            badge={
              filteredRows.length !== ranking.length
                ? `${filteredRows.length} of ${ranking.length}`
                : `${ranking.length} students`
            }
            right={
              <div className="flex items-center gap-x-2 ml-2">
                {/* Print hint */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            }
          />

          {/* Active filters strip */}
          <AnimatePresence>
            {(search || subjectFilter || rankRange) && (
              <MotionDiv
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-slate-100 bg-slate-50/60"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-4 py-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Active filters:
                  </span>
                  {search && (
                    <span className="flex items-center gap-x-1 text-[11px] font-bold text-[#1E3A5F] bg-[#EEF2F8] border border-[#D0DCF0] px-2.5 py-0.5 rounded-full">
                      <Search className="w-3 h-3" />"{search}"
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="ml-1 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {subjectFilter && (
                    <span className="flex items-center gap-x-1 text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">
                      <BookOpen className="w-3 h-3" />
                      {allSubjects.find((s) => s.id === subjectFilter)?.name}
                      <button
                        type="button"
                        onClick={() => setSubjectFilter(null)}
                        className="ml-1 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {rankRange && (
                    <span className="flex items-center gap-x-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      <Hash className="w-3 h-3" />
                      Rank {rankRange[0]}–{rankRange[1]}
                      <button
                        type="button"
                        onClick={() => setRankRange(null)}
                        className="ml-1 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

          {/* Table */}
          <div className="overflow-x-auto">
            <table
              style={{
                minWidth: `${44 + 200 + allSubjects.length * 110 + 80}px`,
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: "auto",
              }}
            >
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {/* Sticky rank col */}
                  <th
                    onClick={() => toggleSort("rank")}
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                      background: "#F8FAFC",
                      width: 44,
                      minWidth: 44,
                      padding: "10px 8px",
                      borderBottom: "1px solid #E2E8F0",
                      borderRight: "1px solid #E2E8F0",
                      textAlign: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748B",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    # <SortIcon col="rank" active={sortCol} dir={sortDir} />
                  </th>

                  {/* Sticky name col */}
                  <th
                    style={{
                      position: "sticky",
                      left: 44,
                      zIndex: 2,
                      background: "#F8FAFC",
                      minWidth: 200,
                      padding: "10px 14px",
                      borderBottom: "1px solid #E2E8F0",
                      borderRight: "1px solid #E2E8F0",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748B",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Student
                  </th>

                  {/* Subject columns */}
                  {allSubjects.map((sub) => (
                    <th
                      key={sub.id}
                      onClick={() => toggleSort(sub.id)}
                      style={{
                        minWidth: 110,
                        padding: "10px 8px",
                        borderBottom: "1px solid #E2E8F0",
                        borderRight: "1px solid #EEF2F8",
                        textAlign: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: subjectFilter === sub.id ? "#1E3A5F" : "#94A3B8",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        background:
                          subjectFilter === sub.id ? "#EEF2F8" : "#F8FAFC",
                        fontFamily: "'DM Sans', sans-serif",
                        maxWidth: 140,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={sub.name}
                    >
                      {sub.name.length > 14
                        ? sub.name.slice(0, 13) + "…"
                        : sub.name}
                      <span style={{ display: "block", marginTop: 1 }}>
                        <SortIcon col={sub.id} active={sortCol} dir={sortDir} />
                      </span>
                    </th>
                  ))}

                  {/* Sticky total col */}
                  <th
                    onClick={() => toggleSort("total")}
                    style={{
                      position: "sticky",
                      right: 0,
                      zIndex: 2,
                      background: "#EEF2F8",
                      minWidth: 80,
                      padding: "10px 10px",
                      borderBottom: "1px solid #E2E8F0",
                      borderLeft: "1px solid #D0DCF0",
                      textAlign: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#1E3A5F",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Total{" "}
                    <SortIcon col="total" active={sortCol} dir={sortDir} />
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={3 + allSubjects.length}
                      style={{
                        padding: "32px",
                        textAlign: "center",
                        color: "#94A3B8",
                        fontSize: "13px",
                      }}
                    >
                      No students match the current filters.
                    </td>
                  </tr>
                )}

                {filteredRows.map((student, idx) => {
                  const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#FAFBFD";
                  const isTop3 = student.rank <= 3;
                  const maxTotal =
                    ranking.length > 0
                      ? Math.max(...ranking.map((s) => s.assessmentsTotal))
                      : 1;
                  const pct = (student.assessmentsTotal / maxTotal) * 100;
                  const rankMedal =
                    student.rank === 1
                      ? "🥇"
                      : student.rank === 2
                        ? "🥈"
                        : student.rank === 3
                          ? "🥉"
                          : null;

                  return (
                    <tr key={student.studentId}>
                      {/* Rank cell */}
                      <td
                        style={{
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                          background: rowBg,
                          width: 44,
                          padding: "9px 6px",
                          borderBottom: "1px solid #F1F5F9",
                          borderRight: "1px solid #E2E8F0",
                          textAlign: "center",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {rankMedal ? (
                          <span style={{ fontSize: "16px" }}>{rankMedal}</span>
                        ) : (
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: isTop3 ? 800 : 600,
                              color: isTop3 ? "#0D1B2E" : "#94A3B8",
                            }}
                          >
                            {student.rank}
                          </span>
                        )}
                      </td>

                      {/* Name cell */}
                      <td
                        style={{
                          position: "sticky",
                          left: 44,
                          zIndex: 1,
                          background: rowBg,
                          minWidth: 200,
                          padding: "9px 14px",
                          borderBottom: "1px solid #F1F5F9",
                          borderRight: "1px solid #E2E8F0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {/* Avatar */}
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: 700,
                              color: "#C9A84C",
                              background:
                                "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                            }}
                          >
                            {student.fullName
                              .split(" ")
                              .slice(0, 2)
                              .map((n) => n[0]?.toUpperCase() ?? "")
                              .join("")}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#0D1B2E",
                                fontFamily: "'DM Sans', sans-serif",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {student.fullName}
                            </div>
                            {student.otherName && (
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#94A3B8",
                                  marginTop: 1,
                                }}
                              >
                                {student.otherName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Subject score cells */}
                      {allSubjects.map((sub) => {
                        const found = student.assessment.find(
                          (a) => a.subjectId === sub.id,
                        );
                        const score = found?.subjectTotalAssessment;
                        const pos = found?.subjectPosition;
                        const isSpot = subjectFilter === sub.id;
                        const heatPct = typeof score === "number" ? score : 0;
                        const heat = scoreColor(heatPct);

                        return (
                          <td
                            key={sub.id}
                            style={{
                              minWidth: 110,
                              padding: "6px 8px",
                              borderBottom: "1px solid #F1F5F9",
                              borderRight: "1px solid #EEF2F8",
                              textAlign: "center",
                              background: isSpot ? "#EEF2F8" : rowBg,
                            }}
                          >
                            {typeof score === "number" ? (
                              <div>
                                {/* Score pill */}
                                <span
                                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${heat.bg} ${heat.text} ${heat.border}`}
                                >
                                  {score?.toFixed(1)}
                                </span>
                                {/* Position hint */}
                                {pos && pos > 0 && (
                                  <div
                                    style={{
                                      fontSize: "9px",
                                      color: "#94A3B8",
                                      marginTop: 2,
                                    }}
                                  >
                                    pos {pos}
                                  </div>
                                )}
                                {/* Mini bar */}
                                <div
                                  style={{
                                    height: 3,
                                    background: "#F1F5F9",
                                    borderRadius: 4,
                                    marginTop: 3,
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      borderRadius: 4,
                                      width: `${Math.min(100, heatPct)}%`,
                                      background:
                                        heatPct >= 70
                                          ? "#10B981"
                                          : heatPct >= 50
                                            ? "#F59E0B"
                                            : "#EF4444",
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span
                                style={{ color: "#CBD5E1", fontSize: "11px" }}
                              >
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Total cell — sticky right */}
                      <td
                        style={{
                          position: "sticky",
                          right: 0,
                          zIndex: 1,
                          background: isTop3
                            ? "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)"
                            : "#EEF2F8",
                          minWidth: 80,
                          padding: "6px 10px",
                          borderBottom: "1px solid #D0DCF0",
                          borderLeft: "1px solid #D0DCF0",
                          textAlign: "center",
                        }}
                      >
                        {/* Total score */}
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: isTop3 ? "#C9A84C" : "#0D1B2E",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {student.assessmentsTotal?.toFixed(1)}
                        </div>
                        {/* Relative bar */}
                        <div
                          style={{
                            height: 3,
                            background: isTop3
                              ? "rgba(255,255,255,0.15)"
                              : "#D0DCF0",
                            borderRadius: 4,
                            marginTop: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 4,
                              width: `${pct}%`,
                              background: isTop3 ? "#C9A84C" : "#1E3A5F",
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {filteredRows.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex-wrap gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                Showing {filteredRows.length} of {ranking.length} students
                {selectedTermName && ` · ${selectedTermName}`}
                {selectedSubLevelName && ` · ${selectedSubLevelName}`}
              </span>
              <div className="flex items-center gap-x-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-x-1">
                  <span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" />
                  ≥70% Excellent
                </span>
                <span className="flex items-center gap-x-1">
                  <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
                  50–69% Average
                </span>
                <span className="flex items-center gap-x-1">
                  <span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" />
                  &lt;50% Needs work
                </span>
              </div>
            </div>
          )}
        </MotionDiv>
      )}
    </div>
  );
};
export default ClassRanking;
