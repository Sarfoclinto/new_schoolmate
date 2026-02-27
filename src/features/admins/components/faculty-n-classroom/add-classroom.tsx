import { classroomKeys, facultyKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import {
  createClassroomFn,
  deleteClassroomFn,
  getAllClassroomsFn,
  getAllFacultiesFn,
  updateClassroomFn,
} from "@/services/setup/faculty-n-classroom";
import type {
  ClassroomsGet,
  ClassroomsPost,
} from "@/types/api/setup/faculty-n-classroom";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TableActions } from "../table-action";
import { SetupPage } from "../setup-page";
import { Building } from "lucide-react";

const AddClassroom = () => {
  // states
  const [form] = Form.useForm<ClassroomsPost>();
  const [record, setRecord] = useState<ClassroomsGet | null>(null);
  const qc = useQueryClient();

  // effects
  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ClassRoomName: record.classRoomName,
        FacultyId: record.facultyId,
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  // queries
  const { data: classrooms, isLoading: loadingClassrooms } = useFetch({
    queryFn: getAllClassroomsFn,
    queryKeys: classroomKeys.list(),
  });
  const { data: faculties, isLoading: loadingFaculties } = useFetch({
    queryFn: getAllFacultiesFn,
    queryKeys: facultyKeys.list(),
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!classrooms) return [];
    return classrooms;
  }, [classrooms]);
  const facultyOptions = useMemo(() => {
    if (!faculties) return [];
    return faculties.map((f) => ({
      label: f.facultyName,
      value: f.facultyId,
    }));
  }, [faculties]);
  const showFaculties = faculties && faculties.length > 0;

  // mutations
  const { mutate: createClassroom, isPending: creatingClassroom } = usePost({
    postFn: createClassroomFn,
    mutationOptions: { mutationKey: ["classrooms", "create"] },
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
      toast.error(`Failed to create classroom`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteClassroom, isPending: deletingClassroom } = usePost({
    postFn: deleteClassroomFn,
    mutationOptions: { mutationKey: ["classrooms", "delete"] },
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
      toast.error(`Failed to delete classroom`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateClassroom, isPending: updatingClassroom } = useUpdate({
    updateFn: updateClassroomFn,
    mutationOptions: { mutationKey: ["classrooms", "update"] },
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
      toast.error(`Failed to update classroom`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: classroomKeys.list() });
  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };
  const onFinish = (values: ClassroomsPost) => {
    if (record?.classRoomId) {
      updateClassroom({ data: values, id: record.classRoomId });
    } else {
      createClassroom(values);
    }
  };

  // data
  const columns: ColumnsType<ClassroomsGet> = [
    ...(showFaculties
      ? [
          {
            key: "facultyName",
            title: "Faculty",
            dataIndex: "facultyName",
            render: (v: string) => (
              <span className="font-semibold capitalize text-[#0D1B2E]">
                {v}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "classRoomName",
      title: "Room Name",
      dataIndex: "classRoomName",
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
          onConfirmDelete={() => deleteClassroom(row.classRoomId)}
          deleteTitle="Delete this classroom?"
        />
      ),
    },
  ];
  const isPending = creatingClassroom || deletingClassroom || updatingClassroom;

  return (
    <SetupPage
      title="Classroom"
      showClock={false}
      showTitle={false}
      icon={<Building className="w-5 h-5" />}
      hint={{
        note: "Classroom are the individual physical building or structures that activities occur inside like learning, examination, etc",
        example: "Sci 1, Room A1, Room 1, etc",
      }}
      record={record}
      onClearRecord={onReset}
      onFinish={onFinish}
      form={form}
      isPending={isPending}
      pendingLabel={
        creatingClassroom
          ? "Creating classroom…"
          : deletingClassroom
            ? "Deleting classroom…"
            : updatingClassroom
              ? "Updating classroom…"
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
          <Form.Item
            name="FacultyId"
            label="Faculty"
            hidden={!showFaculties || loadingFaculties}
          >
            <Select
              placeholder="Select faculty"
              options={[...facultyOptions, { label: "No Faculty", value: "" }]}
              disabled={loadingFaculties}
              loading={loadingFaculties}
              size="large"
            />
          </Form.Item>
          <Form.Item name="ClassRoomName" label="Room Name">
            <Input placeholder="Room name e.g. Sci 1, Room A1, Room 1, etc" />
          </Form.Item>
        </>
      }
    />
  );
};
export default AddClassroom;
