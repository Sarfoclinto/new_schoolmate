import {
  educationKeys,
  remarksKeys,
  studentKeys,
  termKeys,
  yearKeys,
} from "@/config/query-keys";
import { SetupPage } from "@/features/admins/components/setup-page";
import { TableActions } from "@/features/admins/components/table-action";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import {
  createRemarkFn,
  deleteRemarkFn,
  getRemarksFn,
} from "@/services/remarks";
import { getAllYearsFn, getTermsBySubIdFn } from "@/services/setup/year-n-term";
import { getTeachersSublevelsFn } from "@/services/staff";
import { getAllSubLevelStuFn } from "@/services/student";
import { useAuth } from "@/store/auth.store";
import type { Remark, RemarkPayload } from "@/types/api/remarks";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ClipboardCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type FormValues = Omit<RemarkPayload, "teacherId">;

const PrincipalTeacherRemarks = () => {
  // states
  const [form] = Form.useForm<FormValues>();
  const [record, setRecord] = useState<Remark | null>(null);
  const userId = useAuth((s) => s.user?.userId);
  const qc = useQueryClient();

  // params
  const teacherId = useAuth((s) => s.user?.userId) ?? "";
  const subLevelId = Form.useWatch("subLevelId", form);
  const academicYearId = Form.useWatch("academicYearId", form);
  const academicTermId = Form.useWatch("academicTermId", form);

  // queries
  const { data: subLevelData, isLoading: loadingSubs } = useFetch({
    queryKeys: educationKeys.custom("teacher-sublevels", {
      teacherId: userId,
    }),
    queryFn: () => getTeachersSublevelsFn(userId ?? ""),
    enabled: !!userId,
  });
  const { data: remarks = [], isLoading: loadingRemarks } = useFetch({
    queryFn: () =>
      getRemarksFn({ teacherId, subLevelId, academicYearId, academicTermId }),
    queryKeys: remarksKeys.list({
      teacherId,
      subLevelId,
      academicYearId,
      academicTermId,
    }),
    enabled:
      !!teacherId && !!subLevelId && !!academicYearId && !!academicTermId,
  });
  const { data: subStudents, isLoading: subStuLoading } = useFetch({
    queryFn: () => getAllSubLevelStuFn(subLevelId!),
    queryKeys: studentKeys.custom("by-sub-level", {
      subLevelId,
    }),
    enabled: !!subLevelId,
  });
  const { data: years = [], isLoading: loadingYears } = useFetch({
    queryKeys: yearKeys.list(),
    queryFn: getAllYearsFn,
  });
  const { data: terms = [], isLoading: loadingTerms } = useFetch({
    queryKeys: termKeys.list({ subLevelId }),
    queryFn: () => getTermsBySubIdFn(subLevelId!),
    enabled: !!subLevelId,
  });

  // fns
  const invalidate = () => qc.invalidateQueries({ queryKey: remarksKeys.all });

  // mutations
  const { mutate: addRemark, isPending: addingRemark } = usePost({
    postFn: createRemarkFn,
    mutationOptions: { mutationKey: ["remarks", "create"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage);
        onReset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create remark`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteRemark, isPending: deletingRemark } = usePost({
    postFn: deleteRemarkFn,
    mutationOptions: { mutationKey: ["remarks", "delete"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();
        toast.success(responseMessage);
        onReset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create remark`, {
        description: err?.message,
      });
    },
  });

  // fns
  const onFinish = (values: FormValues) => {
    const payload: RemarkPayload = {
      ...values,
      teacherId: userId ?? "",
      id: record?.id ?? null,
    };
    addRemark(payload);
  };
  const onReset = () => {
    setRecord(null);
    form.resetFields(["studentId", "remarks"]);
  };

  // memoized
  const subLevelsOptions = useMemo(
    () =>
      subLevelData?.subLevels.map((s) => ({
        label: s.subLevelName,
        value: s.subLevelId,
      })) ?? [],
    [subLevelData],
  );
  const subStudentsOptions = useMemo(
    () =>
      subStudents?.map((s) => ({
        label: `${s.fullName}`,
        value: s.studentId,
      })) ?? [],
    [subStudents],
  );
  const yearsOptions = useMemo(
    () =>
      years?.map((y) => ({
        label: `${y.startYear}-${y.endYear}`,
        value: y.academicYearId,
      })) ?? [],
    [years],
  );
  const termsOptions = useMemo(() => {
    return (
      terms?.map((t) => ({
        label: t.academicTermName,
        value: t.academicTermId,
      })) ?? []
    );
  }, [terms]);

  // data
  const columns: ColumnsType<Remark> = [
    {
      key: "Student",
      title: "Student",
      render: (_, r) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{`${r.firstName} ${r.lastName}`}</span>
      ),
      width: "30%",
    },
    {
      key: "remark",
      title: "Remark",
      dataIndex: "remark",
      render: (v) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "action",
      title: "Actions",
      width: 100,
      align: "right",
      render: (_, row) => (
        <TableActions
          onEdit={() => {}}
          onDelete={() => {}}
          onConfirmDelete={() => deleteRemark(row.id!)}
          onCancelDelete={() => toast.info("Deletion aborted")}
          deleteTitle="Delete this remark?"
        />
      ),
    },
  ];

  const isPending = addingRemark || deletingRemark;

  return (
    <SetupPage
      title="Remarks"
      breadcrumb={["Student Report", "Remarks"]}
      icon={<ClipboardCheck className="w-4 h-4" />}
      hint={{
        note: "Set up the remarks for student terminal report.",
        example: "Well done!, Well behaved!, etc",
      }}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        deletingRemark ? "Deleting…" : addingRemark ? "Adding…" : "Add Remark"
      }
      tableProps={{
        columns,
        dataSource: remarks,
        loading: loadingRemarks,
        rowKey: "id",
        showHeader: false,
      }}
      formContent={
        <>
          <Form.Item
            name="subLevelId"
            label="Select sublevel"
            rules={[{ required: true, message: "Sublevel is required" }]}
          >
            <Select
              placeholder="Select sublevel"
              showSearch
              allowClear
              size="large"
              options={subLevelsOptions}
              loading={loadingSubs}
              disabled={loadingSubs}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-x-2">
            <Form.Item
              name="academicYearId"
              label="Select academic year"
              rules={[{ required: true, message: "Academic year is required" }]}
            >
              <Select
                placeholder="Select year"
                size="large"
                options={yearsOptions}
                loading={loadingYears}
                disabled={loadingYears}
              />
            </Form.Item>

            <Form.Item
              name="academicTermId"
              label="Select academic term"
              rules={[{ required: true, message: "Term is required" }]}
            >
              <Select
                placeholder={
                  subLevelId ? "Select sublevel" : "Select sublevel first"
                }
                size="large"
                options={termsOptions}
                loading={loadingTerms}
                disabled={loadingTerms}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="studentId"
            label="Student"
            rules={[{ required: true, message: "Student is required" }]}
          >
            <Select
              placeholder={
                subLevelId ? "Select student" : "Select sublevel first"
              }
              showSearch
              allowClear
              size="large"
              options={subStudentsOptions}
              loading={subStuLoading}
              disabled={subStuLoading}
            />
          </Form.Item>

          <Form.Item
            name="remarks"
            label="Remark"
            rules={[{ required: true, message: "Remark is required" }]}
          >
            <Select
              allowClear
              // mode="tags"
              size="large"
              placeholder="Select remark"
              showSearch
              options={[
                {
                  label: "More room for improvement",
                  value: "More room for improvement",
                },
                { label: "Well done", value: "Well done" },
                { label: "Has improved", value: "Has improved" },
                { label: "Well behaved", value: "Well behaved" },
                { label: "Good team player", value: "Good team player" },
                { label: "Approachable", value: "Approachable" },
                { label: "Humble and Friendly", value: "Humble and Friendly" },
                {
                  label: "Slow learner but can improve",
                  value: "Slow learner but can improve",
                },
                {
                  label: "Talkative and sociable",
                  value: "Talkative and sociable",
                },
                {
                  label: "Exhibit good leadership skills",
                  value: "Exhibit good leadership skills",
                },
              ]}
            />
          </Form.Item>
        </>
      }
    />
  );
};
export default PrincipalTeacherRemarks;
