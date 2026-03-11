// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

import { MotionDiv } from "@/components/custom/motion";
import {
  ADMIN_PERMISSION_GROUPS,
  ADMINISTRATIVE_PERMISSIONS,
  type AdminPermission as Permission,
} from "@/config/permissions";
import {
  Eye,
  EyeOff,
  Pencil,
  Lock,
  Check,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ChevronRight,
  Shield,
  Users,
  User,
  ShieldCheck,
  ShieldOff,
  RefreshCw,
  Zap,
  X,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  enforceConstraints,
  getWriteCounterpart,
  isReadPermission,
  toggleGroupAll,
} from "../../util-fns";
// import { useAuth } from "@/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import { toast } from "sonner";
import { Select } from "antd";
import { buildMediaUrl } from "@/utils/media";
import { getInitials } from "@/utils/string";
import { Section } from "../../components/util-components";
import {
  getAllStaffUnPnFn,
  getUserPermissionsFn,
  syncPermissionsFn,
} from "@/services/staff";
import { staffKeys } from "@/config/query-keys";

const InitialAvatar = ({
  name,
  img,
  size = 40,
}: {
  name: string;
  img?: string;
  size?: number;
}) => {
  const initials = getInitials(name);
  return (
    <div
      className="rounded-xl overflow-hidden flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
        color: "#C9A84C",
        fontSize: size * 0.33,
        boxShadow: "0 2px 8px rgba(13,27,46,0.2)",
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
        initials
      )}
    </div>
  );
};

// ─── Permission toggle pill ────────────────────────────────────────────────────
const PermissionToggle = ({
  //   permission,
  label,
  isActive,
  isRead,
  isAutoGranted,
  isAutoRevoked,
  isAdding,
  isRemoving,
  disabled,
  onToggle,
}: {
  permission: Permission;
  label: string;
  isActive: boolean;
  isRead: boolean;
  isAutoGranted: boolean;
  isAutoRevoked: boolean;
  isAdding: boolean;
  isRemoving: boolean;
  disabled: boolean;
  onToggle: () => void;
}) => {
  const showAddDot = isAdding && !isAutoGranted;
  const showRemoveDot = isRemoving && !isAutoRevoked;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`relative group flex items-center gap-x-2.5 px-3 py-1.5 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none
        ${
          isActive
            ? isRead
              ? "bg-[#EEF2F8] border-[#1E3A5F] text-[#1E3A5F]"
              : "text-white border-[#0D1B2E]"
            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"}
        ${isAutoGranted ? "ring-2 ring-emerald-300 ring-offset-1" : ""}
        ${isAutoRevoked ? "ring-2 ring-rose-300 ring-offset-1" : ""}`}
      style={
        isActive && !isRead
          ? { background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)" }
          : {}
      }
    >
      {/* Diff indicator dot */}
      {(showAddDot || showRemoveDot) && (
        <span
          className={`absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-white z-10 ${showAddDot ? "bg-emerald-500" : "bg-rose-500"}`}
        />
      )}
      {/* Auto-dependency badge */}
      {(isAutoGranted || isAutoRevoked) && (
        <span
          className={`absolute -top-1.5 -left-0.5 text-[8px] font-black px-1 rounded-full border border-white z-10 ${isAutoGranted ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
        >
          auto
        </span>
      )}

      {/* Icon */}
      <span
        className={`shrink-0 ${isActive ? (isRead ? "text-[#1E3A5F]" : "text-[#C9A84C]") : "text-slate-300"}`}
      >
        {isRead ? (
          isActive ? (
            <Eye className="w-3.5 h-3.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )
        ) : isActive ? (
          <Pencil className="w-3.5 h-3.5" />
        ) : (
          <Lock className="w-3.5 h-3.5" />
        )}
      </span>

      {/* Label */}
      <span
        className="text-xs font-bold whitespace-nowrap leading-none"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </span>

      {/* Active check */}
      {isActive && (
        <Check
          className={`w-3 h-3 shrink-0 ${isRead ? "text-[#1E3A5F]" : "text-[#C9A84C]"}`}
        />
      )}
    </button>
  );
};

// ─── Permission group card ─────────────────────────────────────────────────────
const PermissionGroupCard = ({
  group,
  localPerms,
  serverPerms,
  onToggle,
  onToggleAll,
  index,
}: {
  group: (typeof ADMIN_PERMISSION_GROUPS)[number];
  localPerms: Set<Permission>;
  serverPerms: Set<Permission>;
  onToggle: (p: Permission) => void;
  onToggleAll: (group: Permission[], allOn: boolean) => void;
  index: number;
}) => {
  const [open, setOpen] = useState(true);
  const groupPerms = group.permissions;
  const activeInGroup = groupPerms.filter((p) => localPerms.has(p));
  const allOn = activeInGroup.length === groupPerms.length;
  //   const someOn = activeInGroup.length > 0 && !allOn;

  // Diff tracking per permission
  const added = groupPerms.filter(
    (p) => !serverPerms.has(p) && localPerms.has(p),
  );
  const removed = groupPerms.filter(
    (p) => serverPerms.has(p) && !localPerms.has(p),
  );
  const hasDiff = added.length > 0 || removed.length > 0;

  // Auto-granted (added because WRITE was toggled on, not directly toggled)
  const autoGrantedPerms = new Set(
    groupPerms.filter((p) => {
      const write = getWriteCounterpart(p);
      //   if(write && localPerms)
      return (
        write &&
        localPerms.has(write) &&
        !serverPerms.has(p) &&
        !added.includes(p)
      );
    }),
  );

  // Auto-revoked (removed because READ was toggled off)
  const autoRevokedPerms = new Set(
    groupPerms.filter((p) => {
      const read = getWriteCounterpart(p);
      return (
        read &&
        !localPerms.has(read) &&
        serverPerms.has(p) &&
        !removed.includes(p)
      );
    }),
  );

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={`bg-white rounded-2xl border overflow-hidden transition-shadow
        ${hasDiff ? "border-amber-300 shadow-[0_2px_12px_rgba(245,158,11,0.12)]" : "border-slate-100 shadow-[0_1px_6px_rgba(13,27,46,0.05)]"}`}
    >
      {/* Group header */}
      <div
        className="flex items-center gap-x-3 px-4 py-3.5 cursor-pointer select-none group"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 bg-slate-50 border border-slate-100">
          {<group.icon className="w-4 h-4" />}
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-x-2 flex-wrap">
            <span
              className="font-bold text-sm text-[#0D1B2E]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {group.label}
            </span>
            {hasDiff && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                modified
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {group.description}
          </p>
        </div>

        {/* Active count */}
        <div className="flex items-center gap-x-2 shrink-0">
          {activeInGroup.length > 0 && (
            <span
              className={`text-[11px] font-bold px-2 py-1 rounded-lg
              ${allOn ? "text-[#C9A84C] bg-[#0D1B2E]" : "text-[#1E3A5F] bg-[#EEF2F8]"}`}
            >
              {activeInGroup.length}/{groupPerms.length}
            </span>
          )}

          {/* Toggle all */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAll(groupPerms, allOn);
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer
              ${
                allOn
                  ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
                  : "bg-[#EEF2F8] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
              }`}
            title={allOn ? "Remove all in group" : "Grant all in group"}
          >
            {allOn ? (
              <Minus className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Collapse */}
          <div className="w-6 h-6 flex items-center justify-center text-slate-300 group-hover:text-slate-500 transition-colors">
            {open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Permissions row */}
      <AnimatePresence>
        {open && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2.5 border-t border-slate-100">
              {groupPerms.map((p) => {
                const isActive = localPerms.has(p);
                const isRead_ = isReadPermission(p);
                const label = p.endsWith(":write")
                  ? "Write"
                  : p.endsWith(":read")
                    ? "Read"
                    : (p.split(":")[1] ?? p);
                const isAdding_ = !serverPerms.has(p) && localPerms.has(p);
                const isRemoving_ = serverPerms.has(p) && !localPerms.has(p);
                const isAutoG = autoGrantedPerms.has(p);
                const isAutoR = autoRevokedPerms.has(p);

                return (
                  <PermissionToggle
                    key={p}
                    permission={p}
                    label={label.charAt(0).toUpperCase() + label.slice(1)}
                    isActive={isActive}
                    isRead={isRead_}
                    isAutoGranted={isAutoG}
                    isAutoRevoked={isAutoR}
                    isAdding={isAdding_}
                    isRemoving={isRemoving_}
                    disabled={false}
                    onToggle={() => onToggle(p)}
                  />
                );
              })}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

// ─── Diff summary bar ──────────────────────────────────────────────────────────
const DiffSummary = ({
  added,
  removed,
}: {
  added: Permission[];
  removed: Permission[];
}) => {
  if (added.length === 0 && removed.length === 0) return null;
  const fmt = (p: Permission) => {
    const [ns, action] = p.split(":");
    return `${ns}:${action}`;
  };
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
    >
      <div className="flex items-center gap-x-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <span
          className="text-xs font-bold text-amber-700"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Unsaved changes — review before saving
        </span>
      </div>
      <div className="flex flex-col gap-y-2">
        {added.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 w-16 shrink-0">
              +Grant
            </span>
            {added.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200"
              >
                <Plus className="w-2.5 h-2.5" />
                {fmt(p)}
              </span>
            ))}
          </div>
        )}
        {removed.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 w-16 shrink-0">
              −Revoke
            </span>
            {removed.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200"
              >
                <Minus className="w-2.5 h-2.5" />
                {fmt(p)}
              </span>
            ))}
          </div>
        )}
      </div>
    </MotionDiv>
  );
};

const AdministrativePermissions = () => {
  const qc = useQueryClient();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  // Local (edited) permission set
  const [localPerms, setLocalPerms] = useState<Set<Permission>>(new Set());
  // The server's current permissions for the selected user (truth baseline)
  const [serverPerms, setServerPerms] = useState<Set<Permission>>(new Set());
  const [isDirty, setIsDirty] = useState(false);

  // ── Staff list ─────────────────────────────────────────────────────────────
  // TODO: Fetch staffs whose dashboard type is admin
  const { data: staffList = [], isLoading: loadingStaff } = useFetch({
    queryKeys: staffKeys.lists(),
    queryFn: getAllStaffUnPnFn,
  });

  // ── Selected user's permissions ────────────────────────────────────────────
  const { data: userPermData, isLoading: loadingPerms } = useFetch({
    queryFn: () => getUserPermissionsFn(selectedUserId!),
    queryKeys: staffKeys.custom("permissions", { selectedUserId }),
    enabled: !!selectedUserId,
  });

  useEffect(() => {
    if (userPermData && userPermData.length > 0) {
      const perms = userPermData.map((s) => s.permission as Permission);
      const s = new Set(perms);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setServerPerms(s);
      setLocalPerms(new Set(s));
      setIsDirty(false);
    }
  }, [userPermData]);

  // ── Sync mutation ──────────────────────────────────────────────────────────
  const syncPerms = usePost({
    postFn: syncPermissionsFn,
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await qc.invalidateQueries({
          queryKey: staffKeys.custom("permissions", { selectedUserId }),
        });
        toast.success(responseMessage);
        // Update server baseline optimistically
        setServerPerms(new Set(localPerms));
        setIsDirty(false);
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (e) =>
      toast.error("Failed to sync permissions", { description: e.message }),
  });

  // ── Derived diff ────────────────────────────────────────────────────────────
  const allPermissions = Object.values(
    ADMINISTRATIVE_PERMISSIONS,
  ) as Permission[];
  const added = allPermissions.filter(
    (p) => !serverPerms.has(p) && localPerms.has(p),
  );
  const removed = allPermissions.filter(
    (p) => serverPerms.has(p) && !localPerms.has(p),
  );

  // ── Selected user object ────────────────────────────────────────────────────
  const selectedUser = useMemo(
    () => staffList.find((s) => s.staffId === selectedUserId) ?? null,
    [staffList, selectedUserId],
  );

  // ── Toggle a single permission ──────────────────────────────────────────────
  const handleToggle = (p: Permission) => {
    const adding = !localPerms.has(p);
    const next = enforceConstraints(localPerms, p, adding);
    setLocalPerms(next);
    setIsDirty(true);
  };

  // ── Toggle all in a group ───────────────────────────────────────────────────
  const handleToggleAll = (group: Permission[], allOn: boolean) => {
    const next = toggleGroupAll(localPerms, group, allOn);
    setLocalPerms(next);
    setIsDirty(true);
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setLocalPerms(new Set(serverPerms));
    setIsDirty(false);
  };

  // ── Grant all ───────────────────────────────────────────────────────────────
  const handleGrantAll = () => {
    setLocalPerms(new Set(allPermissions));
    setIsDirty(true);
  };

  // ── Revoke all ───────────────────────────────────────────────────────────────
  const handleRevokeAll = () => {
    setLocalPerms(new Set());
    setIsDirty(true);
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!selectedUserId) {
      toast.warning("Select a user first.");
      return;
    }
    console.log({
      userId: selectedUserId,
      permissions: Array.from(localPerms),
    });

    syncPerms.mutate({
      userId: selectedUserId,
      userPermissions: Array.from(localPerms),
    });
  };

  const staffOptions = useMemo(
    () =>
      staffList.map((s) => ({
        value: s.staffId,
        label: `${s.firstName} ${s.lastName}`,
        role: s.staffRole,
      })),
    [staffList],
  );

  const totalActive = localPerms.size;
  const totalPerms = allPermissions.length;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-3">
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
            Permission Management
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Administration</span>
            <ChevronRight className="w-3 h-3" />
            <span>Manage Administrative Permissions</span>
          </nav>
        </div>

        {/* Active perm summary */}
        {selectedUserId && !loadingPerms && (
          <div className="flex items-center gap-x-3">
            <div className="flex items-center gap-x-2 px-3.5 py-2 rounded-xl bg-[#EEF2F8] border border-[#D0DCF0]">
              <Shield className="w-4 h-4 text-[#1E3A5F]" />
              <span className="text-sm font-bold text-[#0D1B2E]">
                {totalActive} / {totalPerms} active
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-32 h-2 rounded-full bg-slate-200 overflow-hidden hidden sm:block">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(totalActive / totalPerms) * 100}%`,
                  background: "linear-gradient(90deg,#0D1B2E 0%,#C9A84C 100%)",
                }}
              />
            </div>
          </div>
        )}
      </MotionDiv>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 items-start">
        {/* ════ LEFT: USER PICKER ════ */}
        <MotionDiv
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex flex-col gap-y-4"
        >
          {/* User select card */}
          <Section
            title="Select Administrative User"
            icon={<Users className="w-4 h-4" />}
            cols={1}
            showStep={false}
            step={0}
            childrenClassName="p-3!"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Administrative Member
            </p>
            <Select
              showSearch={{
                filterOption: (input, opt) =>
                  String(opt?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase()),
              }}
              size="large"
              className="w-full"
              placeholder="Search by name…"
              loading={loadingStaff}
              options={staffOptions}
              notFoundContent={
                <div className="flex flex-col items-center py-5 gap-1.5">
                  <User className="w-6 h-6 text-slate-300" />
                  <span className="text-xs text-slate-400">No staff found</span>
                </div>
              }
              onChange={(id) => {
                setSelectedUserId(id);
                setLocalPerms(new Set());
                setServerPerms(new Set());
                setIsDirty(false);
              }}
              value={selectedUserId ?? undefined}
              optionRender={(opt) => (
                <div className="flex items-center gap-x-2 py-0.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#C9A84C] font-bold text-[11px] shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                    }}
                  >
                    {String(opt.label).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#0D1B2E] truncate">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {opt.data?.role}
                    </span>
                  </div>
                </div>
              )}
            />
          </Section>

          {/* Selected user identity card */}
          <AnimatePresence>
            {selectedUser && !loadingPerms && (
              <MotionDiv
                key="user-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
              >
                {loadingPerms ? (
                  <div className="p-5 flex flex-col gap-y-3">
                    <div className="flex items-center gap-x-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse" />
                      <div className="flex flex-col gap-y-1.5 flex-1">
                        <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-3/4" />
                        <div className="h-3 bg-slate-100 rounded-lg animate-pulse w-1/2" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 flex items-center gap-x-3 border-b border-slate-100">
                      <InitialAvatar
                        name={`${selectedUser.firstName} ${selectedUser.lastName}`}
                        img={selectedUser.staffImage}
                        size={44}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[#0D1B2E] truncate">
                          {`${selectedUser.firstName} ${selectedUser.lastName}`}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {selectedUser.email}
                        </p>
                        <span className="inline-flex items-center gap-x-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF2F8] border border-[#D0DCF0] text-[#1E3A5F]">
                          <Shield className="w-2.5 h-2.5" />
                          {selectedUser.staffRole}
                        </span>
                      </div>
                    </div>

                    {/* Current permissions count by group */}
                    <div className="p-4 flex flex-col gap-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Current permissions
                      </p>
                      {ADMIN_PERMISSION_GROUPS.map((g) => {
                        const activeInG = g.permissions.filter((p) =>
                          serverPerms.has(p),
                        ).length;
                        const Icon = <g.icon className="w-3.5 h-3.5" />;
                        return (
                          <div
                            key={g.label}
                            className="flex items-center gap-x-2"
                          >
                            <span className="text-base leading-none w-5 text-center shrink-0">
                              {Icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[10px] font-semibold text-slate-600 truncate">
                                  {g.label}
                                </span>
                                <span
                                  className={`text-[10px] font-bold ${activeInG > 0 ? "text-[#1E3A5F]" : "text-slate-300"}`}
                                >
                                  {activeInG}/{g.permissions.length}
                                </span>
                              </div>
                              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${(activeInG / g.permissions.length) * 100}%`,
                                    background:
                                      activeInG === g.permissions.length
                                        ? "linear-gradient(90deg,#0D1B2E,#1E3A5F)"
                                        : "#1E3A5F",
                                    opacity: activeInG === 0 ? 0 : 1,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </MotionDiv>
            )}
          </AnimatePresence>

          {/* Quick actions */}
          {selectedUserId && !loadingPerms && (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-100 p-4"
              style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                Quick Actions
              </p>
              <div className="flex flex-col gap-y-2">
                <button
                  type="button"
                  onClick={handleGrantAll}
                  className="flex items-center gap-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                  Grant All Permissions
                </button>
                <button
                  type="button"
                  onClick={handleRevokeAll}
                  className="flex items-center gap-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <ShieldOff className="w-3.5 h-3.5" />
                  Revoke All Permissions
                </button>
                {isDirty && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset to Saved State
                  </button>
                )}
              </div>
            </MotionDiv>
          )}
        </MotionDiv>

        {/* ════ RIGHT: PERMISSION MATRIX ════ */}
        <MotionDiv
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="flex flex-col gap-y-4"
        >
          {/* Empty state */}
          {!selectedUserId && (
            <div
              className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center py-16 gap-3"
              style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Shield className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-400">
                Select a user to manage permissions
              </p>
              <p className="text-xs text-slate-300 text-center max-w-65">
                Choose a staff or admin member from the left panel to view and
                edit their access rights.
              </p>
            </div>
          )}

          {/* Loading */}
          {selectedUserId && loadingPerms && (
            <div className="flex flex-col gap-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-white rounded-2xl border border-slate-100 animate-pulse"
                  style={{ opacity: 1 - i * 0.1 }}
                />
              ))}
            </div>
          )}

          {/* Permission groups */}
          {selectedUserId && !loadingPerms && (
            <>
              {/* Legend + hint */}
              <div className="flex items-center flex-wrap gap-3 px-1">
                <div className="flex items-center gap-x-1.5 text-[11px] font-bold text-slate-500">
                  <Eye className="w-3.5 h-3.5 text-[#1E3A5F]" />
                  <span>Read — view only</span>
                </div>
                <div className="flex items-center gap-x-1.5 text-[11px] font-bold text-slate-500">
                  <Pencil className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>Write — create / edit</span>
                </div>
                <div className="flex items-center gap-x-1.5 text-[11px] font-bold text-amber-500">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Write auto-grants Read</span>
                </div>
              </div>

              {/* Diff summary */}
              <AnimatePresence>
                {isDirty && (
                  <MotionDiv
                    key="diff"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <DiffSummary added={added} removed={removed} />
                  </MotionDiv>
                )}
              </AnimatePresence>

              {/* Group cards */}
              {ADMIN_PERMISSION_GROUPS.map((group, i) => (
                <PermissionGroupCard
                  key={group.label}
                  group={group}
                  localPerms={localPerms}
                  serverPerms={serverPerms}
                  onToggle={handleToggle}
                  onToggleAll={handleToggleAll}
                  index={i}
                />
              ))}

              {/* SAVE BAR */}
              <div
                className={`sticky bottom-4 flex items-center justify-between gap-x-4 px-5 py-4 rounded-2xl border transition-all
                ${
                  isDirty
                    ? "bg-white border-amber-300 shadow-[0_4px_24px_rgba(13,27,46,0.14)]"
                    : "bg-white border-slate-100 shadow-[0_2px_8px_rgba(13,27,46,0.06)]"
                }`}
              >
                <div className="flex items-center gap-x-3">
                  {isDirty ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-[#0D1B2E]">
                      {isDirty
                        ? `${added.length} to grant · ${removed.length} to revoke`
                        : "Permissions in sync"}
                    </p>
                    {selectedUser && (
                      <p className="text-[11px] text-slate-400">
                        {`${selectedUser.firstName} ${selectedUser.lastName}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-x-2.5">
                  {isDirty && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Discard
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isDirty || syncPerms.isPending}
                    className={`flex items-center gap-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all
                      ${!isDirty || syncPerms.isPending ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "hover:opacity-90 active:scale-[0.98] cursor-pointer"}`}
                    style={
                      isDirty && !syncPerms.isPending
                        ? {
                            background:
                              "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                          }
                        : {}
                    }
                  >
                    {syncPerms.isPending ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-slate-400 animate-spin" />
                        Syncing…
                      </>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5 text-[#C9A84C]" />
                        Sync Permissions
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </MotionDiv>
      </div>
    </div>
  );
};
export default AdministrativePermissions;
