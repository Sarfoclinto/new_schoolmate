import {
  eduKeys,
  programKeys,
  studentKeys,
  termKeys,
  yearKeys,
} from "@/config/query-keys";
import {
  Divider,
  FL,
  Opt,
  SaveBtn,
} from "@/features/admins/components/util-components";
import useFetch from "@/hooks/api/use-fetch";
import useUpdate from "@/hooks/api/use-update";
import { getAcaByEduIdFn } from "@/services/setup/academic-level";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { getAllProgramsFn } from "@/services/setup/study-module";
import { getSubLevelsByAcaIdFn } from "@/services/setup/sublevel";
import { getAllYearsFn, getTermsByEduIdFn } from "@/services/setup/year-n-term";
import { updateStuEnrollmentInfoFn } from "@/services/student";
import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Select } from "antd";
import { GraduationCap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
  enrollment: {
    studentId: string;
    programId: string;
    programName: string;
    subLevelId: string;
    subLevelName: string;
    academicYearId: string;
    startYear: string;
    endYear: string;
    academicTermId: string;
    academicTermName: string;
    educationalLevelName: string;
    educationalLevelId: string;
    academicLevelName: string;
    academicLevelId: string;
  };
}

const UpdateStudentEnrollmentInfo = ({ enrollment }: Props) => {
  const [form] = Form.useForm();
  const qc = useQueryClient();
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [selectedAca, setSelectedAca] = useState<SelectTypes | null>(null);
  const eduId = selectedEdu?.value;
  const acaId = selectedAca?.value;

  // queries
  const { data: edus, isLoading: edusLoading } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  const { data: acas, isLoading: acasLoading } = useFetch({
    queryFn: () => getAcaByEduIdFn(eduId!),
    queryKeys: eduKeys.academicLevels(eduId),
    enabled: !!eduId,
  });
  //   get all sublevels of that academic level
  const { data: subs, isLoading: subsLoading } = useFetch({
    queryFn: () => getSubLevelsByAcaIdFn(acaId!),
    queryKeys: eduKeys.sublevels({ acaId }),
    enabled: !!acaId,
  });
  const { data: programs, isLoading: progsLoading } = useFetch({
    queryFn: getAllProgramsFn,
    queryKeys: programKeys.list(),
  });
  const { data: academicYears, isLoading: yearsLoading } = useFetch({
    queryFn: getAllYearsFn,
    queryKeys: yearKeys.list(),
  });
  const { data: academicTerms, isLoading: termsLoading } = useFetch({
    queryFn: () => getTermsByEduIdFn(eduId!),
    queryKeys: termKeys.custom("edu-terms", { eduId }),
    enabled: !!eduId,
  });

  const eduOptions = useMemo(
    () =>
      edus?.map((l) => ({
        label: l.educationalLevelName,
        value: l.educationalLevelId,
      })) ?? [],
    [edus],
  );
  const acaOptions = useMemo(
    () =>
      acas?.map((l) => ({
        label: l.academicLevelName,
        value: l.academicLevelId,
      })) ?? [],
    [acas],
  );
  const subOptions = useMemo(
    () =>
      subs?.map((l) => ({ label: l.subLevelName, value: l.subLevelId })) ?? [],
    [subs],
  );
  const progOptions = useMemo(
    () =>
      programs?.map((p) => ({ label: p.programName, value: p.programId })) ??
      [],
    [programs],
  );
  const yearOptions = useMemo(
    () =>
      academicYears?.map((y) => ({
        label: `${y.startYear} / ${y.endYear}`,
        value: y.academicYearId,
      })) ?? [],
    [academicYears],
  );
  const termOptions = useMemo(
    () =>
      academicTerms?.map((t) => ({
        label: t.academicTermName,
        value: t.academicTermId,
      })) ?? [],
    [academicTerms],
  );

  // Pre-fill with current values
  useEffect(() => {
    if (enrollment.educationalLevelId) {
      setSelectedEdu({
        value: enrollment.educationalLevelId,
        label: enrollment.educationalLevelName,
      });
    }
    if (enrollment.academicLevelId) {
      setSelectedAca({
        value: enrollment.academicLevelId,
        label: enrollment.academicLevelName,
      });
    }
    form.setFieldsValue({
      EducationalLevel: enrollment.educationalLevelId
        ? {
            value: enrollment.educationalLevelId,
            label: enrollment.educationalLevelName,
          }
        : undefined,
      AcademicLevel: enrollment.academicLevelId
        ? {
            value: enrollment.academicLevelId,
            label: enrollment.academicLevelName,
          }
        : undefined,
      SubLevel: enrollment.subLevelId
        ? { value: enrollment.subLevelId, label: enrollment.subLevelName }
        : undefined,
      ProgramId: enrollment.programId || undefined,
      AcademicYearId: enrollment.academicYearId || undefined,
      AcademicTermId: enrollment.academicTermId || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment]);

  const { mutate: update, isPending: updating } = useUpdate({
    updateFn: updateStuEnrollmentInfoFn,
    mutationOptions: {
      mutationKey: ["student-update", "enrollment-info", enrollment.studentId],
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
      toast.error("Failed to update enrollment info", {
        description: err.message,
      });
    },
  });

  // TODO: await all invalidations
  const invalidate = async () =>
    await qc.invalidateQueries({
      queryKey: studentKeys.detail(enrollment.studentId),
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (v: any) => {
    const formdata = new FormData();
    formdata.append("SubLevelId", v.SubLevel?.value ?? v.SubLevel);
    formdata.append("ProgramId", v.ProgramId);
    formdata.append("AcademicYearId", "");
    formdata.append("AcademicTermId", "");
    update({ data: formdata, id: enrollment.studentId });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={onFinish}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Current enrollment summary chip */}
      <div className="mb-4 p-3.5 bg-[#EEF2F8] border border-[#D0DCF0] rounded-xl flex items-start gap-x-3">
        <GraduationCap className="w-4 h-4 text-[#1E3A5F] mt-0.5 shrink-0" />
        <div className="text-[11px] text-[#1E3A5F] leading-relaxed">
          <span className="font-bold">Current: </span>
          {[
            enrollment.educationalLevelName,
            enrollment.academicLevelName,
            enrollment.subLevelName,
            enrollment.programName,
          ]
            .filter(Boolean)
            .join(" → ") || "Not set"}
        </div>
      </div>

      <Divider label="Level Placement" />

      <Form.Item
        name="EducationalLevel"
        label={<FL>Educational Level</FL>}
        rules={[{ required: true, message: "Required" }]}
        className="mb-3!"
      >
        <Select
          labelInValue
          size="large"
          placeholder="Select educational level"
          options={eduOptions}
          loading={edusLoading}
          disabled={edusLoading}
          onChange={(opt) => {
            setSelectedEdu({ value: opt.value, label: opt.label as string });
            setSelectedAca(null);
            form.setFieldsValue({
              AcademicLevel: undefined,
              SubLevel: undefined,
            });
          }}
        />
      </Form.Item>
      <Form.Item
        name="AcademicLevel"
        label={<FL>Academic Level</FL>}
        rules={[{ required: true, message: "Required" }]}
        className="mb-3!"
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
          disabled={acasLoading || !selectedEdu}
          onChange={(opt) => {
            setSelectedAca({ value: opt.value, label: opt.label as string });
            form.setFieldsValue({ SubLevel: undefined });
          }}
        />
      </Form.Item>
      <Form.Item
        name="SubLevel"
        label={<FL>Sub-Level / Class</FL>}
        rules={[{ required: true, message: "Required" }]}
        className="mb-3!"
      >
        <Select
          labelInValue
          size="large"
          placeholder={
            selectedAca ? "Select sub-level" : "Select academic level first"
          }
          options={subOptions}
          loading={subsLoading}
          disabled={subsLoading || !selectedAca}
        />
      </Form.Item>

      <Divider label="Program & Term" />

      <Form.Item
        name="ProgramId"
        label={
          <FL>
            Program <Opt />
          </FL>
        }
        className="mb-3!"
      >
        <Select
          size="large"
          placeholder="Select program (optional)"
          options={progOptions}
          loading={progsLoading}
          disabled={progsLoading}
          allowClear
        />
      </Form.Item>
      <div className="grid grid-cols-2 gap-x-4">
        <Form.Item
          name="AcademicYearId"
          label={<FL>Academic Year</FL>}
          rules={[{ required: true, message: "Required" }]}
          className="mb-3!"
        >
          <Select
            size="large"
            placeholder="Select year"
            options={yearOptions}
            loading={yearsLoading}
            disabled={yearsLoading}
          />
        </Form.Item>
        <Form.Item
          name="AcademicTermId"
          label={<FL>Academic Term</FL>}
          rules={[{ required: true, message: "Required" }]}
          className="mb-3!"
        >
          <Select
            size="large"
            placeholder="Select term"
            options={termOptions}
            loading={termsLoading}
            disabled={termsLoading}
          />
        </Form.Item>
      </div>

      <SaveBtn isPending={updating} label="Update Enrollment" />
    </Form>
  );
};
export default UpdateStudentEnrollmentInfo;
