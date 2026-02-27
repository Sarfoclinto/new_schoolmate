import { classroomKeys, eduKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import {
  assignClassroomToSubLevelFn,
  getAllClassroomsFn,
  unassignClassroomFromSubLevelFn,
} from "@/services/setup/faculty-n-classroom";
import { getAllSubLevelsFn } from "@/services/setup/sublevel";
import type {
  ClassroomsGet,
  Mapping,
} from "@/types/api/setup/faculty-n-classroom";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { toast } from "sonner";
import { TableActions } from "../table-action";
import { SetupPage } from "../setup-page";
import { GitBranch } from "lucide-react";
import { Form, Select } from "antd";

const AssignClassroom = () => {
  // states
  const [form] = Form.useForm<Mapping>();
  const qc = useQueryClient();

  // queries
  const { data: classrooms, isLoading: loadingClassrooms } = useFetch({
    queryFn: getAllClassroomsFn,
    queryKeys: classroomKeys.list(),
  });
  const { data: allSubLevels, isLoading: loadingAllSubLevels } = useFetch({
    queryFn: getAllSubLevelsFn,
    queryKeys: eduKeys.sublevels(),
  });

  // memoized values
  const classroomOptions = useMemo(() => {
    if (!classrooms) return [];
    return classrooms.map((c) => ({
      label: c.classRoomName,
      value: c.classRoomId,
    }));
  }, [classrooms]);
  const dataSource = useMemo(() => {
    if (!classrooms) return [];
    return classrooms.filter((cr) => cr.subLevelId === undefined);
  }, [classrooms]);
  const subLevelOptions = useMemo(() => {
    if (!allSubLevels) return [];
    return allSubLevels.map((s) => ({
      label: s.subLevelName,
      value: s.subLevelId,
    }));
  }, [allSubLevels]);

  // mutations
  const { mutate: assign, isPending: assigning } = usePost({
    postFn: assignClassroomToSubLevelFn,
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
      toast.error(`Failed to assign classroom`, {
        description: err?.message,
      });
    },
  });
  const { mutate: unassign, isPending: unassigning } = usePost({
    postFn: unassignClassroomFromSubLevelFn,
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
      toast.error(`Failed to unassign classroom`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: classroomKeys.list() });
  };
  const onReset = () => {
    form.resetFields();
  };
  const onFinish = (values: Mapping) => {
    assign(values);
  };

  // data
  const columns: ColumnsType<ClassroomsGet> = [
    {
      key: "classRoomName",
      title: "Room Name",
      dataIndex: "classRoomName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "capacity",
      title: "Capacity",
      dataIndex: "capacity",
      render: (v: number) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "sublevel",
      title: "Sub-Level",
      dataIndex: "subLevelName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">
          {v ?? "-"}
        </span>
      ),
    },
    {
      key: "action",
      title: "",
      align: "right",
      render: (_, row) => (
        <TableActions
          onEdit={() => {}}
          onDelete={() => {}}
          onConfirmDelete={() =>
            unassign({
              ClassRoomId: row.classRoomId,
              SubLevelId: row.subLevelId,
            })
          }
          deleteTitle="Unassign this classroom?"
        />
      ),
    },
  ];

  return (
    <SetupPage
      title="Classroom"
      showClock={false}
      showTitle={false}
      icon={<GitBranch className="w-5 h-5" />}
      hint={{
        note: "Assign a classroom to a sub-level.",
        example: "Room 1 -> Primary 1A, 1SA -> Science 1A, etc",
      }}
      onClearRecord={onReset}
      onFinish={onFinish}
      form={form}
      isPending={assigning}
      pendingLabel={
        assigning
          ? "Assigning classroom…"
          : unassigning
            ? "Unassigning classroom…"
            : "Adding classroom…"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingClassrooms,
        rowKey: "classRoomId",
        showHeader: false,
      }}
      formContent={
        <>
          <Form.Item name="ClassRoomId" label="Room">
            <Select
              placeholder="Select classroom"
              options={classroomOptions}
              disabled={loadingClassrooms}
              loading={loadingClassrooms}
              size="large"
            />
          </Form.Item>
          <Form.Item name="SubLevelId" label="Sub-Level">
            <Select
              placeholder="Select sub-level"
              options={subLevelOptions}
              disabled={loadingAllSubLevels}
              loading={loadingAllSubLevels}
              size="large"
            />
          </Form.Item>
        </>
      }
    />
  );
};
export default AssignClassroom;
