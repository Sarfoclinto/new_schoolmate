import { eduKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import { getAcaByEduIdFn } from "@/services/setup/academic-level";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { getSubLevelsByAcaIdFn } from "@/services/setup/sublevel";
import { registerStuFn } from "@/services/student";
import type { StudentPost } from "@/types/api/student";
import type { SelectTypes } from "@/types/ui";
import { buildMediaUrl } from "@/utils/media";
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
import { useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";
import { MotionDiv } from "@/components/custom/motion";
import {
  Camera,
  ChevronRight,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Phone,
  UploadIcon,
  User,
  Users,
} from "lucide-react";
import { FL, ParentCard, Section } from "../../components/util-components";
import { disableFutureDate } from "@/utils/date-n-time";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useNavigate } from "react-router-dom";
import paths from "@/config/routes";

const RegisterStudent = () => {
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState<UploadFile[]>([]);
  const [fatherImage, setFatherImage] = useState<UploadFile[]>([]);
  const [motherImage, setMotherImage] = useState<UploadFile[]>([]);
  const [guardianImage, setGuardianImage] = useState<UploadFile[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("/no-logo.png");
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [selectedAca, setSelectedAca] = useState<SelectTypes | null>(null);
  const [selectedSubLevel, setSelectedSubLevel] = useState<SelectTypes | null>(
    null,
  );
  const eduId = selectedEdu?.value;
  const acaId = selectedAca?.value;

  const { isOpen, open, close } = useDisclosure();
  const webcamRef = useRef<Webcam | null>(null);
  const navigate = useNavigate();

  // queries
  const { data: educationalLevels, isLoading: edusLoading } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  const { data: academicLevels, isLoading: acasLoading } = useFetch({
    queryFn: () => getAcaByEduIdFn(eduId!),
    queryKeys: eduKeys.academicLevels(eduId),
    enabled: !!eduId,
  });
  //   get all sublevels of that academic level
  const { data: subLevels, isLoading: sublevelsLoading } = useFetch({
    queryFn: () => getSubLevelsByAcaIdFn(acaId!),
    queryKeys: eduKeys.sublevels({ acaId }),
    enabled: !!acaId,
  });

  // memoized values
  const eduOptions = useMemo(() => {
    if (!educationalLevels) return [];
    return educationalLevels.map((edu) => ({
      label: edu.educationalLevelName,
      value: edu.educationalLevelId,
    }));
  }, [educationalLevels]);
  const acaOptions = useMemo(() => {
    if (!academicLevels) return [];
    return academicLevels.map((aca) => ({
      label: aca.academicLevelName,
      value: aca.academicLevelId,
    }));
  }, [academicLevels]);
  const subLevelOptions = useMemo(() => {
    if (!subLevels) return [];
    return subLevels.map((sub) => ({
      label: sub.subLevelName,
      value: sub.subLevelId,
    }));
  }, [subLevels]);

  // fns / handlers
  const handleAvatarChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setAvatarFile(fileList);
    if (fileList[0]?.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarUrl(e.target?.result as string);
      reader.readAsDataURL(fileList[0].originFileObj);
    } else setAvatarUrl(buildMediaUrl());
  };

  const stopStream = () => {
    const stream = webcamRef.current?.video?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
  };

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
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
      close();
    }
  };

  const handleOpenCamera = () => {
    open();
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

  // mutation
  const { mutate: registerStudent, isPending: isRegistering } = usePost({
    postFn: registerStuFn,
    mutationOptions: { mutationKey: ["student", "create"] },
    onSuccess: ({
      response: { responseCode, responseMessage },
      data: { studentId },
    }) => {
      if (responseCode === 1) {

        toast.success(responseMessage, {
          action: studentId
            ? {
                label: "View",
                onClick: () =>
                  navigate(paths.admin.studentDetails.href, {
                    state: { studentId },
                  }),
              }
            : undefined,
        });
        form.resetFields();
        setAvatarFile([]);
        setFatherImage([]);
        setMotherImage([]);
        setGuardianImage([]);
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

  const onFinish = (values: StudentPost) => {
    const fd = new FormData();
    fd.append("Surname", values.Surname);
    fd.append("FirstName", values.FirstName);
    if (values.OtherName) fd.append("OtherName", values.OtherName);
    fd.append("DateOfBirth", dayjs(values.DateOfBirth).format("YYYY-MM-DD"));
    fd.append("Gender", values.Gender);
    fd.append("Address", values.Address);
    if (values.Email) fd.append("Email", values.Email);
    if (values.Contact) fd.append("Contact", values.Contact);
    fd.append("Nationality", values.Nationality);
    fd.append("Religion", values.Religion);
    fd.append("Note", values.Note ?? "");
    avatarFile.forEach((f) => {
      if (f.originFileObj) fd.append("StudentImage", f.originFileObj);
    });
    (["Father", "Mother"] as const).forEach((p) => {
      const imgs = p === "Father" ? fatherImage : motherImage;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const v = values as any;
      if (v[`${p}FullName`]) fd.append(`${p}FullName`, v[`${p}FullName`]);
      if (v[`${p}Contact`]) fd.append(`${p}Contact`, v[`${p}Contact`]);
      if (v[`${p}Occupation`]) fd.append(`${p}Occupation`, v[`${p}Occupation`]);
      if (v[`${p}LivingStatus`])
        fd.append(`${p}LivingStatus`, v[`${p}LivingStatus`]);
      imgs.forEach((f) => {
        if (f.originFileObj) fd.append(`${p}Image`, f.originFileObj);
      });
    });
    if (values.GuardianFullname)
      fd.append("GuardianFullname", values.GuardianFullname);
    if (values.GuardianContact)
      fd.append("GuardianContact", values.GuardianContact);
    if (values.GuardianOccupation)
      fd.append("GuardianOccupation", values.GuardianOccupation);
    if (values.GuardianAddress)
      fd.append("GuardianAddress", values.GuardianAddress);
    if (values.Relationship) fd.append("Relationship", values.Relationship);
    guardianImage.forEach((f) => {
      if (f.originFileObj) fd.append("GuardianImage", f.originFileObj);
    });
    fd.append("SubLevelId", selectedSubLevel?.value ?? "");
    fd.append("ProgramId", values.ProgramId ?? "");
    fd.append(
      "SubjectIds",
      values.SubjectIds?.length ? values.SubjectIds.join(",") : "",
    );
    registerStudent(fd);
  };

  return (
    <>
      <CameraModal
        isOpen={isOpen}
        webcamRef={webcamRef}
        onClose={() => {
          stopStream();
          close();
        }}
        capture={capture}
      />

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
            Student Registration
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Students</span>
            <ChevronRight className="w-3 h-3" />
            <span>Register &amp; Enroll</span>
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
        {/* 1 – Personal */}
        <Section
          step={1}
          title="Personal Information"
          icon={<User className="w-4 h-4" />}
          delay={0.05}
        >
          {/* Photo upload */}
          <div className="col-span-full flex flex-col sm:flex-row items-center gap-5 pb-6 mb-2 border-b border-slate-100">
            <div className="relative shrink-0">
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50"
                style={{ boxShadow: "0 4px 16px rgba(13,27,46,0.10)" }}
              >
                <img
                  src={avatarUrl}
                  alt="Student"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/no-logo.png";
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleOpenCamera}
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
                Student Photo
              </p>
              <p className="text-xs text-slate-400 mb-3">
                Passport-style photo. PNG/JPG, max 2 MB.
              </p>
              <Upload
                listType="text"
                fileList={avatarFile}
                onChange={handleAvatarChange}
                beforeUpload={() => false}
                accept="image/*"
                maxCount={1}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-x-2 px-4 py-2 text-xs font-semibold text-[#1E3A5F] bg-slate-50 border border-slate-200 rounded-xl hover:bg-[#1E3A5F] hover:text-white hover:border-[#1E3A5F] transition-all cursor-pointer"
                >
                  <UploadIcon className="w-3.5 h-3.5" />
                  {avatarFile.length > 0 ? "Change Photo" : "Upload Photo"}
                </button>
              </Upload>
            </div>
          </div>

          <Form.Item
            name="Surname"
            label={<FL>Surname</FL>}
            rules={[{ required: true, message: "Surname is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="Surname"
              prefix={<User className="w-4 h-4 text-slate-300 mr-1" />}
              className="mt-0! py-0!"
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
              className="mt-0! py-0!"
            />
          </Form.Item>
          <Form.Item
            name="OtherName"
            label={
              <FL>
                Other Name{" "}
                <span className="text-amber-400 font-normal normal-case tracking-normal ml-1">
                  optional
                </span>
              </FL>
            }
            className="mb-0!"
          >
            <Input size="large" placeholder="Other name" />
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
            name="Address"
            label={<FL>Home Address</FL>}
            rules={[{ required: true, message: "Address is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="Residential address"
              prefix={<MapPin className="w-4 h-4 text-slate-300 mr-1" />}
              className="mt-0! py-0!"
            />
          </Form.Item>

          <Form.Item
            name="Email"
            label={
              <FL>
                Email{" "}
                <span className="text-amber-400 font-normal normal-case tracking-normal ml-1">
                  optional
                </span>
              </FL>
            }
            rules={[{ type: "email", message: "Enter a valid email" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="student@email.com"
              prefix={<Mail className="w-4 h-4 text-slate-300 mr-1" />}
              className="mt-0! py-0!"
            />
          </Form.Item>
          <Form.Item
            name="Contact"
            label={
              <FL>
                Phone{" "}
                <span className="text-amber-400 font-normal normal-case tracking-normal ml-1">
                  optional
                </span>
              </FL>
            }
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="Phone number"
              prefix={<Phone className="w-4 h-4 text-slate-300 mr-1" />}
              className="mt-0! py-0!"
            />
          </Form.Item>
          <Form.Item
            name="Nationality"
            label={<FL>Nationality</FL>}
            rules={[{ required: true, message: "Nationality is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="e.g. Ghanaian"
              prefix={<Globe className="w-4 h-4 text-slate-300 mr-1" />}
              className="mt-0! py-0!"
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

        {/* 2 – Parents */}
        <Section
          step={2}
          title="Parents Information"
          icon={<Users className="w-4 h-4" />}
          delay={0.1}
          cols={2}
        >
          <ParentCard
            prefix="Father"
            label="Father"
            fileList={fatherImage}
            onFileChange={({ fileList }) => setFatherImage(fileList)}
          />
          <ParentCard
            prefix="Mother"
            label="Mother"
            fileList={motherImage}
            onFileChange={({ fileList }) => setMotherImage(fileList)}
          />
        </Section>

        {/* 3 – Guardian */}
        <Section
          step={3}
          title="Guardian Information"
          icon={<Heart className="w-4 h-4" />}
          delay={0.15}
        >
          <Form.Item
            name="GuardianFullname"
            label={<FL>Full Name</FL>}
            rules={[{ required: true, message: "Name is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="Guardian's full name"
              prefix={<User className="w-4 h-4 text-slate-300 mr-1" />}
              className="mt-0! py-0!"
            />
          </Form.Item>
          <Form.Item
            name="GuardianContact"
            label={<FL>Phone Number</FL>}
            rules={[{ required: true, message: "Phone is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="Phone number"
              prefix={<Phone className="w-4 h-4 text-slate-300 mr-1" />}
              className="mt-0! py-0!"
            />
          </Form.Item>
          <Form.Item
            name="GuardianOccupation"
            label={<FL>Occupation</FL>}
            rules={[{ required: true, message: "Occupation is required" }]}
            className="mb-0!"
          >
            <Input size="large" placeholder="Occupation" />
          </Form.Item>
          <Form.Item
            name="Relationship"
            label={<FL>Relationship to Student</FL>}
            rules={[{ required: true, message: "Relationship is required" }]}
            className="mb-0!"
          >
            <Select
              size="large"
              placeholder="Select relationship"
              options={["Parent", "Sibling", "Relative", "Other"].map((v) => ({
                label: v,
                value: v,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="GuardianAddress"
            label={<FL>Address</FL>}
            rules={[{ required: true, message: "Address is required" }]}
            className="mb-0!"
          >
            <Input
              size="large"
              placeholder="Guardian's address"
              prefix={<MapPin className="w-4 h-4 text-slate-300 mr-1" />}
              className="mt-0! py-0!"
            />
          </Form.Item>
          <Form.Item
            name="GuardianImage"
            label={
              <FL>
                Guardian Photo{" "}
                <span className="text-amber-400 font-normal normal-case tracking-normal ml-1">
                  optional
                </span>
              </FL>
            }
            className="mb-0!"
          >
            <Upload
              listType="text"
              fileList={guardianImage}
              onChange={({ fileList }) => setGuardianImage(fileList)}
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadIcon className="w-3.5 h-3.5" />} block>
                Upload Photo
              </Button>
            </Upload>
          </Form.Item>
        </Section>

        {/* 4 – Enrollment */}
        <Section
          step={4}
          title="Enrollment Information"
          icon={<GraduationCap className="w-4 h-4" />}
          delay={0.2}
        >
          <Form.Item
            name="EducationalLevel"
            label={<FL>Educational Level</FL>}
            rules={[
              { required: true, message: "Educational level is required" },
            ]}
            className="mb-0!"
          >
            <Select
              labelInValue
              size="large"
              placeholder="Select educational level"
              options={eduOptions}
              loading={edusLoading}
              disabled={edusLoading}
              onChange={(opt) => {
                setSelectedEdu({
                  value: opt.value,
                  label: opt.label as string,
                });
                setSelectedAca(null);
                setSelectedSubLevel(null);
                form.setFieldValue("AcademicLevel", undefined);
                form.setFieldValue("SubLevel", undefined);
              }}
            />
          </Form.Item>
          <Form.Item
            name="AcademicLevel"
            label={<FL>Academic Level</FL>}
            rules={[{ required: true, message: "Academic level is required" }]}
            className="mb-0!"
          >
            <Select
              labelInValue
              size="large"
              placeholder={
                selectedEdu
                  ? "Select academic level"
                  : "Select educational level first"
              }
              options={acaOptions}
              loading={acasLoading}
              disabled={acasLoading || !selectedEdu?.value}
              onChange={(opt) => {
                setSelectedAca({
                  value: opt.value,
                  label: opt.label as string,
                });
                setSelectedSubLevel(null);
                form.setFieldValue("SubLevel", undefined);
              }}
            />
          </Form.Item>
          <Form.Item
            name="SubLevel"
            label={<FL>Sub-Level / Class</FL>}
            rules={[{ required: true, message: "Sub-level is required" }]}
            className="mb-0!"
          >
            <Select
              labelInValue
              size="large"
              placeholder={
                selectedAca ? "Select sub-level" : "Select academic level first"
              }
              options={subLevelOptions}
              loading={sublevelsLoading}
              disabled={sublevelsLoading || !selectedAca?.value}
              onChange={(opt) =>
                setSelectedSubLevel({
                  value: opt.value,
                  label: opt.label as string,
                })
              }
            />
          </Form.Item>
        </Section>

        {/* 5 – Notes */}
        <MotionDiv
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.25 }}
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
                05
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
                placeholder="Any additional notes about this student…"
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
          transition={{ delay: 0.3 }}
          className="pb-4"
        >
          <Form.Item className="mb-0!">
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              block
              loading={isRegistering}
              className="h-12! rounded-xl! font-bold! tracking-wide!"
            >
              Register &amp; Enroll Student
            </Button>
          </Form.Item>
        </MotionDiv>
      </Form>
    </>
  );
};
export default RegisterStudent;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  webcamRef: React.RefObject<Webcam | null>;
  capture: () => void;
};
const CameraModal = ({ isOpen, onClose, capture, webcamRef }: Props) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title="Capture Photo"
      centered
      width={480}
      styles={{ container: { padding: 0 }, body: { padding: 2 } }}
      destroyOnHidden={true}
      footer={null}
    >
      <div className="flex flex-col gap-3 pt-2">
        <div className="rounded-xl overflow-hidden bg-slate-900">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{ facingMode: "user" }}
          />
        </div>
        <Button type="primary" size="large" onClick={capture} block>
          Capture Photo
        </Button>
      </div>
    </Modal>
  );
};

