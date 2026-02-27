import { eduKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getAcaByEduIdFn } from "@/services/setup/academic-level";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import {
  createSubLevelFn,
  deleteSubLevelFn,
  getAllSubLevelsFn,
  getSubLevelsByAcaIdFn,
  updateSubLevelFn,
} from "@/services/setup/sublevel";
import type {
  SubLevelFormValues,
  SubLevelGet,
  SubLevelPost,
} from "@/types/api/setup/sublevel";
import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox, Form, Input, InputNumber, Select, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { TableActions } from "../../components/table-action";
import usePost from "@/hooks/api/use-post";
import { toast } from "sonner";
import useUpdate from "@/hooks/api/use-update";
import { SetupPage } from "../../components/setup-page";
import { LayoutGrid, XCircleIcon } from "lucide-react";

const SubLevels = () => {
  // states
  const [form] = Form.useForm();
  const [record, setRecord] = useState<SubLevelGet | null>(null);
  const qc = useQueryClient();
  const [isNoSubLevelChecked, setIsNoSubLevelChecked] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [selectedAca, setSelectedAca] = useState<SelectTypes | null>(null);

  const eduId = selectedEdu?.value;
  const acaId = selectedAca?.value;

  //   effects
  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        AcademicLevel: selectedAca
          ? { value: record.academicLevelId }
          : undefined,
        SubLevelName: record.subLevelName,
        SubLevelAlias: record.subLevelAlias,
        Capacity: record.capacity,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  useEffect(() => {
    setRecord(null);
    form.setFieldsValue({ SubLevelName: undefined, SubLevelAlias: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAca, selectedEdu]);

  //   queries
  //   get all educational levels for dropdown
  const { data: eduLevels, isLoading: loadingEduLevels } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  //   get all sublevels
  const { data: allSubLevels, isLoading: loadingAllSubLevels } = useFetch({
    queryFn: getAllSubLevelsFn,
    queryKeys: eduKeys.sublevels(),
  });
  //   get academic levels of the selected educational level for dropdown
  const { data: acaLevels, isLoading: loadingAcaLevels } = useFetch({
    queryFn: () => getAcaByEduIdFn(eduId!),
    queryKeys: eduKeys.academicLevels(eduId),
    enabled: !!eduId,
  });
  //   get all sublevels of that academic level
  const { data: subLevels, isLoading: loadingSubLevels } = useFetch({
    queryFn: () => getSubLevelsByAcaIdFn(acaId!),
    queryKeys: eduKeys.sublevels({ acaId }),
    enabled: !!acaId,
  });

  //   memoized values
  //   sublevel table datasource
  const dataSource = useMemo(() => {
    const list = selectedAca?.value ? subLevels : allSubLevels;
    return list ?? [];
  }, [subLevels, allSubLevels, selectedAca?.value]);

  //   edu options
  const eduOptions = useMemo(
    () =>
      eduLevels?.map((e) => ({
        label: e.educationalLevelName,
        value: e.educationalLevelId,
      })) ?? [],
    [eduLevels],
  );
  //   aca options
  const acaOptions = useMemo(
    () =>
      acaLevels?.map((a) => ({
        label: a.academicLevelName,
        value: a.academicLevelId,
      })) ?? [],
    [acaLevels],
  );

  //   mutations
  const { mutate: createSubLevel, isPending: creatingSubLevel } = usePost({
    postFn: createSubLevelFn,
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage);
        form.resetFields([
          "SubLevelName",
          "hasNoSubLevel",
          "SubLevelAlias",
          "useAlias",
          "Capacity",
        ]);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create sub-level`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateSubLevel, isPending: updatingSubLevel } = useUpdate({
    updateFn: updateSubLevelFn,
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
      toast.error(`Failed to update sub-level`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteSubLevel, isPending: deletingSubLevel } = usePost({
    postFn: deleteSubLevelFn,
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
      toast.error(`Failed to delete sub-level`, {
        description: err?.message,
      });
    },
  });

  //   fns
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: eduKeys.sublevels() });
    qc.invalidateQueries({ queryKey: eduKeys.sublevels({ acaId }) });
  };

  const onFinish = (values: SubLevelFormValues) => {
    const postData: SubLevelPost = {
      AcademicLevelId: values.AcademicLevel.value,
      SubLevelName: values.SubLevelName,
      Capacity: values.Capacity,
      SubLevelAlias: values.SubLevelAlias,
    };
    if (record?.subLevelId) {
      updateSubLevel({ id: record.subLevelId, data: postData });
    } else {
      createSubLevel(postData);
    }
  };

  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };

  //   data
  const columns: ColumnsType<SubLevelGet> = [
    {
      key: "subLevelName",
      title: "Sub-Level",
      dataIndex: "subLevelName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "alias",
      title: "Alias",
      dataIndex: "subLevelAlias",
      //   width: 100,
      render: (v: string) => (
        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
          {v ?? "—"}
        </span>
      ),
    },
    {
      key: "capacity",
      title: "Capacity",
      dataIndex: "capacity",
      width: 90,
      render: (v: number) => (
        <span className="text-xs font-bold text-[#1E3A5F] bg-blue-50 px-2 py-0.5 rounded-full">
          {v}
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
          onDelete={() => setRecord(row)}
          onConfirmDelete={() => deleteSubLevel(row.subLevelId)}
          deleteTitle="Delete this sub-level?"
        />
      ),
    },
  ];
  const isPending = creatingSubLevel || updatingSubLevel || deletingSubLevel;

  return (
    <SetupPage
      title="Sub-Levels"
      breadcrumb={["Institution Setup", "Sub-Levels"]}
      icon={<LayoutGrid className="w-4 h-4" />}
      hint={{
        note: "Sub-Levels group students within an Academic Level into smaller classrooms.",
        example: "Primary 1A, Primary 1B, JHS 1A, SHS 1B",
      }}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        updatingSubLevel
          ? "Updating…"
          : deletingSubLevel
            ? "Deleting…"
            : "Adding…"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingAllSubLevels || loadingSubLevels,
        rowKey: "subLevelId",
        title: () => (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-4 text-xs">
              <span className="text-slate-400">
                Edu:{" "}
                <span className="font-semibold text-[#1E3A5F]">
                  {selectedEdu?.label ?? "All"}
                </span>
              </span>
              <span className="w-px h-3 bg-slate-200" />
              <span className="text-slate-400">
                Aca:{" "}
                <span className="font-semibold text-[#1E3A5F]">
                  {selectedAca?.label ?? "All"}
                </span>
              </span>
            </div>

            <Tooltip title="View All" placement="left">
              <XCircleIcon
                onClick={() => {
                  form.resetFields();
                  setSelectedAca(null);
                }}
                className="size-4 cursor-pointer hover:scale-105 duration-100 active:scale-100"
              />
            </Tooltip>
          </div>
        ),
      }}
      formContent={
        <>
          <Form.Item
            name="EducationalLevel"
            label="Educational Level"
            rules={[
              { required: true, message: "Educational level is required" },
            ]}
          >
            <Select
              size="large"
              labelInValue
              placeholder="Select educational level"
              options={eduOptions}
              loading={loadingEduLevels}
              disabled={loadingEduLevels}
              onChange={(opt) => {
                setSelectedEdu({
                  value: opt.value,
                  label: opt.label as string,
                });
                setIsNoSubLevelChecked(false);
                form.resetFields([
                  "hasNoSubLevel",
                  "useAlias",
                  "AcademicLevel",
                ]);
              }}
            />
          </Form.Item>

          <Form.Item
            name="AcademicLevel"
            label="Academic Level"
            rules={[{ required: true, message: "Academic level is required" }]}
          >
            <Select
              size="large"
              labelInValue
              placeholder={
                selectedEdu
                  ? "Select academic level"
                  : "Select educational level first"
              }
              options={acaOptions}
              loading={loadingAcaLevels}
              disabled={loadingAcaLevels || !selectedEdu?.value}
              onChange={(opt) => {
                setSelectedAca({
                  value: opt.value,
                  label: opt.label as string,
                });
                setIsNoSubLevelChecked(false);
                form.resetFields(["hasNoSubLevel", "useAlias"]);
              }}
            />
          </Form.Item>

          <Form.Item
            name="SubLevelName"
            label="Sub-Level Name"
            dependencies={["hasNoSubLevel"]}
            rules={[
              ({ getFieldValue }) => ({
                required: !getFieldValue("hasNoSubLevel"),
                message: "Sub-level name is required",
              }),
            ]}
          >
            <Input
              size="large"
              className="rounded-xl!"
              placeholder="e.g. Primary 1A, JHS 2B"
              disabled={isNoSubLevelChecked}
              onChange={(e) => {
                if (form.getFieldValue("useAlias"))
                  form.setFieldsValue({ SubLevelAlias: e.target.value });
              }}
            />
          </Form.Item>

          {!(dataSource.length > 0) && (
            <Form.Item
              name="hasNoSubLevel"
              valuePropName="checked"
              className="-mt-2!"
            >
              <Checkbox
                onChange={(e) => {
                  setIsNoSubLevelChecked(e.target.checked);
                  if (e.target.checked)
                    form.setFieldsValue({ SubLevelName: selectedAca?.label });
                  else
                    form.setFieldsValue({
                      SubLevelName: undefined,
                      SubLevelAlias: undefined,
                    });
                }}
                className="text-xs text-slate-500"
              >
                Has no Sub-Level (use academic level directly)
              </Checkbox>
            </Form.Item>
          )}

          <Form.Item name="SubLevelAlias" label="Alias">
            <Input
              size="large"
              className="rounded-xl!"
              placeholder="e.g. KG 1, P1, JHS 1"
              disabled={isNoSubLevelChecked}
            />
          </Form.Item>

          <Form.Item
            name="useAlias"
            valuePropName="checked"
            initialValue={false}
            className="-mt-2!"
          >
            <Checkbox
              disabled={isNoSubLevelChecked}
              onChange={(e) => {
                if (e.target.checked)
                  form.setFieldsValue({
                    SubLevelAlias: form.getFieldValue("SubLevelName"),
                  });
                else form.setFieldsValue({ SubLevelAlias: "" });
              }}
              className="text-xs text-slate-500"
            >
              Use sub-level name as alias
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="Capacity"
            label="Class Capacity (Max size)"
            rules={[{ required: true, message: "Class capacity is required" }]}
          >
            <InputNumber
              className="w-full! rounded-xl!"
              size="large"
              min={1}
              placeholder="e.g. 40, 50"
            />
          </Form.Item>
        </>
      }
    />
  );
};
export default SubLevels;
