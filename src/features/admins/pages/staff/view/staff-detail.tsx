import { MotionDiv } from "@/components/custom/motion";
import { staffKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getStaffByIdFn } from "@/services/staff";
import {
  ChevronRight,
  Church,
  Clock,
  Globe,
  Briefcase,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
  UserCog,
  BookOpen,
  Building,
  Files,
  CreditCard,
  Save,
  BriefcaseBusiness,
  ArrowLeft,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Drawer, Image } from "antd";
import { buildMediaUrl } from "@/utils/media";
import { capitalizeWords, getInitials, truncateString } from "@/utils/string";
import {
  DetailField,
  GenderBadge,
  Shimmer,
  StatusBadge,
  TabBtn,
} from "@/features/admins/components/student/util-components";
import { formatDate, getAgeOutOfDate } from "@/utils/date-n-time";
import { CardHeader } from "@/features/admins/components/teacher-util-components";
import { AnimatePresence } from "motion/react";
import StaffSubjects from "./tabs/subjects";
import StaffSubLevels from "./tabs/sublevels";
import StaffFiles from "./tabs/files";
import StaffOtherData from "./tabs/others";
import { useQueryClient } from "@tanstack/react-query";
import AdminUpdateStaff from "./admin-update-staff";

type TabKey = "subjects" | "sublevels" | "files" | "others";

const StaffDetail = () => {
  const location = useLocation();
  const { staffId } = location.state || {};
  const [drawerOpen, setDrawerOpen] = useState(false); // actual form drawer
  const qc = useQueryClient();

  // ── Query ────────────────────────────────────────────
  const { data: staff, isLoading } = useFetch({
    queryFn: () => getStaffByIdFn(staffId),
    queryKeys: staffKeys.detail(staffId),
    enabled: !!staffId,
  });
  const isATeacher = useMemo(
    () => staff && staff?.staffMode === "TEACHING",
    [staff],
  );
  const [activeTab, setActiveTab] = useState<TabKey>("sublevels");
  useEffect(() => {
    if (isATeacher) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab("sublevels");
    } else {
      setActiveTab("files");
    }
  }, [isATeacher]);

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: staffKeys.detail(staffId) });
    setDrawerOpen(false);
  };

  // ── Tab content ──────────────────────────────────────
  const tabContent: Record<TabKey, React.ReactNode> = {
    subjects: (
      <StaffSubjects teacherId={staff?.staffId} isATeacher={isATeacher} />
    ),
    sublevels: (
      <StaffSubLevels teacherId={staff?.staffId} isATeacher={isATeacher} />
    ),
    files: <StaffFiles />,
    others: <StaffOtherData />,
  };

  const tabs = [
    ...(isATeacher
      ? [
          {
            key: "sublevels",
            icon: <Building className="w-3.5 h-3.5" />,
            label: "Sub-Levels",
          },
          {
            key: "subjects",
            icon: <BookOpen className="w-3.5 h-3.5" />,
            label: "Subjects",
          },
        ]
      : []),
    {
      key: "files",
      icon: <Files className="w-3.5 h-3.5" />,
      label: "Files",
    },
    {
      key: "others",
      icon: <CreditCard className="w-3.5 h-3.5" />,
      label: "Others",
    },
  ] as { key: TabKey; icon: React.ReactNode; label: string }[];

  // ── Loading state ────────────────────────────────────
  if (isLoading || !staff) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-3">
        <div className="mb-5 flex items-center gap-x-3">
          <Shimmer className="h-6 w-44" />
          <Shimmer className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-4 mb-4">
          <Shimmer className="h-72 rounded-2xl" />
          <Shimmer className="h-72 rounded-2xl" />
          <Shimmer className="h-72 rounded-2xl" />
        </div>
        <Shimmer className="h-96 rounded-2xl" />
      </div>
    );
  }

  const fullName =
    `${staff?.firstName ?? ""} ${staff?.lastName ?? ""}`.trim() || "Staff";
  const initials = getInitials(fullName);
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* ── Page header ──────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5 flex items-center justify-between"
      >
        <div>
          <h1
            className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Staff Profile
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Staff</span>
            <ChevronRight className="w-3 h-3" />
            <span>View Staff</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#0D1B2E] font-semibold truncate max-w-40">
              {fullName}
            </span>
          </nav>
        </div>

        {/* Edit button */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-x-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          <Save className="w-3.5 h-3.5 text-[#C9A84C]" />
          Update Staff
        </button>
      </MotionDiv>

      {/* ═══ PROFILE CARDS ROW ═══════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-4 mb-4">
        {/* ── HERO CARD – photo + identity ── */}
        <MotionDiv
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          {/* Navy top stripe */}
          <div
            className="h-16 w-full shrink-0"
            style={{
              background: "linear-gradient(135deg, #0D1B2E 0%, #2D5A8E 100%)",
            }}
          />

          {/* Avatar — overlaps the stripe */}
          <div className="flex flex-col items-center px-4 -mt-10 pb-5 flex-1">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md shrink-0 bg-[#0D1B2E] flex items-center justify-center">
              {staff?.staffImage ? (
                <Image
                  src={buildMediaUrl(staff.staffImage)}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                  fallback="/no-logo.png"
                  preview
                />
              ) : (
                <span className="text-[#C9A84C] text-2xl font-bold select-none">
                  {initials}
                </span>
              )}
            </div>

            <h2
              className="mt-3 text-base font-bold text-[#0D1B2E] text-center leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {staff.title}. {fullName}
            </h2>

            {/* Student ID badge */}
            <span className="mt-1.5 text-[11px] font-bold font-mono text-[#C9A84C] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {staff?.staffId ?? "—"}
            </span>

            {/* Status + gender pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              <StatusBadge value={staff?.status} />
              <GenderBadge value={staff?.gender} />
            </div>

            {/* Age */}
            <div className="mt-4 w-full flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Age
              </span>
              <span className="text-sm font-bold text-[#0D1B2E]">
                {getAgeOutOfDate(staff?.dateOfBirth || "")}yrs
              </span>
            </div>
            <div className="w-full h-px bg-slate-100 my-2" />
            <div className="w-full flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                DOB
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {formatDate(staff?.dateOfBirth || "")}
              </span>
            </div>
          </div>
        </MotionDiv>

        {/* ── PERSONAL INFO card ── */}
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <CardHeader
            icon={<User className="w-3.5 h-3.5" />}
            title="Personal Information"
          />

          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
            <DetailField
              icon={<Phone className="w-3 h-3" />}
              label="Phone"
              value={staff?.staffPhone}
            />
            <DetailField
              icon={<Mail className="w-3 h-3" />}
              label="Email"
              value={staff?.email}
            />
            <DetailField
              icon={<MapPin className="w-3 h-3" />}
              label="Address"
              value={truncateString(staff?.address || "", 20)}
            />
            <DetailField
              icon={<Church className="w-3 h-3" />}
              label="Religion"
              value={staff?.religion}
            />
            <DetailField
              icon={<Globe className="w-3 h-3" />}
              label="Emg Contact"
              value={staff?.emergencyContact}
            />
            <DetailField
              icon={<User className="w-3 h-3" />}
              label="Emg Name"
              value={staff?.emergencyName}
            />

            {/* Full-width note */}
            {staff?.note && (
              <div className="col-span-2 sm:col-span-3 border-t border-slate-100 pt-4 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  Note
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                  {staff.note}
                </p>
              </div>
            )}
          </div>
        </MotionDiv>

        {/* ── EMPLOYMENT card ── */}
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.11 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <CardHeader
            icon={<BriefcaseBusiness className="w-3.5 h-3.5" />}
            title="Empoyment Information"
          />

          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
            <DetailField
              icon={<Briefcase className="w-3 h-3" />}
              label="Staff Mode"
              highlight
              value={capitalizeWords(staff?.staffMode ?? "")}
            />
            <DetailField
              icon={<UserCog className="w-3 h-3" />}
              label="Staff Role"
              value={staff?.staffRole}
            />
            <DetailField
              icon={<Clock className="w-3 h-3" />}
              label="Employed Year"
              value={formatDate(staff?.createdOn || "")}
            />
            <DetailField
              icon={<Hash className="w-3 h-3" />}
              label="ID"
              value={staff?.nationalId}
            />
            <DetailField
              icon={<Clock className="w-3 h-3" />}
              label="Staff ID"
              value={staff?.staffId}
            />
            <StatusBadge value={staff?.status} />
          </div>
        </MotionDiv>
      </div>

      {/* ═══ TABBED LOWER SECTION ════════════════════ */}
      <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        {/* Tab bar */}
        <div
          className={`grid border-b border-slate-100 bg-slate-50/50 overflow-x-auto scrollbar-none`}
          style={{
            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
          }}
        >
          {tabs.map((tab) => (
            <TabBtn
              key={tab.key}
              active={activeTab === tab.key}
              icon={tab.icon}
              label={tab.label}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <MotionDiv
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-5"
          >
            {tabContent[activeTab]}
          </MotionDiv>
        </AnimatePresence>
      </MotionDiv>

      {/* ═══ UPDATE DRAWER — actual form ═════════════ */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size={520}
        placement="right"
        closeIcon={null}
        styles={{
          header: { display: "none" },
          body: { padding: 0 },
          wrapper: { boxShadow: "-4px 0 24px rgba(13,27,46,0.12)" },
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center gap-x-3 px-5 py-4 sticky top-0 z-10"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          {/* Back to modal */}
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false);
            }}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all cursor-pointer shrink-0"
            title="Back to section selection"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
            <BriefcaseBusiness className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-white font-bold text-sm leading-tight truncate"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Update Staff
            </p>
            <p className="text-white/50 text-[11px] truncate">{fullName}</p>
          </div>

          {/* Close entirely */}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer body — renders the selected update form */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={"update"}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <AdminUpdateStaff
                data={{
                  role: staff?.staffRole,
                  staffMode: staff.staffMode,
                  title: staff.title,
                }}
                invalidate={invalidate}
                staffId={staffId}
              />
            </MotionDiv>
          </AnimatePresence>
        </div>
      </Drawer>
    </div>
  );
};
export default StaffDetail;
