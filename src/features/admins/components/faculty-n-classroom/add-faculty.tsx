import { facultyKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import {
  createFacultyFn,
  deleteFacultyFn,
  getAllFacultiesFn,
  updateFacultyFn,
} from "@/services/setup/faculty-n-classroom";
import type {
  FacultiesGet,
  FacultiesPost,
} from "@/types/api/setup/faculty-n-classroom";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox, Form, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { TableActions } from "../table-action";
import usePost from "@/hooks/api/use-post";
import { toast } from "sonner";
import useUpdate from "@/hooks/api/use-update";
import { SetupPage } from "../setup-page";
import { Building2 } from "lucide-react";

const AddFaculty = () => {
  // states
  const [form] = Form.useForm();
  const [record, setRecord] = useState<FacultiesGet | null>(null);
  // const [hasFaculty, setHasFaculty] = useState(false);
  const qc = useQueryClient();

  // effects
  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        FacultyName: record.facultyName,
        FacultyAlias: record.facultyAlias,
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  // queries
  const { data: faculties, isLoading: loadingFaculties } = useFetch({
    queryFn: getAllFacultiesFn,
    queryKeys: facultyKeys.list(),
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!faculties) return [];
    return faculties;
  }, [faculties]);

  // mutations
  const { mutate: createFaculty, isPending: creatingFaculty } = usePost({
    postFn: createFacultyFn,
    mutationOptions: { mutationKey: ["faculties", "create"] },
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
      toast.error(`Failed to create faculty`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteFaculty, isPending: deletingFaculty } = usePost({
    postFn: deleteFacultyFn,
    mutationOptions: { mutationKey: ["faculties", "delete"] },
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
      toast.error(`Failed to delete faculty`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateFaculty, isPending: updatingFaculty } = useUpdate({
    updateFn: updateFacultyFn,
    mutationOptions: { mutationKey: ["faculties", "update"] },
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
      toast.error(`Failed to update faculty`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: facultyKeys.list() });
  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };
  const onFinish = (values: FacultiesPost) => {
    if (record?.facultyId) {
      updateFaculty({ data: values, id: record.facultyId });
    } else {
      createFaculty(values);
    }
  };

  // data
  const columns: ColumnsType<FacultiesGet> = [
    {
      key: "facultyName",
      title: "Faculty Name",
      dataIndex: "facultyName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "facultyAlias",
      title: "Alias",
      dataIndex: "facultyAlias",
      render: (v: string) => (
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
          onConfirmDelete={() => deleteFaculty(row.facultyId)}
          deleteTitle="Delete this faculty?"
        />
      ),
    },
  ];
  const isPending = creatingFaculty || deletingFaculty || updatingFaculty;

  return (
    <SetupPage
      title="Faculty"
      showClock={false}
      showTitle={false}
      icon={<Building2 className="w-5 h-5" />}
      hint={{
        note: "A Faculty or Department is a unit within an educational institution responsible for teaching and training students. It typically includes classes and has its own courses, teachers, and resources",
        example: "Science, Arts, Engineering etc.",
      }}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        creatingFaculty
          ? "Creating faculty…"
          : deletingFaculty
            ? "Deleting faculty…"
            : updatingFaculty
              ? "Updating faculty…"
              : "Adding faculty…"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingFaculties,
        rowKey: "facultyId",
        showHeader: false,
      }}
      formContent={
        <>
          <Form.Item
            label="Faculty Name"
            name="FacultyName"
            rules={[
              {
                required: true,
                message: "Please input the faculty name!",
              },
            ]}
          >
            <Input placeholder="Faculty Name e.g. Science, Arts, Engineering" />
          </Form.Item>
          <Form.Item label="Faculty Alias" name="FacultyAlias">
            <Input placeholder="Faculty Alias e.g Sc, En" />
          </Form.Item>
          <Checkbox
            onChange={(e) => {
              const checked = e.target.checked;
              if (checked) {
                form.setFieldsValue({
                  FacultyAlias: form.getFieldValue("FacultyName"),
                });
              } else {
                form.setFieldsValue({ FacultyAlias: "" });
              }
            }}
          >
            Same as Faculty name
          </Checkbox>
        </>
      }
    />
  );
};
export default AddFaculty;
