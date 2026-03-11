import { eduKeys, termKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import {
  createTermFn,
  deleteTermFn,
  getTermsByEduIdFn,
} from "@/services/setup/year-n-term";
import type {
  AcademicTermGet,
  AcademicTermPost,
} from "@/types/api/setup/year-n-term";
import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SetupPage } from "../setup-page";
import { ClockFading } from "lucide-react";
// import { cn } from "@/lib/utils";
import { TableActions } from "../table-action";

interface FormValues {
  AcademicTermType: string;
  AcademicTerm: string;
}

const Terms = () => {
  // states
  const [form] = Form.useForm();
  const [record, setRecord] = useState<AcademicTermGet | null>(null);
  const [otherSelected, setOtherSelected] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const qc = useQueryClient();

  const eduId = selectedEdu?.value;

  // effects

  // queries
  const { data: educationalLevels, isLoading: loadingEducationalLevels } =
    useFetch({
      queryFn: getAllEduLevelsFn,
      queryKeys: eduKeys.levels(),
    });
  const { data: academicTerms, isLoading: loadingAcademicTerms } = useFetch({
    queryFn: () => getTermsByEduIdFn(eduId!),
    queryKeys: termKeys.custom("edu-terms", { eduId }),
    enabled: !!eduId,
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!academicTerms) return [];
    return academicTerms;
  }, [academicTerms]);

  const eduOptions = useMemo(() => {
    if (!educationalLevels) return [];
    return educationalLevels.map((edu) => ({
      label: edu.educationalLevelName,
      value: edu.educationalLevelId,
    }));
  }, [educationalLevels]);

  // mutations
  const { mutate: createTerm, isPending: creatingTerm } = usePost({
    postFn: createTermFn,
    mutationOptions: { mutationKey: ["term", "create"] },
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
      toast.error(`Failed to create term`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteTerm, isPending: deletingTerm } = usePost({
    postFn: deleteTermFn,
    mutationOptions: { mutationKey: ["term", "delete"] },
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
      toast.error(`Failed to delete term`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () => qc.invalidateQueries({ queryKey: termKeys.all });
  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };
  const onFinish = (values: FormValues) => {
    if (!selectedEdu || !eduId) {
      toast.info("Please select an educational level");
      return;
    }
    const payload: AcademicTermPost = {
      AcademicTermType: values.AcademicTermType,
      EducationalLevelId: eduId,
      AcademicTerm: [values.AcademicTerm],
    };
    createTerm(payload);
  };

  // data
  const columns: ColumnsType<AcademicTermGet> = [
    {
      key: "academictermName",
      title: "Term",
      dataIndex: "academicTermName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    // {
    //   key: "status",
    //   title: "Status",
    //   dataIndex: "status",
    //   render: (v: string) => (
    //     <span
    //       className={cn(
    //         "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
    //         v?.toLowerCase() === "active"
    //           ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
    //           : "bg-slate-50 text-slate-400 border border-slate-100",
    //       )}
    //     >
    //       {v}
    //     </span>
    //   ),
    // },
    {
      key: "action",
      title: "",
      width: 100,
      align: "right",
      render: (_, row) => (
        <TableActions
          onDelete={() => {}}
          onConfirmDelete={() => deleteTerm(row.academicTermId)}
        />
      ),
    },
  ];
  const isPending = creatingTerm || deletingTerm;

  return (
    <>
      <SetupPage
        title="Academic-Term"
        showClock={false}
        showTitle={false}
        icon={<ClockFading className="w-4 h-4" />}
        record={record}
        onClearRecord={onReset}
        form={form}
        onFinish={onFinish}
        isPending={isPending}
        pendingLabel={
          deletingTerm
            ? "Deleting…"
            : creatingTerm
              ? "Creating…"
              : "Activating…"
        }
        tableProps={{
          columns,
          dataSource,
          loading: loadingAcademicTerms,
          rowKey: "academicTermId",
          showHeader: false,
        }}
        formContent={
          <>
            <Form.Item
              label="Educational Level"
              name="EducationalLevel"
              rules={[
                {
                  required: true,
                  message: "Please select Educational Level!",
                },
              ]}
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
                  setOtherSelected(false);
                  form.resetFields(["AcademicTerm", "AcademicTermType"]);
                }}
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              label="Term Type"
              name="AcademicTermType"
              rules={[
                {
                  required: true,
                  message: "Please select Academic Term Type!",
                },
              ]}
            >
              <Select
                placeholder="Select Academic Term type"
                onChange={(value) => {
                  if (value === "Other") {
                    setOtherSelected(true);
                  } else {
                    setOtherSelected(false);
                  }
                }}
                options={termOptions}
              />
            </Form.Item>
            {otherSelected && (
              <Form.Item
                label="Academic Term"
                name="AcademicTerm"
                required={otherSelected}
              >
                <Input placeholder="Enter Academic Term name" />
              </Form.Item>
            )}
          </>
        }
      />
    </>
  );
};
export default Terms;

const termOptions = [
  { label: "Semester", value: "Semester" },
  {
    label: "Trimester",
    value: "Trimester",
  },
  {
    label: "Quarter",
    value: "Quater",
  },
  {
    label: "Other",
    value: "Other",
  },
];
