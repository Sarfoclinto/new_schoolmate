/**
 * RequestCenter.tsx
 *
 * Teacher-facing request management page.
 *
 * Architecture:
 * ─────────────
 * 1. REQUEST_TYPE_CONFIG — single source of truth for every request type.
 *    Adding a new type = adding one entry here. No other changes needed.
 *
 * 2. DynamicRequestFields — renders the right sub-form fields based on
 *    the selected type, driven entirely by the config object.
 *
 * 3. RequestCard — displays a single request with status badge, meta pills,
 *    and an "action" button when status === "approved".
 *
 * 4. The page is split into two stacked sections:
 *    a. Compose panel — full-width card at the top
 *    b. My Requests   — filterable/searchable list below
 *
 * Layout (responsive):
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  PAGE HEADER                                            │
 *  ├─────────────────────────────────────────────────────────┤
 *  │  COMPOSE CARD                                           │
 *  │  Type selector → dynamic fields → receiver → note      │
 *  ├─────────────────────────────────────────────────────────┤
 *  │  MY REQUESTS                                            │
 *  │  Filter tabs (All | Pending | Approved | Declined)      │
 *  │  Request cards                                          │
 *  └─────────────────────────────────────────────────────────┘
 */

import { Popconfirm, Select } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import dayjs from "dayjs";
import {
  ChevronRight,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  FileEdit,
  ArrowRight,
  User,
  Calendar,
  BookOpen,
  Hash,
  MessageSquare,
  Layers,
  RefreshCw,
  ClipboardList,
  Plus,
  AlertCircle,
  ChevronDown,
  Info,
  Trash2,
} from "lucide-react";
import type {
  DeletePayload,
  RequestItem,
  RequestPayload,
  RequestStatus,
  RequestType,
} from "@/types/api/request";
import type {
  AcademicTermGet,
  AcademicYearGet,
} from "@/types/api/setup/year-n-term";
import type { SublevelLite } from "@/types/api/setup/sublevel";
import { useAuth } from "@/store/auth.store";
import { getAllStaffUnPnFn, getTeachersSublevelsFn } from "@/services/staff";
import {
  educationKeys,
  requestKeys,
  staffKeys,
  termKeys,
  yearKeys,
} from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getAllYearsFn, getTermsBySubIdFn } from "@/services/setup/year-n-term";
import {
  deleteRequestFn,
  getUserRequestsFn,
  postRequest,
} from "@/services/request";
import usePost from "@/hooks/api/use-post";
import { useSignalRStore } from "@/store/signalr.store";
import { Link } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST TYPE CONFIG — THE ONLY PLACE YOU NEED TO EDIT WHEN ADDING A NEW TYPE
// ═══════════════════════════════════════════════════════════════════════════════

interface FieldConfig {
  key: string;
  label: string;
  required: boolean;
  type: "select-year" | "select-term" | "select-sublevel" | "text" | "date";
  placeholder: string;
  helperText?: string;
}

interface RequestTypeConfig {
  value: RequestType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: { bg: string; text: string; border: string; iconBg: string };
  fields: FieldConfig[];
  /** Route to navigate to when request is approved. Receives the RequestItem. */
  approvedAction: {
    label: string;
    href: (req: RequestItem) => string;
    icon: React.ReactNode;
  };
}

const REQUEST_TYPE_CONFIG: RequestTypeConfig[] = [
  {
    value: "ACADEMIC_RECORD_UPDATE",
    label: "Academic Record Update",
    description:
      "Request permission to add or modify academic scores for a class",
    icon: <FileEdit className="w-4 h-4" />,
    color: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
    },
    fields: [
      {
        key: "yearId",
        label: "Academic Year",
        required: true,
        type: "select-year",
        placeholder: "Select academic year…",
        helperText: "The year these records belong to",
      },
      {
        key: "sublevelId",
        label: "Class / Sub-Level",
        required: true,
        type: "select-sublevel",
        placeholder: "Select your class…",
        helperText: "The class whose records you want to update",
      },
      {
        key: "termId",
        label: "Academic Term",
        required: true,
        type: "select-term",
        placeholder: "Select a term…",
        helperText: "The term within that year and sublevel",
      },
    ],
    approvedAction: {
      label: "Go to Records",
      icon: <ArrowRight className="w-3.5 h-3.5" />,
      href: (req) =>
        `/staff/old-record-update?sublevel=${req.sublevelId ?? ""}&term=${req.termId ?? ""}&year=${req.yearId ?? ""}`,
    },
  },
  // ─── Add future request types here ───────────────────────────────────────
  // {
  //   value: "ATTENDANCE_OVERRIDE",
  //   label: "Attendance Override",
  //   description: "Request to correct a previously submitted attendance record",
  //   icon: <CalendarCheck className="w-4 h-4" />,
  //   color: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", iconBg: "bg-amber-100" },
  //   fields: [ … ],
  //   approvedAction: { label: "Go to Attendance", icon: <ArrowRight .../>, href: (req) => "…" },
  // },
];

const TYPE_MAP = Object.fromEntries(
  REQUEST_TYPE_CONFIG.map((c) => [c.value, c]),
) as Record<RequestType, RequestTypeConfig>;

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<
  RequestStatus,
  {
    label: string;
    icon: React.ReactNode;
    bg: string;
    text: string;
    border: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="w-3 h-3" />,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircle2 className="w-3 h-3" />,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  declined: {
    label: "Declined",
    icon: <XCircle className="w-3 h-3" />,
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

const FL = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label
    className="flex items-center gap-x-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    {children}
    {required && <span className="text-rose-400 text-[10px]">*</span>}
  </label>
);

const CardHeader = ({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string | number;
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
  </div>
);

const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
};

const MetaPill = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-x-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
      <span className="text-slate-300">{icon}</span>
      <span className="text-slate-400 font-medium">{label}:</span>
      <span className="font-bold text-[#0D1B2E]">{value}</span>
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
  <div className="flex flex-col items-center py-12 gap-3">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
      {icon}
    </div>
    <p className="text-sm font-semibold text-slate-400">{message}</p>
    {sub && (
      <p className="text-xs text-slate-300 text-center max-w-60">{sub}</p>
    )}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-y-3 animate-pulse">
    <div className="flex items-center gap-x-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100" />
      <div className="flex-1 flex flex-col gap-y-1.5">
        <div className="h-4 bg-slate-100 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
      <div className="w-16 h-6 bg-slate-100 rounded-full" />
    </div>
    <div className="h-3 bg-slate-100 rounded w-full" />
    <div className="flex gap-x-2">
      <div className="h-7 bg-slate-100 rounded-xl w-24" />
      <div className="h-7 bg-slate-100 rounded-xl w-24" />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE SELECTOR CARD
// ═══════════════════════════════════════════════════════════════════════════════

const TypeSelectorCard = ({
  selected,
  onSelect,
}: {
  selected: RequestType | null;
  onSelect: (t: RequestType) => void;
}) => (
  <div className="flex flex-col gap-y-2">
    {REQUEST_TYPE_CONFIG.map((cfg) => {
      const isSelected = selected === cfg.value;
      return (
        <button
          key={cfg.value}
          type="button"
          onClick={() => onSelect(cfg.value)}
          className={`flex items-center gap-x-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer
            ${
              isSelected
                ? "border-[#1E3A5F] bg-[#EEF2F8]"
                : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
            }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all
            ${isSelected ? "text-[#C9A84C]" : `${cfg.color.iconBg} ${cfg.color.text}`}`}
            style={
              isSelected
                ? {
                    background:
                      "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                  }
                : {}
            }
          >
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-bold leading-tight ${isSelected ? "text-[#0D1B2E]" : "text-slate-600"}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {cfg.label}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {cfg.description}
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
            ${isSelected ? "border-[#1E3A5F] bg-[#1E3A5F]" : "border-slate-300"}`}
          >
            {isSelected && (
              <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />
            )}
          </div>
        </button>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMIC REQUEST FIELDS
// Renders the per-type sub-form. Drop-in extensible — just add to config.
// ═══════════════════════════════════════════════════════════════════════════════

interface DynamicFieldsProps {
  type: RequestType;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  // Data props for selects
  years: AcademicYearGet[];
  terms: AcademicTermGet[];
  subLevels: SublevelLite[];
  loadingYears: boolean;
  loadingTerms: boolean;
  loadingSubs: boolean;
  disabled: boolean;
}

const DynamicRequestFields = ({
  type,
  values,
  onChange,
  years,
  terms,
  subLevels,
  loadingYears,
  loadingTerms,
  loadingSubs,
  disabled,
}: DynamicFieldsProps) => {
  const cfg = TYPE_MAP[type];
  if (!cfg) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cfg.fields.map((field) => (
        <div key={field.key}>
          <FL required={field.required}>{field.label}</FL>

          {field.type === "select-year" && (
            <Select
              size="large"
              className="w-full"
              placeholder={field.placeholder}
              loading={loadingYears}
              disabled={loadingYears || disabled}
              value={values[field.key] || undefined}
              options={years.map((y) => ({
                label: `${y.startYear}-${y.endYear}`,
                value: y.academicYearId,
              }))}
              onChange={(v) => onChange(field.key, v)}
              notFoundContent={
                <div className="py-4 flex flex-col items-center gap-1">
                  <Calendar className="w-5 h-5 text-slate-300" />
                  <span className="text-xs text-slate-400">No years found</span>
                </div>
              }
            />
          )}

          {field.type === "select-sublevel" && (
            <Select
              size="large"
              className="w-full"
              showSearch={{
                filterOption: (input, opt) =>
                  String(opt?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase()),
              }}
              placeholder={field.placeholder}
              loading={loadingSubs}
              disabled={loadingSubs || disabled}
              value={values[field.key] || undefined}
              options={subLevels.map((s) => ({
                label: s.subLevelName,
                value: s.subLevelId,
              }))}
              onChange={(v) => onChange(field.key, v)}
              notFoundContent={
                <div className="py-4 flex flex-col items-center gap-1">
                  <Layers className="w-5 h-5 text-slate-300" />
                  <span className="text-xs text-slate-400">
                    No classes assigned
                  </span>
                </div>
              }
            />
          )}

          {field.type === "select-term" && (
            <Select
              size="large"
              className="w-full"
              placeholder={
                values.yearId
                  ? field.placeholder
                  : "Select a year and sublevel first…"
              }
              loading={loadingTerms}
              disabled={!values.yearId || loadingTerms || disabled}
              value={values[field.key] || undefined}
              options={terms.map((t) => ({
                label: t.academicTermName,
                value: t.academicTermId,
              }))}
              onChange={(v) => onChange(field.key, v)}
              notFoundContent={
                <div className="py-4 flex flex-col items-center gap-1">
                  <BookOpen className="w-5 h-5 text-slate-300" />
                  <span className="text-xs text-slate-400">
                    No terms for this year and sublevel
                  </span>
                </div>
              }
            />
          )}

          {field.helperText && (
            <p className="text-[10px] text-slate-400 mt-1.5">
              {field.helperText}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST CARD
// ═══════════════════════════════════════════════════════════════════════════════
type RequestCardProps = {
  request: RequestItem;
  onDelete: (data: DeletePayload) => void;
  isDeleting: boolean;
  index: number;
};
const RequestCard = ({
  request,
  onDelete,
  isDeleting,
  index,
}: RequestCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const typeCfg = TYPE_MAP[request.type];
  //   const statusCfg = STATUS_CONFIG[request.status];
  const canDelete =
    request.status === "pending" || request.status === "declined";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
      layout
      className={`bg-white rounded-2xl border overflow-hidden transition-shadow
        ${
          request.status === "approved"
            ? "border-emerald-200 shadow-[0_2px_12px_rgba(16,185,129,0.08)]"
            : request.status === "declined"
              ? "border-rose-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              : "border-slate-100 shadow-[0_2px_8px_rgba(13,27,46,0.05)]"
        }`}
    >
      {/* Status top strip */}
      <div
        className={`h-0.5 w-full ${
          request.status === "approved"
            ? "bg-emerald-400"
            : request.status === "declined"
              ? "bg-rose-300"
              : "bg-amber-300"
        }`}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-x-3 mb-3">
          {/* Type icon */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeCfg?.color.iconBg ?? "bg-slate-100"} ${typeCfg?.color.text ?? "text-slate-500"}`}
          >
            {typeCfg?.icon ?? <ClipboardList className="w-4 h-4" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-x-2 flex-wrap gap-y-1">
              <span
                className="font-bold text-sm text-[#0D1B2E]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {typeCfg?.label ?? request.type}
              </span>
              <StatusBadge status={request.status} />
            </div>
            <div className="flex items-center gap-x-3 mt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-x-1">
                <User className="w-3 h-3" />
                To:{" "}
                <span className="font-semibold text-slate-600 ml-1">
                  {request.receiverName}
                </span>
              </span>
              <span className="flex items-center gap-x-1">
                <Clock className="w-3 h-3" />
                {dayjs(request.createdAt).format("DD MMM YYYY")}
              </span>
            </div>
          </div>

          {/* Delete (pending only) */}
          {canDelete && (
            <Popconfirm
              title="Withdraw this request?"
              description="This will permanently delete the request."
              okText={request.status === "declined" ? "Delete" : "Withdraw"}
              cancelText="Cancel"
              okButtonProps={{ danger: true, size: "small" }}
              cancelButtonProps={{ size: "small" }}
              onConfirm={() =>
                onDelete({
                  receiverId: request.receiverId,
                  senderId: request.senderId,
                  requestId: request.id,
                })
              }
            >
              <button
                type="button"
                disabled={isDeleting}
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Popconfirm>
          )}
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {request.yearName && (
            <MetaPill
              icon={<Calendar className="w-3 h-3" />}
              label="Year"
              value={request.yearName}
            />
          )}
          {request.termName && (
            <MetaPill
              icon={<BookOpen className="w-3 h-3" />}
              label="Term"
              value={request.termName}
            />
          )}
          {request.sublevelName && (
            <MetaPill
              icon={<Hash className="w-3 h-3" />}
              label="Class"
              value={request.sublevelName}
            />
          )}
        </div>

        {/* Note / content */}
        {request.content && (
          <div className="mb-3">
            <div
              onClick={() => setExpanded((v) => !v)}
              className={`text-xs text-slate-500 leading-relaxed cursor-pointer ${!expanded ? "line-clamp-2" : ""}`}
            >
              <MessageSquare className="w-3 h-3 inline-block mr-1 text-slate-300" />
              {request.content}
            </div>
            {request.content.length > 120 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-x-1 mt-0.5 text-[11px] font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-colors cursor-pointer"
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                />
                {expanded ? "Less" : "More"}
              </button>
            )}
          </div>
        )}

        {/* Declined reason placeholder */}
        {request.status === "declined" && (
          <div className="flex items-start gap-x-2 p-2.5 bg-rose-50 border border-rose-100 rounded-xl mb-3">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-rose-600 leading-relaxed">
              This request was declined. Contact your administrator for more
              details.
            </p>
          </div>
        )}

        {/* Approved action CTA */}
        {request.status === "approved" && typeCfg?.approvedAction && (
          <Link
            to={typeCfg.approvedAction.href(request)}
            className="inline-flex items-center gap-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
            style={{
              background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
            }}
          >
            {typeCfg.approvedAction.icon}
            {typeCfg.approvedAction.label}
          </Link>
        )}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

type FilterTab = "all" | RequestStatus;

const RequestCenter = () => {
  const user = useAuth((s) => s.user);
  const qc = useQueryClient();

  // ── Compose state ─────────────────────────────────────────────────────────
  const [selectedType, setSelectedType] = useState<RequestType | null>(null);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [, setSelectedYearId] = useState<string | null>(null);
  const [selectedSublevel, setSelectedSublevel] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(true);

  // ── List state ────────────────────────────────────────────────────────────
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const realTimeRequest = useSignalRStore((s) => s.requests);
  const addRequest = useSignalRStore((s) => s.addRequest);

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: allStaff = [], isLoading: loadingStaff } = useFetch({
    queryKeys: staffKeys.lists(),
    queryFn: getAllStaffUnPnFn,
  });

  const { data: years = [], isLoading: loadingYears } = useFetch({
    queryKeys: yearKeys.list(),
    queryFn: getAllYearsFn,
  });

  const { data: terms = [], isLoading: loadingTerms } = useQuery({
    queryKey: termKeys.list({ selectedSublevel }),
    queryFn: () => getTermsBySubIdFn(selectedSublevel!),
    enabled: !!selectedSublevel,
  });

  const { data: subLevelData, isLoading: loadingSubs } = useFetch({
    queryKeys: educationKeys.custom("teacher-sublevels", {
      teacherId: user?.userId,
    }),
    queryFn: () => getTeachersSublevelsFn(user?.userId ?? ""),
    enabled: !!user?.userId,
  });

  const { data: myRequests = [], isLoading: loadingRequests } = useQuery<
    RequestItem[]
  >({
    queryKey: requestKeys.list({ teacherId: user?.userId }),
    queryFn: () => getUserRequestsFn(user?.userId ?? "", "sender"),
    enabled: !!user?.userId,
  });

  useEffect(() => {
    if (myRequests && myRequests.length > 0) {
      addRequest(myRequests);
    }
  }, [myRequests, addRequest]);

  // ── Staff options (exclude self) ──────────────────────────────────────────
  const staffOptions = useMemo(
    () =>
      allStaff
        .filter((s) => s.staffId !== user?.userId)
        .map((s) => ({
          value: s.staffId,
          label: `${s.firstName} ${s.lastName}`,
          role: s.staffRole,
        })),
    [allStaff, user?.userId],
  );

  const subLevels = useMemo(
    () => subLevelData?.subLevels ?? [],
    [subLevelData],
  );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const submitRequest = usePost({
    postFn: postRequest,
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        qc.invalidateQueries({
          queryKey: requestKeys.list({ teacherId: user?.userId }),
        });
        toast.success(responseMessage || "Request sent successfully");
      } else {
        toast.info(responseMessage);
      }
      resetCompose();
    },
    onError: (e) => toast.error("Request not sent", { description: e.message }),
  });

  const { mutate: deleteRequest, isPending: deletingRequest } = usePost({
    postFn: deleteRequestFn,
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        qc.invalidateQueries({
          queryKey: requestKeys.list({ teacherId: user?.userId }),
        });
        toast.success(responseMessage || "Request sent successfully");
      } else {
        toast.info(responseMessage);
      }
      resetCompose();
    },
    onError: (e) =>
      toast.error("An error occurred", { description: e.message }),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleFieldChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    if (key === "yearId") {
      setSelectedYearId(value);
      setFieldValues((prev) => ({ ...prev, yearId: value, termId: "" }));
    } else if (key === "sublevelId") {
      setSelectedSublevel(value);
    }
  };

  const resetCompose = () => {
    setSelectedType(null);
    setReceiverId(null);
    setContent("");
    setFieldValues({});
    setSelectedYearId(null);
  };

  const handleSubmit = () => {
    if (!selectedType) {
      toast.warning("Please select a request type.");
      return;
    }
    if (!receiverId) {
      toast.warning("Please select a recipient.");
      return;
    }

    const cfg = TYPE_MAP[selectedType];
    const missingRequired = cfg.fields.filter(
      (f) => f.required && !fieldValues[f.key],
    );
    if (missingRequired.length > 0) {
      toast.warning(
        `Please fill in: ${missingRequired.map((f) => f.label).join(", ")}`,
      );
      return;
    }

    const payload: RequestPayload = {
      senderId: user?.userId ?? "",
      receiverId: receiverId,
      status: "pending",
      content: content.trim(),
      type: selectedType,
      academicYearId: fieldValues.yearId || undefined,
      academicTermId: fieldValues.termId || undefined,
      sublevelId: fieldValues.sublevelId || undefined,
      other: undefined,
    };
    submitRequest.mutate(payload);
  };

  // ── Filtered requests ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    // Combine and deduplicate by ID
    let base = realTimeRequest;

    if (filterTab !== "all") base = base.filter((r) => r.status === filterTab);
    if (search) {
      const q = search.toLowerCase();
      base = base.filter(
        (r) =>
          r.receiverName.toLowerCase().includes(q) ||
          (TYPE_MAP[r.type]?.label ?? r.type).toLowerCase().includes(q) ||
          r.content?.toLowerCase().includes(q),
      );
    }
    return [...base].sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
    );
  }, [filterTab, search, realTimeRequest]);

  // ── Tab counts ────────────────────────────────────────────────────────────
  const counts = useMemo(
    () => ({
      all: myRequests.length,
      pending: myRequests.filter((r) => r.status === "pending").length,
      approved: myRequests.filter((r) => r.status === "approved").length,
      declined: myRequests.filter((r) => r.status === "declined").length,
    }),
    [myRequests],
  );

  const FILTER_TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "declined", label: "Declined", count: counts.declined },
  ];

  // Validate compose readiness
  const typeCfg = selectedType ? TYPE_MAP[selectedType] : null;
  const allFieldsFilled = typeCfg
    ? typeCfg.fields
        .filter((f) => f.required)
        .every((f) => !!fieldValues[f.key])
    : false;
  const isComposeValid = !!selectedType && !!receiverId && allFieldsFilled;

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <motion.div
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
            Request Center
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">My Workspace</span>
            <ChevronRight className="w-3 h-3" />
            <span>Request Center</span>
          </nav>
        </div>

        {/* Counts strip */}
        {myRequests.length > 0 && (
          <div className="flex items-center gap-x-2">
            {counts.pending > 0 && (
              <div className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                <Clock className="w-3.5 h-3.5" />
                {counts.pending} pending
              </div>
            )}
            {counts.approved > 0 && (
              <div className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {counts.approved} approved
              </div>
            )}
          </div>
        )}
      </motion.div>

      <div className="flex flex-col gap-y-5">
        {/* ════ COMPOSE CARD ════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          {/* Collapsible header */}
          <button
            type="button"
            className="w-full"
            onClick={() => setComposeOpen((v) => !v)}
          >
            <CardHeader
              icon={<Plus className="w-4 h-4" />}
              title="New Request"
              badge={composeOpen ? undefined : "click to expand"}
            />
          </button>

          <AnimatePresence>
            {composeOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="p-5 flex flex-col gap-y-6">
                  {/* ── STEP 1: Type ── */}
                  <div>
                    <div className="flex items-center gap-x-2 mb-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#C9A84C] flex items-center justify-center text-[10px] font-black text-[#C9A84C]">
                        1
                      </div>
                      <p className="text-xs font-bold text-[#0D1B2E] uppercase tracking-wider">
                        Select request type
                      </p>
                    </div>
                    <TypeSelectorCard
                      selected={selectedType}
                      onSelect={(t) => {
                        setSelectedType(t);
                        setFieldValues({});
                        setSelectedYearId(null);
                      }}
                    />
                  </div>

                  {/* ── STEP 2: Type-specific fields ── */}
                  <AnimatePresence>
                    {selectedType && (
                      <motion.div
                        key={selectedType}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-x-2 mb-3">
                          <div className="w-5 h-5 rounded-full border-2 border-[#C9A84C] flex items-center justify-center text-[10px] font-black text-[#C9A84C]">
                            2
                          </div>
                          <p className="text-xs font-bold text-[#0D1B2E] uppercase tracking-wider">
                            Fill in the details
                          </p>
                        </div>

                        {/* Info banner */}
                        <div className="flex items-start gap-x-3 p-3 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl mb-4">
                          <Info className="w-3.5 h-3.5 text-[#1E3A5F] shrink-0 mt-0.5" />
                          <p className="text-[11px] text-[#1E3A5F] leading-relaxed font-medium">
                            {TYPE_MAP[selectedType].description}. Fill in the
                            fields below to specify what you need access to.
                          </p>
                        </div>

                        <DynamicRequestFields
                          type={selectedType}
                          values={fieldValues}
                          onChange={handleFieldChange}
                          years={years}
                          terms={terms}
                          subLevels={subLevels}
                          loadingYears={loadingYears}
                          loadingTerms={loadingTerms}
                          loadingSubs={loadingSubs}
                          disabled={submitRequest.isPending}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── STEP 3: Recipient + Note ── */}
                  <AnimatePresence>
                    {selectedType && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                      >
                        <div className="flex items-center gap-x-2 mb-3">
                          <div className="w-5 h-5 rounded-full border-2 border-[#C9A84C] flex items-center justify-center text-[10px] font-black text-[#C9A84C]">
                            3
                          </div>
                          <p className="text-xs font-bold text-[#0D1B2E] uppercase tracking-wider">
                            Recipient &amp; note
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Receiver */}
                          <div>
                            <FL required>Send to (Recipient)</FL>
                            <Select
                              size="large"
                              className="w-full"
                              showSearch={{
                                filterOption: (input, opt) =>
                                  String(opt?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase()),
                              }}
                              placeholder="Select admin / staff…"
                              loading={loadingStaff}
                              disabled={loadingStaff || submitRequest.isPending}
                              value={receiverId ?? undefined}
                              options={staffOptions}
                              onChange={setReceiverId}
                              optionRender={(opt) => (
                                <div className="flex items-center gap-x-2 py-0.5">
                                  <div
                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[#C9A84C] font-bold text-[10px] shrink-0"
                                    style={{
                                      background:
                                        "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                                    }}
                                  >
                                    {String(opt.label).charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-[#0D1B2E] truncate">
                                      {opt.label}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {opt.data?.role}
                                    </div>
                                  </div>
                                </div>
                              )}
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5">
                              The administrator who will review this request
                            </p>
                          </div>

                          {/* Note */}
                          <div>
                            <FL>
                              Additional Note{" "}
                              <span className="text-[10px] font-normal normal-case text-slate-300">
                                (optional)
                              </span>
                            </FL>
                            <div className="relative">
                              <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                maxLength={400}
                                rows={3}
                                disabled={submitRequest.isPending}
                                placeholder="Briefly explain why you need this permission…"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#0D1B2E] placeholder:text-slate-300
                                  focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition-all resize-none"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              />
                              <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-300 pointer-events-none">
                                {content.length}/400
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── SUBMIT ROW ── */}
                  {selectedType && (
                    <div className="flex items-center justify-between gap-x-4 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={resetCompose}
                        className="flex items-center gap-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset
                      </button>

                      <div className="flex items-center gap-x-3">
                        {/* Inline validation pills */}
                        <AnimatePresence>
                          {!isComposeValid && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hidden sm:flex items-center gap-x-1.5 text-[11px] text-slate-400"
                            >
                              {!receiverId && (
                                <span className="px-2 py-1 bg-slate-100 rounded-full font-bold">
                                  Select recipient
                                </span>
                              )}
                              {typeCfg?.fields
                                .filter(
                                  (f) => f.required && !fieldValues[f.key],
                                )
                                .slice(0, 1)
                                .map((f) => (
                                  <span
                                    key={f.key}
                                    className="px-2 py-1 bg-slate-100 rounded-full font-bold"
                                  >
                                    Fill {f.label.toLowerCase()}
                                  </span>
                                ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!isComposeValid || submitRequest.isPending}
                          className={`flex items-center gap-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all
                            ${
                              !isComposeValid || submitRequest.isPending
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-[0_4px_16px_rgba(13,27,46,0.2)]"
                            }`}
                          style={
                            isComposeValid && !submitRequest.isPending
                              ? {
                                  background:
                                    "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                                }
                              : {}
                          }
                        >
                          {submitRequest.isPending ? (
                            <>
                              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-slate-400 animate-spin" />
                              Sending…
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 text-[#C9A84C]" />
                              Send Request
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ════ MY REQUESTS ════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <CardHeader
            icon={<ClipboardList className="w-4 h-4" />}
            title="My Requests"
            badge={counts.all > 0 ? `${counts.all} total` : undefined}
          />

          {/* Filter tabs */}
          <div className="flex items-center border-b border-slate-100 px-4 pt-3 gap-x-0 overflow-x-auto">
            {FILTER_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setFilterTab(t.key);
                }}
                className={`flex items-center gap-x-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap
                  ${filterTab === t.key ? "border-[#0D1B2E] text-[#0D1B2E]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                {t.label}
                {t.count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    ${filterTab === t.key ? "bg-[#0D1B2E] text-[#C9A84C]" : "bg-slate-100 text-slate-500"}`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/40">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search requests…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-300
                  focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          </div>

          {/* List */}
          <div className="p-4">
            {loadingRequests && (
              <div className="flex flex-col gap-y-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loadingRequests && filtered.length === 0 && (
              <EmptyState
                icon={<ClipboardList className="w-6 h-6" />}
                message={
                  filterTab === "all"
                    ? "No requests yet"
                    : `No ${filterTab} requests`
                }
                sub={
                  filterTab === "all"
                    ? "Use the compose panel above to send your first request to an administrator."
                    : `You have no ${filterTab} requests at the moment.`
                }
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((req, i) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    index={i}
                    onDelete={deleteRequest}
                    isDeleting={deletingRequest}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RequestCenter;
