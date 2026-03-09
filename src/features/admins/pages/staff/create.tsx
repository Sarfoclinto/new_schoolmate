import { roleKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import { getAllRolesFn } from "@/services/setup/roles";
import { dataURLtoFile } from "@/utils/others";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Upload,
  type UploadFile,
} from "antd";
import {
  Camera,
  ChevronRight,
  FileText,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Shield,
  UploadIcon,
  User,
  UserCog,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import dayjs from "@/lib/dayjs";
import { MotionDiv } from "@/components/custom/motion";
import { FL, Section } from "../../components/util-components";
import { disableFutureDate } from "@/utils/date-n-time";
import { createStaffFn } from "@/services/staff";
import { toast } from "sonner";
import paths from "@/config/routes";
import { useNavigate } from "react-router-dom";

const ID_LENGTHS: Record<string, number> = {
  "Personal ID": 15,
  "Voter ID": 10,
  Passport: 9,
  "NHIS Card": 13,
  "Staff Id": 8,
};

const CreateStaff = () => {
  // states
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState<UploadFile[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("/no-logo.png");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam | null>(null);
  const navigate = useNavigate();

  // queries
  const { data: roles, isLoading: loadingRoles } = useFetch({
    queryFn: getAllRolesFn,
    queryKeys: roleKeys.list(),
  });

  // memoized values
  const roleOption = useMemo(() => {
    if (!roles) return [];
    return roles.map((role) => ({
      label: role.roleName,
      value: role.roleId,
    }));
  }, [roles]);

  // handlers
  const handleAvatarChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setAvatarFile(fileList);
    if (fileList[0]?.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarUrl(e.target?.result as string);
      reader.readAsDataURL(fileList[0].originFileObj);
    } else {
      setAvatarUrl("/no-logo.png");
    }
  };

  const stopStream = () => {
    const stream = webcamRef.current?.video?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
  };

  const capture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setAvatarUrl(imageSrc);
      setAvatarFile([
        {
          uid: "-1",
          name: "captured.jpg",
          status: "done",
          url: imageSrc,
          originFileObj: dataURLtoFile(imageSrc, "captured.jpg"),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ]);
      stopStream();
      setIsCameraOpen(false);
    }
  };

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
    setTimeout(() => {
      if (webcamRef.current?.video) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((s) => {
            webcamRef.current!.video!.srcObject = s;
          })
          .catch(console.error);
      }
    }, 100);
  };

  // mutations
  const { mutate: registerStaff, isPending: registering } = usePost({
    postFn: createStaffFn,
    mutationOptions: { mutationKey: ["staff", "create"] },
    onSuccess: ({
      response: { responseCode, responseMessage },
      data: { staffId },
    }) => {
      if (responseCode === 1) {
        toast.success(responseMessage, {
          action: staffId
            ? {
                label: "View",
                onClick: () =>
                  navigate(paths.admin.staffDetails.href, {
                    state: { staffId },
                  }),
              }
            : undefined,
        });
        form.resetFields();
        setAvatarFile([]);
        setAvatarUrl("/no-logo.png");
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error("An error occurred. Please try again.", {
        description: err.message,
      });
    },
  });

  // events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (values: any) => {
    const fd = new FormData();
    fd.append("Title", values.Title);
    fd.append("FirstName", values.FirstName);
    fd.append("LastName", values.LastName);
    fd.append("DateOfBirth", dayjs(values.DateOfBirth).format("YYYY-MM-DD"));
    fd.append("Gender", values.Gender);
    fd.append("Address", values.Address);
    fd.append("StaffPhone", values.TeacherPhone);
    fd.append("Email", values.Email);
    fd.append("StaffMode", values.StaffMode);
    fd.append("RoleId", values.Role);
    fd.append("NationalId", values.NationalId);
    fd.append("Religion", values.Religion);
    fd.append("EmergencyName", values.EmergencyName);
    fd.append("EmergencyContact", values.EmergencyContact);
    fd.append("EmergencyRelationship", values.EmergencyRelationship);
    fd.append("Note", values.Note ?? "");
    avatarFile.forEach((f) => {
      if (f.originFileObj) fd.append("StaffImage", f.originFileObj);
    });
    registerStaff(fd);
  };

  return (
    <div className="flex flex-col p-2">
      <CameraModal
        open={isCameraOpen}
        webcamRef={webcamRef}
        onCapture={capture}
        onClose={() => {
          stopStream();
          setIsCameraOpen(false);
        }}
      />

      {/* Page header */}
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <div>
          <h1
            className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Staff Registration
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Staff</span>
            <ChevronRight className="w-3 h-3" />
            <span>Register Staff</span>
          </nav>
        </div>
        <div className="flex items-center gap-x-3 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            Required
          </span>
          <span className="flex items-center gap-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-300 inline-block" />
            Optional
          </span>
        </div>
      </MotionDiv>

      <Form
        layout="vertical"
        // requiredMark={false}
        onFinish={onFinish}
        form={form}
        className="flex flex-col gap-5"
      >
        {/* ── 1. Basic Information ── */}
        <Section
          step={1}
          title="Basic Information"
          icon={<User className="w-4 h-4" />}
          delay={0.05}
        >
          <PhotoUpload
            avatarUrl={avatarUrl}
            avatarFile={avatarFile}
            onFileChange={handleAvatarChange}
            onCapture={handleOpenCamera}
          />

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

          <Form.Item
            name="FirstName"
            label={<FL>First Name</FL>}
            rules={[{ required: true, message: "First name is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="First name"
              prefix={<User className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>

          <Form.Item
            name="LastName"
            label={<FL>Last Name</FL>}
            rules={[{ required: true, message: "Last name is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="Last name"
              prefix={<User className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>

          <Form.Item
            name="DateOfBirth"
            label={<FL>Date of Birth</FL>}
            rules={[{ required: true, message: "Date of birth is required" }]}
            className="mb-0!"
          >
            <DatePicker
              disabledDate={disableFutureDate}
              placeholder="Select date"
              size="large"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="Gender"
            label={<FL>Gender</FL>}
            rules={[{ required: true, message: "Gender is required" }]}
            className="mb-0!"
          >
            <Select
              size="large"
              placeholder="Select gender"
              options={["Male", "Female"].map((v) => ({ label: v, value: v }))}
            />
          </Form.Item>

          <Form.Item
            name="Religion"
            label={<FL>Religion</FL>}
            rules={[{ required: true, message: "Religion is required" }]}
            className="mb-0!"
          >
            <Select
              size="large"
              placeholder="Select religion"
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
        </Section>

        {/* ── 2. Employment Details ── */}
        <Section
          step={2}
          title="Employment Details"
          icon={<UserCog className="w-4 h-4" />}
          delay={0.1}
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
              options={roleOption}
              loading={loadingRoles}
              disabled={loadingRoles}
            />
          </Form.Item>
        </Section>

        {/* ── 3. Contact & Address ── */}
        <Section
          step={3}
          title="Contact & Address"
          icon={<Phone className="w-4 h-4" />}
          delay={0.15}
        >
          <Form.Item
            name="TeacherPhone"
            label={<FL>Phone Number</FL>}
            rules={[{ required: true, message: "Phone number is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="+233 XX XXX XXXX"
              prefix={<Phone className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>

          <Form.Item
            name="Email"
            label={<FL>Email Address</FL>}
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="staff@school.edu"
              prefix={<Mail className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>

          <Form.Item
            name="Address"
            label={<FL>Home Address</FL>}
            rules={[{ required: true, message: "Address is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="Residential address"
              prefix={<MapPin className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>
        </Section>

        {/* ── 4. Identification ── */}
        <Section
          step={4}
          title="Identification"
          icon={<Shield className="w-4 h-4" />}
          delay={0.2}
        >
          <Form.Item
            name="IdType"
            label={<FL>ID Type</FL>}
            rules={[{ required: true, message: "ID type is required" }]}
            className="mb-0!"
          >
            <Select
              size="large"
              placeholder="Select ID type"
              onChange={() => form.setFieldValue("NationalId", "")}
              options={[
                "Personal ID",
                "Voter ID",
                "Passport",
                "NHIS Card",
                "Staff Id",
              ].map((v) => ({ label: v, value: v }))}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.IdType !== curr.IdType}
          >
            {({ getFieldValue }) => {
              const idType = getFieldValue("IdType");
              const length = ID_LENGTHS[idType] || 16;

              return (
                <Form.Item
                  name="NationalId"
                  label={<FL>National ID Number</FL>}
                  rules={[
                    { required: true, message: "National ID is required" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        if (value.length !== length) {
                          return Promise.reject(
                            new Error(`ID must be exactly ${length} digits`),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="mb-0! col-span-full sm:col-span-2"
                >
                  <Input.OTP length={length} />
                </Form.Item>
              );
            }}
          </Form.Item>

          {/* <Form.Item
            name="NationalId"
            label={<FL>National ID Number</FL>}
            rules={[{ required: true, message: "National ID is required" }]}
            className="mb-0! col-span-full sm:col-span-2"
          >
            <Input.OTP length={16} />
          </Form.Item> */}
        </Section>

        {/* ── 5. Emergency Contact ── */}
        <Section
          step={5}
          title="Emergency Contact"
          icon={<HeartPulse className="w-4 h-4" />}
          delay={0.25}
        >
          <Form.Item
            name="EmergencyName"
            label={<FL>Contact Name</FL>}
            rules={[{ required: true, message: "Name is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="Full name"
              prefix={<User className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>

          <Form.Item
            name="EmergencyContact"
            label={<FL>Contact Number</FL>}
            rules={[{ required: true, message: "Number is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="Phone number"
              prefix={<Phone className="w-4 h-4 text-slate-300 mr-1" />}
              className="my-0! py-0!"
            />
          </Form.Item>

          <Form.Item
            name="EmergencyRelationship"
            label={<FL>Relationship</FL>}
            rules={[{ required: true, message: "Relationship is required" }]}
            className="mb-0!"
          >
            <Select
              size="large"
              placeholder="Select relationship"
              options={["Sibling", "Parent", "Spouse", "Relative", "Other"].map(
                (v) => ({ label: v, value: v }),
              )}
            />
          </Form.Item>
        </Section>

        {/* ── 6. Additional Notes ── */}
        <MotionDiv
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          <div
            className="flex items-center gap-x-3 px-6 py-3.5 border-b border-slate-100"
            style={{
              background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
            }}
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-x-2">
              <span
                className="text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                06
              </span>
              <span
                className="text-white font-semibold text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Additional Notes{" "}
                <span className="text-white/40 font-normal text-xs ml-1">
                  optional
                </span>
              </span>
            </div>
          </div>
          <div className="p-6">
            <Form.Item name="Note" className="mb-0!">
              <Input.TextArea
                rows={4}
                placeholder="Any additional notes about this staff member…"
                className="rounded-xl! resize-none"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </div>
        </MotionDiv>

        {/* Submit */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="pb-4"
        >
          <Form.Item className="mb-0!">
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              block
              loading={registering}
              disabled={registering}
              className="h-12! rounded-xl! font-bold! tracking-wide!"
            >
              Register Staff Member
            </Button>
          </Form.Item>
        </MotionDiv>
      </Form>
    </div>
  );
};
export default CreateStaff;

// ─── Photo upload widget ──────────────────────────────────
const PhotoUpload = ({
  avatarUrl,
  avatarFile,
  onFileChange,
  onCapture,
  label = "Staff Photo",
}: {
  avatarUrl: string;
  avatarFile: UploadFile[];
  onFileChange: (fl: { fileList: UploadFile[] }) => void;
  onCapture: () => void;
  label?: string;
}) => (
  <div className="col-span-full flex flex-col sm:flex-row items-center gap-5 pb-6 mb-2 border-b border-slate-100">
    <div className="relative shrink-0">
      <div
        className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50"
        style={{ boxShadow: "0 4px 16px rgba(13,27,46,0.10)" }}
      >
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/no-logo.png";
          }}
        />
      </div>
      <button
        type="button"
        onClick={onCapture}
        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0D1B2E] border-2 border-white flex items-center justify-center hover:bg-[#1E3A5F] transition-colors cursor-pointer"
      >
        <Camera className="w-3.5 h-3.5 text-[#C9A84C]" />
      </button>
    </div>
    <div className="flex-1 min-w-0 text-center sm:text-left">
      <p
        className="text-sm font-bold text-[#0D1B2E] mb-0.5"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </p>
      <p className="text-xs text-slate-400 mb-3">
        Upload a clear passport-size photo. PNG/JPG, max 2 MB.
      </p>
      <Upload
        listType="text"
        fileList={avatarFile}
        onChange={onFileChange}
        beforeUpload={() => false}
        accept="image/*"
        maxCount={1}
        showUploadList={avatarFile.length > 0}
      >
        <button
          type="button"
          className="inline-flex items-center gap-x-2 px-4 py-2 text-xs font-semibold text-[#1E3A5F] bg-slate-50 border border-slate-200 rounded-xl hover:bg-[#1E3A5F] hover:text-white hover:border-[#1E3A5F] transition-all duration-200 cursor-pointer"
        >
          <UploadIcon className="w-3.5 h-3.5" />
          {avatarFile.length > 0 ? "Change Photo" : "Upload Photo"}
        </button>
      </Upload>
    </div>
  </div>
);

// ─── Camera modal ─────────────────────────────────────────
const CameraModal = ({
  open,
  webcamRef,
  onCapture,
  onClose,
}: {
  open: boolean;
  webcamRef: React.RefObject<Webcam | null>;
  onCapture: () => void;
  onClose: () => void;
}) => (
  <Modal
    destroyOnHidden
    open={open}
    onCancel={onClose}
    footer={null}
    title="Capture Photo"
    centered
    width={480}
    styles={{ container: { padding: 0 }, body: { padding: 2 } }}
  >
    <div className="flex flex-col gap-3 pt-2. ">
      <div className="rounded-xl overflow-hidden bg-slate-900">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width="100%"
          videoConstraints={{ facingMode: "user" }}
        />
      </div>
      <Button type="primary" size="large" onClick={onCapture} block>
        Capture Photo
      </Button>
    </div>
  </Modal>
);
