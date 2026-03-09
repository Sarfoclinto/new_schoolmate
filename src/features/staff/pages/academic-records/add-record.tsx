import ActiveTermBadge from "@/components/custom/active-term-badge";
import {
  academicRecordsKeys,
  educationKeys,
  studentKeys,
  subjectKeys,
} from "@/config/query-keys";
import { SetupPage } from "@/features/admins/components/setup-page";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import { useActiveTerm } from "@/hooks/use-active-term";
import {
  addRecordFn,
  getSublvelSubjectRecordsFn,
} from "@/services/academic-records";
import { getAssessmentsBySubIdFn } from "@/services/setup/assessment-n-grading";
import {
  getTeachersSublevelsFn,
  getTeacherSublevelSubjectsFn,
} from "@/services/staff";
import { getAllSubLevelStuFn } from "@/services/student";
import { useAuth } from "@/store/auth.store";
import type {
  AcademicRecordPost,
  SubLevelSubjectAcademicRecordGet,
} from "@/types/api/academic-records";
import type { SelectTypes } from "@/types/ui";
import { capitalizeWords } from "@/utils/string";
import { useQueryClient } from "@tanstack/react-query";
import { Form, InputNumber, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusCircleIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type FormValues = {
  SubLevelId: SelectTypes;
  AssessmentId: SelectTypes;
  SubjectId: SelectTypes;
  MarkedOver: number;
  StudentId: SelectTypes;
  Marks: number;
};

const AddRecords = () => {
  const user = useAuth((s) => s.user);
  const [form] = Form.useForm();
  const markedOver = Form.useWatch("MarkedOver", form);
  const qc = useQueryClient();
  const [sublevel, setSublevel] = useState<SelectTypes | null>(null);
  const [assessment, setAssessment] = useState<SelectTypes | null>(null);
  const [subject, setSubject] = useState<SelectTypes | null>(null);

  const sublevelId = sublevel?.value;
  const assessmentId = assessment?.value;
  const subjectId = subject?.value;
  const teacherId = user?.userId;

  const { data: assessments, isLoading: loadingAssessments } = useFetch({
    queryFn: () => getAssessmentsBySubIdFn(sublevelId!),
    queryKeys: educationKeys.custom("assessment", { sublevelId }),
    enabled: !!sublevelId,
  });

  const { data: sublevelData, isLoading: loadingSubs } = useFetch({
    queryFn: () => getTeachersSublevelsFn(teacherId!),
    queryKeys: educationKeys.custom("teacher-sublevels", { teacherId }),
    enabled: !!teacherId,
  });
  const { data: subjectsData, isLoading: loadingSubjects } = useFetch({
    queryFn: () => getTeacherSublevelSubjectsFn(teacherId!, sublevelId!),
    queryKeys: subjectKeys.custom("teacher-subjects", {
      sublevelId,
      teacherId,
    }),
    enabled: !!sublevelId && !!teacherId,
  });
  const { data: students, isLoading: loadingStu } = useFetch({
    queryFn: () => getAllSubLevelStuFn(sublevelId!),
    queryKeys: studentKeys.custom("by-sub-level", {
      sublevelId,
    }),
    enabled: !!sublevelId,
  });

  const { data: records, isLoading: loadingRecords } = useFetch({
    queryFn: () =>
      getSublvelSubjectRecordsFn(assessmentId!, sublevelId!, subjectId!),
    queryKeys: academicRecordsKeys.custom("sublevel-subject-records", {
      assessmentId,
      sublevelId,
      subjectId,
    }),
    enabled: !!assessmentId && !!sublevelId && !!subjectId,
  });

  // memoized values
  const sublevelOptions = useMemo(() => {
    if (!sublevelData?.subLevels) return [];
    return sublevelData.subLevels.map((s) => ({
      label: s.subLevelName,
      value: s.subLevelId,
    }));
  }, [sublevelData?.subLevels]);

  const subjectOptions = useMemo(() => {
    if (!subjectsData?.subjects) return [];
    return subjectsData.subjects.map((s) => ({
      label: s.subjectName,
      value: s.subjectId,
    }));
  }, [subjectsData?.subjects]);

  const assessmentOptions = useMemo(() => {
    if (!assessments) return [];
    return assessments.assessments.map((a) => ({
      label: capitalizeWords(a.assessmentName),
      value: a.assessmentId,
    }));
  }, [assessments]);

  const markedStudents = useMemo(() => {
    if (!records) return [];
    return records.map((r) => r.studentId);
  }, [records]);
  const studentOptions = useMemo(() => {
    if (!students) return [];
    return students
      .filter((s) => !markedStudents.includes(s.studentId))
      .map((s) => ({
        label: s.fullName,
        value: s.studentId,
      }));
  }, [markedStudents, students]);
  const dataSource = useMemo(() => {
    if (!records) return [];
    return records;
  }, [records]);

  const sub = useMemo(
    () => sublevelData?.subLevels.find((s) => s.subLevelId === sublevelId),
    [sublevelData?.subLevels, sublevelId],
  );
  const activeTerm = useActiveTerm(sub?.educationalLevelId);

  // useEffect to check if academic records exist and set the MarkedOver value.
  useEffect(() => {
    if (records && records.length > 0) {
      const fetchedMarkedOver = records[0].markedOver;
      // Set the MarkedOver field value in the form.
      form.setFieldsValue({ MarkedOver: fetchedMarkedOver });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);

  const { mutate: addRecord, isPending: addingRecord } = usePost({
    postFn: addRecordFn,
    mutationOptions: { mutationKey: ["record", "create"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await qc.invalidateQueries({ queryKey: academicRecordsKeys.all });
        form.resetFields(["Marks"]);
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to add record`, {
        description: err?.message,
      });
    },
  });

  const columns: ColumnsType<SubLevelSubjectAcademicRecordGet> = [
    {
      key: "sn",
      title: "#",
      render: (_, __, idx) => idx + 1,
    },
    {
      key: "student",
      title: "Student",
      dataIndex: "fullName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "marks",
      title: "Marks",
      dataIndex: "marks",
      render: (_, row) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">
          {row.marks}/{row.markedOver}
        </span>
      ),
    },
  ];

  const onFinish = (values: FormValues) => {
    if (!teacherId) {
      toast.info("Teacher not found, Re-Login");
      return;
    }
    const payload: AcademicRecordPost = {
      StudentId: values.StudentId.value,
      SubjectId: values.SubjectId.value,
      AssessmentId: values.AssessmentId.value,
      SubLevelId: values.SubLevelId.value,
      UserId: teacherId,
      Marks: Number(values?.Marks.toString().replace("%", "")),
      MarkedOver: Number(values.MarkedOver),
    };
    addRecord(payload);
  };

  return (
    <SetupPage
      title="Record"
      breadcrumb={["Academic Records", "Add Record"]}
      icon={<PlusCircleIcon className="size-4" />}
      form={form}
      onFinish={onFinish}
      isPending={addingRecord}
      pendingLabel={addingRecord ? "Adding..." : "Add Record"}
      tableProps={{
        columns,
        dataSource,
        loading: loadingRecords,
        rowKey: "academicRecordId",
        // showHeader: false,
      }}
      headerNode={
        sublevelId && (
          <ActiveTermBadge
            active={!!activeTerm}
            name={activeTerm?.academicTermName}
          />
        )
      }
      formContent={
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Form.Item
              label="Class / Sub-level"
              name="SubLevelId"
              rules={[
                {
                  required: true,
                  message: "Please select Class!",
                },
              ]}
            >
              <Select
                placeholder="Please select Class or SubLevel"
                labelInValue
                onChange={(opt) => {
                  setSublevel({
                    label: opt.label,
                    value: opt.value,
                  });
                }}
                options={sublevelOptions}
                loading={loadingSubs}
                disabled={loadingSubs}
              />
            </Form.Item>
            <Form.Item
              label="Assessment Type"
              name="AssessmentId"
              rules={[
                {
                  required: true,
                  message: "Please select Assessment Type!",
                },
              ]}
            >
              <Select
                placeholder="Please select assessment Type"
                labelInValue
                onChange={(opt) => {
                  setAssessment({
                    label: opt?.label,
                    value: opt?.value,
                  });
                }}
                options={assessmentOptions}
                loading={loadingAssessments}
                disabled={loadingAssessments || !sublevelId}
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Form.Item
              label="Subject"
              name="SubjectId"
              rules={[
                {
                  required: true,
                  message: "Please select Subject!",
                },
              ]}
            >
              <Select
                placeholder="Please select Subject!"
                labelInValue
                onChange={(opt) => {
                  setSubject({
                    label: opt?.label,
                    value: opt?.value,
                  });
                }}
                options={subjectOptions}
                loading={loadingSubjects}
                disabled={loadingSubjects}
              />
            </Form.Item>

            <Form.Item
              label="Marked Over"
              name="MarkedOver"
              rules={[
                {
                  required: true,
                  message: "Enter Marked Over",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Marked Over must be greater than 0",
                },
              ]}
            >
              <InputNumber
                min={1}
                className="w-full!"
                placeholder="Enter Marked Over"
                disabled={records && records.length > 0} // disable if academic records exist
              />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-medium roboto">Student</span>}
            name="StudentId"
            rules={[
              {
                required: true,
                message: "Please select Student",
              },
            ]}
          >
            <Select
              placeholder="Please select Student"
              showSearch={{
                optionFilterProp: "label",
                filterSort: (optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase()),
              }}
              options={studentOptions}
              labelInValue
              loading={loadingStu}
              disabled={loadingStu}
            />
          </Form.Item>

          <Form.Item
            label={`Marks ${markedOver > 0 ? `(/${markedOver})` : ""}`}
            name="Marks"
            dependencies={["MarkedOver"]}
            rules={[
              {
                required: true,
                message: "Please enter Marks!",
              },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (value !== undefined && value !== "") {
                    const markedOverValue = getFieldValue("MarkedOver");
                    if (Number(value) > markedOverValue) {
                      return Promise.reject(
                        new Error(
                          "Marks must be less than or equal to Marked Over",
                        ),
                      );
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              className="w-full!"
              min={1}
              placeholder="Input Marks"
            />
          </Form.Item>
        </>
      }
    />
  );
};
export default AddRecords;
