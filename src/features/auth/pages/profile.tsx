/**
 * UserProfile.tsx
 *
 * Works for any role: Admin, Teacher, Staff, etc.
 * Sections:
 *  1. Profile hero — avatar upload + key identity chips
 *  2. Personal Information — edit name, email, phone, gender, DOB, address
 *  3. Change Password — old / new / confirm
 *  4. Account Info — read-only: role, school, joined date, userId (copy)
 *
 * Layout (desktop):
 * ┌──────────────────────┬────────────────────────────────────────────┐
 * │  SIDEBAR             │  CONTENT PANELS (tabbed)                  │
 * │  Avatar hero         │  Personal Info  /  Security  /  Account   │
 * │  Name + role         │                                            │
 * │  Tab navigation      │                                            │
 * └──────────────────────┴────────────────────────────────────────────┘
 *
 * NOTE: Adjust service imports, query keys, and type paths for your project.
 */

import { DatePicker, Form, Input, Select } from "antd";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AnimatePresence } from "motion/react";
import dayjs from "@/lib/dayjs";
import {
  ChevronRight,
  User,
  Shield,
  Building2,
  Calendar,
  Phone,
  Mail,
  Lock,
  Camera,
  Copy,
  Check,
  Save,
  KeyRound,
  Info,
  Pencil,
  X,
  GraduationCap,
  IdCard,
  Hash,
} from "lucide-react";
import { FL } from "@/features/admins/components/util-components";
import { useAuth } from "@/store/auth.store";
import useFetch from "@/hooks/api/use-fetch";
import {
  getStaffByIdFn,
  updateStaffPasswordFn,
  updateStaffProfileFn,
} from "@/services/staff";
import { staffKeys } from "@/config/query-keys";
import useUpdate from "@/hooks/api/use-update";
import { useShallow } from "zustand/react/shallow";
import type { StaffUpdateWithFile, UpdateSecurity } from "@/types/api/staff";
import { MotionDiv } from "@/components/custom/motion";
import type { Rule } from "antd/es/form";
import { buildMediaUrl } from "@/utils/media";
import { signalRSelectors, useSignalRStore } from "@/store/signalr.store";

// ═══════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════

// Reusable text input
const Field = ({
  label,
  name,
  placeholder,
  type = "text",
  icon,
  disabled,
  rules,
  extra,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  rules?: Rule[];
  extra?: string;
}) => (
  <Form.Item
    name={name}
    label={<FL>{label}</FL>}
    rules={rules}
    extra={extra && <span className="text-[11px] text-slate-400">{extra}</span>}
    className="mb-0!"
  >
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none z-10">
          {icon}
        </div>
      )}
      <Form.Item name={name} noStyle rules={rules}>
        <Input
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`rounded-xl! h-11! ${icon ? "pl-9!" : ""}`}
        />
      </Form.Item>
    </div>
  </Form.Item>
);

// Read-only info row
const InfoRow = ({
  icon,
  label,
  value,
  copyable,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  copyable?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-x-3 py-3.5 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-[#EEF2F8] flex items-center justify-center text-[#1E3A5F] shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-0.5">
          {label}
        </p>
        <p
          className="text-sm font-semibold text-[#0D1B2E] truncate"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {value || (
            <span className="text-slate-300 font-normal italic">Not set</span>
          )}
        </p>
      </div>
      {copyable && value && (
        <button
          type="button"
          onClick={copy}
          className="shrink-0 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-[#EEF2F8] hover:text-[#1E3A5F] transition-all cursor-pointer text-slate-400"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
};

// Section card wrapper
const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-2xl border border-slate-100 overflow-hidden ${className}`}
    style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
  >
    {children}
  </div>
);

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <div
    className="flex items-center gap-x-3 px-5 py-3.5"
    style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)" }}
  >
    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <p
        className="text-white font-semibold text-sm leading-tight"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {title}
      </p>
      {subtitle && (
        <p className="text-white/50 text-[11px] mt-0.5">{subtitle}</p>
      )}
    </div>
  </div>
);

// Password visibility toggle field
const PasswordField = ({
  label,
  name,
  placeholder,
  rules,
  dependencies,
}: {
  label: string;
  name: string;
  placeholder?: string;
  rules?: Rule[];
  dependencies?: string[];
}) => {
  return (
    <Form.Item
      name={name}
      label={<FL>{label}</FL>}
      rules={rules}
      dependencies={dependencies}
      className="mb-0!"
    >
      <Input.Password
        placeholder={placeholder}
        className="rounded-xl! h-11!"
        prefix={
          <Lock className="w-4 h-4 text-slate-300 pointer-events-none z-10" />
        }
      />
    </Form.Item>
  );
};

// ─── Save / Cancel footer ──────────────────────────────────────────
const FormFooter = ({
  isPending,
  onCancel,
  label = "Save Changes",
}: {
  isPending: boolean;
  onCancel?: () => void;
  label?: string;
}) => (
  <div className="flex items-center justify-end gap-x-3 pt-4 border-t border-slate-100 mt-2">
    {onCancel && (
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
        Cancel
      </button>
    )}
    <button
      type="submit"
      disabled={isPending}
      className={`flex items-center gap-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all
        ${isPending ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "hover:opacity-90 active:scale-[0.98] cursor-pointer"}`}
      style={
        isPending
          ? {}
          : { background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)" }
      }
    >
      {isPending ? (
        <>
          <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-slate-400 animate-spin" />
          Saving…
        </>
      ) : (
        <>
          <Save className="w-3.5 h-3.5 text-[#C9A84C]" />
          {label}
        </>
      )}
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// AVATAR UPLOADER
// ═══════════════════════════════════════════════════════════════════
const AvatarUploader = ({
  currentImage,
  name,
  onUpload,
  isUploading,
}: {
  currentImage?: string;
  name: string;
  onUpload: (file: File) => void;
  isUploading: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials =
    name
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("") || "?";
  const imgUrl = buildMediaUrl(currentImage, { useNoLogo: false });

  return (
    <div className="flex flex-col items-center gap-y-3">
      {/* Avatar circle */}
      <div className="relative">
        <div
          className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-[#C9A84C] text-3xl select-none"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
            boxShadow: "0 4px 20px rgba(13,27,46,0.25)",
          }}
        >
          {imgUrl ? (
            <img
              src={imgUrl}
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

        {/* Upload overlay button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform cursor-pointer disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          {isUploading ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-[#C9A84C] animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-[#C9A84C]" />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
        }}
      />

      <p className="text-[10px] text-slate-400 text-center font-medium">
        Click the camera icon to update photo
        <br />
        <span className="opacity-60">JPG, PNG · max 2MB</span>
      </p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// TAB TYPES
// ═══════════════════════════════════════════════════════════════════
type TabKey = "personal" | "security" | "account";

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const UserProfile = () => {
  const institutionName = useSignalRStore(signalRSelectors.institution)?.name;
  const { user, updateUser } = useAuth(
    useShallow((s) => ({
      user: s.user,
      updateUser: s.updateUser,
    })),
  );
  const userId = user?.userId;
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabKey>("personal");

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────
  const { data: profile, isLoading } = useFetch({
    queryKeys: staffKeys.detail(userId!),
    queryFn: () => getStaffByIdFn(userId!),
    enabled: !!userId,
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      profileForm.setFieldsValue({
        FirstName: profile.firstName,
        LastName: profile.lastName,
        Email: profile.email,
        Phone: profile.staffPhone,
        Gender: profile.gender,
        DateOfBirth: profile.dateOfBirth
          ? dayjs(profile.dateOfBirth)
          : undefined,
        Address: profile.address,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // ── Mutations ────────────────────────────────────────────────────
  const updateProfile = useUpdate({
    updateFn: updateStaffProfileFn,
    onSuccess: async ({
      response: { responseCode, responseMessage },
      user: newProfile,
    }) => {
      if (responseCode === 1) {
        if (newProfile && newProfile.staffId && newProfile.userId) {
          updateUser(newProfile);
        }
        await qc.invalidateQueries({ queryKey: staffKeys.detail(userId!) });
        toast.success(responseMessage);
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (err) =>
      toast.error("Failed to update profile", { description: err.message }),
  });

  const changePassword = useUpdate({
    updateFn: updateStaffPasswordFn,
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await qc.invalidateQueries({ queryKey: staffKeys.detail(userId!) });
        passwordForm.resetFields();
        toast.success(responseMessage);
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (err) =>
      toast.error("Failed to update password", { description: err.message }),
  });

  const uploadImage = useUpdate({
    updateFn: updateStaffProfileFn,
    onSuccess: async ({ response: { responseCode, responseMessage } }) => {
      if (responseCode === 1) {
        await qc.invalidateQueries({ queryKey: staffKeys.detail(userId!) });
        toast.success(responseMessage);
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (err) =>
      toast.error("Failed to update image", { description: err.message }),
  });

  // ── Handlers ─────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onProfileFinish = (values: any) => {
    if (!userId) {
      toast.warning("User not found. Re-Login again.");
      return;
    }
    const fd = new FormData();
    fd.append("FirstName", values.FirstName);
    fd.append("LastName", values.LastName);
    fd.append("DateOfBirth", values.DateOfBirth);
    fd.append("Gender", values.Gender);
    fd.append("Email", values.Email);
    fd.append("Address", values.Address);
    fd.append("StaffPhone", values.Phone);
    const payload: StaffUpdateWithFile = {
      id: userId,
      data: fd,
    };
    updateProfile.mutate(payload);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPasswordFinish = (values: any) => {
    if (values.NewPassword !== values.ConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!userId) {
      toast.warning("User not found. Re-Login again.");
      return;
    }
    const payload: UpdateSecurity = {
      data: {
        Password: values.OldPassword,
        NewPassword: values.NewPassword,
        ConfirmPassword: values.ConfirmPassword,
      },
      id: userId!,
    };
    changePassword.mutate(payload);
  };

  const displayName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
    : (user?.name ?? "");

  const TABS: { key: TabKey; icon: React.ReactNode; label: string }[] = [
    {
      key: "personal",
      icon: <User className="w-4 h-4" />,
      label: "Personal Info",
    },
    {
      key: "security",
      icon: <KeyRound className="w-4 h-4" />,
      label: "Security",
    },
    { key: "account", icon: <Info className="w-4 h-4" />, label: "Account" },
  ];

  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* PAGE HEADER */}
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5"
      >
        <h1
          className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Profile &amp; Settings
        </h1>
        <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
          <span className="text-[#1E3A5F] font-semibold">Account</span>
          <ChevronRight className="w-3 h-3" />
          <span>My Profile</span>
        </nav>
      </MotionDiv>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
        {/* ════ LEFT SIDEBAR ════ */}
        <MotionDiv
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex flex-col gap-y-4"
        >
          {/* Profile hero card */}
          <SectionCard>
            <div className="p-5 flex flex-col items-center text-center gap-y-3">
              {isLoading ? (
                <div className="w-24 h-24 rounded-2xl bg-slate-100 animate-pulse" />
              ) : (
                <AvatarUploader
                  currentImage={profile?.staffImage}
                  name={displayName}
                  onUpload={(file) => {
                    const fd = new FormData();
                    fd.append("StaffImage", file);
                    const payload: StaffUpdateWithFile = {
                      id: userId!,
                      data: fd,
                    };
                    uploadImage.mutate(payload);
                  }}
                  isUploading={uploadImage.isPending}
                />
              )}

              {isLoading ? (
                <div className="flex flex-col items-center gap-y-2 w-full">
                  <div className="h-5 bg-slate-100 rounded-lg animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-1/2" />
                </div>
              ) : (
                <>
                  <div>
                    <h2
                      className="font-bold text-base text-[#0D1B2E]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {displayName || "—"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {profile?.email}
                    </p>
                  </div>

                  {/* Role badge */}
                  {profile?.staffRole && (
                    <span className="inline-flex items-center gap-x-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-[#EEF2F8] border border-[#D0DCF0] text-[#1E3A5F]">
                      <Shield className="w-3 h-3" />
                      {profile.staffRole}
                    </span>
                  )}

                  {/* Quick chips */}
                  <div className="flex flex-col gap-y-1.5 w-full text-left mt-1">
                    {profile?.staffPhone && (
                      <div className="flex items-center gap-x-2 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        {profile.staffPhone}
                      </div>
                    )}
                    {profile?.gender && (
                      <div className="flex items-center gap-x-2 text-xs text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        {profile.gender}
                      </div>
                    )}
                    {profile?.createdOn && (
                      <div className="flex items-center gap-x-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        Joined {dayjs(profile.createdOn).format("MMM YYYY")}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          {/* Tab navigation */}
          <SectionCard>
            <div className="p-2 flex flex-col gap-y-0.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer text-left w-full
                    ${
                      tab === t.key
                        ? "text-[#C9A84C]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#1E3A5F]"
                    }`}
                  style={
                    tab === t.key
                      ? {
                          background:
                            "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                        }
                      : {}
                  }
                >
                  {t.icon}
                  {t.label}
                  {tab === t.key && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#C9A84C]/60" />
                  )}
                </button>
              ))}
            </div>
          </SectionCard>
        </MotionDiv>

        {/* ════ RIGHT CONTENT ════ */}
        <MotionDiv
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <AnimatePresence mode="wait">
            {/* ─── PERSONAL INFO ─── */}
            {tab === "personal" && (
              <MotionDiv
                key="personal"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <SectionCard>
                  <SectionHeader
                    icon={<Pencil className="w-4 h-4" />}
                    title="Personal Information"
                    subtitle="Update your name, contact details and address"
                  />
                  <Form
                    form={profileForm}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onProfileFinish}
                    className="p-5!"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {/* Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <Field
                        label="First Name"
                        name="FirstName"
                        placeholder="e.g. John"
                        icon={<User className="w-4 h-4" />}
                        rules={[
                          { required: true, message: "First name is required" },
                        ]}
                      />
                      <Field
                        label="Last Name"
                        name="LastName"
                        placeholder="e.g. Mensah"
                        icon={<User className="w-4 h-4" />}
                        rules={[
                          { required: true, message: "Last name is required" },
                        ]}
                      />
                    </div>

                    {/* Contact row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <Field
                        label="Email Address"
                        name="Email"
                        type="email"
                        placeholder="john@school.edu"
                        icon={<Mail className="w-4 h-4" />}
                        rules={[
                          {
                            required: true,
                            type: "email",
                            message: "Valid email required",
                          },
                        ]}
                      />
                      <Field
                        label="Phone Number"
                        name="Phone"
                        placeholder="+233 XX XXX XXXX"
                        icon={<Phone className="w-4 h-4" />}
                      />
                    </div>

                    {/* Gender + DOB */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <FL>Gender</FL>
                        <Form.Item name="Gender" className="mb-0!">
                          <Select
                            size="large"
                            className="w-full"
                            placeholder="Select gender"
                            options={[
                              { label: "Male", value: "Male" },
                              { label: "Female", value: "Female" },
                              { label: "Other", value: "Other" },
                            ]}
                          />
                        </Form.Item>
                      </div>
                      <div>
                        <FL>Date of Birth</FL>
                        <Form.Item name="DateOfBirth" className="mb-0!">
                          <DatePicker
                            // type="date"
                            // name="DateOfBirth"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0D1B2E] focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 transition-all"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          />
                        </Form.Item>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <FL>Address / Residence</FL>
                      <Form.Item name="Address" className="mb-0! relative">
                        <Input.TextArea
                          rows={3}
                          placeholder="Street address or town/city…"
                          className="rounded-xl! pl-9!. resize-none"
                        />
                      </Form.Item>
                    </div>

                    <FormFooter isPending={updateProfile.isPending} />
                  </Form>
                </SectionCard>
              </MotionDiv>
            )}

            {/* ─── SECURITY ─── */}
            {tab === "security" && (
              <MotionDiv
                key="security"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <SectionCard>
                  <SectionHeader
                    icon={<KeyRound className="w-4 h-4" />}
                    title="Change Password"
                    subtitle="Use a strong password you don't use elsewhere"
                  />

                  <Form
                    form={passwordForm}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onPasswordFinish}
                    className="p-5!"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {/* Tips banner */}
                    <div className="flex items-start gap-x-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5">
                      <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 font-medium leading-relaxed">
                        Use at least 8 characters, including uppercase,
                        lowercase, numbers and symbols. Never share your
                        password with anyone.
                      </p>
                    </div>

                    <div className="flex flex-col gap-y-4">
                      <PasswordField
                        label="Current Password"
                        name="OldPassword"
                        placeholder="Enter your current password"
                        rules={[
                          {
                            required: true,
                            message: "Current password is required",
                          },
                        ]}
                      />
                      <PasswordField
                        label="New Password"
                        name="NewPassword"
                        placeholder="Enter new password"
                        rules={[
                          {
                            required: true,
                            message: "New password is required",
                          },
                          { min: 8, message: "Minimum 8 characters" },
                        ]}
                      />
                      <PasswordField
                        label="Confirm New Password"
                        name="ConfirmPassword"
                        placeholder="Re-enter new password"
                        dependencies={["NewPassword"]}
                        rules={[
                          {
                            required: true,
                            message: "Please confirm your new password",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (
                                !value ||
                                getFieldValue("NewPassword") === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Passwords do not match!"),
                              );
                            },
                          }),
                        ]}
                      />
                    </div>

                    <FormFooter
                      isPending={changePassword.isPending}
                      label="Update Password"
                      onCancel={() => passwordForm.resetFields()}
                    />
                  </Form>
                </SectionCard>
              </MotionDiv>
            )}

            {/* ─── ACCOUNT INFO ─── */}
            {tab === "account" && (
              <MotionDiv
                key="account"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <SectionCard>
                  <SectionHeader
                    icon={<Info className="w-4 h-4" />}
                    title="Account Information"
                    subtitle="Read-only details about your account and institution"
                  />

                  <div className="p-5">
                    {isLoading ? (
                      <div className="flex flex-col gap-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-12 bg-slate-100 rounded-xl animate-pulse"
                            style={{ opacity: 1 - i * 0.1 }}
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        <InfoRow
                          icon={<IdCard className="w-4 h-4" />}
                          label="User ID"
                          value={profile?.staffId}
                          copyable
                        />
                        <InfoRow
                          icon={<User className="w-4 h-4" />}
                          label="Full Name"
                          value={displayName}
                        />
                        <InfoRow
                          icon={<Shield className="w-4 h-4" />}
                          label="Role"
                          value={profile?.staffRole}
                        />
                        <InfoRow
                          icon={<Building2 className="w-4 h-4" />}
                          label="Institution"
                          value={institutionName}
                        />
                        <InfoRow
                          icon={<Hash className="w-4 h-4" />}
                          label="Staff ID / Code"
                          value={profile?.nationalId}
                          copyable
                        />
                        <InfoRow
                          icon={<GraduationCap className="w-4 h-4" />}
                          label="Educational Level"
                          value={profile?.religion}
                        />
                        <InfoRow
                          icon={<Calendar className="w-4 h-4" />}
                          label="Account Created"
                          value={
                            profile?.createdOn
                              ? dayjs(profile.createdOn).format("DD MMM YYYY")
                              : undefined
                          }
                        />
                        <InfoRow
                          icon={<Mail className="w-4 h-4" />}
                          label="Email"
                          value={profile?.email}
                          copyable
                        />
                      </>
                    )}

                    {/* Soft disclaimer */}
                    <div className="flex items-start gap-x-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Account information is managed by your institution
                        administrator. Contact them to update your role, staff
                        ID, or institutional details.
                      </p>
                    </div>
                  </div>
                </SectionCard>
              </MotionDiv>
            )}
          </AnimatePresence>
        </MotionDiv>
      </div>
    </div>
  );
};
export default UserProfile;
