import { programKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import {
  createProgramFn,
  deleteProgramFn,
  getAllProgramsFn,
  updateProgramFn,
} from "@/services/setup/study-module";
import type { ProgramGet, ProgramPost } from "@/types/api/setup/study-modules";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TableActions } from "../table-action";
import { SetupPage } from "../setup-page";
import { LayoutList } from "lucide-react";

const AddProgram = () => {
  // states
  const [form] = Form.useForm();
  const [record, setRecord] = useState<ProgramGet | null>(null);
  const qc = useQueryClient();

  // effects
  useEffect(() => {
    if (record?.programId)
      form.setFieldsValue({ ProgramName: record.programName });
    else form.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  // queries
  const { data: programs, isLoading: loadingPrograms } = useFetch({
    queryFn: getAllProgramsFn,
    queryKeys: programKeys.list(),
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!programs) return [];
    return programs;
  }, [programs]);

  // mutations
  const { mutate: createProgram, isPending: creatingProgram } = usePost({
    postFn: createProgramFn,
    mutationOptions: { mutationKey: ["programs", "create"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        onReset();
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create program`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateProgram, isPending: updatingProgram } = useUpdate({
    updateFn: updateProgramFn,
    mutationOptions: { mutationKey: ["programs", "update"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        onReset();
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to update program`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteProgram, isPending: deletingProgram } = usePost({
    postFn: deleteProgramFn,
    mutationOptions: { mutationKey: ["programs", "delete"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        onReset();
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to delete program`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: programKeys.list() });

  const onFinish = (values: ProgramPost) => {
    if (record?.programId) {
      updateProgram({ data: values, id: record.programId });
    } else {
      createProgram(values);
    }
  };

  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };

  // data
  const columns: ColumnsType<ProgramGet> = [
    {
      key: "programName",
      title: "Program Name",
      dataIndex: "programName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
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
          onDelete={() => setRecord(row)}
          onConfirmDelete={() => deleteProgram(row.programId)}
          deleteTitle="Delete this program?"
        />
      ),
    },
  ];

  const isPending = creatingProgram || updatingProgram || deletingProgram;

  return (
    <SetupPage
      title="Programs"
      breadcrumb={["Programs & Subjects", "Programs"]}
      icon={<LayoutList className="w-4 h-4" />}
      hint={{
        note: "Programs group related subjects together for a specific academic track or career path.",
        example: "Science, Arts, Business, General, Vocational",
      }}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        creatingProgram
          ? "Creating…"
          : updatingProgram
            ? "Updating…"
            : deletingProgram
              ? "Deleting…"
              : "Adding…"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingPrograms,
        rowKey: "programId",
        showHeader: false,
      }}
      formContent={
        <Form.Item
          name="ProgramName"
          label="Program Name"
          rules={[{ required: true, message: "Program name is required" }]}
        >
          <Input
            size="large"
            className="rounded-xl!"
            placeholder="e.g. Science, Arts, Business, General"
          />
        </Form.Item>
      }
    />
  );
};
export default AddProgram;
