import { studentKeys } from "@/config/query-keys";
import {
  Divider,
  FL,
  PhotoBox,
  SaveBtn,
} from "@/features/admins/components/util-components";
import { usePhotoState } from "@/features/admins/util-fns";
import useUpdate from "@/hooks/api/use-update";
import { updateStuGuardiansInfoFn } from "@/services/student";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select } from "antd";
import { MapPin, Phone, User } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface Props {
  guardian: {
    id: string;
    name: string;
    img: string;
    phone: string;
    occupation: string;
    address: string;
    relationship: string;
    studentId: string;
  };
}

const UpdateStudentGuardian = ({ guardian }: Props) => {
  const [form] = Form.useForm();
  const qc = useQueryClient();
  const photo = usePhotoState(guardian.img);

  useEffect(() => {
    form.setFieldsValue({
      GuardianFullname: guardian.name,
      GuardianContact: guardian.phone,
      GuardianOccupation: guardian.occupation,
      Relationship: guardian.relationship,
      GuardianAddress: guardian.address,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardian]);

  const { mutate: update, isPending: updating } = useUpdate({
    updateFn: updateStuGuardiansInfoFn,
    mutationOptions: {
      mutationKey: ["student-update", "guardian-info", guardian.studentId],
    },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        toast.success(responseMessage);
        invalidate();
        form.resetFields();
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (err) => {
      toast.error("Failed to update personal info", {
        description: err.message,
      });
    },
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: studentKeys.detail(guardian.studentId) });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (v: any) => {
    const fd = new FormData();
    fd.append("GuardianFullname", v.GuardianFullname);
    fd.append("GuardianContact", v.GuardianContact);
    fd.append("GuardianOccupation", v.GuardianOccupation);
    fd.append("Relationship", v.Relationship);
    fd.append("GuardianAddress", v.GuardianAddress);
    photo.fileList.forEach((f) => {
      if (f.originFileObj) fd.append("GuardianImage", f.originFileObj);
    });
    update({ data: fd, id: guardian.studentId });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={onFinish}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Divider label="Guardian Photo" />
      <PhotoBox
        label="Guardian Photo"
        previewUrl={photo.previewUrl}
        fileList={photo.fileList}
        onChange={photo.handleChange}
      />

      <Divider label="Guardian Details" />
      <Form.Item
        name="GuardianFullname"
        label={<FL>Full Name</FL>}
        rules={[{ required: true, message: "Required" }]}
        className="mb-3!"
      >
        <Input
          size="large"
          placeholder="Guardian's full name"
          prefix={<User className="w-4 h-4 text-slate-300 mr-1" />}
          className="my-0! py-0!"
        />
      </Form.Item>
      <div className="grid grid-cols-2 gap-x-4">
        <Form.Item
          name="GuardianContact"
          label={<FL>Phone</FL>}
          rules={[{ required: true, message: "Required" }]}
          className="mb-3!"
        >
          <Input
            size="large"
            placeholder="Phone number"
            prefix={<Phone className="w-4 h-4 text-slate-300 mr-1" />}
            className="my-0! py-0!"
          />
        </Form.Item>
        <Form.Item
          name="GuardianOccupation"
          label={<FL>Occupation</FL>}
          rules={[{ required: true, message: "Required" }]}
          className="mb-3!"
        >
          <Input size="large" placeholder="Occupation" />
        </Form.Item>
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <Form.Item
          name="Relationship"
          label={<FL>Relationship</FL>}
          rules={[{ required: true, message: "Required" }]}
          className="mb-3!"
        >
          <Select
            size="large"
            placeholder="Select"
            options={["Parent", "Sibling", "Relative", "Other"].map((v) => ({
              label: v,
              value: v,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="GuardianAddress"
          label={<FL>Address</FL>}
          rules={[{ required: true, message: "Required" }]}
          className="mb-3!"
        >
          <Input
            size="large"
            placeholder="Guardian's address"
            prefix={<MapPin className="w-4 h-4 text-slate-300 mr-1" />}
            className="my-0! py-0!"
          />
        </Form.Item>
      </div>

      <SaveBtn isPending={updating} />
    </Form>
  );
};
export default UpdateStudentGuardian;
