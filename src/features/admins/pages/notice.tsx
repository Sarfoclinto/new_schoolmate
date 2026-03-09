/**
 * Notice.tsx
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────┐
 * │  PAGE HEADER  breadcrumb                                     │
 * ├─────────────────────┬────────────────────────────────────────┤
 * │  COMPOSE PANEL      │  NOTICE BOARD                         │
 * │  Title / Body /     │  Search + Date filter                 │
 * │  Target cascader    │  Notice cards (own = editable)        │
 * │  Post button        │  Pagination                           │
 * └─────────────────────┴────────────────────────────────────────┘
 *
 * Notice cards:
 *  ─ Unread: left accent border in navy
 *  ─ Read: muted grey
 *  ─ Own notices: edit + delete controls
 *  ─ Target chips: show who received the notice
 *  ─ Click to expand body if truncated
 *
 * Design: navy × gold system, DM Sans + Playfair Display
 */

import { Cascader, DatePicker, Form, Input, Modal, Popconfirm } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  User,
  Shield,
  GraduationCap,
  Layers,
  Hash,
  Clock,
  MailOpen,
  Mail,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
} from "lucide-react";
import { getInitials } from "@/utils/string";
import type { NoticeGet, Target } from "@/types/api/setup/notice";
import { formatDateOutDatetime } from "@/utils/date-n-time";
import { FL } from "../components/util-components";
import { useAuth } from "@/store/auth.store";
import useFetch from "@/hooks/api/use-fetch";
import {
  createNoticeFn,
  deleteNoticeFn,
  getUserNotices,
  updateNoticeFn,
} from "@/services/setup/notice";
import {
  academicKeys,
  eduKeys,
  noticeKeys,
  roleKeys,
  staffKeys,
} from "@/config/query-keys";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { getAllAcaLevelsFn } from "@/services/setup/academic-level";
import { getAllSubLevelsFn } from "@/services/setup/sublevel";
import { getAllRolesFn } from "@/services/setup/roles";
import { getAllStaffUnPnFn } from "@/services/staff";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import { MotionDiv } from "@/components/custom/motion";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/config/constants";
import { buildMediaUrl } from "@/utils/media";

type Options = {
  label: string;
  value: string;
  selectable: boolean;
  children:
    | {
        label: string;
        value: string;
      }[]
    | undefined;
}[];

// Target type → icon + colour
const TARGET_COLOURS: Record<
  string,
  { icon: React.ReactNode; bg: string; text: string; border: string }
> = {
  Education: {
    icon: <GraduationCap className="w-3 h-3" />,
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  Academic: {
    icon: <Layers className="w-3 h-3" />,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  SubLevel: {
    icon: <Hash className="w-3 h-3" />,
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  Role: {
    icon: <Shield className="w-3 h-3" />,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  User: {
    icon: <User className="w-3 h-3" />,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
};

const TargetChip = ({
  targetType,
  targetName,
}: {
  targetType: string;
  targetName: string;
}) => {
  const c = TARGET_COLOURS[targetType] ?? TARGET_COLOURS.User;
  return (
    <span
      className={`inline-flex items-center gap-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.icon} {targetName}
    </span>
  );
};

// Initials avatar
const Avatar = ({
  name,
  img,
  size = 36,
}: {
  name: string;
  img?: string;
  size?: number;
}) => {
  const initials = getInitials(name);
  return (
    <div
      className="rounded-xl overflow-hidden shrink-0 flex items-center justify-center font-bold text-[#C9A84C] select-none"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
        fontSize: size * 0.33,
        boxShadow: "0 2px 8px rgba(13,27,46,0.15)",
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

// ─────────────────────────────────────────────────────────
// Notice Card
// ─────────────────────────────────────────────────────────
interface NoticeCardProps {
  notice: NoticeGet & {
    mergedTargets: string[];
    mergedTargetNames: string[];
  };
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const NoticeCard = ({
  notice,
  isOwn,
  onEdit,
  onDelete,
  isDeleting,
}: NoticeCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const isUnread = notice.status === "unread";
  const isLong = notice.body.length > 160;

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.22 }}
      className={`bg-white rounded-2xl border overflow-hidden transition-all
        ${isUnread ? "border-[#1E3A5F]/20" : "border-slate-100"}
      `}
      style={{
        boxShadow: isUnread
          ? "0 2px 12px rgba(13,27,46,0.08)"
          : "0 1px 4px rgba(13,27,46,0.04)",
      }}
    >
      {/* Unread accent stripe */}
      {isUnread && (
        <div
          className="h-0.5 w-full"
          style={{
            background: "linear-gradient(90deg, #0D1B2E 0%, #C9A84C 100%)",
          }}
        />
      )}

      <div className="p-4">
        {/* Top row: avatar + meta + status */}
        <div className="flex items-start gap-x-3 mb-3">
          <Avatar name={notice.userFullName} img={notice.userImage} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-x-2 flex-wrap">
              <span
                className="font-bold text-sm text-[#0D1B2E] leading-tight"
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

          {/* Read/unread indicator */}
          <div
            className={`flex items-center gap-x-1 text-[10px] font-bold shrink-0
            ${isUnread ? "text-[#1E3A5F]" : "text-slate-300"}`}
          >
            {isUnread ? (
              <>
                <Mail className="w-3.5 h-3.5" /> Unread
              </>
            ) : (
              <>
                <MailOpen className="w-3.5 h-3.5" /> Read
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-bold text-[#0D1B2E] text-sm mb-2 leading-snug"
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
                <ChevronUp className="w-3 h-3" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> Read more
              </>
            )}
          </button>
        )}

        {/* Target chips */}
        {notice.mergedTargets.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 self-center">
              To:
            </span>
            {notice.mergedTargets.map((type, i) => (
              <TargetChip
                key={i}
                targetType={type}
                targetName={notice.mergedTargetNames[i] ?? type}
              />
            ))}
          </div>
        )}

        {/* Own notice actions */}
        {isOwn && (
          <div className="flex items-center justify-end gap-x-2 mt-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-x-1.5 px-3 py-1.5 text-[11px] font-bold text-[#1E3A5F] bg-[#EEF2F8] rounded-lg hover:bg-[#1E3A5F] hover:text-white transition-all cursor-pointer"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <Popconfirm
              title="Delete this notice?"
              description="This will remove the notice for all recipients."
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

// ─────────────────────────────────────────────────────────
// Update Modal
// ─────────────────────────────────────────────────────────
const UpdateNoticeModal = ({
  open,
  record,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean;
  record: NoticeGet | null;
  onClose: () => void;
  onSubmit: (values: { Title: string; Body: string }) => void;
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
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <X className="w-3.5 h-3.5 text-slate-500" />
        </div>
      }
      styles={{
        container: { padding: 0, borderRadius: 20, overflow: "hidden" },
        body: { padding: 0 },
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-x-3 px-5 py-4"
        style={{
          background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
        }}
      >
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C]">
          <Pencil className="w-4 h-4" />
        </div>
        <div>
          <p
            className="text-white font-bold text-sm leading-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Edit Notice
          </p>
          <p className="text-white/50 text-[11px] mt-0.5">
            Update title and body
          </p>
        </div>
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
          label={<FL>Title / Subject</FL>}
          rules={[{ required: true, message: "Title is required" }]}
          className="mb-4!"
        >
          <Input
            size="large"
            placeholder="Notice title"
            className="rounded-xl!"
          />
        </Form.Item>
        <Form.Item
          name="Body"
          label={<FL>Message Body</FL>}
          rules={[{ required: true, message: "Body is required" }]}
          className="mb-4!"
        >
          <Input.TextArea
            rows={5}
            placeholder="Notice message…"
            className="rounded-xl! resize-none"
            showCount
            maxLength={1000}
          />
        </Form.Item>
        <button
          type="submit"
          disabled={isPending}
          className={`w-full h-11 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-x-2 transition-all
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

// ─────────────────────────────────────────────────────────
// Compose panel
// ─────────────────────────────────────────────────────────
const ComposePanel = ({
  options,
  optionsLoading,
  isPending,
  onSubmit,
}: {
  options: Options;
  optionsLoading: boolean;
  isPending: boolean;
  onSubmit: (
    values: { Title: string; Body: string },
    rawValues: string[],
  ) => void;
}) => {
  const [form] = Form.useForm();
  const [rawValues, setRawValues] = useState<string[]>([]);

  const handleChange = (
    _values: string[][],
    selectedOptions: { label: string; value: string }[][],
  ) => {
    setRawValues(selectedOptions.map((path) => path[path.length - 1].value));
  };

  const onFinish = (values: { Title: string; Body: string }) => {
    onSubmit(values, rawValues);
    form.resetFields();
    setRawValues([]);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-x-3 px-5 py-3.5"
        style={{
          background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
        }}
      >
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C]">
          <MessageSquarePlus className="w-4 h-4" />
        </div>
        <span className="text-white font-semibold text-sm">Compose Notice</span>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        className="p-5! flex flex-col gap-y-0"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Form.Item
          name="Title"
          label={<FL>Title / Subject</FL>}
          rules={[{ required: true, message: "Title is required" }]}
          className="mb-4!"
        >
          <Input
            size="large"
            placeholder="e.g. School Sports Day"
            className="rounded-xl!"
            prefix={<Bell className="w-4 h-4 text-slate-300 mr-1" />}
          />
        </Form.Item>

        <Form.Item
          name="Body"
          label={<FL>Message Body</FL>}
          rules={[{ required: true, message: "Body is required" }]}
          className="mb-4!"
        >
          <Input.TextArea
            rows={5}
            placeholder="Write your notice here…"
            className="rounded-xl! resize-none"
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item
          name="Targets"
          label={<FL>Send To</FL>}
          extra={
            <span className="text-[11px] text-slate-400">
              Select one or more recipients (levels, roles, or individuals)
            </span>
          }
          rules={[
            { required: true, message: "At least one target is required" },
          ]}
          className="mb-5!"
        >
          <Cascader
            options={options}
            multiple
            loading={optionsLoading}
            disabled={optionsLoading}
            showCheckedStrategy={Cascader.SHOW_CHILD}
            placeholder="Select recipients…"
            size="large"
            className="w-full"
            fieldNames={{
              label: "label",
              value: "value",
              children: "children",
            }}
            onChange={handleChange}
          />
        </Form.Item>

        <button
          type="submit"
          disabled={isPending}
          className={`w-full h-11 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-x-2.5 transition-all
            ${isPending ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "text-white hover:opacity-90 active:scale-[0.98] cursor-pointer"}`}
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
              Posting…
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-[#C9A84C]" />
              Post Notice
            </>
          )}
        </button>
      </Form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
const parseTarget = (val: string): Target => {
  const i = val.indexOf("-");
  return { TargetType: val.slice(0, i), TargetId: val.slice(i + 1) };
};
const Notice = () => {
  const user = useAuth((s) => s.user);
  const qc = useQueryClient();
  const userId = user?.userId ?? "";

  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [search, setSearch] = useState("");
  const [record, setRecord] = useState<NoticeGet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Pagination
  const [page, setPage] = useState(DEFAULT_PAGE);
  const PAGE_SIZE = DEFAULT_LIMIT;

  const selectedDate = useMemo(() => date?.format("YYYY-MM-DD"), [date]);

  // ── Queries ──────────────────────────────────────────
  const { data: notices, isLoading: noticesLoading } = useFetch({
    queryFn: () => getUserNotices(userId, selectedDate),
    queryKeys: noticeKeys.custom("by-date", {
      userId,
      date: selectedDate,
    }),
    enabled: !!userId && !!selectedDate,
  });

  const { data: edLevels, isLoading: edLoading } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  const { data: acadLevels, isLoading: acLoading } = useFetch({
    queryFn: getAllAcaLevelsFn,
    queryKeys: academicKeys.list(),
  });
  const { data: subLevels, isLoading: slLoading } = useFetch({
    queryFn: getAllSubLevelsFn,
    queryKeys: eduKeys.sublevels(),
  });
  const { data: roles, isLoading: roLoading } = useFetch({
    queryFn: getAllRolesFn,
    queryKeys: roleKeys.list(),
  });
  const { data: staffList, isLoading: stLoading } = useFetch({
    queryFn: getAllStaffUnPnFn,
    queryKeys: staffKeys.list(),
  });

  const optionsLoading =
    edLoading || acLoading || slLoading || roLoading || stLoading;

  // Build cascader options
  const cascaderOptions = useMemo(
    () => [
      {
        label: "Educational Levels",
        value: "group-ed",
        selectable: false,
        children: edLevels?.map((el) => ({
          label: el.educationalLevelName,
          value: `Education-${el.educationalLevelId}`,
          children: acadLevels
            ?.filter((al) => al.educationalLevelId === el.educationalLevelId)
            .map((al) => ({
              label: al.academicLevelName,
              value: `Academic-${al.academicLevelId}`,
              children: subLevels
                ?.filter((sl) => sl.academicLevelId === al.academicLevelId)
                .map((sl) => ({
                  label: sl.subLevelName,
                  value: `SubLevel-${sl.subLevelId}`,
                })),
            })),
        })),
      },
      {
        label: "Roles",
        value: "group-roles",
        selectable: false,
        children: roles?.map((r) => ({
          label: r.roleName,
          value: `Role-${r.roleId}`,
        })),
      },
      {
        label: "Individuals",
        value: "group-users",
        selectable: false,
        children: staffList?.map((u) => ({
          label: `${u.firstName} ${u.lastName}`,
          value: `User-${u.staffId}`,
        })),
      },
    ],
    [edLevels, acadLevels, subLevels, roles, staffList],
  );

  //   mutations
  const { mutate: createNotice, isPending: creatingNotice } = usePost({
    postFn: createNoticeFn,
    mutationOptions: { mutationKey: ["notices", "create"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
        invalidate();
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
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
        invalidate();
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
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
        invalidate();
        setRecord(null);
        setModalOpen(false);
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

  // ── Derived data ─────────────────────────────────────
  /** De-duplicate by noticeId, merging targetType arrays */
  const deduped = useMemo(() => {
    const map = new Map<
      string,
      NoticeGet & { mergedTargets: string[]; mergedTargetNames: string[] }
    >();
    notices?.forEach((n) => {
      if (map.has(n.noticeId)) {
        const ex = map.get(n.noticeId)!;
        if (!ex.mergedTargets.includes(n.targetType)) {
          ex.mergedTargets.push(n.targetType);
          ex.mergedTargetNames.push(n.targetName ?? "");
        }
      } else {
        map.set(n.noticeId, {
          ...n,
          mergedTargets: [n.targetType],
          mergedTargetNames: [n.targetName ?? ""],
        });
      }
    });
    return Array.from(map.values());
  }, [notices]);

  const filtered = useMemo(() => {
    return deduped.filter((n) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.userFullName.toLowerCase().includes(q)
      );
    });
  }, [deduped, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const readDiff =
        (b.status === "unread" ? 1 : 0) - (a.status === "unread" ? 1 : 0);
      if (readDiff !== 0) return readDiff;
      return dayjs(b.createdOn).valueOf() - dayjs(a.createdOn).valueOf();
    });
  }, [filtered]);

  // Paginated slice
  const paginated = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page, PAGE_SIZE],
  );
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  const unreadCount = sorted.filter((n) => n.status === "unread").length;

  // ── Handlers ─────────────────────────────────────────
  const handlePost = (
    values: { Title: string; Body: string },
    rawValues: string[],
  ) => {
    const targets: Target[] = rawValues.map(parseTarget);
    createNotice({
      Body: values.Body,
      Targets: targets,
      Title: values.Title,
      UserId: user?.userId ?? "",
    });
  };

  const handleUpdate = (values: { Title: string; Body: string }) => {
    updateNotice({
      id: record?.noticeId ?? "",
      userId: user?.userId ?? "",
      data: values,
    });
  };

  // ── Render ───────────────────────────────────────────
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
            Notice Board
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Communication</span>
            <ChevronRight className="w-3 h-3" />
            <span>Notices</span>
          </nav>
        </div>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="flex items-center gap-x-2 px-3.5 py-2 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl">
            <Bell className="w-4 h-4 text-[#1E3A5F]" />
            <span className="text-sm font-bold text-[#0D1B2E]">
              {unreadCount} unread
            </span>
          </div>
        )}
      </MotionDiv>

      {/* ── Two-panel grid ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 items-start">
        {/* ════ LEFT — Compose ════ */}
        <MotionDiv
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <ComposePanel
            options={cascaderOptions}
            optionsLoading={optionsLoading}
            isPending={creatingNotice}
            onSubmit={handlePost}
          />
        </MotionDiv>

        {/* ════ RIGHT — Notice Board ════ */}
        <MotionDiv
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          {/* Board header */}
          <div
            className="flex items-center gap-x-3 px-5 py-3.5 border-b border-slate-100"
            style={{
              background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
            }}
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-white font-semibold text-sm flex-1">
              Notices
            </span>
            {sorted.length > 0 && (
              <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full">
                {sorted.length} total
              </span>
            )}
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex-1 sm:w-1/2!">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search notices…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-[#0D1B2E] placeholder:text-slate-300 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
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
              <div className="flex flex-col items-center py-10 gap-3 text-slate-300">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-slate-300" />
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
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#EEF2F8] hover:border-[#1E3A5F] hover:text-[#1E3A5F] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer
                      ${
                        p === page
                          ? "text-white"
                          : "border border-slate-200 text-slate-500 hover:bg-[#EEF2F8] hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
                      }`}
                      style={
                        p === page
                          ? {
                              background:
                                "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
                            }
                          : {}
                      }
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#EEF2F8] hover:border-[#1E3A5F] hover:text-[#1E3A5F] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </MotionDiv>
      </div>

      {/* ── Update Modal ─────────────────────────────── */}
      <UpdateNoticeModal
        open={modalOpen}
        record={record}
        onClose={() => {
          setModalOpen(false);
          setRecord(null);
        }}
        onSubmit={handleUpdate}
        isPending={updatingNotice}
      />
    </div>
  );
};
export default Notice;
