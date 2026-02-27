import { FieldLabel } from "@/components/custom/field-label";
import { FormSection } from "@/components/custom/form-section";
import { MotionDiv } from "@/components/custom/motion";
import { regionData } from "@/data/region-data";
import { disableFutureYears } from "@/utils/date-n-time";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Radio,
  Select,
  Upload,
  type FormInstance,
  type UploadFile,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import type { UploadChangeParam } from "antd/es/upload";
import type { Dayjs } from "dayjs";
import {
  AlignLeft,
  Building2,
  Camera,
  Globe,
  Hash,
  Mail,
  MapPin,
  Phone,
  UploadIcon,
} from "lucide-react";

interface Props {
  form: FormInstance;
  isPending: boolean;
  cityList: string[];
  institutionId?: string;
  avatarUrl: string;
  avatarFile: UploadFile[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFinish: (values: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleAvatarChange: (info: UploadChangeParam<UploadFile<any>>) => void;
  handleYearChange: (date: Dayjs | null) => void;
  handleRegionChange: (region: string) => void;
  handleValuesChange: () => void;
  hasChanges: boolean;
}

export const InstitutionForm = ({
  form,
  institutionId,
  isPending,
  cityList,
  avatarUrl,
  avatarFile,
  hasChanges,
  onFinish,
  handleAvatarChange,
  handleYearChange,
  handleRegionChange,
  handleValuesChange,
}: Props) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onValuesChange={handleValuesChange}
      requiredMark={false}
      className="flex flex-col gap-5"
    >
      {/* Section 1 – Logo & Identity */}
      <FormSection
        title="Logo & Identity"
        icon={<Building2 className="w-4 h-4" />}
        delay={0.05}
      >
        {/* Logo upload area */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-slate-100">
          {/* Avatar preview */}
          <div className="relative shrink-0">
            <div
              className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center"
              style={{ boxShadow: "0 4px 16px rgba(13,27,46,0.10)" }}
            >
              <img
                src={avatarUrl}
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/no-logo.png";
                }}
              />
            </div>
            <Upload
              listType="picture"
              fileList={avatarFile}
              onChange={handleAvatarChange}
              beforeUpload={() => false}
              showUploadList={false}
              accept="image/*"
            >
              <button
                type="button"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0D1B2E] border-2 border-white flex items-center justify-center cursor-pointer hover:bg-[#1E3A5F] transition-colors duration-200"
              >
                <Camera className="w-3.5 h-3.5 text-[#C9A84C]" />
              </button>
            </Upload>
          </div>

          {/* Upload instructions */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0D1B2E] mb-1">
              School Logo
            </p>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Upload your institution's official logo. PNG or JPG recommended.
              Max size 2MB.
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
                className="inline-flex items-center gap-x-2 px-4 py-2 text-xs font-semibold text-[#1E3A5F] bg-[#F4F6FA] border border-slate-200 rounded-lg hover:border-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-all duration-200 cursor-pointer"
              >
                <UploadIcon className="w-3.5 h-3.5" />
                {avatarFile.length > 0 ? "Change Logo" : "Upload Logo"}
              </button>
            </Upload>
          </div>
        </div>

        {/* Name + Motto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Form.Item
            name="Name"
            label={<FieldLabel required>Name of Institution</FieldLabel>}
            rules={[
              { required: true, message: "Institution name is required" },
            ]}
            className="mb-0!"
          >
            <Input
              placeholder="e.g. Accra Academy Senior High School"
              size="large"
              className="rounded-xl!"
            />
          </Form.Item>
          <Form.Item
            name="Motto"
            label={<FieldLabel>School Motto</FieldLabel>}
            className="mb-0!"
          >
            <Input
              placeholder="e.g. Knowledge is Power"
              size="large"
              className="rounded-xl!"
            />
          </Form.Item>
        </div>

        {/* Year + Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Form.Item
            name="EstablishedYear"
            label={<FieldLabel required>Established Year</FieldLabel>}
            rules={[
              { required: true, message: "Establishment year is required" },
            ]}
            className="mb-0!"
          >
            <DatePicker
              picker="year"
              placeholder="Select year"
              onChange={handleYearChange}
              disabledDate={disableFutureYears}
              size="large"
              className="w-full rounded-xl!"
            />
          </Form.Item>

          <Form.Item
            name="InstitutionType"
            label={<FieldLabel required>Institution Type</FieldLabel>}
            rules={[
              { required: true, message: "Please select an institution type" },
            ]}
            className="mb-0!"
          >
            <Radio.Group className="grid! grid-cols-3! gap-x-2 mt-1 w-full">
              {["Public", "Private", "International"].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer text-sm font-medium text-slate-600 hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-all duration-150 has-checked:border-[#1E3A5F] has-checked:bg-[#1E3A5F]/5 has-checked:text-[#1E3A5F]"
                >
                  <Radio value={type} className="hidden" />
                  {type}
                </label>
              ))}
            </Radio.Group>
          </Form.Item>
        </div>
      </FormSection>

      {/* Section 2 – Contact Information */}
      <FormSection
        title="Contact Information"
        icon={<Mail className="w-4 h-4" />}
        delay={0.1}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            name="Email"
            label={<FieldLabel required>Email Address</FieldLabel>}
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
            className="mb-0!"
          >
            <Input
              placeholder="admin@schoolname.edu.gh"
              size="large"
              className="rounded-xl! mt-0! py-0!"
              prefix={<Mail className="w-3.5 h-3.5 text-slate-300 mr-1" />}
            />
          </Form.Item>

          <Form.Item
            name="Contact"
            label={<FieldLabel required>Phone Number</FieldLabel>}
            rules={[{ required: true, message: "Phone number is required" }]}
            className="mb-0!"
          >
            <Input
              placeholder="+233 XX XXX XXXX"
              size="large"
              className="rounded-xl! mt-0! py-0!"
              prefix={<Phone className="w-3.5 h-3.5 text-slate-300 mr-1" />}
            />
          </Form.Item>

          <Form.Item
            name="WebsiteLink"
            label={<FieldLabel>Website</FieldLabel>}
            rules={[{ type: "url", message: "Enter a valid URL" }]}
            className="mb-0!"
          >
            <Input
              placeholder="https://www.schoolname.edu.gh"
              size="large"
              className="rounded-xl! mt-0! py-0!"
              prefix={<Globe className="w-3.5 h-3.5 text-slate-300 mr-1" />}
            />
          </Form.Item>

          <Form.Item
            name="PostalAddress"
            label={<FieldLabel>Postal Address (P.O. Box)</FieldLabel>}
            className="mb-0!"
          >
            <Input
              placeholder="P.O. Box 123, Accra"
              size="large"
              className="rounded-xl! mt-0! py-0!"
              prefix={<Hash className="w-3.5 h-3.5 text-slate-300 mr-1" />}
            />
          </Form.Item>
        </div>
      </FormSection>

      {/* Section 3 – Location */}
      <FormSection
        title="Location"
        icon={<MapPin className="w-4 h-4" />}
        delay={0.15}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Form.Item
            name="Country"
            label={<FieldLabel>Country</FieldLabel>}
            initialValue="Ghana"
            className="mb-0!"
          >
            <Input disabled size="large" className="rounded-xl! bg-slate-50!" />
          </Form.Item>

          <Form.Item
            name="Region"
            label={<FieldLabel required>Region</FieldLabel>}
            rules={[{ required: true, message: "Please select a region" }]}
            className="mb-0!"
          >
            <Select
              placeholder="Select region"
              onChange={handleRegionChange}
              size="large"
              className="rounded-xl!"
            >
              {Object.keys(regionData).map((region) => (
                <Select.Option key={region} value={region}>
                  {region}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="City"
            label={<FieldLabel required>City / District</FieldLabel>}
            rules={[{ required: true, message: "Please select a city" }]}
            className="mb-0!"
          >
            <Select
              placeholder={
                cityList.length ? "Select city" : "Select region first"
              }
              disabled={!cityList.length}
              size="large"
            >
              {cityList.map((city) => (
                <Select.Option key={city} value={city}>
                  {city}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Form.Item
            name="Town"
            label={<FieldLabel>Town / Suburb</FieldLabel>}
            className="mb-0!"
          >
            <Input
              placeholder="e.g. Labone"
              size="large"
              className="rounded-xl! mt-0! py-0!"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="Address"
            label={<FieldLabel>GPS Address</FieldLabel>}
            className="mb-0!"
          >
            <Input
              placeholder="e.g. GA-123-4567"
              size="large"
              className="rounded-xl! mt-0! py-0!"
              prefix={
                <span className="text-xs font-bold text-slate-400 mr-1">
                  GPS
                </span>
              }
            />
          </Form.Item>
        </div>
      </FormSection>

      {/* Section 4 – About */}
      <FormSection
        title="About the Institution"
        icon={<AlignLeft className="w-4 h-4" />}
        delay={0.2}
      >
        <Form.Item
          name="Description"
          label={<FieldLabel>Description</FieldLabel>}
          className="mb-0!"
        >
          <TextArea
            rows={5}
            placeholder="Write a brief description of your institution — its history, vision, and academic offerings…"
            className="rounded-xl! resize-none"
            showCount
            maxLength={1000}
          />
        </Form.Item>
      </FormSection>

      {/* Submit button */}
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Form.Item className="mb-0!">
          <Button
            htmlType="submit"
            loading={isPending}
            disabled={institutionId ? !hasChanges : false}
            block
            size="large"
            className="h-12! rounded-xl! border-0! font-bold! text-sm! tracking-wide!"
            style={{
              background:
                institutionId && !hasChanges
                  ? "#cbd5e1"
                  : "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
              color: "white",
            }}
          >
            {institutionId
              ? hasChanges
                ? "Save Changes"
                : "No Changes"
              : "Create Profile"}
          </Button>
        </Form.Item>
      </MotionDiv>
    </Form>
  );
};
