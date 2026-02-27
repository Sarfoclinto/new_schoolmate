import { usePhotoState } from "@/features/admins/util-fns";
import { useQueryClient } from "@tanstack/react-query";
import { DatePicker, Form, Input, Select } from "antd";
import { useEffect } from "react";
import dayjs from "@/lib/dayjs";
import { studentKeys } from "@/config/query-keys";
import useUpdate from "@/hooks/api/use-update";
import { updateStuPersonalInfoFn } from "@/services/student";
import { toast } from "sonner";
import {
  CameraModal,
  Divider,
  FL,
  Opt,
  PhotoBox,
  SaveBtn,
} from "@/features/admins/components/util-components";
import { Globe, Mail, MapPin, Phone, User } from "lucide-react";
import { disableFutureDate } from "@/utils/date-n-time";

interface Props {
  personalData: {
    id: string;
    surname: string;
    firstname: string;
    othername: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    contact: string;
    nationality: string;
    religion: string;
    note: string;
    img: string;
    phone: string;
    address: string;
  };
}

const UpdateStudentPersonalInfo = ({ personalData }: Props) => {
  const [form] = Form.useForm();
  const qc = useQueryClient();
  const photo = usePhotoState(personalData.img);

  useEffect(() => {
    form.setFieldsValue({
      Surname: personalData.surname,
      FirstName: personalData.firstname,
      OtherName: personalData.othername,
      DateOfBirth: personalData.dateOfBirth
        ? dayjs(personalData.dateOfBirth)
        : undefined,
      Gender: personalData.gender,
      Email: personalData.email,
      Contact: personalData.contact,
      Nationality: personalData.nationality,
      Religion: personalData.religion,
      Address: personalData.address,
      Note: personalData.note,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalData]);

  const { mutate: update, isPending: updating } = useUpdate({
    updateFn: updateStuPersonalInfoFn,
    mutationOptions: {
      mutationKey: ["student-update", "personal-info", personalData.id],
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

  // fns
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: studentKeys.detail(personalData.id) });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (v: any) => {
    const fd = new FormData();
    fd.append("Surname", v.Surname);
    fd.append("FirstName", v.FirstName);
    if (v.OtherName) fd.append("OtherName", v.OtherName);
    fd.append("DateOfBirth", dayjs(v.DateOfBirth).format("YYYY-MM-DD"));
    fd.append("Gender", v.Gender);
    fd.append("Address", v.Address);
    if (v.Email) fd.append("Email", v.Email);
    if (v.Contact) fd.append("Contact", v.Contact);
    fd.append("Nationality", v.Nationality);
    fd.append("Religion", v.Religion);
    if (v.Note) fd.append("Note", v.Note);
    photo.fileList.forEach((f) => {
      if (f.originFileObj) fd.append("StudentImage", f.originFileObj);
    });
    update({ data: fd, id: personalData.id });
  };

  return (
    <>
      <CameraModal
        open={photo.cameraOpen}
        webcamRef={photo.webcamRef}
        onCapture={photo.capture}
        onClose={() => {
          photo.stopStream();
          photo.setCameraOpen(false);
        }}
      />

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Divider label="Student Photo" />
        <PhotoBox
          label="Student Photo"
          previewUrl={photo.previewUrl}
          fileList={photo.fileList}
          onChange={photo.handleChange}
          onCamera={() => photo.setCameraOpen(true)}
        />

        <Divider label="Name" />
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="Surname"
            label={<FL>Surname</FL>}
            rules={[{ required: true, message: "Required" }]}
            className="mb-3!"
          >
            <Input
              size="large"
              placeholder="Surname"
              prefix={<User className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>
          <Form.Item
            name="FirstName"
            label={<FL>First Name</FL>}
            rules={[{ required: true, message: "Required" }]}
            className="mb-3!"
          >
            <Input
              size="large"
              placeholder="First name"
              prefix={<User className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>
        </div>
        <Form.Item
          name="OtherName"
          label={
            <FL>
              Other Name <Opt />
            </FL>
          }
          className="mb-3!"
        >
          <Input size="large" placeholder="Other / middle name" />
        </Form.Item>

        <Divider label="Personal Details" />
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="DateOfBirth"
            label={<FL>Date of Birth</FL>}
            rules={[{ required: true, message: "Required" }]}
            className="mb-3!"
          >
            <DatePicker
              disabledDate={disableFutureDate}
              size="large"
              className="w-full"
              placeholder="Select date"
            />
          </Form.Item>
          <Form.Item
            name="Gender"
            label={<FL>Gender</FL>}
            rules={[{ required: true, message: "Required" }]}
            className="mb-3!"
          >
            <Select
              size="large"
              placeholder="Select"
              options={["Male", "Female"].map((v) => ({ label: v, value: v }))}
            />
          </Form.Item>
        </div>
        <Form.Item
          name="Address"
          label={<FL>Home Address</FL>}
          rules={[{ required: true, message: "Required" }]}
          className="mb-3!"
        >
          <Input
            size="large"
            placeholder="Residential address"
            prefix={<MapPin className="w-4 h-4 text-slate-300 mr-1" />}
            className="my-0! py-0!"
          />
        </Form.Item>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="Email"
            label={
              <FL>
                Email <Opt />
              </FL>
            }
            rules={[{ type: "email", message: "Invalid email" }]}
            className="mb-3!"
          >
            <Input
              size="large"
              placeholder="Email"
              prefix={<Mail className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>
          <Form.Item
            name="Contact"
            label={
              <FL>
                Phone <Opt />
              </FL>
            }
            className="mb-3!"
          >
            <Input
              size="large"
              placeholder="Phone"
              prefix={<Phone className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="Nationality"
            label={<FL>Nationality</FL>}
            rules={[{ required: true, message: "Required" }]}
            className="mb-3!"
          >
            <Input
              size="large"
              placeholder="e.g. Ghanaian"
              prefix={<Globe className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>
          <Form.Item
            name="Religion"
            label={<FL>Religion</FL>}
            rules={[{ required: true, message: "Required" }]}
            className="mb-3!"
          >
            <Select
              size="large"
              placeholder="Select"
              options={[
                "Christianity",
                "Islam",
                "Buddhism",
                "Hinduism",
                "Judaism",
                "Other",
              ].map((v) => ({ label: v, value: v }))}
            />
          </Form.Item>
        </div>

        <Divider label="Notes" />
        <Form.Item
          name="Note"
          label={
            <FL>
              Additional Note <Opt />
            </FL>
          }
          className="mb-3!"
        >
          <Input.TextArea
            rows={3}
            placeholder="Any additional notes…"
            className="rounded-xl! resize-none"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <SaveBtn isPending={updating} />
      </Form>
    </>
  );
};

export default UpdateStudentPersonalInfo;
