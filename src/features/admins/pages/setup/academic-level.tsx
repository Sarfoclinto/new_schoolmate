import { academicKeys, eduKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import {
  createAcaLevelFn,
  deleteAcaLevelFn,
  getAcaByEduIdFn,
  getAllAcaLevelsFn,
  updateAcaLevelFn,
} from "@/services/setup/academic-level";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import type {
  AcaLevelFormValues,
  AcaLevelGet,
  AcaLevelPost,
} from "@/types/api/setup/academic-level";
import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox, Form, Input, Select, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TableActions } from "../../components/table-action";
import { SetupPage } from "../../components/setup-page";
import { LayoutGrid, XCircleIcon } from "lucide-react";

const AcademicLevel = () => {
  // states
  const [form] = Form.useForm();
  const [record, setRecord] = useState<AcaLevelGet | null>(null);
  const [isNoAcaLevelChecked, setIsNoAcaLevelChecked] = useState(false);
  const qc = useQueryClient();
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);

  const eduId = selectedEdu?.value;

  // effects
  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        AcademicLevelName: record.academicLevelName,
        Alias: record.alias,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  //   queries
  //   get all educational levels for dropdown
  const { data: eduLevels, isLoading: loadingEduLevels } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });

  // get all academic levels
  const { data: acaLevels, isLoading: loadingAcaLevels } = useFetch({
    queryFn: getAllAcaLevelsFn,
    queryKeys: academicKeys.list(),
  });

  // get academic levels by educational level id
  const { data: acaLevelsByEduId, isLoading: loadingAcaByEduId } = useFetch({
    queryFn: () => getAcaByEduIdFn(eduId!),
    queryKeys: eduKeys.academicLevels(eduId!),
    enabled: !!eduId,
  });

  // memoized values
  const dataSource = useMemo(() => {
    const list = eduId ? acaLevelsByEduId : acaLevels;
    return list || [];
  }, [acaLevels, acaLevelsByEduId, eduId]);

  // edu options for select
  const eduOptions = useMemo(() => {
    return (eduLevels || []).map((edu) => ({
      label: edu.educationalLevelName,
      value: edu.educationalLevelId,
    }));
  }, [eduLevels]);

  // mutations
  const { mutate: createAcaLevel, isPending: creatingAcaLevel } = usePost({
    postFn: createAcaLevelFn,
    mutationOptions: { mutationKey: ["academic-level", "create"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        form.resetFields([
          "AcademicLevelName",
          "hasNoAcaLevel",
          "useAlias",
          "AcademicLevelAlias",
        ]);
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create academic level`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateAcaLevel, isPending: updatingAcaLevel } = useUpdate({
    updateFn: updateAcaLevelFn,
    mutationOptions: { mutationKey: ["academic-level", "update"] },
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
      toast.error(`Failed to update academic level`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteAcaLevel, isPending: deletingAcaLevel } = usePost({
    postFn: deleteAcaLevelFn,
    mutationOptions: { mutationKey: ["academic-level", "delete"] },
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
      toast.error(`Failed to delete academic level`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: academicKeys.list() });
    if (eduId) {
      qc.invalidateQueries({ queryKey: eduKeys.academicLevels(eduId) });
    }
  };

  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };

  const onFinish = (values: AcaLevelFormValues) => {
    const postData: AcaLevelPost = {
      AcademicLevelName: values.AcademicLevelName,
      EducationalLevelId: values.EducationalLevel.value,
      AcademicLevelAlias: values.AcademicLevelAlias,
    };
    if (record?.academicLevelId) {
      updateAcaLevel({ id: record.academicLevelId, data: postData });
    } else {
      createAcaLevel(postData);
    }
  };

  // data
  const columns: ColumnsType<AcaLevelGet> = [
    {
      key: "academicLevelName",
      title: "Level Name",
      dataIndex: "academicLevelName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "alias",
      title: "Alias",
      dataIndex: "academicLevelAlias",
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
          onDelete={() => setRecord(row)}
          onConfirmDelete={() => deleteAcaLevel(row.academicLevelId)}
          deleteTitle="Delete this academic level?"
        />
      ),
    },
  ];

  const isPending = creatingAcaLevel || updatingAcaLevel || deletingAcaLevel;

  return (
    <SetupPage
      title="Academic-Levels"
      breadcrumb={["Institution Setup", "Academic-Levels"]}
      icon={<LayoutGrid className="w-4 h-4" />}
      hint={{
        note: "Academic Level is the level of education that a student is currently in. Please select and check Has No Level for Educational Levels without Academic level",
        example: "Kindergaten 1, Primary 1, JHS 1,SHS 1, Level 100, etc.",
      }}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        updatingAcaLevel
          ? "Updating…"
          : deletingAcaLevel
            ? "Deleting…"
            : "Adding…"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingAcaLevels || loadingAcaByEduId,
        rowKey: "academicLevelId",
        title: () => (
          <div className="flex items-center justify-between gap-x-4 text-xs">
            <span className="text-slate-400">
              Edu:{" "}
              <span className="font-semibold text-[#1E3A5F]">
                {selectedEdu?.label ?? "All"}
              </span>
            </span>
            <Tooltip title="View All" placement="left">
              <XCircleIcon
                onClick={() => {
                  form.resetFields();
                  setSelectedEdu(null);
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
                setIsNoAcaLevelChecked(false);
                form.resetFields([
                  "hasNoAcaLevel",
                  "useAlias",
                  "AcademicLevel",
                ]);
              }}
            />
          </Form.Item>
          {!(dataSource.length > 0) && (
            <Form.Item name="hasNoAcaLevel" valuePropName="checked">
              <Checkbox
                onChange={(e) => {
                  setIsNoAcaLevelChecked(e.target.checked);
                  if (e.target.checked)
                    form.setFieldsValue({
                      AcademicLevelName: selectedEdu?.label,
                    });
                  else
                    form.setFieldsValue({
                      AcademicLevelName: undefined,
                      Alias: undefined,
                    });
                }}
              >
                Has no academic level
              </Checkbox>
            </Form.Item>
          )}
          <Form.Item
            name="AcademicLevelName"
            label="Academic Level Name"
            rules={[
              ({ getFieldValue }) => ({
                required: !getFieldValue("hasNoAcaLevel"),
                message: "Academic level name is required",
              }),
            ]}
            dependencies={["hasNoAcaLevel"]}
          >
            <Input
              size="large"
              className="rounded-xl!"
              placeholder="e.g. KG 1, P1, JHS 1"
              disabled={isNoAcaLevelChecked}
            />
          </Form.Item>
          <Form.Item name="AcademicLevelAlias" label="Alias">
            <Input
              size="large"
              className="rounded-xl!"
              placeholder="e.g. KG 1, P1, JHS 1"
              disabled={isNoAcaLevelChecked}
            />
          </Form.Item>
          <Form.Item name="useAlias" valuePropName="checked">
            <Checkbox
              disabled={isNoAcaLevelChecked}
              onChange={(e) => {
                if (e.target.checked) {
                  form.setFieldsValue({
                    AcademicLevelAlias: form.getFieldValue("AcademicLevelName"),
                  });
                } else {
                  form.setFieldsValue({ AcademicLevelAlias: "" });
                }
              }}
            >
              Use academic level name as alias
            </Checkbox>
          </Form.Item>
        </>
      }
    />
  );
};
export default AcademicLevel;
