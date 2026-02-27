import { educationKeys, eduKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import {
  createGradingFn,
  deleteGradingFn,
  getGradingByEduIdFn,
  updateGradingFn,
} from "@/services/setup/assessment-n-grading";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import type {
  GradeGet,
  GradePost,
} from "@/types/api/setup/assessment-n-grading";
import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, InputNumber, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TableActions } from "../table-action";
import { SetupPage } from "../setup-page";
import { Table } from "lucide-react";

type FormValues = GradePost & { EducationalLevel: SelectTypes };
const AddGrading = () => {
  // states
  const [form] = Form.useForm<FormValues>();
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [record, setRecord] = useState<GradeGet | null>(null);
  const qc = useQueryClient();

  const eduId = selectedEdu?.value;

  // effects
  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        Grade: record.grade,
        From: record.from,
        To: record.to,
        Remark: record.remark,
        EducationalLevel: { value: record.educationalLevelId },
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  // queries
  const { data: grading, isLoading: loadingGrading } = useFetch({
    queryFn: () => getGradingByEduIdFn(eduId!),
    queryKeys: educationKeys.custom("grade", { eduId }),
    enabled: !!eduId,
  });
  const { data: educationalLevels, isLoading: loadingEducationalLevels } =
    useFetch({
      queryFn: getAllEduLevelsFn,
      queryKeys: eduKeys.levels(),
    });

  // memoized values
  const dataSource = useMemo(() => {
    if (!grading) return [];
    return grading;
  }, [grading]);

  const eduOptions = useMemo(() => {
    if (!educationalLevels) return [];
    return educationalLevels.map((edu) => ({
      label: edu.educationalLevelName,
      value: edu.educationalLevelId,
    }));
  }, [educationalLevels]);

  // mutations
  const { mutate: addGrading, isPending: addingGrading } = usePost({
    postFn: createGradingFn,
    mutationOptions: { mutationKey: ["grade", "create"] },
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
      toast.error(`Failed to create grade`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateGrading, isPending: updatingGrading } = useUpdate({
    updateFn: updateGradingFn,
    mutationOptions: { mutationKey: ["grade", "update"] },
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
      toast.error(`Failed to update grade`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteGrading, isPending: deletingGrading } = usePost({
    postFn: deleteGradingFn,
    mutationOptions: { mutationKey: ["grade", "delete"] },
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
      toast.error(`Failed to delete grade`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () => qc.invalidateQueries({ queryKey: eduKeys.all });
  const onReset = () => {
    setRecord(null);
    form.resetFields(["From", "Grade", "Remark", "To"]);
  };
  const onFinish = (values: FormValues) => {
    const payload: GradePost = {
      ...values,
      EducationalLevelId: values.EducationalLevel.value,
    };

    if (record?.educationalLevelId) {
      updateGrading({ data: payload, id: record.gradingSystemId });
    } else {
      addGrading(payload);
    }
  };

  // data
  const columns: ColumnsType<GradeGet> = [
    {
      key: "grade",
      title: "Grade",
      dataIndex: "grade",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "from",
      title: "From",
      dataIndex: "from",
      render: (v) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}%</span>
      ),
    },
    {
      key: "to",
      title: "To",
      dataIndex: "to",
      render: (v) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}%</span>
      ),
    },
    {
      key: "remark",
      title: "Remark",
      dataIndex: "remark",
      render: (v) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">
          {v ?? "-"}
        </span>
      ),
    },
    {
      key: "action",
      title: "",
      width: 100,
      align: "right",
      render: (_, row) => (
        <TableActions
          onEdit={() => setRecord(row)}
          onDelete={() => {}}
          onConfirmDelete={() => deleteGrading(row.educationalLevelId)}
          deleteTitle="Delete this grading?"
        />
      ),
    },
  ];
  const isPending = addingGrading || updatingGrading || deletingGrading;

  return (
    <SetupPage
      title="Grading"
      showClock={false}
      showTitle={false}
      icon={<Table className="w-4 h-4" />}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        updatingGrading
          ? "Updating…"
          : deletingGrading
            ? "Deleting…"
            : "Adding…"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingGrading,
        rowKey: "gradingSystemId",
        showHeader: false,
      }}
      formContent={
        <>
          <Form.Item
            name="EducationalLevel"
            label="Edu Level Name"
            rules={[{ required: true, message: "Edu level is required" }]}
          >
            <Select
              options={eduOptions}
              placeholder="Select Educational Level"
              labelInValue
              loading={loadingEducationalLevels}
              disabled={loadingEducationalLevels}
              onChange={(opt) => {
                setSelectedEdu({
                  label: opt.label,
                  value: opt.value,
                });
              }}
              className="w-full"
            />
          </Form.Item>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3">
            <Form.Item
              name="From"
              label="From (Min)"
              rules={[{ required: true, message: "Min number is required" }]}
            >
              <InputNumber className="w-full!" min={1} max={100} />
            </Form.Item>
            <Form.Item
              name="To"
              label="To (Max)"
              rules={[{ required: true, message: "Max number is required" }]}
            >
              <InputNumber className="w-full!" min={1} max={100} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3">
            <Form.Item
              name="Grade"
              label="Grade"
              rules={[{ required: true, message: "Grade is required" }]}
            >
              <Input size="large" placeholder="A1, B2, 1, 9 etc" />
            </Form.Item>
            <Form.Item name="Remark" label="Remark">
              <Input size="large" placeholder="Excellent, Good, low, etc" />
            </Form.Item>
          </div>
        </>
      }
    />
  );
};
export default AddGrading;
