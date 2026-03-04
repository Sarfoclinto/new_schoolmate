import {
  academicRecordsKeys,
  educationKeys,
  subjectKeys,
} from "@/config/query-keys";
import { SetupPage } from "@/features/admins/components/setup-page";
import { TableActions } from "@/features/admins/components/table-action";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import {
  addPassmarkFn,
  deletePassmarkFn,
  getPassmarkFn,
  updatePassmarkFn,
} from "@/services/academic-records";
import {
  getTeachersSublevelsFn,
  getTeacherSublevelSubjectsFn,
} from "@/services/staff";
import { useAuth } from "@/store/auth.store";
import type { PassmarkGet, PassmarkPost } from "@/types/api/academic-records";
import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Form, InputNumber, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TargetIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type FormValues = {
  PassMark: number;
  SubjectId: string;
  SubLevel: SelectTypes;
};
const PassMark = () => {
  const user = useAuth((s) => s.user);
  const [form] = Form.useForm<FormValues>();
  const qc = useQueryClient();
  const [subLevel, setSubLevel] = useState<SelectTypes | null>(null);
  const [record, setRecord] = useState<PassmarkGet | null>(null);

  const sublevelId = subLevel?.value;
  const teacherId = user?.userId;

  useEffect(() => {
    if (record && record.passMarkId) {
      form.setFieldsValue({
        PassMark: record.passMark,
        SubjectId: record.subjectId,
        SubLevel: {
          label: record.subLevelName,
          value: record.subLevelId,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  const { data: passmarks, isLoading: loadingPassmarks } = useFetch({
    queryFn: () => getPassmarkFn(teacherId!, sublevelId!),
    queryKeys: academicRecordsKeys.custom("passmark", {
      teacherId,
      sublevelId,
    }),
    enabled: !!teacherId && !!sublevelId,
  });
  const { data: sublevelData, isLoading: loadingSublevelData } = useFetch({
    queryFn: () => getTeachersSublevelsFn(teacherId!),
    queryKeys: educationKeys.custom("teacher-sublevels", { teacherId }),
    enabled: !!teacherId,
  });
  const { data: subjectsData, isLoading: loadingSubjects } = useFetch({
    queryFn: () => getTeacherSublevelSubjectsFn(teacherId!, sublevelId!),
    queryKeys: subjectKeys.custom("teacher-sublevel", {
      sublevelId,
      teacherId,
    }),
    enabled: !!sublevelId && !!teacherId,
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!passmarks) return [];
    return passmarks;
  }, [passmarks]);

  const subjectOptions = useMemo(() => {
    if (!subjectsData?.subjects) return [];
    return subjectsData?.subjects.map((s) => ({
      label: s.subjectName,
      value: s.subjectId,
    }));
  }, [subjectsData]);

  const sublevelOptions = useMemo(() => {
    if (!sublevelData?.subLevels) return [];
    return sublevelData?.subLevels.map((s) => ({
      label: s.subLevelName,
      value: s.subLevelId,
    }));
  }, [sublevelData?.subLevels]);

  // mutations
  const { mutate: addPassmark, isPending: addingPassmark } = usePost({
    postFn: addPassmarkFn,
    mutationOptions: { mutationKey: ["passmark", "create"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();
        reset();
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to add passmark`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updatePassmark, isPending: updatingPassmark } = useUpdate({
    updateFn: updatePassmarkFn,
    mutationOptions: { mutationKey: ["passmark", "update"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();
        reset();
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to update passmark`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deletePassmark, isPending: deletingPassmark } = usePost({
    postFn: deletePassmarkFn,
    mutationOptions: { mutationKey: ["passmark", "delete"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();
        reset();
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to delete passmark`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = async () =>
    await qc.invalidateQueries({
      queryKey: academicRecordsKeys.custom("passmark", {
        teacherId,
        sublevelId,
      }),
    });

  const onFinish = (values: FormValues) => {
    if (!teacherId) {
      toast.info("Teacher not found, Re-Login");
      return;
    }
    const payload: PassmarkPost = {
      PassMark: values.PassMark,
      SubjectId: values.SubjectId,
      SubLevelId: values.SubLevel.value,
      TeacherId: teacherId,
    };
    if (record && record.passMarkId) {
      updatePassmark({ id: record.passMarkId, data: payload });
    } else {
      addPassmark(payload);
    }
  };
  const reset = () => {
    form.resetFields(["PassMark", "SubjectId"]);
    setRecord(null);
  };

  const columns: ColumnsType<PassmarkGet> = [
    {
      key: "sn",
      title: "#",
      render: (_, __, idx) => idx + 1,
    },
    {
      key: "subject",
      title: "Subject",
      dataIndex: "subjectName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "passmark",
      title: "Passmark",
      dataIndex: "passMark",
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
          onDelete={() => {}}
          onConfirmDelete={() => {
            deletePassmark(row.passMarkId);
          }}
          deleteTitle="Are you sure you want to delete?"
        />
      ),
    },
  ];

  const isPending = addingPassmark || updatingPassmark || deletingPassmark;

  return (
    <SetupPage
      title="Passmarks"
      breadcrumb={["Academic Records", "Set Passmark"]}
      icon={<TargetIcon className="w-4 h-4" />}
      hint={{
        note: "Setup the passmark for your subjects. Students promotion for your subjects depend on this",
        example: "Grade 1A - Math - 50, JHS 1C - English - 60",
      }}
      record={record}
      onClearRecord={reset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        updatingPassmark
          ? "Updating…"
          : deletingPassmark
            ? "Deleting…"
            : addingPassmark
              ? "Adding…"
              : "Add Passmark"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingPassmarks,
        rowKey: "passMarkId",
        // showHeader: false,
      }}
      formContent={
        <>
          <Form.Item
            label="SubLevels"
            name="SubLevel"
            rules={[{ required: true, message: "Please Sublevel is required" }]}
          >
            <Select
              placeholder="Select SubLevel"
              labelInValue
              onChange={(option) => {
                const newSelection = {
                  value: option.value,
                  label: option.label as string,
                };
                setSubLevel(newSelection);
                form.resetFields(["SubjectId"]);
              }}
              loading={loadingSublevelData}
              disabled={loadingSublevelData}
              options={sublevelOptions}
            />
          </Form.Item>
          <Form.Item
            label="Subject"
            name="SubjectId"
            rules={[{ required: true, message: "Please Subject is required" }]}
          >
            <Select
              placeholder={
                sublevelId ? "Select subject" : "Please select sublevel first"
              }
              loading={loadingSubjects}
              disabled={loadingSubjects || !sublevelId}
              options={subjectOptions}
            />
          </Form.Item>
          <Form.Item
            label={<span className="font-medium roboto">PassMark</span>}
            name="PassMark"
            rules={[{ required: true, message: "Please Passmark is required" }]}
          >
            <InputNumber
              className="w-full!"
              placeholder="Enter passmark here"
            />
          </Form.Item>
        </>
      }
    />
  );
};
export default PassMark;
