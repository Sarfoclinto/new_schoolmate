import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import {
  createRoleFn,
  deleteRoleFn,
  getAllRolesFn,
  updateRoleFn,
} from "@/services/setup/roles";
import {
  RolePostSchema,
  type RoleGet,
  type RolePost,
} from "@/types/api/setup/roles";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
import { toast } from "sonner";
import { TableActions } from "../../components/table-action";
import { useState } from "react";
import { SetupPage } from "../../components/setup-page";
import { Shield } from "lucide-react";
import { Form, Input, Select } from "antd";
import { roleKeys } from "@/config/query-keys";

const Roles = () => {
  // states
  const [form] = Form.useForm();
  const [record, setRecord] = useState<RoleGet | null>(null);
  const qc = useQueryClient();

  // queries
  const { data: roles, isLoading: loadingRoles } = useFetch({
    queryFn: getAllRolesFn,
    queryKeys: roleKeys.list(),
  });

  // fns
  const invalidate = () => qc.invalidateQueries({ queryKey: roleKeys.all });

  // mutations
  const { mutate: addRole, isPending: addingRole } = usePost({
    postFn: createRoleFn,
    mutationOptions: { mutationKey: ["roles", "create"] },
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
      toast.error(`Failed to create role`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateRole, isPending: updatingRole } = useUpdate({
    updateFn: updateRoleFn,
    mutationOptions: { mutationKey: ["roles", "update"] },
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
      toast.error(`Failed to create role`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteRole, isPending: deletingRole } = usePost({
    postFn: deleteRoleFn,
    mutationOptions: { mutationKey: ["roles", "delete"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();
        toast.success(responseMessage);
        onReset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create role`, {
        description: err?.message,
      });
    },
  });

  // fns
  const onFinish = (values: RolePost) => {
    const result = RolePostSchema.safeParse(values);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    if (record?.roleId) {
      updateRole({ data: result.data, id: record.roleId });
    } else {
      addRole(result.data);
    }
  };
  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };

  // data
  const columns: ColumnsType<RoleGet> = [
    {
      key: "roleName",
      title: "Role Name",
      dataIndex: "roleName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "dashboardType",
      title: "Dashboard Type",
      dataIndex: "dashboardType",
      render: (v: string) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            v === "admin"
              ? "bg-[#0D1B2E] text-[#C9A84C] border-[#0D1B2E]"
              : v === "staff"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                : ""
          }`}
        >
          {v ?? "unset"}
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
          onEdit={() => {
            setRecord(row);
            form.setFieldsValue({
              RoleName: row.roleName,
              DashboardType: row.dashboardType,
            });
          }}
          onDelete={() => {}}
          onConfirmDelete={() => deleteRole(row.roleId)}
          onCancelDelete={() => toast.info("Deletion aborted")}
          deleteTitle="Delete this role?"
        />
      ),
    },
  ];
  const isPending = loadingRoles || addingRole || updatingRole || deletingRole;

  return (
    <SetupPage
      title="Roles"
      breadcrumb={["Institution Setup", "Roles"]}
      icon={<Shield className="w-4 h-4" />}
      hint={{
        note: "Set up the various roles for your institution. This helps manage user access and permissions effectively.",
        example: "Teacher, Lab Technician, Supervisor, Librarian",
      }}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        updatingRole
          ? "Updating…"
          : deletingRole
            ? "Deleting…"
            : addingRole
              ? "Adding…"
              : "Add Role"
      }
      tableProps={{
        columns,
        dataSource: roles,
        loading: loadingRoles,
        rowKey: "roleId",
        showHeader: false,
      }}
      formContent={
        <>
          <Form.Item
            name="RoleName"
            label="Role Name"
            rules={[{ required: true, message: "Role name is required" }]}
          >
            <Input
              size="large"
              className="rounded-xl!"
              placeholder="e.g. Teacher, Lab Technician"
            />
          </Form.Item>
          <Form.Item
            name="DashboardType"
            label="Dashboard Type"
            rules={[
              { required: true, message: "Dashboard type is required" },
              { type: "enum", enum: ["admin", "staff"] },
            ]}
            extra={
              <span className="text-xs text-slate-500 mt-1.5 font-mono">
                Select the dashboard type for this role.
              </span>
            }
          >
            <Select
              placeholder="Select dashboard type"
              size="large"
              options={[
                { label: "Administrative", value: "admin" },
                { label: "Staff", value: "staff" },
              ]}
            />
          </Form.Item>
        </>
      }
    />
  );
};
export default Roles;
