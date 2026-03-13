/**
 * TeacherNotice.tsx
 *
 * Teacher sends notices to their own sub-levels (and optionally other targets).
 * Also views the notice board — notices sent to them or their class.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  PAGE HEADER                                                     │
 * ├─────────────────────┬────────────────────────────────────────────┤
 * │  COMPOSE PANEL      │  NOTICE BOARD                             │
 * │  Title / Body /     │  Tabs: All | Unread | My Notices          │
 * │  Target chips from  │  Search + filter                          │
 * │  teacher's classes  │  Notice cards                             │
 * └─────────────────────┴────────────────────────────────────────────┘
 */
import { toast } from "sonner";
import { AnimatePresence } from "motion/react";
import dayjs, { type Dayjs } from "@/lib/dayjs";
import {
  ChevronRight,
  Bell,
  Send,
  Search,
  Pencil,
  Trash2,
  X,
  Clock,
  MailOpen,
  Mail,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  Hash,
  CheckCheck,
  Users,
} from "lucide-react";
import { educationKeys, noticeKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getTeachersSublevelsFn } from "@/services/staff";
import { useAuth } from "@/store/auth.store";
import type { NoticeGet, Target } from "@/types/api/setup/notice";
import { useEffect, useMemo, useState } from "react";
import { MotionDiv } from "@/components/custom/motion";
import { formatDateOutDatetime } from "@/utils/date-n-time";
import { DatePicker, Form, Input, Modal, Popconfirm } from "antd";
import { FL } from "@/features/admins/components/util-components";
import { DEFAULT_PAGE } from "@/config/constants";
import {
  createNoticeFn,
  deleteNoticeFn,
  // getStaffNotices,
  updateNoticeFn,
} from "@/services/setup/notice";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import { useQueryClient } from "@tanstack/react-query";
import { CardHeader } from "@/features/admins/components/teacher-util-components";
import { useStaffNotices } from "@/hooks/custom/use-staff-notice";
import { buildMediaUrl } from "@/utils/media";

const Avatar = ({
  name,
  img,
  size = 34,
}: {
  name: string;
  img?: string;
  size?: number;
}) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      className="rounded-xl overflow-hidden shrink-0 flex items-center justify-center font-bold text-[#C9A84C]"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
        fontSize: size * 0.33,
        boxShadow: "0 2px 6px rgba(13,27,46,0.15)",
      }}
    >
      {img ? (
        <img
          src={buildMediaUrl(img)}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        initials || "?"
      )}
    </div>
  );
};

// ─── Sub-level target toggle chip ──────────────────────────────────
const SubLevelChip = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer
      ${
        selected
          ? "bg-[#0D1B2E] border-[#0D1B2E] text-[#C9A84C]"
          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
      }`}
  >
    {selected ? (
      <CheckCheck className="w-3 h-3" />
    ) : (
      <Hash className="w-3 h-3 opacity-50" />
    )}
    {label}
  </button>
);

// ─── Notice card ───────────────────────────────────────────────────
const NoticeCard = ({
  notice,
  isOwn,
  onEdit,
  onDelete,
  isDeleting,
}: {
  notice: NoticeGet & {
    mergedTargets: string[];
    mergedTargetNames: string[];
  };
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const isUnread = notice.status === "unread";
  const isLong = notice.body.length > 160;

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-2xl border overflow-hidden ${isUnread ? "border-[#1E3A5F]/20" : "border-slate-100"}`}
      style={{
        boxShadow: isUnread
          ? "0 2px 12px rgba(13,27,46,0.08)"
          : "0 1px 4px rgba(13,27,46,0.04)",
      }}
    >
      {isUnread && (
        <div
          className="h-0.5 w-full"
          style={{
            background: "linear-gradient(90deg,#0D1B2E 0%,#C9A84C 100%)",
          }}
        />
      )}
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-x-3 mb-3">
          <Avatar name={notice.userFullName} img={notice.userImage} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-x-2 flex-wrap">
              <span
                className="font-bold text-sm text-[#0D1B2E]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {notice.userFullName}
              </span>
              {isOwn && (
                <span className="text-[10px] font-bold text-[#C9A84C] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-x-1">
              <Clock className="w-3 h-3" />
              {formatDateOutDatetime(notice.createdOn)}
            </p>
          </div>
          <div
            className={`flex items-center gap-x-1 text-[10px] font-bold shrink-0
            ${isUnread ? "text-[#1E3A5F]" : "text-slate-300"}`}
          >
            {isUnread ? (
              <>
                <Mail className="w-3.5 h-3.5" />
                Unread
              </>
            ) : (
              <>
                <MailOpen className="w-3.5 h-3.5" />
                Read
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-bold text-[#0D1B2E] text-sm mb-2"
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
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Read more
              </>
            )}
          </button>
        )}

        {/* Targets */}
        {notice.mergedTargetNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 self-center">
              To:
            </span>
            {notice.mergedTargetNames.map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-cyan-50 text-cyan-700 border-cyan-200"
              >
                <Hash className="w-3 h-3" />
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Own actions */}
        {isOwn && (
          <div className="flex items-center justify-end gap-x-2 mt-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-x-1.5 px-3 py-1.5 text-[11px] font-bold text-[#1E3A5F] bg-[#EEF2F8] rounded-lg hover:bg-[#1E3A5F] hover:text-white transition-all cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
            <Popconfirm
              title="Delete this notice?"
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, size: "small" }}
              cancelButtonProps={{ size: "small" }}
              onConfirm={onDelete}
            >
              <button
                type="button"
                disabled={isDeleting}
                className="flex items-center gap-x-1.5 px-3 py-1.5 text-[11px] font-bold text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-500 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </Popconfirm>
          </div>
        )}
      </div>
    </MotionDiv>
  );
};

// ─── Update modal ──────────────────────────────────────────────────
const UpdateModal = ({
  open,
  record,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean;
  record: NoticeGet | null;
  onClose: () => void;
  onSubmit: (v: { Title: string; Body: string }) => void;
  isPending: boolean;
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (record) form.setFieldsValue({ Title: record.title, Body: record.body });
    else form.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      destroyOnHidden
      closeIcon={
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200">
          <X className="w-3.5 h-3.5 text-slate-500" />
        </div>
      }
      styles={{
        container: { padding: 0, borderRadius: 20, overflow: "hidden" },
        body: { padding: 0},
      }}
    >
      <div
        className="flex items-center gap-x-3 px-5 py-4"
        style={{
          background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
        }}
      >
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C]">
          <Pencil className="w-4 h-4" />
        </div>
        <p
          className="text-white font-bold text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Edit Notice
        </p>
      </div>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onSubmit}
        className="p-5!"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Form.Item
          name="Title"
          label={<FL>Title</FL>}
          rules={[{ required: true }]}
          className="mb-4!"
        >
          <Input size="large" className="rounded-xl!" />
        </Form.Item>
        <Form.Item
          name="Body"
          label={<FL>Message</FL>}
          rules={[{ required: true }]}
          className="mb-4!"
        >
          <Input.TextArea
            rows={5}
            className="rounded-xl! resize-none"
            showCount
            maxLength={1000}
          />
        </Form.Item>
        <button
          type="submit"
          disabled={isPending}
          className={`w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-x-2 transition-all
            ${isPending ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "text-white hover:opacity-90 cursor-pointer"}`}
          style={
            isPending
              ? {}
              : {
                  background:
                    "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
                }
          }
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-[#C9A84C]" />
              Save Changes
            </>
          )}
        </button>
      </Form>
    </Modal>
  );
};

// const parseTarget = (val: string): Target => {
//   const i = val.indexOf("-");
//   return { TargetType: val.slice(0, i), TargetId: val.slice(i + 1) };
// };

type TabKey = "all" | "unread" | "mine";

const Notice = () => {
  const user = useAuth((s) => s.user);
  const teacherId = user?.userId;

  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabKey>("all");
  const [record, setRecord] = useState<NoticeGet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const PAGE_SIZE = 3;

  // Compose state
  const [composeTitle, setComposeTitle] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());

  const selectedDate = useMemo(() => date?.format("YYYY-MM-DD"), [date]);

  //   queries
  const { data: sublevelData } = useFetch({
    queryFn: () => getTeachersSublevelsFn(teacherId!),
    queryKeys: educationKeys.custom("teacher-sublevels", { teacherId }),
    enabled: !!teacherId,
  });

  // const { data: notices, isLoading: noticesLoading } = useFetch({
  //   queryFn: () => getStaffNotices(teacherId!, selectedDate),
  //   queryKeys: noticeKeys.custom("by-date", {
  //     teacherId,
  //     date: selectedDate,
  //   }),
  //   enabled: !!teacherId && !!selectedDate,
  // });
  const {
    dedupedNotices,
    unreadCount,
    isLoading: noticesLoading,
  } = useStaffNotices(teacherId, selectedDate);

  //   mutations
  const { mutate: createNotice, isPending: creatingNotice } = usePost({
    postFn: createNoticeFn,
    mutationOptions: { mutationKey: ["notices", "create"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();
        toast.success(responseMessage);
        reset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error("Failed to create notice", {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteNotice, isPending: deletingNotice } = usePost({
    postFn: deleteNoticeFn,
    mutationOptions: { mutationKey: ["notices", "delete"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();
        toast.success(responseMessage);
        reset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error("Failed to delete notice", {
        description: err?.message,
      });
    },
  });
  const { mutate: updateNotice, isPending: updatingNotice } = useUpdate({
    updateFn: updateNoticeFn,
    mutationOptions: { mutationKey: ["notices", "update"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();
        toast.success(responseMessage);
        reset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error("Failed to update notice", {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: noticeKeys.all });
  };
  const reset = () => {
    setRecord(null);
    setComposeBody("");
    setComposeTitle("");
    setSelectedSubs(new Set());
  };
  // ── Derived: de-duplicate notices ────────────────────────────────
  // const deduped = useMemo(() => {
  //   const map = new Map<
  //     string,
  //     NoticeGet & { mergedTargets: string[]; mergedTargetNames: string[] }
  //   >();
  //   notices?.forEach((n) => {
  //     if (map.has(n.noticeId)) {
  //       const ex = map.get(n.noticeId)!;
  //       if (!ex.mergedTargets.includes(n.targetType)) {
  //         ex.mergedTargets.push(n.targetType);
  //         ex.mergedTargetNames.push(n.targetName ?? "");
  //       }
  //     } else {
  //       map.set(n.noticeId, {
  //         ...n,
  //         mergedTargets: [n.targetType],
  //         mergedTargetNames: [n.targetName ?? ""],
  //       });
  //     }
  //   });
  //   return Array.from(map.values());
  // }, [notices]);

  const tabFiltered = useMemo(() => {
    return dedupedNotices.filter((n) => {
      if (tab === "unread") return n.status === "unread";
      if (tab === "mine") return n.userId === user?.userId;
      return true;
    });
  }, [dedupedNotices, tab, user]);

  const filtered = useMemo(() => {
    if (!search) return tabFiltered;
    const q = search.toLowerCase();
    return tabFiltered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.userFullName.toLowerCase().includes(q),
    );
  }, [tabFiltered, search]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const rd =
          (b.status === "unread" ? 1 : 0) - (a.status === "unread" ? 1 : 0);
        return rd !== 0
          ? rd
          : dayjs(b.createdOn).valueOf() - dayjs(a.createdOn).valueOf();
      }),
    [filtered],
  );

  const paginated = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page],
  );
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  // const unreadCount = deduped.filter((n) => n.status === "unread").length;

  // ── Sub-level options from teacher's classes ──────────────────────
  const subLevels = sublevelData?.subLevels ?? [];

  const toggleSub = (id: string) =>
    setSelectedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      //   next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () =>
    setSelectedSubs(
      selectedSubs.size === subLevels.length
        ? new Set()
        : new Set(subLevels.map((s) => s.subLevelId)),
    );

  // ── Post handler ─────────────────────────────────────────────────
  const handlePost = () => {
    if (!composeTitle.trim()) {
      toast.warning("Please enter a title.");
      return;
    }
    if (!composeBody.trim()) {
      toast.warning("Please enter a message.");
      return;
    }
    if (selectedSubs.size === 0) {
      toast.warning("Select at least one class to notify.");
      return;
    }
    if (!teacherId) {
      toast.warning("User not found. Re-login");
      return;
    }
    const targets: Target[] = Array.from(selectedSubs).map((id) => ({
      TargetType: "SubLevel",
      TargetId: id,
    }));
    createNotice({
      Body: composeBody,
      Title: composeTitle,
      UserId: teacherId,
      Targets: targets,
    });
  };

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    { key: "all", label: "All", count: dedupedNotices.length },
    { key: "unread", label: "Unread", count: unreadCount },
    {
      key: "mine",
      label: "My Notices",
      count: dedupedNotices.filter((n) => n.userId === user?.userId).length,
    },
  ];

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
            Notice Board
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Communication</span>
            <ChevronRight className="w-3 h-3" />
            <span>Notices</span>
          </nav>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-x-2 px-3.5 py-2 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl">
            <Bell className="w-4 h-4 text-[#1E3A5F]" />
            <span className="text-sm font-bold text-[#0D1B2E]">
              {unreadCount} unread
            </span>
          </div>
        )}
      </MotionDiv>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5 items-start">
        {/* ════ LEFT: COMPOSE ════ */}
        <MotionDiv
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <CardHeader
            icon={<MessageSquarePlus className="w-4 h-4" />}
            title="Send Notice"
          />

          <div className="p-5 flex flex-col gap-y-4">
            {/* Title */}
            <div>
              <p className="mb-1.5">
                <FL>Title</FL>
              </p>
              <div className="relative">
                <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  type="text"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  placeholder="e.g. Parent-Teacher Meeting"
                  maxLength={120}
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0D1B2E] placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FL>Message</FL>
                <span className="text-[10px] text-slate-400">
                  {composeBody.length}/1000
                </span>
              </div>
              <textarea
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your notice here…"
                maxLength={1000}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#0D1B2E] placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all resize-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>

            {/* Target sub-levels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <FL>Send to Classes</FL>
                {subLevels.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-[11px] font-bold text-[#1E3A5F] hover:text-[#C9A84C] transition-colors cursor-pointer"
                  >
                    {selectedSubs.size === subLevels.length
                      ? "Deselect all"
                      : "Select all"}
                  </button>
                )}
              </div>

              {subLevels.length === 0 ? (
                <div className="flex items-center gap-x-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <Users className="w-4 h-4 text-slate-300" />
                  <span className="text-xs text-slate-400">
                    No classes assigned to you yet
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subLevels.map((sl) => (
                    <SubLevelChip
                      key={sl.subLevelId}
                      label={sl.subLevelName}
                      selected={selectedSubs.has(sl.subLevelId)}
                      onClick={() => toggleSub(sl.subLevelId)}
                    />
                  ))}
                </div>
              )}
              {selectedSubs.size > 0 && (
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {selectedSubs.size} class{selectedSubs.size > 1 ? "es" : ""}{" "}
                  selected
                </p>
              )}
            </div>

            {/* Post button */}
            <button
              type="button"
              onClick={handlePost}
              disabled={creatingNotice}
              className={`w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-x-2 transition-all
                ${creatingNotice ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "text-white hover:opacity-90 active:scale-[0.98] cursor-pointer"}`}
              style={
                creatingNotice
                  ? {}
                  : {
                      background:
                        "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
                    }
              }
            >
              {creatingNotice ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Posting…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#C9A84C]" />
                  Post Notice
                </>
              )}
            </button>
          </div>
        </MotionDiv>

        {/* ════ RIGHT: NOTICE BOARD ════ */}
        <MotionDiv
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <CardHeader
            icon={<Bell className="w-4 h-4" />}
            title="Notices"
            badge={sorted.length > 0 ? `${sorted.length} total` : undefined}
          />

          {/* Tabs */}
          <div className="flex items-center gap-x-0 border-b border-slate-100 px-4 pt-3">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
                className={`flex items-center gap-x-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer
                  ${
                    tab === t.key
                      ? "border-[#0D1B2E] text-[#0D1B2E]"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
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
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search notices…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] transition-all"
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
              className="rounded-xl! w-1/2!"
            />
          </div>

          {/* Notice list */}
          <div className="p-4 flex flex-col gap-y-3 min-h-50">
            {noticesLoading && (
              <div className="flex flex-col gap-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 bg-slate-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            )}

            {!noticesLoading && sorted.length === 0 && (
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-400">
                  No notices found
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
                <NoticeCard
                  key={notice.noticeId}
                  notice={notice}
                  isOwn={notice.userId === user?.userId}
                  onEdit={() => {
                    setRecord(notice);
                    setModalOpen(true);
                  }}
                  onDelete={() =>
                    deleteNotice({
                      noticeId: notice.noticeId,
                      userId: user?.userId ?? "",
                    })
                  }
                  isDeleting={deletingNotice}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium">
                Page {page} of {totalPages} · {sorted.length} notices
              </span>
              <div className="flex items-center gap-x-1.5">
                {[
                  <button
                    key="prev"
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#EEF2F8] hover:border-[#1E3A5F] disabled:opacity-30 cursor-pointer transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>,
                  ...Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
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
                    ),
                  ),
                  <button
                    key="next"
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#EEF2F8] hover:border-[#1E3A5F] disabled:opacity-30 cursor-pointer transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>,
                ]}
              </div>
            </div>
          )}
        </MotionDiv>
      </div>

      <UpdateModal
        open={modalOpen}
        record={record}
        onClose={() => {
          setModalOpen(false);
          setRecord(null);
        }}
        onSubmit={(v) =>
          updateNotice({
            id: record?.noticeId ?? "",
            userId: user?.userId ?? "",
            data: v,
          })
        }
        isPending={updatingNotice}
      />
    </div>
  );
};
export default Notice;
