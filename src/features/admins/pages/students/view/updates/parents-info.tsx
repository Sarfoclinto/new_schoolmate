import { studentKeys } from "@/config/query-keys";
import {
  FL,
  PhotoBox,
  SaveBtn,
} from "@/features/admins/components/util-components";
import { usePhotoState } from "@/features/admins/util-fns";
import useUpdate from "@/hooks/api/use-update";
import { updateStuParentsInfoFn } from "@/services/student";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Radio } from "antd";
import { Phone, User } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface Props {
  mother: {
    id: string;
    name: string;
    img: string;
    phone: string;
    occupation: string;
    status: "Deceased" | "Alive";
  };
  father: {
    studentId: string;
    id: string;
    name: string;
    img: string;
    phone: string;
    occupation: string;
    status: "Deceased" | "Alive";
  };
}

const UpdateStudentParents = ({ mother, father }: Props) => {
  const [form] = Form.useForm();
  const qc = useQueryClient();
  const fatherPhoto = usePhotoState(father.img);
  const motherPhoto = usePhotoState(mother.img);

  useEffect(() => {
    form.setFieldsValue({
      FatherFullName: father.name,
      FatherOccupation: father.occupation,
      FatherContact: father.phone,
      FatherLivingStatus: father.status || "Alive",
      MotherFullName: mother.name,
      MotherOccupation: mother.occupation,
      MotherContact: mother.phone,
      MotherLivingStatus: mother.status || "Alive",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [father, mother]);

  const { mutate: update, isPending: updating } = useUpdate({
    updateFn: updateStuParentsInfoFn,
    mutationOptions: {
      mutationKey: ["student-update", "parents-info", father.studentId],
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
    qc.invalidateQueries({ queryKey: studentKeys.detail(father.studentId) });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (v: any) => {
    const fd = new FormData();
    (["Father", "Mother"] as const).forEach((p) => {
      if (v[`${p}FullName`]) fd.append(`${p}FullName`, v[`${p}FullName`]);
      if (v[`${p}Contact`]) fd.append(`${p}Contact`, v[`${p}Contact`]);
      if (v[`${p}Occupation`]) fd.append(`${p}Occupation`, v[`${p}Occupation`]);
      if (v[`${p}LivingStatus`])
        fd.append(`${p}LivingStatus`, v[`${p}LivingStatus`]);
      const imgs = p === "Father" ? fatherPhoto.fileList : motherPhoto.fileList;
      imgs.forEach((f) => {
        if (f.originFileObj) fd.append(`${p}Image`, f.originFileObj);
      });
    });
    update({ data: fd, id: father.studentId });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={onFinish}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="flex flex-col gap-y-4">
        <ParentFormSection prefix="Father" title="Father" photo={fatherPhoto} />
        <ParentFormSection prefix="Mother" title="Mother" photo={motherPhoto} />
      </div>
      <SaveBtn isPending={updating} />
    </Form>
  );
};
export default UpdateStudentParents;

/** A single parent sub-form — reused for Father and Mother */
const ParentFormSection = ({
  prefix,
  title,
  photo,
}: {
  prefix: "Father" | "Mother";
  title: string;
  photo: ReturnType<typeof usePhotoState>;
}) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-y-0">
    <div className="flex items-center gap-x-2.5 mb-3">
      <div className="w-6 h-6 rounded-lg bg-[#0D1B2E] flex items-center justify-center shrink-0">
        <User className="w-3.5 h-3.5 text-[#C9A84C]" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-[#1E3A5F]">
        {title}
      </span>
    </div>

    <PhotoBox
      label={`${title}'s Photo`}
      previewUrl={photo.previewUrl}
      fileList={photo.fileList}
      onChange={photo.handleChange}
    />

    <Form.Item
      name={`${prefix}FullName`}
      label={<FL>Full Name</FL>}
      className="mb-2!"
    >
      <Input
        size="large"
        placeholder={`${title}'s full name`}
        prefix={<User className="w-4 h-4 text-slate-300 mr-1" />}
        className="my-0! py-0!"
      />
    </Form.Item>
    <Form.Item
      name={`${prefix}Occupation`}
      label={<FL>Occupation</FL>}
      className="mb-2!"
    >
      <Input size="large" placeholder="Occupation" />
    </Form.Item>
    <Form.Item
      name={`${prefix}Contact`}
      label={<FL>Phone Number</FL>}
      className="mb-2!"
    >
      <Input
        size="large"
        placeholder="Phone number"
        prefix={<Phone className="w-4 h-4 text-slate-300 mr-1" />}
        className="my-0! py-0!"
      />
    </Form.Item>
    <Form.Item
      name={`${prefix}LivingStatus`}
      label={<FL>Living Status</FL>}
      className="mb-0!"
    >
      <Radio.Group block>
        <Radio.Button value="Alive">Alive</Radio.Button>
        <Radio.Button value="Deceased">Deceased</Radio.Button>
      </Radio.Group>
    </Form.Item>
  </div>
);
