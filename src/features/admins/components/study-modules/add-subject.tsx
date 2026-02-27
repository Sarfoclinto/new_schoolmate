import { subjectKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import {
  createSubjectFn,
  deleteSubjectFn,
  getAllSubjectsFn,
  updateSubjectFn,
} from "@/services/setup/study-module";
import type { SubjectGet, SubjectPost } from "@/types/api/setup/study-modules";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TableActions } from "../table-action";
import { SetupPage } from "../setup-page";
import { BookOpen } from "lucide-react";

const AddSubject = () => {
  // states
  const [form] = Form.useForm();
  const [record, setRecord] = useState<SubjectGet | null>(null);
  const qc = useQueryClient();

  // effects
  useEffect(() => {
    if (record?.subjectId)
      form.setFieldsValue({ SubjectName: record.subjectName });
    else form.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  // queries
  const { data: subjects, isLoading: loadingSubjects } = useFetch({
    queryFn: getAllSubjectsFn,
    queryKeys: subjectKeys.list(),
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!subjects) return [];
    return subjects;
  }, [subjects]);

  // mutations
  const { mutate: createSubject, isPending: creatingSubject } = usePost({
    postFn: createSubjectFn,
    mutationOptions: { mutationKey: ["subjects", "create"] },
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
      toast.error(`Failed to create subject`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateSubject, isPending: updatingSubject } = useUpdate({
    updateFn: updateSubjectFn,
    mutationOptions: { mutationKey: ["subjects", "update"] },
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
      toast.error(`Failed to update subject`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteSubject, isPending: deletingSubject } = usePost({
    postFn: deleteSubjectFn,
    mutationOptions: { mutationKey: ["subjects", "delete"] },
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
      toast.error(`Failed to delete subject`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: subjectKeys.list() });

  const onFinish = (values: SubjectPost) => {
    if (record?.subjectId) {
      updateSubject({ data: values, id: record.subjectId });
    } else {
      createSubject(values);
    }
  };

  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };

  // data
  const columns: ColumnsType<SubjectGet> = [
    {
      key: "subjectName",
      title: "Subject Name",
      dataIndex: "subjectName",
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
          onConfirmDelete={() => deleteSubject(row.subjectId)}
          deleteTitle="Delete this subject?"
        />
      ),
    },
  ];

  const isPending = creatingSubject || updatingSubject || deletingSubject;

  return (
    <SetupPage
      title="Subjects"
      breadcrumb={["Programs & Subjects", "Subjects"]}
      icon={<BookOpen className="w-4 h-4" />}
      hint={{ note: "Add the subjects offered by your institution." }}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        updatingSubject
          ? "Updating…"
          : deletingSubject
            ? "Deleting…"
            : "Adding…"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingSubjects,
        rowKey: "subjectId",
        showHeader: false,
      }}
      formContent={
        <Form.Item
          name="SubjectName"
          label="Subject Name"
          rules={[{ required: true, message: "Subject name is required" }]}
        >
          <Input
            size="large"
            className="rounded-xl!"
            placeholder="e.g. English Language, Mathematics, OWAP"
          />
        </Form.Item>
      }
    />
  );
};
export default AddSubject;
