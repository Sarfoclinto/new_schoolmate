import { MotionDiv } from "@/components/custom/motion";
import type { GuardianStudentMapPost } from "@/types/api/guardian";
import type { GuardianOption } from "@/types/api/guardian";
import { Form } from "antd";
import {
  X,
  Shield,
  User,
  Users,
  Link2,
  GraduationCap,
  Phone,
  Hash,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import GuardianSearchSelect from "../../components/guardian-select-search";
import StudentSearchSelect from "../../components/student-select-search";
import { useState } from "react";
import type { StudentOption } from "@/types/api/student";
import usePost from "@/hooks/api/use-post";
import { mapStudentToGuardianFn } from "@/services/guardian";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { guardianKeys } from "@/config/query-keys";

type Props = {
  isOpen: boolean;
  close: () => void;
  count: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const Initials = ({
  name,
  size = 32,
  variant = "navy",
}: {
  name: string;
  size?: number;
  variant?: "navy" | "gold" | "slate";
}) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  const bg =
    variant === "navy"
      ? "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)"
      : variant === "gold"
        ? "linear-gradient(135deg,#C9A84C 0%,#E8C76A 100%)"
        : "linear-gradient(135deg,#64748B 0%,#94A3B8 100%)";

  const text = variant === "gold" ? "#0D1B2E" : "#C9A84C";

  return (
    <div
      className="rounded-xl flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: bg,
        color: text,
        fontSize: size * 0.31,
      }}
    >
      {initials || "?"}
    </div>
  );
};

// ─── Live mapping tree ────────────────────────────────────────────────────────
const MappingTree = ({
  guardian,
  students,
}: {
  guardian: GuardianOption | null;
  students: StudentOption[];
}) => {
  const hasGuardian = !!guardian;
  const hasStudents = students.length > 0;
  const isReady = hasGuardian && hasStudents;

  if (!hasGuardian && !hasStudents) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
        className="mt-5"
      >
        {/* Section label */}
        <div className="flex items-center gap-x-2 mb-3">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-1.5">
            <Link2 className="w-3 h-3" />
            Mapping Preview
          </span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        {/* Tree card */}
        <div
          className="rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          {/* Status banner */}
          <div
            className={`flex items-center gap-x-2 px-4 py-2.5 text-xs font-bold
              ${
                isReady
                  ? "bg-emerald-50 border-b border-emerald-100 text-emerald-700"
                  : "bg-[#EEF2F8] border-b border-[#D0DCF0] text-[#1E3A5F]"
              }`}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready to create mapping
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                {!hasGuardian
                  ? "Select a guardian to begin"
                  : "Select students to map"}
              </>
            )}
          </div>

          <div className="p-4">
            {/* ── Guardian node ── */}
            <AnimatePresence mode="wait">
              {hasGuardian && guardian ? (
                <motion.div
                  key="guardian"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center gap-x-3 px-3.5 py-3 rounded-xl bg-[#EEF2F8] border border-[#D0DCF0]"
                >
                  <Initials
                    name={guardian.guardianName}
                    size={36}
                    variant="navy"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm text-[#0D1B2E] truncate"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {guardian.guardianName}
                    </p>
                    <div className="flex items-center gap-x-2 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-x-1 text-[10px] text-slate-500">
                        <Phone className="w-2.5 h-2.5" />
                        {guardian.guardianContact}
                      </span>
                      <span className="flex items-center gap-x-1 text-[10px] text-slate-500">
                        <Users className="w-2.5 h-2.5" />
                        {guardian.guardianWardCount} ward
                        {guardian.guardianWardCount !== 1 ? "s" : ""} existing
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-black text-[#1E3A5F] bg-white border border-[#D0DCF0] px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Guardian
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="guardian-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-x-3 px-3.5 py-3 rounded-xl border border-dashed border-slate-200 bg-slate-50"
                >
                  <div className="w-9 h-9 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                    <Shield className="w-4 h-4" />
                  </div>
                  <p
                    className="text-sm text-slate-400 italic"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Guardian not selected yet
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Connector lines + student nodes ── */}
            {(hasGuardian || hasStudents) && (
              <div className="ml-5 mt-0 relative">
                {/* Vertical stem */}
                <div
                  className="absolute left-0 top-0 w-0.5 bg-slate-200 rounded-full"
                  style={{ height: `${Math.max(1, students.length) * 60}px` }}
                />

                <div className="flex flex-col gap-y-2 pt-2 pb-1">
                  {/* Mapped students */}
                  <AnimatePresence mode="popLayout">
                    {students.map((stu, i) => (
                      <motion.div
                        key={stu.studentId}
                        layout
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8, height: 0 }}
                        transition={{ duration: 0.22, delay: i * 0.05 }}
                        className="flex items-center gap-x-2 relative"
                      >
                        {/* Horizontal branch */}
                        <div className="w-5 h-0.5 bg-slate-200 shrink-0" />

                        {/* Student card */}
                        <div
                          className="flex-1 flex items-center gap-x-2.5 px-3 py-2.5 rounded-xl bg-white border border-slate-100 min-w-0"
                          style={{ boxShadow: "0 1px 4px rgba(13,27,46,0.05)" }}
                        >
                          <Initials
                            name={stu.fullName}
                            size={30}
                            variant="slate"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-xs text-[#0D1B2E] truncate"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {stu.fullName}
                            </p>
                            <div className="flex items-center gap-x-2 mt-0.5 flex-wrap">
                              {stu.subLevelName && (
                                <span className="flex items-center gap-x-1 text-[10px] text-slate-400">
                                  <GraduationCap className="w-2.5 h-2.5" />
                                  {stu.subLevelName}
                                </span>
                              )}
                              <span className="flex items-center gap-x-1 text-[10px] text-slate-400">
                                <Hash className="w-2.5 h-2.5" />
                                {stu?.studentId?.slice(0, 8)}…
                              </span>
                            </div>
                          </div>
                          {/* Already has a guardian indicator */}
                          {stu.guardianId &&
                            stu.guardianId !== guardian?.guardianId && (
                              <div
                                title={`Already linked to ${stu.guardianName}`}
                                className="shrink-0 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap"
                              >
                                Has guardian
                              </div>
                            )}
                          {stu.guardianId &&
                            stu.guardianId === guardian?.guardianId && (
                              <div className="shrink-0 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                Already linked
                              </div>
                            )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty student placeholder */}
                  {students.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-x-2"
                    >
                      <div className="w-5 h-0.5 bg-slate-200 shrink-0" />
                      <div className="flex-1 flex items-center gap-x-2.5 px-3 py-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60">
                        <div className="w-7 h-7 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <p
                          className="text-xs text-slate-400 italic"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          No students selected yet
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* ── Summary footer ── */}
            <AnimatePresence>
              {isReady && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mt-3 pt-3 border-t border-slate-100"
                >
                  <div
                    className="flex items-center gap-x-2 text-xs text-slate-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <Initials
                      name={guardian!.guardianName}
                      size={18}
                      variant="navy"
                    />
                    <span className="font-semibold text-[#0D1B2E]">
                      {guardian!.guardianName}
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="font-bold text-[#1E3A5F]">
                      {students.length} student
                      {students.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-slate-300">will be linked</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DRAWER
// ═══════════════════════════════════════════════════════════════════════════════
const GuardianMap = ({ close, isOpen, count }: Props) => {
  const [form] = Form.useForm<GuardianStudentMapPost>();
  const qc = useQueryClient();

  // Track selected objects for the live preview
  const [selectedGuardian, setSelectedGuardian] =
    useState<GuardianOption | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([]);

  const handleClose = () => {
    close();
    // slight delay so the exit animation plays before reset
    setTimeout(() => {
      form.resetFields();
      setSelectedGuardian(null);
      setSelectedStudents([]);
    }, 320);
  };

  const { mutate, isPending } = usePost({
    postFn: mapStudentToGuardianFn,
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
        qc.invalidateQueries({
          queryKey: guardianKeys.custom("without-wards"),
        });
      } else {
        toast.warning(responseMessage);
      }
    },
    onError: (err) =>
      toast.error("An error occurred", { description: err.message }),
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <MotionDiv
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{
              background: "rgba(13,27,46,0.35)",
              backdropFilter: "blur(2px)",
            }}
            onClick={handleClose}
          />

          {/* Drawer panel */}
          <MotionDiv
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 bg-white flex flex-col"
            style={{
              width: "min(520px, 100vw)",
              boxShadow: "-8px 0 40px rgba(13,27,46,0.15)",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center gap-x-3 px-5 py-4 shrink-0"
              style={{
                background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
                <Link2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-white font-bold text-sm leading-tight"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Map Guardian to Student(s)
                </p>
                <p className="text-white/50 text-[11px] mt-0.5">
                  {count} mapping{count !== 1 ? "s" : ""} exist
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 flex flex-col gap-y-1">
                {/* ── Form ── */}
                <Form<GuardianStudentMapPost>
                  form={form}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={(values) => {
                    mutate(values);
                  }}
                >
                  {/* Guardian select */}
                  <Form.Item
                    name="guardianId"
                    label={
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Guardian
                      </span>
                    }
                    rules={[
                      { required: true, message: "Guardian is required" },
                    ]}
                    className="mb-4!"
                  >
                    <GuardianSearchSelect
                      allowClear
                      onGuardianSelect={(g) => setSelectedGuardian(g)}
                      onChange={(val) => {
                        if (!val) setSelectedGuardian(null);
                      }}
                    />
                  </Form.Item>

                  {/* Student(s) select */}
                  <Form.Item
                    name="studentIds"
                    label={
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Student(s)
                      </span>
                    }
                    rules={[
                      { required: true, message: "Student(s) is required" },
                      {
                        type: "array",
                        min: 1,
                        message: "At least 1 student is required",
                      },
                    ]}
                    className="mb-0!"
                  >
                    <StudentSearchSelect
                      mode="multiple"
                      allowClear
                      onStudentSelect={(stus) => {
                        setSelectedStudents(() => {
                          return stus;
                        });
                      }}
                      // onChange={(vals) => {
                      //   console.log("onchange values: ", vals);
                      //   // When user removes a chip, sync the preview
                      //   const ids = Array.isArray(vals)
                      //     ? (vals as string[])
                      //     : [];
                      //   setSelectedStudents((prev) =>
                      //     prev.filter((s) => ids.includes(s.studentId)),
                      //   );
                      // }}
                    />
                  </Form.Item>
                </Form>

                {/* ── Live mapping tree ── */}
                <MappingTree
                  guardian={selectedGuardian}
                  students={selectedStudents}
                />
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="shrink-0 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 h-11 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => form.submit()}
                  disabled={
                    !selectedGuardian ||
                    selectedStudents.length === 0 ||
                    isPending
                  }
                  className={`flex-2 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-x-2 transition-all
                    ${
                      (selectedGuardian && selectedStudents.length > 0) ||
                      isPending
                        ? "text-white hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-[0_4px_14px_rgba(13,27,46,0.2)]"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  style={
                    selectedGuardian && selectedStudents.length > 0
                      ? {
                          background:
                            "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
                          fontFamily: "'DM Sans', sans-serif",
                        }
                      : { fontFamily: "'DM Sans', sans-serif" }
                  }
                >
                  <Link2
                    className={`w-4 h-4 ${selectedGuardian && selectedStudents.length > 0 ? "text-[#C9A84C]" : ""}`}
                  />
                  {selectedStudents.length > 0
                    ? `Create Mapping (${selectedStudents.length})`
                    : "Create Mapping"}
                </button>
              </div>
              {selectedGuardian && selectedStudents.length > 0 && (
                <p
                  className="text-center text-[11px] text-slate-400 mt-2"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {selectedGuardian.guardianName} will be linked to{" "}
                  {selectedStudents.length} student
                  {selectedStudents.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};

export default GuardianMap;
