import { MotionDiv } from "@/components/custom/motion";
import { roleKeys } from "@/config/query-keys";
import {
  Divider,
  FL,
  Section,
} from "@/features/admins/components/util-components";
import useFetch from "@/hooks/api/use-fetch";
import useUpdate from "@/hooks/api/use-update";
import { getAllRolesFn } from "@/services/setup/roles";
import { adminUpdateStaffFn } from "@/services/staff";
import type { AdminUpdateStaffType } from "@/types/api/staff";
import { Button, Form, Select } from "antd";
import { UserCog } from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

interface Props {
  data: { title: string; staffMode: string; role: string };
  staffId: string;
  invalidate: () => Promise<void>;
}

type FormValues = {
  Title: string;
  StaffMode: string;
  Role: string;
};

const AdminUpdateStaff = ({ data, invalidate, staffId }: Props) => {
  const [form] = Form.useForm<FormValues>();

  // queries
  const { data: roles, isLoading: loadingRoles } = useFetch({
    queryFn: getAllRolesFn,
    queryKeys: roleKeys.custom("list"),
  });

  // effects
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        Title: data.title,
        StaffMode: data.staffMode,
        Role: roles?.find((r) => r.roleName === data.role)?.roleId ?? undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, roles]);

  // memoized data
  const roleOption = useMemo(() => {
    if (!roles) return [];
    return roles.map((r) => ({
      label: r.roleName,
      value: r.roleId,
    }));
  }, [roles]);

  const { mutate: update, isPending: updating } = useUpdate({
    updateFn: adminUpdateStaffFn,
    mutationOptions: { mutationKey: ["staff", "update", staffId] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
        await invalidate();
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (err) => {
      toast.error("Something went wrong!", {
        description: err.message,
      });
    },
  });

  const onFinish = async (values: FormValues) => {
    if (!staffId) {
      toast.error("Something went wrong!", {
        description: "User is missing",
      });
      return;
    }
    const payload: AdminUpdateStaffType["data"] = {
      title: values.Title,
      staffMode: values.StaffMode,
      roleId: values.Role,
    };
    console.log("payload: ", payload);

    update({ data: payload, id: staffId });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={onFinish}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Divider label="Personal Details" />
      <Section
        step={1}
        title="Employment Details"
        icon={<UserCog className="w-4 h-4" />}
        delay={0.1}
        cols={1}
      >
        <Form.Item
          name="Title"
          label={<FL>Title</FL>}
          rules={[{ required: true, message: "Title is required" }]}
          className="mb-0!"
        >
          <Select
            size="large"
            placeholder="Mr / Mrs…"
            options={["Mr", "Mrs", "Ms", "Dr"].map((v) => ({
              label: v,
              value: v,
            }))}
          />
        </Form.Item>
      </Section>

      <Divider label="Employment Placement" />

      <Section
        step={2}
        title="Employment Details"
        icon={<UserCog className="w-4 h-4" />}
        delay={0.5}
        cols={1}
      >
        <Form.Item
          name="StaffMode"
          label={<FL>Staff Mode</FL>}
          rules={[{ required: true, message: "Staff mode is required" }]}
          className="mb-0!"
        >
          <Select
            size="large"
            placeholder="Select mode"
            options={[
              { label: "Teaching Staff", value: "TEACHING" },
              { label: "Non-Teaching Staff", value: "NON-TEACHING" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="Role"
          label={<FL>Role</FL>}
          rules={[{ required: true, message: "Role is required" }]}
          className="mb-0!"
        >
          <Select
            size="large"
            placeholder="Select role"
            showSearch
            options={roleOption}
            loading={loadingRoles}
            disabled={loadingRoles}
          />
        </Form.Item>
      </Section>

      <Divider label="Submit" />

      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <Form.Item className="mb-0!">
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            block
            loading={updating}
            disabled={updating}
            className="h-12! rounded-xl! font-bold! tracking-wide!"
          >
            Update Staff
          </Button>
        </Form.Item>
      </MotionDiv>
    </Form>
  );
};
export default AdminUpdateStaff;
