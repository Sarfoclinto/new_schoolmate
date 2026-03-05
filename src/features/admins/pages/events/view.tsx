import {
  AlignLeft,
  CalendarDays,
  ChevronRight,
  Clock,
  Coffee,
  Filter,
  LayoutGrid,
  Palmtree,
  PartyPopper,
  Search,
  Tag,
  X,
} from "lucide-react";
import dayjs from "@/lib/dayjs";
import type { EventGet } from "@/types/api/event";
import { MotionButton, MotionDiv } from "@/components/custom/motion";
import { formatDate } from "@/utils/date-n-time";
import { List, Modal, Select, Table } from "antd";
import type { SelectTypes } from "@/types/ui";
import { useMemo, useState } from "react";
import useFetch from "@/hooks/api/use-fetch";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { eduKeys, eventKeys, termKeys } from "@/config/query-keys";
import { getTermsByEduIdFn } from "@/services/setup/year-n-term";
import { getAllEvents } from "@/services/event";
import type { ColumnsType } from "antd/es/table";
import { AnimatePresence } from "motion/react";

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
type EventType = "Event" | "Holiday" | "Break";

const TYPE_CONFIG: Record<
  EventType,
  {
    icon: React.ReactNode;
    bg: string;
    border: string;
    text: string;
    headerBg: string;
    dot: string;
  }
> = {
  Event: {
    icon: <PartyPopper className="w-3.5 h-3.5" />,
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    dot: "bg-violet-500",
    headerBg: "linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%)",
  },
  Holiday: {
    icon: <Palmtree className="w-3.5 h-3.5" />,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    headerBg: "linear-gradient(135deg, #064E3B 0%, #059669 100%)",
  },
  Break: {
    icon: <Coffee className="w-3.5 h-3.5" />,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
    headerBg: "linear-gradient(135deg, #78350F 0%, #D97706 100%)",
  },
};

const getTypeConfig = (t?: string) =>
  TYPE_CONFIG[(t as EventType) ?? "Event"] ?? TYPE_CONFIG.Event;

// ─────────────────────────────────────────────────────────
// Micro-components
// ─────────────────────────────────────────────────────────
const FL = ({ children }: { children: React.ReactNode }) => (
  <span
    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    {children}
  </span>
);

const TypeBadge = ({ type }: { type?: string }) => {
  const c = getTypeConfig(type);
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${c.bg} ${c.border} ${c.text}`}
    >
      {c.icon}
      {type ?? "Event"}
    </span>
  );
};

const StatChip = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) => (
  <div
    className={`flex items-center gap-x-3 rounded-2xl px-4 py-3 border border-white flex-1 min-w-27.5 ${color}`}
    style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.04)" }}
  >
    <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-none mb-0.5">
        {label}
      </p>
      <p
        className="text-xl font-bold leading-tight"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {value}
      </p>
    </div>
  </div>
);

// Duration string: "3 days" / "1 day" / "same day"
const getDuration = (start?: string, end?: string) => {
  if (!start || !end) return "—";
  const diff = dayjs(end).diff(dayjs(start), "day");
  if (diff === 0) return "Same day";
  return `${diff + 1} day${diff > 0 ? "s" : ""}`;
};

// ─────────────────────────────────────────────────────────
// Event Card (grid view)
// ─────────────────────────────────────────────────────────
const EventCard = ({
  event,
  onClick,
}: {
  event: EventGet;
  onClick: () => void;
}) => {
  const c = getTypeConfig(event.calendarType);
  const isOngoing = dayjs().isBetween(
    event.startDate,
    event.endDate,
    "day",
    "[]",
  );
  const isPast = dayjs().isAfter(dayjs(event.endDate), "day");

  return (
    <MotionButton
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22 }}
      className="w-full text-left bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer"
      style={{ boxShadow: "0 2px 10px rgba(13,27,46,0.06)" }}
    >
      {/* Coloured top strip */}
      <div className="h-1.5 w-full" style={{ background: c.headerBg }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-x-2 mb-3">
          <TypeBadge type={event.calendarType} />
          {isOngoing && (
            <span className="inline-flex items-center gap-x-1 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Ongoing
            </span>
          )}
          {isPast && !isOngoing && (
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Past
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="font-bold text-[#0D1B2E] text-sm leading-snug mb-3 line-clamp-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {event.title || (
            <span className="text-slate-300 italic font-normal">Untitled</span>
          )}
        </h3>

        {/* Dates */}
        <div className="flex items-center gap-x-2 text-xs text-slate-500 mb-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-semibold">{formatDate(event.startDate)}</span>
          {event.startDate !== event.endDate && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-semibold">{formatDate(event.endDate)}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-x-2 text-[11px] text-slate-400">
          <Clock className="w-3 h-3 shrink-0" />
          {getDuration(event.startDate, event.endDate)}
        </div>

        {/* Description preview */}
        {event.description && (
          <p className="mt-3 text-[11px] text-slate-400 line-clamp-2 leading-relaxed border-t border-slate-100 pt-3">
            {event.description}
          </p>
        )}
      </div>
    </MotionButton>
  );
};

// ─────────────────────────────────────────────────────────
// Detail Modal
// ─────────────────────────────────────────────────────────
const EventDetailModal = ({
  event,
  open,
  onClose,
}: {
  event: EventGet | null;
  open: boolean;
  onClose: () => void;
}) => {
  if (!event) return null;
  const c = getTypeConfig(event.calendarType);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      closeIcon={
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <X className="w-3.5 h-3.5 text-slate-500" />
        </div>
      }
      styles={{
        wrapper: { padding: 0, borderRadius: 20, overflow: "hidden" },
        container: { padding: 1 },
        body: { padding: 0 },
      }}
    >
      {/* Modal header */}
      <div
        className="px-5 py-4 rounded-t-lg"
        style={{ background: c.headerBg }}
      >
        <div className="flex items-center gap-x-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white">
            {c.icon}
          </div>
          <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
            {event.calendarType}
          </span>
        </div>
        <h2
          className="text-white font-bold text-lg leading-snug mt-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {event.title || "Untitled Event"}
        </h2>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-y-4">
        {/* Date range */}
        <div className="flex items-center gap-x-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <CalendarDays className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Date
            </p>
            <p
              className="text-sm font-bold text-[#0D1B2E]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {formatDate(event.startDate)}
              {event.startDate !== event.endDate && (
                <>
                  {" "}
                  <ChevronRight className="w-3.5 h-3.5 inline text-slate-300" />{" "}
                  {formatDate(event.endDate)}
                </>
              )}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Duration
            </p>
            <p className="text-sm font-bold text-[#0D1B2E]">
              {getDuration(event.startDate, event.endDate)}
            </p>
          </div>
        </div>

        {/* Type */}
        <div className="flex items-center gap-x-3">
          <Tag className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 w-24">
            Type
          </span>
          <TypeBadge type={event.calendarType} />
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <div className="flex items-center gap-x-3 mb-2">
              <AlignLeft className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Description
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              {event.description}
            </p>
          </div>
        )}

        {/* Term */}
        {event.academicTermName && (
          <div className="flex items-center gap-x-3">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 w-24">
              Term
            </span>
            <span className="text-sm font-semibold text-[#0D1B2E]">
              {event.academicTermName}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};

const ViewEvents = () => {
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<SelectTypes | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [detailEvent, setDetailEvent] = useState<EventGet | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const eduId = selectedEdu?.value;
  const termId = selectedTerm?.value;

  // ── Queries ──────────────────────────────────────────
  const { data: educationalLevels, isLoading: edusLoading } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  const { data: terms, isLoading: termsLoading } = useFetch({
    queryFn: () => getTermsByEduIdFn(eduId!),
    queryKeys: termKeys.custom("edu-terms", { eduId }),
    enabled: !!eduId,
  });
  const { data: events, isLoading: eventsLoading } = useFetch({
    queryFn: () => getAllEvents(termId!),
    queryKeys: eventKeys.list({ termId }),
    enabled: !!termId,
  });

  const eduOptions = useMemo(
    () =>
      educationalLevels?.map((l) => ({
        label: l.educationalLevelName,
        value: l.educationalLevelId,
      })) ?? [],
    [educationalLevels],
  );
  const termOptions = useMemo(
    () =>
      terms?.map((t) => ({
        label: t.academicTermName,
        value: t.academicTermId,
      })) ?? [],
    [terms],
  );

  // ── Filtered events ──────────────────────────────────
  const filtered = useMemo(() => {
    return (events ?? []).filter((e) => {
      if (typeFilter && e.calendarType !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !e.title?.toLowerCase().includes(q) &&
          !e.description?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [events, typeFilter, search]);

  // ── Stats ────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      events: (events ?? []).filter((e) => e.calendarType === "Event").length,
      holidays: (events ?? []).filter((e) => e.calendarType === "Holiday")
        .length,
      breaks: (events ?? []).filter((e) => e.calendarType === "Break").length,
    }),
    [events],
  );

  // ── Table columns ────────────────────────────────────
  const columns: ColumnsType<EventGet> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (v: string) => (
        <span className="font-semibold text-[#0D1B2E]">{v || "—"}</span>
      ),
    },
    {
      title: "Type",
      dataIndex: "calendarType",
      key: "type",
      render: (v: string) => <TypeBadge type={v} />,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "start",
      render: (d: string) => formatDate(d),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "end",
      render: (d: string) => formatDate(d),
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, row) => getDuration(row.startDate, row.endDate),
    },
    {
      title: "",
      key: "action",
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setDetailEvent(row)}
          className="text-[11px] font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-colors cursor-pointer"
        >
          View →
        </button>
      ),
    },
  ];

  const hasEvents = !!selectedTerm && !eventsLoading;

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
            className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Events &amp; Holidays
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Calendar</span>
            <ChevronRight className="w-3 h-3" />
            <span>View All Events</span>
            {selectedTerm && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#0D1B2E] font-semibold">
                  {selectedTerm.label}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* View toggle */}
        {hasEvents && filtered.length > 0 && (
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            {(
              [
                ["grid", <LayoutGrid className="w-3.5 h-3.5" />],
                ["table", <List className="w-3.5 h-3.5" />],
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

      {/* ── Filter card ──────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <div
          className="flex items-center gap-x-3 px-5 py-3.5"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
            <Filter className="w-4 h-4" />
          </div>
          <span className="text-white font-semibold text-sm flex-1">
            Filter Events
          </span>
          {selectedTerm && (
            <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <FL>Type</FL>
            </p>
            <Select
              size="large"
              allowClear
              placeholder="All types"
              className="w-full"
              disabled={!selectedTerm}
              options={["Event", "Holiday", "Break"].map((v) => ({
                label: <TypeBadge type={v} />,
                value: v,
              }))}
              onChange={(v) => setTypeFilter(v ?? null)}
            />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <FL>Search</FL>
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search title or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={!selectedTerm}
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0D1B2E] placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* ── Stats (shown once a term is selected and data loads) ── */}
      <AnimatePresence>
        {hasEvents && events && events.length > 0 && (
          <MotionDiv
            key="stats"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-3 gap-3 mb-4"
          >
            <StatChip
              icon={<PartyPopper className="w-4 h-4 text-violet-600" />}
              label="Events"
              value={stats.events}
              color="bg-violet-50 text-violet-800"
            />
            <StatChip
              icon={<Palmtree className="w-4 h-4 text-emerald-600" />}
              label="Holidays"
              value={stats.holidays}
              color="bg-emerald-50 text-emerald-800"
            />
            <StatChip
              icon={<Coffee className="w-4 h-4 text-amber-600" />}
              label="Breaks"
              value={stats.breaks}
              color="bg-amber-50 text-amber-800"
            />
          </MotionDiv>
        )}
      </AnimatePresence>

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
            <CalendarDays className="w-4 h-4" />
          </div>
          <span className="text-white font-semibold text-sm flex-1">
            {selectedTerm ? `${selectedTerm.label} — Events` : "Events"}
          </span>
        </div>

        {/* Prompt: no term selected */}
        {!selectedTerm && (
          <div className="flex flex-col items-center py-16 gap-3 text-slate-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <CalendarDays className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-400">
              Select a term to view events
            </p>
            <p className="text-xs text-slate-300 text-center max-w-60">
              Choose an educational level and academic term in the filter bar
              above
            </p>
          </div>
        )}

        {/* Loading */}
        {eventsLoading && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 bg-slate-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty: term selected but no events */}
        {hasEvents && filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3 text-slate-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <PartyPopper className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-400">
              No events found
            </p>
            {(typeFilter || search) && (
              <button
                type="button"
                onClick={() => {
                  setTypeFilter(null);
                  setSearch("");
                }}
                className="text-xs font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Grid view */}
        {hasEvents && filtered.length > 0 && viewMode === "grid" && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((event, i) => (
              <MotionDiv
                key={event.academicTermCalendarId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <EventCard
                  event={event}
                  onClick={() => setDetailEvent(event)}
                />
              </MotionDiv>
            ))}
          </div>
        )}

        {/* Table view */}
        {hasEvents && filtered.length > 0 && viewMode === "table" && (
          <div className="p-5">
            <Table
              rowKey="academicTermCalendarId"
              dataSource={filtered}
              columns={columns}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              styles={{ header: { cell: { color: "white" } } }}
              onRow={(row) => ({
                onClick: () => setDetailEvent(row),
                className: "cursor-pointer hover:bg-slate-50 transition-colors",
              })}
              size="small"
            />
          </div>
        )}
      </MotionDiv>

      {/* ── Detail Modal ─────────────────────────────── */}
      <EventDetailModal
        event={detailEvent}
        open={!!detailEvent}
        onClose={() => setDetailEvent(null)}
      />
    </div>
  );
};
export default ViewEvents;
