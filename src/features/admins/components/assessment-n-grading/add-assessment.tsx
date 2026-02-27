import { educationKeys, eduKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import useUpdate from "@/hooks/api/use-update";
import {
  createAssessmentFn,
  deleteAssessmentFn,
  getAssessmentsByEduIdFn,
  updateAssessmentFn,
} from "@/services/setup/assessment-n-grading";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import type {
  AssessmentGet,
  AssessmentPost,
} from "@/types/api/setup/assessment-n-grading";
import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, InputNumber, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TableActions } from "../table-action";
import { Table } from "lucide-react";
import { SetupPage } from "../setup-page";

type FormValues = AssessmentPost & { EducationalLevel: SelectTypes };

const AddAssessment = () => {
  // states
  const [form] = Form.useForm<FormValues>();
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [record, setRecord] = useState<AssessmentGet | null>(null);
  const qc = useQueryClient();
  const eduId = selectedEdu?.value;

  //  effects
  useEffect(() => {
    if (record && record.assessmentId) {
      form.setFieldsValue({
        AssessmentName: record.assessmentName,
        AssessmentPercentage: record.assessmentPercentage,
        EducationalLevel: { value: selectedEdu?.value },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  const { data: educationalLevels, isLoading: loadingEducationalLevels } =
    useFetch({
      queryFn: getAllEduLevelsFn,
      queryKeys: eduKeys.levels(),
    });

  const { data: assessments, isLoading: loadingAssessments } = useFetch({
    queryFn: () => getAssessmentsByEduIdFn(eduId!),
    queryKeys: educationKeys.custom("assessment", { eduId }),
    enabled: !!eduId,
  });

  // memoized values
  const eduOptions = useMemo(() => {
    if (!educationalLevels) return [];
    return educationalLevels.map((edu) => ({
      label: edu.educationalLevelName,
      value: edu.educationalLevelId,
    }));
  }, [educationalLevels]);
  const dataSource = useMemo(() => {
    if (!assessments) return [];
    return assessments.assessments;
  }, [assessments]);
  const totalPercentage = useMemo(() => {
    return dataSource.reduce((acc, curr) => {
      return acc + curr.assessmentPercentage;
    }, 0);
  }, [dataSource]);

  // mutations
  const { mutate: createAssessment, isPending: creatingAssessment } = usePost({
    postFn: createAssessmentFn,
    mutationOptions: { mutationKey: ["assessment", "create"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage);
        onReset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create assessment`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateAssessment, isPending: updatingAssessment } = useUpdate(
    {
      updateFn: updateAssessmentFn,
      mutationOptions: { mutationKey: ["assessment", "update"] },
      onSuccess: ({ responseCode, responseMessage }) => {
        if (responseCode === 1) {
          invalidate();
          toast.success(responseMessage);
          onReset();
        } else {
          toast.error(responseMessage);
        }
      },
      onError: (err) => {
        toast.error(`Failed to update assessment`, {
          description: err?.message,
        });
      },
    },
  );
  const { mutate: deleteAssessment, isPending: deletingAssessment } = usePost({
    postFn: deleteAssessmentFn,
    mutationOptions: { mutationKey: ["assessment", "delete"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage);
        onReset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to delete assessment`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () => qc.invalidateQueries({ queryKey: eduKeys.all });
  const onReset = () => {
    setRecord(null);
    form.resetFields(["AssessmentName", "AssessmentPercentage"]);
  };
  const onFinish = (values: FormValues) => {
    // remove % sign if in assessmentPercentage  value
    const percentage = values.AssessmentPercentage.toString().replace("%", "");
    const num = Number(percentage);

    const payload: AssessmentPost = {
      ...values,
      AssessmentPercentage: num,
      EducationalLevelId: values.EducationalLevel.value,
    };

    if (record?.assessmentId) {
      updateAssessment({ data: payload, id: record.assessmentId });
    } else {
      createAssessment(payload);
    }
  };

  // data
  const columns: ColumnsType<AssessmentGet> = [
    {
      key: "assessmentName",
      title: "Assessment",
      dataIndex: "assessmentName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "assessmentPercentage",
      title: "Percentage",
      dataIndex: "assessmentPercentage",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}%</span>
      ),
    },
    {
      key: "action",
      title: "",
      width: 100,
      align: "right",
      render: (_, row) => (
        <TableActions
          onEdit={() => setRecord(row)}
          onDelete={() => {}}
          onConfirmDelete={() => deleteAssessment(row.assessmentId)}
          deleteTitle="Delete this assessment?"
        />
      ),
    },
  ];

  const isPending =
    creatingAssessment || updatingAssessment || deletingAssessment;

  return (
    <SetupPage
      title="Assessment"
      replaceCount
      countReplacement={`${totalPercentage}%`}
      showClock={false}
      showTitle={false}
      icon={<Table className="w-4 h-4" />}
      hint={{
        note: "Assessments are tools used to measure students' skills or knowledge. They include questions or activities and help evaluate performance, track progress, and guide learning decisions. Assessments can take many forms—like tests, classroom activities, or even attendance—and are a key part of the school's evaluation system",
      }}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        updatingAssessment
          ? "Updating…"
          : deletingAssessment
            ? "Deleting…"
            : "Adding…"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingAssessments,
        rowKey: "assessmentId",
        showHeader: false,
      }}
      formContent={
        <>
          <Form.Item
            name="EducationalLevel"
            label="Edu Level Name"
            rules={[{ required: true, message: "Edu level is required" }]}
          >
            <Select
              options={eduOptions}
              placeholder="Select Educational Level"
              labelInValue
              loading={loadingEducationalLevels}
              disabled={loadingEducationalLevels}
              onChange={(opt) => {
                setSelectedEdu({
                  label: opt.label,
                  value: opt.value,
                });
              }}
              className="w-full"
            />
          </Form.Item>
          <Form.Item
            name="AssessmentName"
            label="Assessment Name"
            rules={[
              {
                required: true,
                message: "Assessment Name is required",
              },
            ]}
          >
            <Input placeholder="Assessment Name eg. Class Assessment, Exam Assessment, Attendance, etc" />
          </Form.Item>
          <Form.Item
            name="AssessmentPercentage"
            dependencies={["EducationalLevel"]}
            label=" Assessment Percentage(%)"
            rules={[
              {
                required: true,
                message: "Assessment Percentage is required",
              },
              () => ({
                validator(_, value) {
                  if (value + totalPercentage > 100) {
                    return Promise.reject(
                      new Error("Sum of Assessment cannot exceed 100%"),
                    );
                  } else {
                    return Promise.resolve();
                  }
                },
              }),
            ]}
          >
            <InputNumber
              className="w-full!"
              min={1}
              max={100}
              placeholder="Assessment Percentage eg. 30, 60, 10"
            />
          </Form.Item>
        </>
      }
    />
  );
};
export default AddAssessment;
