import { infrastructureKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import {
  createFacilityFn,
  deleteFacilityFn,
  getAllFacilitiesFn,
  updateFacilityFn,
} from "@/services/setup/facilities";
import type { StructureGet, StructurePost } from "@/types/api/setup/facilities";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TableActions } from "../../components/table-action";
import { SetupPage } from "../../components/setup-page";
import { Building2 } from "lucide-react";

const Facilities = () => {
  // states
  const [form] = Form.useForm<StructurePost>();
  const [record, setRecord] = useState<StructureGet | null>(null);
  const qc = useQueryClient();

  //   effects
  useEffect(() => {
    if (record && record.infrastructureId) {
      form.setFieldsValue({
        InfrastructureName: record.infrastructureName,
        InfrastructureAlias: record?.infrastructureAlias,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  //   queries
  const { data: infrastructure, isLoading: loadingInfrastructure } = useFetch({
    queryFn: getAllFacilitiesFn,
    queryKeys: infrastructureKeys.list(),
  });

  //   memoized values
  const dataSource = useMemo(() => {
    if (!infrastructure) return [];
    return infrastructure;
  }, [infrastructure]);

  //   mutations
  const { mutate: addFacility, isPending: addingFacility } = usePost({
    postFn: createFacilityFn,
    mutationOptions: { mutationKey: ["infrastructure", "create"] },
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
      toast.error(`Failed to create infrastructure`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateFacility, isPending: updatingFacility } = useUpdate({
    updateFn: updateFacilityFn,
    mutationOptions: { mutationKey: ["infrastructure", "update"] },
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
      toast.error(`Failed to update infrastructure`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteFacility, isPending: deletingFacility } = usePost({
    postFn: deleteFacilityFn,
    mutationOptions: { mutationKey: ["infrastructure", "delete"] },
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
      toast.error(`Failed to delete infrastructure`, {
        description: err?.message,
      });
    },
  });

  //   fns
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: infrastructureKeys.list() });
  };
  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };
  const onFinish = (values: StructurePost) => {
    if (record?.infrastructureId) {
      updateFacility({ data: values, id: record.infrastructureId });
    } else {
      addFacility(values);
    }
  };

  // data
  const columns: ColumnsType<StructureGet> = [
    {
      key: "infrastructureName",
      title: "Infrastructure Name",
      dataIndex: "infrastructureName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "Alias",
      title: "Alias",
      dataIndex: "infrastructureAlias",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">
          {v ?? "-"}
        </span>
      ),
    },
    {
      key: "action",
      title: "Actions",
      width: 100,
      align: "right",
      render: (_, row) => (
        <TableActions
          onEdit={() => setRecord(row)}
          onDelete={() => {}}
          onConfirmDelete={() => deleteFacility(row.infrastructureId)}
          deleteTitle="Delete this facility?"
        />
      ),
    },
  ];
  const isPending = addingFacility || updatingFacility || deletingFacility;

  return (
    <SetupPage
      title="Facilities"
      breadcrumb={["Institution-Setup", "Facilities"]}
      hint={{
        note: "These are the physical locations within the instituion where educational activities take place.",
        example: "X-Library, B-Laboratory, Z-Hall, etc",
      }}
      icon={<Building2 className="w-4 h-4" />}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        updatingFacility
          ? "Updating…"
          : deletingFacility
            ? "Deleting…"
            : "Adding…"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingInfrastructure,
        rowKey: "infrastructureId",
        showHeader: false,
      }}
      formContent={
        <>
          <Form.Item
            label={<span className="font-medium roboto">Facility Name</span>}
            name="InfrastructureName"
            rules={[
              {
                required: true,
                message: "Structure name is required",
              },
            ]}
          >
            <Input placeholder="eg. X-Library, B-Laboratory, Z-Hall, etc" />
          </Form.Item>
          <Form.Item
            label={<span className="font-medium roboto">Alias</span>}
            name="InfrastructureAlias"
          >
            <Input placeholder="eg. PH-Lab, etc" />
          </Form.Item>
        </>
      }
    />
  );
};
export default Facilities;
