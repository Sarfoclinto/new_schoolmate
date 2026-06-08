import { MotionDiv } from "@/components/custom/motion";
import { studentKeys } from "@/config/query-keys";
import { drawerMeta, type UpdateKey } from "@/features/admins/data/utils";
import {
  DetailField,
  GenderBadge,
  Shimmer,
  StatusBadge,
  TabBtn,
  UpdateOptionBtn,
} from "@/features/admins/components/student/util-components";
import useFetch from "@/hooks/api/use-fetch";
import { buildMediaUrl } from "@/utils/media";
import { getStuByIdFn } from "@/services/student";
import {
  ArrowLeft,
  BookOpen,
  Building,
  ChevronRight,
  Church,
  Clock,
  CreditCard,
  Globe,
  GraduationCap,
  Hash,
  Heart,
  ImageIcon,
  Layers,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
  UserCog,
  Users,
  X,
  Calendar,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Drawer, Image, Modal } from "antd";
import { formatDate, getAgeOutOfDate } from "@/utils/date-n-time";
import { CardHeader } from "@/features/admins/components/teacher-util-components";
import { getInitials, truncateString } from "@/utils/string";
import { AnimatePresence } from "motion/react";
import StudentFeesInfo from "./tabs/student-fees-info";
import GuardianInfo from "./tabs/guardian-info";
import ParentsInfo from "./tabs/parent-info";
import StudentSubjects from "./tabs/subjects";
import UpdateStudentPersonalInfo from "./updates/personal-info";
import UpdateStudentParents from "./updates/parents-info";
import UpdateStudentGuardian from "./updates/guardian";
import UpdateImages from "./updates/images";
import UpdateStudentEnrollmentInfo from "./updates/enrollment-info";
import { useDisclosure } from "@/hooks/use-disclosure";
import logo from "/logo.png";
import StudentCard, { type CardSize } from "@/components/custom/student-card";
import { useSignalRStore } from "@/store/signalr.store";

type TabKey = "subjects" | "parents" | "guardian" | "fees";

const StudentDetails = () => {
  const location = useLocation();
  const { studentId } = location.state || {};
  const institutionName = useSignalRStore((s) => s.institution?.name);

  const [activeTab, setActiveTab] = useState<TabKey>("subjects");
  const [modalOpen, setModalOpen] = useState(false); // "choose section" modal
  const [drawerOpen, setDrawerOpen] = useState(false); // actual form drawer
  const [updateKey, setUpdateKey] = useState<UpdateKey>("personal");
  const [size, setSize] = useState<CardSize | null>(null);

  const { isOpen, open, close } = useDisclosure();

  // ── Query ────────────────────────────────────────────
  const { data: student, isLoading } = useFetch({
    queryFn: () => getStuByIdFn(studentId),
    queryKeys: studentKeys.detail(studentId),
    enabled: !!studentId,
  });

  // ── Derived data objects (unchanged shape from original) ─
  const motherdata = useMemo(
    () => ({
      id: student?.parentId || "",
      name: student?.motherFullName || "",
      img: student?.motherImage || "",
      phone: student?.motherContact || "",
      occupation: student?.motherOccupation || "",
      status: student?.motherLivingStatus || "Alive",
    }),
    [student],
  );

  const fatherdata = useMemo(
    () => ({
      studentId: student?.studentId || "",
      id: student?.parentId || "",
      name: student?.fatherFullName || "",
      img: student?.fatherImage || "",
      phone: student?.fatherContact || "",
      occupation: student?.fatherOccupation || "",
      status: student?.fatherLivingStatus || "Alive",
    }),
    [student],
  );

  const guardiandata = useMemo(
    () => ({
      id: student?.guardianId || "",
      name: student?.guardianFullName || "",
      img: student?.guardianImage || "",
      phone: student?.guardianContact || "",
      occupation: student?.guardianOccupation || "",
      address: student?.guardianAddress || "",
      relationship: student?.relationship || "",
      studentId: student?.studentId || "",
    }),
    [student],
  );

  const images = useMemo(
    () => ({
      studentId: student?.studentId || "",
      student: student?.studentImage || "",
      parentId: student?.parentId || "",
      mother: student?.motherImage || "",
      father: student?.fatherImage || "",
      guardianId: student?.guardianId || "",
      guardian: student?.guardianImage || "",
    }),
    [student],
  );

  const personaldata = useMemo(
    () => ({
      id: student?.studentId || "",
      surname: student?.surname || "",
      firstname: student?.firstName || "",
      othername: student?.otherName || "",
      dateOfBirth: student?.dateOfBirth || "",
      gender: student?.gender || "",
      email: student?.email || "",
      contact: student?.contact || "",
      nationality: student?.nationality || "",
      religion: student?.religion || "",
      note: student?.note || "",
      img: student?.studentImage || "",
      phone: student?.contact || "",
      address: student?.address || "",
    }),
    [student],
  );

  const enrollmentdata = useMemo(
    () => ({
      studentId: student?.studentId || "",
      programId: student?.programId || "",
      programName: student?.programName || "",
      subLevelId: student?.subLevelId || "",
      subLevelName: student?.subLevelName || "",
      academicYearId: student?.academicYearId || "",
      startYear: student?.startYear || "",
      endYear: student?.endYear || "",
      academicTermId: student?.academicTermId || "",
      academicTermName: student?.academicTermName || "",
      educationalLevelName: student?.educationalLevelName || "",
      educationalLevelId: student?.educationalLevelId || "",
      academicLevelName: student?.academicLevelName || "",
      academicLevelId: student?.academicLevelId || "",
    }),
    [student],
  );

  const studentSubjectsData = useMemo(
    () => ({
      studentId: student?.studentId || "",
      programId: student?.programId || "",
      subLevelId: student?.subLevelId || "",
      academicYearId: student?.academicYearId || "",
      academicTermId: student?.academicTermId || "",
    }),
    [student],
  );

  // ── Tab content ──────────────────────────────────────
  const tabContent: Record<TabKey, React.ReactNode> = {
    subjects: <StudentSubjects student={studentSubjectsData} />,
    parents: <ParentsInfo mother={motherdata} father={fatherdata} />,
    guardian: <GuardianInfo guardian={guardiandata} />,
    fees: <StudentFeesInfo />,
  };

  // ── Update drawer content ────────────────────────────
  const updateContent: Record<UpdateKey, React.ReactNode> = {
    personal: <UpdateStudentPersonalInfo personalData={personaldata} />,
    parent: <UpdateStudentParents mother={motherdata} father={fatherdata} />,
    guardian: <UpdateStudentGuardian guardian={guardiandata} />,
    imgs: <UpdateImages images={images} />,
    enrollment: <UpdateStudentEnrollmentInfo enrollment={enrollmentdata} />,
  };

  /** Open drawer for a specific update section */
  const openDrawerFor = (key: UpdateKey) => {
    setModalOpen(false);
    setUpdateKey(key);
    // Small delay so modal close animation finishes before drawer opens
    setTimeout(() => setDrawerOpen(true), 160);
  };

  // ── Loading state ────────────────────────────────────
  if (isLoading) {
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
    `${student?.surname ?? ""} ${student?.firstName ?? ""}`.trim() || "Student";
  const initials = getInitials(fullName);
  // const initials = fullName
  //   .split(" ")
  //   .slice(0, 2)
  //   .map((n) => n[0]?.toUpperCase() ?? "")
  //   .join("");

  // ── Render ───────────────────────────────────────────
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
            Student Profile
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Students</span>
            <ChevronRight className="w-3 h-3" />
            <span>View Students</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#0D1B2E] font-semibold truncate max-w-40">
              {fullName}
            </span>
          </nav>
        </div>

        {/* Edit button */}
        <div className="flex items-center gap-x-2">
          {!!student && !!studentId && (
            <button
              type="button"
              onClick={open}
              className="flex items-center gap-x-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
              }}
            >
              <User className="w-3.5 h-3.5 text-[#C9A84C]" />
              Student Card
            </button>
          )}

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-x-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
            }}
          >
            <Pencil className="w-3.5 h-3.5 text-[#C9A84C]" />
            Edit Profile
          </button>
        </div>
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
              {student?.studentImage ? (
                <Image
                  src={buildMediaUrl(student.studentImage)}
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
              {fullName}
            </h2>

            {/* Student ID badge */}
            <span className="mt-1.5 text-[11px] font-bold font-mono text-[#C9A84C] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {student?.studentId ?? "—"}
            </span>

            {/* Status + gender pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              <StatusBadge value={student?.status} />
              <GenderBadge value={student?.gender} />
            </div>

            {/* Age */}
            <div className="mt-4 w-full flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Age
              </span>
              <span className="text-sm font-bold text-[#0D1B2E]">
                {getAgeOutOfDate(student?.dateOfBirth || "")}yrs
              </span>
            </div>
            <div className="w-full h-px bg-slate-100 my-2" />
            <div className="w-full flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                DOB
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {formatDate(student?.dateOfBirth || "")}
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
              value={student?.contact}
            />
            <DetailField
              icon={<Mail className="w-3 h-3" />}
              label="Email"
              value={student?.email}
            />
            <DetailField
              icon={<MapPin className="w-3 h-3" />}
              label="Address"
              value={truncateString(student?.address || "", 20)}
            />
            <DetailField
              icon={<Church className="w-3 h-3" />}
              label="Religion"
              value={student?.religion}
            />
            <DetailField
              icon={<Globe className="w-3 h-3" />}
              label="Nationality"
              value={student?.nationality}
            />
            <DetailField
              icon={<User className="w-3 h-3" />}
              label="Other Name"
              value={student?.otherName}
            />

            {/* Full-width note */}
            {student?.note && (
              <div className="col-span-2 sm:col-span-3 border-t border-slate-100 pt-4 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  Note
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                  {student.note}
                </p>
              </div>
            )}
          </div>
        </MotionDiv>

        {/* ── ENROLLMENT card ── */}
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.11 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <CardHeader
            icon={<GraduationCap className="w-3.5 h-3.5" />}
            title="Enrollment Information"
          />

          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
            <DetailField
              icon={<Building className="w-3 h-3" />}
              label="Edu. Level"
              value={student?.educationalLevelName}
            />
            <DetailField
              icon={<Layers className="w-3 h-3" />}
              label="Aca. Level"
              value={student?.academicLevelName}
            />
            <DetailField
              icon={<Hash className="w-3 h-3" />}
              label="Sub-Level"
              value={student?.subLevelName}
            />
            <DetailField
              icon={<BookOpen className="w-3 h-3" />}
              label="Program"
              value={student?.programName}
            />
            <DetailField
              icon={<Clock className="w-3 h-3" />}
              label="Academic Term"
              value={student?.academicTermName}
            />
            <DetailField
              icon={<Calendar className="w-3 h-3" />}
              label="Enrolled Year"
              value={
                student?.startYear && student?.endYear
                  ? `${student.startYear} / ${student.endYear}`
                  : undefined
              }
            />
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
        <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/50 overflow-x-auto scrollbar-none">
          {(
            [
              {
                key: "subjects",
                icon: <BookOpen className="w-3.5 h-3.5" />,
                label: "Subjects",
              },
              {
                key: "parents",
                icon: <Users className="w-3.5 h-3.5" />,
                label: "Parents Info",
              },
              {
                key: "guardian",
                icon: <Heart className="w-3.5 h-3.5" />,
                label: "Guardian Info",
              },
              {
                key: "fees",
                icon: <CreditCard className="w-3.5 h-3.5" />,
                label: "Fees",
              },
            ] as { key: TabKey; icon: React.ReactNode; label: string }[]
          ).map((tab) => (
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

      {/* ═══ UPDATE MODAL — choose which section ═════ */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={420}
        centered
        closeIcon={
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-3.5 h-3.5 text-slate-500" />
          </div>
        }
        // closable={false}
        styles={{
          body: { padding: 0, overflow: "hidden" },
          container: { padding: 0, borderRadius: 20, overflow: "hidden" },
        }}
        className="student-profile-modal"
      >
        {/* Modal header */}
        <div
          className="flex items-center gap-x-3 px-5 py-4"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C]">
            <UserCog className="w-4 h-4" />
          </div>
          <div>
            <p
              className="text-white font-bold text-sm leading-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Update Profile
            </p>
            <p className="text-white/50 text-[11px] mt-0.5">
              Choose a section to edit
            </p>
          </div>
        </div>

        {/* Update option buttons */}
        <div className="p-4 flex flex-col gap-y-2.5">
          <UpdateOptionBtn
            icon={<User className="w-4 h-4" />}
            label="Personal Information"
            desc="Name, DOB, gender, contact, address"
            onClick={() => openDrawerFor("personal")}
          />
          <UpdateOptionBtn
            icon={<Users className="w-4 h-4" />}
            label="Parents Information"
            desc="Father & mother details, contacts"
            onClick={() => openDrawerFor("parent")}
          />
          <UpdateOptionBtn
            icon={<Heart className="w-4 h-4" />}
            label="Guardian Information"
            desc="Guardian details, relationship"
            onClick={() => openDrawerFor("guardian")}
          />
          <UpdateOptionBtn
            icon={<GraduationCap className="w-4 h-4" />}
            label="Enrollment Information"
            desc="Program, level, sub-level, term"
            onClick={() => openDrawerFor("enrollment")}
          />
          <UpdateOptionBtn
            icon={<ImageIcon className="w-4 h-4" />}
            label="Update Photos"
            desc="Student, parents & guardian photos"
            onClick={() => openDrawerFor("imgs")}
          />
        </div>
      </Modal>

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
              setTimeout(() => setModalOpen(true), 160);
            }}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all cursor-pointer shrink-0"
            title="Back to section selection"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
            {drawerMeta[updateKey].icon}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-white font-bold text-sm leading-tight truncate"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {drawerMeta[updateKey].label}
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
              key={updateKey}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {updateContent[updateKey]}
            </MotionDiv>
          </AnimatePresence>
        </div>
      </Drawer>

      <Modal
        open={isOpen}
        footer={null}
        width={size === "lg" ? 600 : undefined}
        centered
        onCancel={close}
        closable={false}
      >
        <StudentCard
          studentId={studentId!}
          data={student}
          schoolName={institutionName!}
          schoolLogo={logo}
          onSizeChange={(size) => {
            setSize(size);
          }}
        />
      </Modal>
    </div>
  );
};
export default StudentDetails;
