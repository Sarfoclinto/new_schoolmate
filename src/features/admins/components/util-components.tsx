import { MotionDiv } from "@/components/custom/motion";
import { cn } from "@/lib/utils";
import {
  Button,
  Form,
  Input,
  Modal,
  Radio,
  Upload,
  type UploadFile,
} from "antd";
import {
  Phone,
  User,
  Upload as UploadIcon,
  CheckCircle2,
  Camera,
} from "lucide-react";
import Webcam from "react-webcam";

// ─── Section card ─────────────────────────────────────────
export const Section = ({
  step,
  title,
  icon,
  children,
  delay = 0,
  cols = 3,
  childrenClassName = "",
  showStep = true,
}: {
  step: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  cols?: 1 | 2 | 3;
  childrenClassName?: string;
  showStep?: boolean;
}) => (
  <MotionDiv
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.38, ease: "easeOut", delay }}
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
        {icon}
      </div>
      <div className="flex items-center gap-x-2">
        {showStep && (
          <span
            className="text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {String(step).padStart(2, "0")}
          </span>
        )}
        <span
          className="text-white font-semibold text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {title}
        </span>
      </div>
    </div>
    <div
      className={cn(
        `p-6 grid grid-cols-1 gap-x-5 gap-y-1 ${
          cols === 3
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : cols === 2
              ? "sm:grid-cols-2"
              : ""
        }`,
        childrenClassName,
      )}
    >
      {children}
    </div>
  </MotionDiv>
);

// ─── Shared label ─────────────────────────────────────────
export const FL = ({ children }: { children: React.ReactNode }) => (
  <span
    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    {children}
  </span>
);

// ─── Parent sub-card ──────────────────────────────────────
export const ParentCard = ({
  prefix,
  label,
  fileList,
  onFileChange,
}: {
  prefix: string;
  label: string;
  fileList: UploadFile[];
  onFileChange: (fl: { fileList: UploadFile[] }) => void;
}) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col gap-y-1">
    <p className="text-xs font-bold uppercase tracking-widest text-[#1E3A5F] mb-3 flex items-center gap-x-2">
      <User className="w-3.5 h-3.5" />
      {label}
    </p>
    <Form.Item
      name={`${prefix}FullName`}
      label={<FL>Full Name</FL>}
      className="mb-0!"
    >
      <Input
        size="large"
        placeholder={`${label}'s full name`}
        prefix={<User className="w-4 h-4 text-slate-300 mr-1" />}
        className="mt-0! py-0!"
      />
    </Form.Item>
    <Form.Item
      name={`${prefix}Occupation`}
      label={<FL>Occupation</FL>}
      className="mb-0!"
    >
      <Input size="large" placeholder="Occupation" />
    </Form.Item>
    <Form.Item
      name={`${prefix}Contact`}
      label={<FL>Phone Number</FL>}
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
      name={`${prefix}LivingStatus`}
      label={<FL>Living Status</FL>}
      className="mb-0!"
    >
      <Radio.Group block>
        <Radio.Button value="Alive">Alive</Radio.Button>
        <Radio.Button value="Deceased">Deceased</Radio.Button>
      </Radio.Group>
    </Form.Item>
    <Form.Item name={`${prefix}Image`} label={<FL>Photo</FL>} className="mb-0!">
      <Upload
        listType="text"
        fileList={fileList}
        onChange={onFileChange}
        beforeUpload={() => false}
        accept="image/*"
        maxCount={1}
      >
        <Button icon={<UploadIcon className="w-3.5 h-3.5" />} block>
          Upload {label}'s Photo
        </Button>
      </Upload>
    </Form.Item>
  </div>
);

export const CardHeader = (
  icon: React.ReactNode,
  title: string,
  badge?: number,
) => (
  <div
    className="flex items-center gap-x-3 px-6 py-4 border-b border-slate-100"
    style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)" }}
  >
    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
      {icon}
    </div>
    <span className="text-white font-semibold text-sm">{title}</span>
    {badge !== undefined && (
      <span className="ml-auto text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2.5 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </div>
);

/** "optional" inline badge inside a label */
export const Opt = () => (
  <span className="text-amber-400 font-normal normal-case tracking-normal ml-1.5 text-[10px]">
    optional
  </span>
);

/** Thin divider with centered label — separates form sections */
export const Divider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-x-3 my-4">
    <span className="flex-1 h-px bg-slate-100" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 select-none whitespace-nowrap">
      {label}
    </span>
    <span className="flex-1 h-px bg-slate-100" />
  </div>
);

/** Submit button — full-width navy gradient */
export const SaveBtn = ({
  isPending,
  label = "Save Changes",
  pendingLabel = "Saving…",
}: {
  isPending: boolean;
  label?: string;
  pendingLabel?: string;
}) => (
  <button
    type="submit"
    disabled={isPending}
    className={`
      mt-5 w-full h-11 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-x-2.5 transition-all duration-200
      ${isPending ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "text-white hover:opacity-90 active:scale-[0.98] cursor-pointer"}
    `}
    style={
      isPending
        ? {}
        : { background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)" }
    }
  >
    {isPending ? (
      <>
        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        {pendingLabel}
      </>
    ) : (
      <>
        <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
        {label}
      </>
    )}
  </button>
);

/** Photo preview + upload + optional camera button */
export const PhotoBox = ({
  label = "Photo",
  previewUrl,
  fileList,
  onChange,
  onCamera,
}: {
  label?: string;
  previewUrl: string;
  fileList: UploadFile[];
  onChange: (info: { fileList: UploadFile[] }) => void;
  onCamera?: () => void;
}) => (
  <div className="flex items-center gap-x-4 p-4 bg-slate-50 border border-slate-100 rounded-xl mb-1">
    <div className="relative shrink-0">
      <div
        className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white bg-[#0D1B2E] flex items-center justify-center"
        style={{ boxShadow: "0 4px 14px rgba(13,27,46,0.12)" }}
      >
        <img
          src={previewUrl}
          alt={label}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/no-logo.png";
          }}
        />
      </div>
      {onCamera && (
        <button
          type="button"
          onClick={onCamera}
          className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#0D1B2E] border-2 border-white flex items-center justify-center hover:bg-[#1E3A5F] transition-colors cursor-pointer"
          title="Use camera"
        >
          <Camera className="w-3 h-3 text-[#C9A84C]" />
        </button>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className="text-xs font-bold text-[#0D1B2E] mb-0.5"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </p>
      <p className="text-[11px] text-slate-400 mb-2.5">PNG / JPG · max 2 MB</p>
      <Upload
        listType="text"
        fileList={fileList}
        onChange={onChange}
        beforeUpload={() => false}
        accept="image/*"
        maxCount={1}
      >
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#1E3A5F] bg-white border border-slate-200 rounded-lg hover:bg-[#1E3A5F] hover:text-white hover:border-[#1E3A5F] transition-all cursor-pointer"
        >
          <UploadIcon className="w-3 h-3" />
          {fileList.length > 0 ? "Change Photo" : "Upload Photo"}
        </button>
      </Upload>
    </div>
  </div>
);

/** Camera capture modal — reused by any form that needs it */
export const CameraModal = ({
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
    open={open}
    onCancel={onClose}
    footer={null}
    title="Capture Photo"
    centered
    width={460}
    destroyOnHidden
    styles={{ container: { padding: 0 }, body: { padding: 2 } }}
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
      <button
        type="button"
        onClick={onCapture}
        className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-x-2 cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
        }}
      >
        <Camera className="w-4 h-4 text-[#C9A84C]" /> Capture
      </button>
    </div>
  </Modal>
);
