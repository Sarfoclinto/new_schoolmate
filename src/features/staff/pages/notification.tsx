/**
 * NotificationsInbox.tsx
 *
 * Personal notification centre for any user (teacher, admin, etc.).
 * Shows all notifications sent to: the user directly, their role,
 * their sub-level, their academic level, their educational level.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  PAGE HEADER  +  unread badge  +  Mark All Read button          │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  FILTER BAR   Tabs (All | Unread | Notices | System) + search   │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  NOTIFICATION LIST  — scrollable, paginated                     │
 * │  Each card: sender avatar · title · body · target tag · time    │
 * │  Unread: navy accent stripe + bold indicator                    │
 * │  Action: "Mark as Read" per item (if applicable)               │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * NOTE: Adjust service function names / query keys to match your API.
 * This file imports from the same notice services used by the admin,
 * since notices ARE the notifications in this system.
 */

import { MotionDiv } from "@/components/custom/motion";
import { useAuth } from "@/store/auth.store";
import type { NoticeGet } from "@/types/api/setup/notice";
import { formatDateOutDatetime } from "@/utils/date-n-time";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Bell,
  BellOff,
  Search,
  Mail,
  MailOpen,
  Clock,
  Hash,
  Shield,
  GraduationCap,
  Layers,
  User,
  CheckCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import dayjs, { type Dayjs } from "@/lib/dayjs";
import { useMemo } from "react";
import { useStaffNotices } from "@/hooks/custom/use-staff-notice";
import usePost from "@/hooks/api/use-post";
import { markAllAsReadFn, noticeActionFn } from "@/services/setup/notice";
import { noticeKeys } from "@/config/query-keys";
import { toast } from "sonner";
import type { MdResponse } from "@/types/api";
import { DatePicker } from "antd";
import { AnimatePresence } from "motion/react";

// ═══════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════

const Avatar = ({
  name,
  img,
  size = 36,
}: {
  name: string;
  img?: string;
  size?: number;
}) => {
  const initials =
    name
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("") || "?";
  return (
    <div
      className="rounded-xl overflow-hidden flex items-center justify-center font-bold text-[#C9A84C] flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
        fontSize: size * 0.32,
        boxShadow: "0 2px 6px rgba(13,27,46,0.15)",
      }}
    >
      {img ? (
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}${img}`}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
};

// Target type → colour + icon
const TARGET_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    bg: string;
    text: string;
    border: string;
    label: string;
  }
> = {
  Education: {
    icon: <GraduationCap className="w-3 h-3" />,
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    label: "Edu Level",
  },
  Academic: {
    icon: <Layers className="w-3 h-3" />,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    label: "Academic",
  },
  SubLevel: {
    icon: <Hash className="w-3 h-3" />,
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    label: "Class",
  },
  Role: {
    icon: <Shield className="w-3 h-3" />,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "Role",
  },
  User: {
    icon: <User className="w-3 h-3" />,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    label: "Direct",
  },
};

const TargetTag = ({
  targetType,
  targetName,
}: {
  targetType: string;
  targetName: string;
}) => {
  const c = TARGET_CONFIG[targetType] ?? TARGET_CONFIG.User;
  return (
    <span
      className={`inline-flex items-center gap-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.icon}
      <span className="opacity-60">{c.label}:</span> {targetName}
    </span>
  );
};

// Skeleton
const NotifSkeleton = () => (
  <div className="flex flex-col gap-y-3 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="flex gap-x-3 p-4 rounded-2xl border border-slate-100"
      >
        <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-y-2">
          <div
            className="h-4 bg-slate-100 rounded-lg animate-pulse w-2/3"
            style={{ opacity: 1 - i * 0.1 }}
          />
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse w-full" />
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Single notification card ──────────────────────────────────────
const NotifCard = ({
  notice,
  onMarkRead,
  isMarkingRead,
}: {
  notice: NoticeGet & {
    mergedTargets: string[];
    mergedTargetNames: string[];
  };
  onMarkRead: () => void;
  isMarkingRead: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const isUnread = notice.status === "unread";
  const isLong = notice.body?.length > 180;

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-2xl border overflow-hidden transition-shadow
        ${isUnread ? "border-[#1E3A5F]/20 shadow-[0_2px_12px_rgba(13,27,46,0.08)]" : "border-slate-100 shadow-[0_1px_4px_rgba(13,27,46,0.04)]"}`}
    >
      {/* Unread stripe */}
      {isUnread && (
        <div
          className="h-0.5 w-full"
          style={{
            background: "linear-gradient(90deg,#0D1B2E 0%,#C9A84C 100%)",
          }}
        />
      )}

      <div className="p-4">
        <div className="flex items-start gap-x-3">
          {/* Avatar */}
          <Avatar name={notice.userFullName} img={notice.userImage} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between gap-x-2 mb-1.5">
              <div className="min-w-0">
                <div className="flex items-center gap-x-2 flex-wrap">
                  <span
                    className="font-bold text-sm text-[#0D1B2E] leading-tight"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {notice.userFullName}
                  </span>
                  {isUnread && (
                    <span className="inline-flex items-center gap-x-1 text-[10px] font-bold text-[#1E3A5F] bg-[#EEF2F8] border border-[#D0DCF0] px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] animate-pulse" />
                      New
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-x-1">
                  <Clock className="w-3 h-3" />
                  {formatDateOutDatetime(notice.createdOn)}
                </p>
              </div>

              {/* Read status icon */}
              <div
                className={`flex-shrink-0 ${isUnread ? "text-[#1E3A5F]" : "text-slate-300"}`}
              >
                {isUnread ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <MailOpen className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* Title */}
            <h3
              className="font-bold text-[#0D1B2E] text-sm mb-1.5 leading-snug"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {notice.title}
            </h3>

            {/* Body */}
            <div
              className={`text-sm text-slate-600 leading-relaxed ${!expanded && isLong ? "line-clamp-3" : ""}`}
            >
              {notice.body}
            </div>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 flex items-center gap-x-1 text-[11px] font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-colors cursor-pointer"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    More
                  </>
                )}
              </button>
            )}

            {/* Target tags + mark-read action */}
            <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
              {notice.mergedTargets.map((type, i) => (
                <TargetTag
                  key={i}
                  targetType={type}
                  targetName={notice.mergedTargetNames[i] ?? type}
                />
              ))}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Mark as read */}
              {isUnread && (
                <button
                  type="button"
                  onClick={onMarkRead}
                  disabled={isMarkingRead}
                  className="flex items-center gap-x-1.5 text-[11px] font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

type TabKey = "all" | "unread" | "direct";

const Notifications = () => {
  const user = useAuth((s) => s.user);
  const teacherId = user?.userId;
  const qc = useQueryClient();

  const [date, setDate] = useState<Dayjs | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const selectedDate = useMemo(() => date?.format("YYYY-MM-DD"), [date]);

  const {
    dedupedNotices: deduped,
    unreadCount: unreadItems,
    isLoading: noticesLoading,
  } = useStaffNotices(teacherId, selectedDate);

  // ── Mark single read ─────────────────────────────────────────────
  const markRead = usePost({
    postFn: noticeActionFn,
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
        await invalidate();
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (e) =>
      toast.error("Failed to mark as read", { description: e.message }),
  });

  // ── Mark ALL read ─────────────────────────────────────────────────
  const { mutate: markAllRead, isPending: markAllReadPending } = usePost({
    postFn: markAllAsReadFn,
    onSuccess: async (responses: MdResponse[]) => {
      const successCount = responses.filter((r) => r.responseCode === 1).length;
      const failCount = responses.length - successCount;

      if (successCount > 0) {
        toast.success(`Successfully marked ${successCount} notices as read.`);
      }
      if (failCount > 0) {
        toast.error(`Failed to mark ${failCount} notices.`);
      }

      await invalidate();
    },
    onError: (e) =>
      toast.error("Failed to mark as read", { description: e.message }),
  });

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: noticeKeys.all });
  };

  // ── Sorted by unread first, then newest ──────────────────────────
  const sorted = useMemo(
    () =>
      [...deduped].sort((a, b) => {
        const rd =
          (b.status === "unread" ? 1 : 0) - (a.status === "unread" ? 1 : 0);
        return rd !== 0
          ? rd
          : dayjs(b.createdOn).valueOf() - dayjs(a.createdOn).valueOf();
      }),
    [deduped],
  );

  // ── Apply tab + search filter ─────────────────────────────────────
  const filtered = useMemo(() => {
    let base = sorted;
    if (tab === "unread") base = base.filter((n) => n.status === "unread");
    if (tab === "direct") base = base.filter((n) => n.targetType === "User");
    if (search) {
      const q = search.toLowerCase();
      base = base.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.body?.toLowerCase().includes(q) ||
          n.userFullName?.toLowerCase().includes(q),
      );
    }
    return base;
  }, [sorted, tab, search]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const directCount = deduped.filter((n) => n.targetType === "User").length;

  const TABS = [
    {
      key: "all" as TabKey,
      label: "All",
      count: deduped.length,
      icon: <Bell className="w-3.5 h-3.5" />,
    },
    {
      key: "unread" as TabKey,
      label: "Unread",
      count: unreadItems,
      icon: <Mail className="w-3.5 h-3.5" />,
    },
    {
      key: "direct" as TabKey,
      label: "Sent to Me",
      count: directCount,
      icon: <User className="w-3.5 h-3.5" />,
    },
  ];

  const onMarkAllAsRead = () => {
    if (!teacherId) {
      toast.warning(
        "You are not logged in. Please log in to mark all notifications as read.",
      );
      return;
    }
    const payload = deduped.map((n) => ({
      NoticeId: n.noticeId,
      Status: "Read" as const,
      UserId: teacherId,
    }));
    markAllRead(payload);
  };

  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* PAGE HEADER */}
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
            Notifications
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Communication</span>
            <ChevronRight className="w-3 h-3" />
            <span>Notifications Inbox</span>
          </nav>
        </div>

        <div className="flex items-center gap-x-3">
          {/* Unread pill */}
          {unreadItems > 0 && (
            <div className="flex items-center gap-x-2 px-3.5 py-2 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl">
              <span className="w-2 h-2 rounded-full bg-[#0D1B2E] animate-pulse" />
              <span className="text-sm font-bold text-[#0D1B2E]">
                {unreadItems} unread
              </span>
            </div>
          )}

          {/* Mark all read */}
          {unreadItems > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              disabled={markAllReadPending}
              className="flex items-center gap-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
              style={{
                background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
              }}
            >
              {markAllReadPending ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Marking…
                </>
              ) : (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                  Mark all read
                </>
              )}
            </button>
          )}
        </div>
      </MotionDiv>

      {/* MAIN CARD */}
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 16px rgba(13,27,46,0.07)" }}
      >
        {/* Card header */}
        <div
          className="flex items-center gap-x-3 px-5 py-3.5"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] flex-shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <span className="text-white font-semibold text-sm flex-1">
            Your Notifications
          </span>
          {unreadItems > 0 && (
            <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full">
              {unreadItems} new
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-100 px-4 pt-3 gap-x-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`flex items-center gap-x-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap
                ${tab === t.key ? "border-[#0D1B2E] text-[#0D1B2E]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              {t.icon}
              {t.label}
              {t.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                  ${tab === t.key ? "bg-[#0D1B2E] text-[#C9A84C]" : "bg-slate-100 text-slate-500"}`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + date filter */}
        <div className="flex flex-col sm:flex-row gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/40">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notifications…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
          <DatePicker
            placeholder="Filter by date"
            value={date}
            onChange={(v) => {
              setDate(v);
              setPage(1);
            }}
            allowClear
            size="middle"
            className="!rounded-xl w-1/2!"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-colors cursor-pointer whitespace-nowrap self-center"
            >
              Clear
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="p-4 flex flex-col gap-y-3 min-h-[240px]">
          {noticesLoading && <NotifSkeleton />}

          {!noticesLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center py-14 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <BellOff className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-400">
                {tab === "unread"
                  ? "No unread notifications"
                  : "No notifications found"}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-xs font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-colors cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {paginated.map((notice) => (
              <NotifCard
                key={notice.noticeId}
                notice={notice}
                onMarkRead={() => {
                  if (!teacherId) {
                    toast.warning(
                      "You are not logged in. Please log in to mark notifications as read.",
                    );
                    return;
                  }
                  markRead.mutate({
                    NoticeId: notice.noticeId,
                    Status: "Read",
                    UserId: teacherId,
                  });
                }}
                isMarkingRead={markRead.isPending}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/60">
            <span className="text-xs text-slate-400 font-medium">
              Page {page} of {totalPages} · {filtered.length} notifications
            </span>
            <div className="flex items-center gap-x-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#EEF2F8] disabled:opacity-30 cursor-pointer transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              </button>
              {Array.from(
                { length: Math.min(totalPages, 7) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer
                    ${p === page ? "text-white" : "border border-slate-200 text-slate-500 hover:bg-[#EEF2F8]"}`}
                  style={
                    p === page
                      ? {
                          background:
                            "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                        }
                      : {}
                  }
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#EEF2F8] disabled:opacity-30 cursor-pointer transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </MotionDiv>
    </div>
  );
};
export default Notifications;
