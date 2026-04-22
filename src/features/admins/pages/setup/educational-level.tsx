import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import {
  createEduLevelFn,
  deleteEduLevelFn,
  getAllEduLevelsFn,
  updateEduLevelFn,
} from "@/services/setup/educational-level";
import type {
  EduLevelGet,
  EduLevelPost,
} from "@/types/api/setup/educational-level";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox, Form, Input, type CheckboxChangeEvent } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TableActions } from "../../components/table-action";
import { SetupPage } from "../../components/setup-page";
import { GraduationCap } from "lucide-react";
import { educationMutationKeys, eduKeys } from "@/config/query-keys";
// import { ADMINISTRATIVE_PERMISSIONS } from "@/config/permissions";

const EducationalLevel = () => {
  // states
  const [form] = Form.useForm();
  const [record, setRecord] = useState<EduLevelGet | null>(null);
  const qc = useQueryClient();

  // effects
  useEffect(() => {
    if (record)
      form.setFieldsValue({
        EducationalLevelName: record.educationalLevelName,
        Alias: record.alias,
      });
    else form.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  // queries
  const { data: educationalLevels, isLoading: loadingEducationalLevels } =
    useFetch({
      queryFn: getAllEduLevelsFn,
      queryKeys: eduKeys.levels(),
    });

  // mutations
  const { mutate: addEduLevel, isPending: addingEduLevel } = usePost({
    postFn: createEduLevelFn,
    mutationOptions: { mutationKey: educationMutationKeys.create },
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
      toast.error(`Failed to create educational level`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateEduLevel, isPending: updatingEduLevel } = useUpdate({
    updateFn: updateEduLevelFn,
    mutationOptions: { mutationKey: educationMutationKeys.update },
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
      toast.error(`Failed to edit educational level`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteEduLevel, isPending: deletingEduLevel } = usePost({
    postFn: deleteEduLevelFn,
    mutationOptions: { mutationKey: educationMutationKeys.delete },
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
      toast.error(`Failed to delete educational level`, {
        description: err?.message,
      });
    },
  });

  // fns / handlers
  const invalidate = () => qc.invalidateQueries({ queryKey: eduKeys.all });
  const handleAliasSync = (e: CheckboxChangeEvent) => {
    if (e.target.checked)
      form.setFieldsValue({
        Alias: form.getFieldValue("EducationalLevelName"),
      });
    else form.setFieldsValue({ Alias: "" });
  };

  const onFinish = (values: EduLevelPost) => {
    return record?.educationalLevelId
      ? updateEduLevel({ data: values, id: record.educationalLevelId })
      : addEduLevel(values);
  };

  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };

  //  data
  const columns: ColumnsType<EduLevelGet> = [
    {
      key: "educationalLevelName",
      title: "Level Name",
      dataIndex: "educationalLevelName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "alias",
      title: "Alias",
      dataIndex: "alias",
      // width: 120,
      render: (v: string) => (
        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
          {v ?? "—"}
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
          onConfirmDelete={() => deleteEduLevel(row.educationalLevelId)}
          deleteTitle="Delete this educational level?"
        />
      ),
    },
  ];
  const isPending = addingEduLevel || updatingEduLevel || deletingEduLevel;

  return (
    <SetupPage
      title="Educational Levels"
      breadcrumb={["Institution Setup", "Educational Levels"]}
      icon={<GraduationCap className="w-4 h-4" />}
      hint={{
        note: "Educational Levels help organise courses, activities, and resources. Use clear, unique names to prevent confusion.",
        example:
          "Creche, Kindergarten, Primary, Junior High School, Senior High School, Tertiary",
      }}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        updatingEduLevel
          ? "Updating…"
          : deletingEduLevel
            ? "Deleting…"
            : "Adding…"
      }
      tableProps={{
        columns,
        dataSource: educationalLevels,
        loading: loadingEducationalLevels,
        rowKey: "educationalLevelId",
        showHeader: false,
      }}
      formContent={
        <>
          <Form.Item
            name="EducationalLevelName"
            label="Level Name"
            rules={[{ required: true, message: "Level name is required" }]}
          >
            <Input
              size="large"
              className="rounded-xl!"
              placeholder="e.g. Primary, Junior High School"
            />
          </Form.Item>
          <Form.Item name="Alias" label="Alias (Short Name)">
            <Input
              size="large"
              className="rounded-xl!"
              placeholder="e.g. JHS, SHS, UNI"
            />
          </Form.Item>
          <Form.Item name="useAlias" valuePropName="checked" className="-mt-2!">
            <Checkbox
              onChange={handleAliasSync}
              className="text-xs text-slate-500"
            >
              Use level name as alias
            </Checkbox>
          </Form.Item>
        </>
      }
    />
  );
};
export default EducationalLevel;
