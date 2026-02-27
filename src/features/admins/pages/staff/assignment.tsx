import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Popconfirm, Select, Table, Tooltip } from "antd";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Construction,
  GraduationCap,
  LayoutGrid,
  Link2,
  ListChecks,
  Search,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CardHeader,
  EmptyState,
  PreferenceCard,
  PreviewTabBtn,
  SectionDivider,
  TeacherChip,
  type PreviewTab,
} from "../../components/teacher-util-components";
import useFetch from "@/hooks/api/use-fetch";
import {
  createTeacherMapFn,
  deleteTeachersSubjectFn,
  deleteTeachersSublevelFn,
  getAllTeachersFn,
  getTeachersSubjectsFn,
} from "@/services/staff";
import {
  eduKeys,
  programKeys,
  staffKeys,
  subjectKeys,
} from "@/config/query-keys";
import {
  getAllProgramsFn,
  getAllSubjectsFn,
} from "@/services/setup/study-module";
import { getAllSubLevelsFn } from "@/services/setup/sublevel";
import usePost from "@/hooks/api/use-post";
import type { ColumnsType } from "antd/es/table";
import type { SubjectGet } from "@/types/api/setup/study-modules";
import type { SubLevelGet } from "@/types/api/setup/sublevel";
import { MotionDiv } from "@/components/custom/motion";
import { AnimatePresence } from "motion/react";
import { FL } from "../../components/util-components";

interface FormValues {
  SubLevelIds: string;
  SubjectIds?: string[];
  ProgramId?: string;
}

const StaffAssignment = () => {
  // states
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const [selectedTeacher, setSelectedTeacher] = useState<SelectTypes | null>(
    null,
  );
  const [preference, setPreference] = useState<"ProgramId" | "SubjectIds">(
    "ProgramId",
  );
  const [previewTab, setPreviewTab] = useState<PreviewTab>("subjects");
  const teacherId = selectedTeacher?.value;

  // ── Queries ─────────────────────────────────────────────
  const { data: allTeachers, isLoading: loadingTeachers } = useFetch({
    queryFn: getAllTeachersFn,
    queryKeys: staffKeys.custom("all-teachers"),
  });
  const { data: subjects, isLoading: loadingSubjects } = useFetch({
    queryFn: getAllSubjectsFn,
    queryKeys: subjectKeys.list(),
  });
  const { data: programs, isLoading: loadingPrograms } = useFetch({
    queryFn: getAllProgramsFn,
    queryKeys: programKeys.list(),
  });
  const { data: sublevels, isLoading: loadingSubLevels } = useFetch({
    queryFn: getAllSubLevelsFn,
    queryKeys: eduKeys.sublevels(),
  });
  const { data: teachersData, isLoading: loadingTeacherData } = useFetch({
    queryFn: () => getTeachersSubjectsFn(teacherId!),
    queryKeys: subjectKeys.custom("teacher", { teacherId }),
    enabled: !!teacherId,
  });

  // memoized
  // ── Derived ──────────────────────────────────────────────
  const subjectDataSource = useMemo(() => {
    if (!teachersData) return [];
    return teachersData.subjects;
  }, [teachersData]);

  const subLevelDataSource = useMemo(() => {
    if (!teachersData) return [];
    return teachersData.subLevels;
  }, [teachersData]);

  const teacherOptions = useMemo(
    () =>
      allTeachers?.map((t) => ({
        label: `${t.firstName} ${t.lastName}`,
        value: t.staffId,
      })) ?? [],
    [allTeachers],
  );
  const subLevelOptions = useMemo(
    () =>
      sublevels?.map((l) => ({
        label: l.subLevelAlias ? `${l.subLevelName}` : l.subLevelName,
        value: l.subLevelId,
      })) ?? [],
    [sublevels],
  );
  const programOptions = useMemo(
    () =>
      programs?.map((p) => ({ label: p.programName, value: p.programId })) ??
      [],
    [programs],
  );
  const subjectOptions = useMemo(
    () =>
      subjects?.map((s) => ({ label: s.subjectName, value: s.subjectId })) ??
      [],
    [subjects],
  );

  const invalidate = () => {
    qc.invalidateQueries({
      queryKey: subjectKeys.custom("teacher", { teacherId }),
    });
  };

  // mutations
  const { mutate: mapTeacher, isPending: mappingTeacher } = usePost({
    postFn: createTeacherMapFn,
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage, {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        });
        // Reset only the assignment-specific fields, keep teacher selected
        form.resetFields(["SubLevelIds", "SubjectIds", "ProgramId"]);
      } else {
        // Parse + group warning messages
        parseAndToastWarnings(responseMessage);
      }
      invalidate();
    },
    onError: (err) => {
      toast.error(`Failed to create teacher map`, {
        description: err?.message,
      });
    },
  });
  const { mutate: removeSubject, isPending: removingSubject } = usePost({
    postFn: deleteTeachersSubjectFn,
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage);
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to delete teacher map`, {
        description: err?.message,
      });
    },
  });
  const { mutate: removeSubLevel, isPending: removingSubLevel } = usePost({
    postFn: deleteTeachersSublevelFn,
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage);
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to delete teacher map`, {
        description: err?.message,
      });
    },
  });

  // ── Form submit ──────────────────────────────────────────
  const onFinish = (values: FormValues) => {
    if (!teacherId) {
      toast.error("Please select a teacher first");
      return;
    }
    const payload = {
      TeacherId: selectedTeacher.value,
      SubLevelIds: values.SubLevelIds ? [values.SubLevelIds] : [],
      ProgramId: preference === "ProgramId" ? values.ProgramId : undefined,
      SubjectIds: preference === "SubjectIds" ? (values.SubjectIds ?? []) : [],
    };
    mapTeacher(payload);
  };

  // ── Table columns ────────────────────────────────────────
  const subjectColumns: ColumnsType<SubjectGet> = [
    {
      key: "subjectName",
      dataIndex: "subjectName",
      title: "Subject",
      render: (v: string) => (
        <span className="font-semibold text-[#0D1B2E] capitalize text-sm flex items-center gap-x-2">
          <BookOpen className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
          {v}
        </span>
      ),
    },
    {
      key: "action",
      title: "",
      width: 52,
      align: "right",
      render: (_, row) => (
        <Tooltip title="Remove subject from teacher">
          <Popconfirm
            title="Remove this subject?"
            description="This teacher will no longer be assigned to this subject."
            okText="Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true, size: "small" }}
            cancelButtonProps={{ size: "small" }}
            onConfirm={() =>
              removeSubject({
                teacherId: selectedTeacher!.value,
                subjectId: row.subjectId,
              })
            }
          >
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-rose-50 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-150 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Popconfirm>
        </Tooltip>
      ),
    },
  ];

  const subLevelColumns: ColumnsType<SubLevelGet> = [
    {
      key: "subLevelName",
      dataIndex: "subLevelName",
      title: "Sub-Level",
      render: (v: string) => (
        <span className="font-semibold text-[#0D1B2E] capitalize text-sm flex items-center gap-x-2">
          <LayoutGrid className="w-3.5 h-3.5 text-[#1E3A5F] shrink-0" />
          {v}
        </span>
      ),
    },
    {
      key: "alias",
      dataIndex: "subLevelAlias",
      title: "Alias",
      width: 100,
      render: (v: string) => (
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {v ?? "—"}
        </span>
      ),
    },
    {
      key: "action",
      title: "",
      width: 52,
      align: "right",
      render: (_, row) => (
        <Tooltip title="Remove sub-level from teacher">
          <Popconfirm
            title="Remove this sub-level?"
            description="This teacher will no longer be assigned to this sub-level."
            okText="Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true, size: "small" }}
            cancelButtonProps={{ size: "small" }}
            onConfirm={() =>
              removeSubLevel({
                teacherId: selectedTeacher!.value,
                subLevelId: row.subLevelId,
              })
            }
          >
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-rose-50 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-150 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Popconfirm>
        </Tooltip>
      ),
    },
  ];

  const isPending =
    mappingTeacher || removingSubject || removingSubLevel || loadingTeacherData;

  // ── Render ───────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* ── Page header ──────────────────────────────────── */}
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
          Staff Assignment
        </h1>
        <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
          <span className="text-[#1E3A5F] font-semibold">Staff</span>
          <ChevronRight className="w-3 h-3" />
          <span>Teachers Assignment</span>
        </nav>
      </MotionDiv>

      {/* ═══ ZONE ① — Teacher selector ═══════════════════ */}
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.04 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-5"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <CardHeader
          icon={<Users className="w-4 h-4" />}
          title="Select Teacher"
          meta={
            <span className="text-[10px] text-white/40 font-medium tracking-wide">
              Step 1 of 2
            </span>
          }
        />

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            {/* Picker */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Teaching Staff
              </p>
              <Select
                size="large"
                labelInValue
                showSearch={{
                  filterOption: (input, opt) =>
                    String(opt?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase()),
                }}
                placeholder={
                  <span className="flex items-center gap-x-1.5 text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                    Search teacher by name…
                  </span>
                }
                className="w-full"
                options={teacherOptions}
                loading={loadingTeachers}
                disabled={loadingTeachers}
                onChange={(opt) => {
                  const sel = { value: opt.value, label: opt.label as string };
                  setSelectedTeacher(sel);
                  // Also update the form field so validation passes
                  form.setFieldValue("Teacher", sel);
                }}
                value={selectedTeacher ?? undefined}
              />
            </div>

            {/* Selected chip */}
            <AnimatePresence>
              {selectedTeacher && (
                <MotionDiv
                  key="chip"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="sm:col-span-1 lg:col-span-2"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Selected
                  </p>
                  <TeacherChip
                    name={selectedTeacher.label}
                    subjectCount={subjectDataSource.length}
                    subLevelCount={subLevelDataSource.length}
                    onClear={() => {
                      setSelectedTeacher(null);
                      form.resetFields();
                    }}
                  />
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>

          {/* Info hint */}
          <div className="mt-4 p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 flex items-start gap-x-3">
            <UserCog className="w-4 h-4 text-[#1E3A5F] mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-[#1E3A5F]">How it works: </span>
              Select a teacher, then assign them a sub-level (class) and
              subjects below. Subjects can come from a whole program or be
              picked individually. The right panel shows their existing
              assignments in real time.
            </p>
          </div>
        </div>
      </MotionDiv>

      {/* ═══ ZONE ② + ③ — Form + Preview ════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* ════ LEFT – Assignment form ════════════════════ */}
        <MotionDiv
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <CardHeader
            icon={<Link2 className="w-4 h-4" />}
            title="Assignment Details"
            meta={
              <span className="text-[10px] text-white/40 font-medium tracking-wide">
                Step 2 of 2
              </span>
            }
          />

          <div className="p-5">
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={onFinish}
              className="flex flex-col gap-y-0"
            >
              {/* Hidden teacher field for validation */}
              <Form.Item name="Teacher" noStyle>
                <input type="hidden" />
              </Form.Item>

              {/* ── Sub-level ─────────────────────────── */}
              <SectionDivider label="Class / Sub-Level" />

              <Form.Item
                name="SubLevelIds"
                label={<FL>Assign to Sub-Level</FL>}
                className="mb-0!"
                rules={[
                  { required: true, message: "Please select a sub-level" },
                ]}
              >
                <Select
                  size="large"
                  showSearch={{
                    filterOption: (input, opt) =>
                      String(opt?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase()),
                  }}
                  placeholder={
                    selectedTeacher
                      ? "Select the class"
                      : "Select a teacher first"
                  }
                  options={subLevelOptions}
                  loading={loadingSubLevels}
                  disabled={loadingSubLevels || !selectedTeacher}
                />
              </Form.Item>

              {/* ── Subjects ──────────────────────────── */}
              <SectionDivider label="Subject Assignment" />

              {/* Preference toggle */}
              <div className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Assign Subjects By
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <PreferenceCard
                    // value="ProgramId"
                    active={preference === "ProgramId"}
                    icon={<GraduationCap className="w-4 h-4" />}
                    label="By Program"
                    desc="All subjects in a program"
                    onClick={() => {
                      setPreference("ProgramId");
                      form.resetFields(["SubjectIds"]);
                    }}
                  />
                  <PreferenceCard
                    // value="SubjectIds"
                    active={preference === "SubjectIds"}
                    icon={<ListChecks className="w-4 h-4" />}
                    label="Custom Pick"
                    desc="Choose subjects manually"
                    onClick={() => {
                      setPreference("SubjectIds");
                      form.resetFields(["ProgramId"]);
                    }}
                  />
                </div>
              </div>

              {/* Conditional field */}
              <AnimatePresence mode="wait">
                {preference === "ProgramId" ? (
                  <MotionDiv
                    key="program-field"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.16 }}
                  >
                    <Form.Item
                      name="ProgramId"
                      label={<FL>Program</FL>}
                      className="mb-0!"
                    >
                      <Select
                        size="large"
                        showSearch
                        placeholder={
                          selectedTeacher
                            ? "Select a program"
                            : "Select a teacher first"
                        }
                        options={programOptions}
                        loading={loadingPrograms}
                        disabled={loadingPrograms || !selectedTeacher}
                        filterOption={(input, opt) =>
                          String(opt?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>
                  </MotionDiv>
                ) : (
                  <MotionDiv
                    key="subjects-field"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.16 }}
                  >
                    <Form.Item
                      name="SubjectIds"
                      label={<FL>Subjects</FL>}
                      className="mb-0!"
                    >
                      <Select
                        size="large"
                        mode="multiple"
                        showSearch={{
                          filterOption: (input, opt) =>
                            String(opt?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase()),
                        }}
                        placeholder={
                          selectedTeacher
                            ? "Pick one or more subjects"
                            : "Select a teacher first"
                        }
                        options={subjectOptions}
                        loading={loadingSubjects}
                        disabled={loadingSubjects || !selectedTeacher}
                        maxTagCount="responsive"
                      />
                    </Form.Item>
                  </MotionDiv>
                )}
              </AnimatePresence>

              {/* Submit ─────────────────────────────────── */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isPending || !selectedTeacher}
                  className={`
                    w-full h-11 rounded-xl font-bold text-sm tracking-wide
                    flex items-center justify-center gap-x-2.5 transition-all duration-200
                    ${
                      isPending || !selectedTeacher
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "text-white hover:opacity-90 active:scale-[0.98] cursor-pointer"
                    }
                  `}
                  style={
                    !isPending && selectedTeacher
                      ? {
                          background:
                            "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
                        }
                      : {}
                  }
                >
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      {mappingTeacher ? "Assigning…" : "Removing…"}
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 text-[#C9A84C]" />
                      Assign to {selectedTeacher?.label ?? "Teacher"}
                    </>
                  )}
                </button>
              </div>
            </Form>
          </div>
        </MotionDiv>

        {/* ════ RIGHT – Tabbed preview panel ══════════════ */}
        <MotionDiv
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <CardHeader
            icon={<ListChecks className="w-4 h-4" />}
            title={
              selectedTeacher
                ? `${selectedTeacher.label} — Assignments`
                : "Current Assignments"
            }
          />

          {/* Tab bar */}
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <PreviewTabBtn
              // tabKey="subjects"
              active={previewTab === "subjects"}
              icon={<BookOpen className="w-3.5 h-3.5" />}
              label="Subjects"
              count={subjectDataSource.length}
              onClick={() => setPreviewTab("subjects")}
            />
            <PreviewTabBtn
              // tabKey="sublevels"
              active={previewTab === "sublevels"}
              icon={<LayoutGrid className="w-3.5 h-3.5" />}
              label="Sub-Levels"
              count={subLevelDataSource.length}
              onClick={() => setPreviewTab("sublevels")}
            />
          </div>

          {/* Tab body */}
          <AnimatePresence mode="wait">
            {!selectedTeacher ? (
              <MotionDiv
                key="no-teacher"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState
                  icon={<Users className="w-6 h-6 text-slate-300" />}
                  message="No teacher selected"
                  sub="Select a teacher above to view their current assignments"
                />
              </MotionDiv>
            ) : previewTab === "subjects" ? (
              <MotionDiv
                key="subjects-panel"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Table
                  columns={subjectColumns}
                  dataSource={subjectDataSource}
                  rowKey="subjectId"
                  loading={loadingTeacherData}
                  size="middle"
                  showHeader={false}
                  pagination={{ pageSize: 8, showSizeChanger: false }}
                  locale={{
                    emptyText: (
                      <EmptyState
                        icon={<BookOpen className="w-6 h-6 text-slate-300" />}
                        message="No subjects assigned yet"
                        sub="Assign subjects using the form on the left"
                      />
                    ),
                  }}
                />
              </MotionDiv>
            ) : (
              <MotionDiv
                key="sublevels-panel"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Table
                  columns={subLevelColumns}
                  dataSource={subLevelDataSource}
                  rowKey="subLevelId"
                  loading={loadingTeacherData}
                  size="middle"
                  showHeader={false}
                  pagination={{ pageSize: 8, showSizeChanger: false }}
                  locale={{
                    emptyText: (
                      <EmptyState
                        icon={<LayoutGrid className="w-6 h-6 text-slate-300" />}
                        message="No sub-levels assigned yet"
                        sub="Assign a sub-level using the form on the left"
                      />
                    ),
                  }}
                />
              </MotionDiv>
            )}
          </AnimatePresence>
        </MotionDiv>
      </div>

      {/* ═══ ZONE ④ — Non-teaching staff placeholder ═════ */}
      <MotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="mt-5 bg-white rounded-2xl border border-dashed border-slate-200 overflow-hidden"
        style={{ boxShadow: "0 1px 6px rgba(13,27,46,0.04)" }}
      >
        <div className="flex items-start gap-x-4 px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
            <Construction className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-x-3 flex-wrap gap-y-1">
              <p
                className="font-bold text-slate-600 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Non-Teaching Staff Assignments
              </p>
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Facility assignments for non-teaching staff — libraries, science
              labs, computer labs, and other institutional resources — will be
              available here in a future update.
            </p>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};
export default StaffAssignment;

function parseAndToastWarnings(rawMsg: string): void {
  if (!rawMsg) return;

  const cleaned = rawMsg.replace(/^Warnings:\s*/i, "").trim();
  const parts = cleaned
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  type Hit = { subject: string; teacher: string };

  const hits: Hit[] = parts.flatMap((part) => {
    const subMatch = part.match(/Subject\s+(.+?)\s+already assigned/i);
    const tchMatch = part.match(/teacher\s+(.+?)\s+in\s+Sub-Level/i);
    return subMatch && tchMatch
      ? [{ subject: subMatch[1].trim(), teacher: tchMatch[1].trim() }]
      : [];
  });

  // Fallback: no structured data found — just show raw
  if (!hits.length) {
    toast.warning(cleaned, { duration: 6000 });
    return;
  }

  // Group by teacher name
  const grouped = hits.reduce<Record<string, string[]>>(
    (acc, { subject, teacher }) => {
      if (!acc[teacher]) acc[teacher] = [];
      acc[teacher].push(subject);
      return acc;
    },
    {},
  );

  // One toast per teacher
  Object.entries(grouped).forEach(([teacher, subjects]) => {
    toast.warning(
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <p className="font-bold text-sm text-amber-800 mb-1">{teacher}</p>
        <p className="text-xs text-amber-700">
          Already assigned to:{" "}
          <span className="font-semibold">{subjects.join(", ")}</span>
        </p>
      </div>,
      {
        duration: 7000,
        icon: (
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        ),
      },
    );
  });
}
