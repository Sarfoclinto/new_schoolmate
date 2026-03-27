import { eduKeys, staffKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import {
  getAllTeachersFn,
  getPrincipalTeachersFn,
  postPrincipalTeacherFn,
  unAssignPrincipalFn,
} from "@/services/staff";
import type {
  PrincipalTeacherGet,
  PrincipalTeacherPost,
} from "@/types/api/staff";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SetupPage } from "../../setup-page";
import { UserCog } from "lucide-react";
import { getAllSubLevelsFn } from "@/services/setup/sublevel";
import { TableActions } from "../../table-action";

const AssignPrincipal = () => {
  // states
  const [form] = Form.useForm<PrincipalTeacherPost>();
  const [record, setRecord] = useState<PrincipalTeacherGet | null>(null);
  const qc = useQueryClient();

  // effects
  useEffect(() => {
    if (record && record.teacherId) {
      form.setFieldsValue({
        subLevelId: record.subLevelId,
        teacherId: record.teacherId,
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  // queries
  const { data: principalTeachers = [], isLoading: loadingPrincipalTeachers } =
    useFetch({
      queryFn: getPrincipalTeachersFn,
      queryKeys: staffKeys.custom("principal-teachers"),
    });

  const { data: allTeachers = [], isLoading: loadingTeachers } = useFetch({
    queryFn: getAllTeachersFn,
    queryKeys: staffKeys.custom("all-teachers"),
  });
  const { data: allSubLevels = [], isLoading: loadingAllSubLevels } = useFetch({
    queryFn: getAllSubLevelsFn,
    queryKeys: eduKeys.sublevels(),
  });

  const teachersOptions = useMemo(() => {
    return allTeachers.map((t) => ({
      label: `${t.firstName} ${t.lastName}`,
      value: t.staffId,
    }));
  }, [allTeachers]);
  const subLevelsOptions = useMemo(() => {
    return allSubLevels.map((t) => ({
      label: t.subLevelName,
      value: t.subLevelId,
    }));
  }, [allSubLevels]);

  //   mutations
  const {
    mutate: createPrincipalTeacher,
    isPending: creatingPrincipalTeacher,
  } = usePost({
    postFn: postPrincipalTeacherFn,
    mutationOptions: { mutationKey: ["principal-teacher", "create"] },
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
      toast.error(`Failed to assign principal teacher`, {
        description: err?.message,
      });
    },
  });
  const { mutate: unassignPrincipalTeacher } = usePost({
    postFn: unAssignPrincipalFn,
    mutationOptions: { mutationKey: ["principal-teacher", "unassign"] },
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
      toast.error(`Failed to unassign principal`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: staffKeys.custom("principal-teachers") });
  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };

  const onFinish = (values: PrincipalTeacherPost) => {
    createPrincipalTeacher(values);
  };

  const columns: ColumnsType<PrincipalTeacherGet> = [
    {
      key: "staffId",
      title: "Staff ID",
      dataIndex: "teacherId",
      render: (v: string) => (
        <span className="font-bold text-[11px] tracking-wider text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-1 rounded-lg">
          {v}
        </span>
      ),
    },
    {
      key: "teacherName",
      title: "Teacher Name",
      dataIndex: "teacherName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "sublevel",
      title: "Sub-Level",
      dataIndex: "subLevelAlias",
      render: (v: string, row) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">
          {v ?? row.subLevelName}
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
          editDisabled
          onDelete={() => {}}
          onConfirmDelete={() => {
            unassignPrincipalTeacher({
              subLevelId: row.subLevelId,
              teacherId: row.teacherId,
            });
          }}
          deleteTitle="Unassign this teacher?"
        />
      ),
    },
  ];

  return (
    <SetupPage
      title="Principal-Teachers"
      showClock={false}
      showTitle={false}
      icon={<UserCog className="w-4 h-4" />}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={creatingPrincipalTeacher}
      pendingLabel="Creating…"
      tableProps={{
        columns,
        dataSource: principalTeachers,
        loading: loadingPrincipalTeachers,
        rowKey: "teacherId",
      }}
      formContent={
        <>
          <Form.Item
            label="Teacher"
            name="teacherId"
            rules={[{ required: true, message: "Please select a teacher!" }]}
          >
            <Select
              className="w-full"
              showSearch
              placeholder="Select a teacher"
              options={teachersOptions}
              loading={loadingTeachers}
              disabled={loadingTeachers}
            />
          </Form.Item>
          <Form.Item
            label="Sublevel"
            name="subLevelId"
            rules={[{ required: true, message: "Please select a sublevel!" }]}
          >
            <Select
              className="w-full"
              showSearch
              placeholder="Select a sublevel"
              options={subLevelsOptions}
              loading={loadingAllSubLevels}
              disabled={loadingAllSubLevels}
            />
          </Form.Item>
        </>
      }
    />
  );
};
export default AssignPrincipal;
