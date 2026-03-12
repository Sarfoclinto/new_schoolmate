import { eduKeys, termKeys, yearKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import {
  activeTermFn,
  getAllYearsFn,
  getTermsByEduIdFn,
  getTermsFromStateByEduId,
  updateTermTimeRangeFn,
} from "@/services/setup/year-n-term";
import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Button, DatePicker, Form, Select } from "antd";
import { useEffect, useMemo, useState } from "react";
import { SetupPage } from "../setup-page";
import type { ColumnsType } from "antd/es/table";
import type {
  AcademicTermTimeRange,
  UpdateAcademicTermTimeRange,
} from "@/types/api/setup/year-n-term";
import { TableActions } from "../table-action";
import { CheckCircle2, ClockFading } from "lucide-react";
import usePost from "@/hooks/api/use-post";
import { toast } from "sonner";
import { formatDate } from "@/utils/date-n-time";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";

interface FormValues {
  AcademicYear: { value: string };
  EducationalLevel: { value: string };
  AcademicTerm: string;
  StartDate: string;
  EndDate: string;
}

const TermsUpdate = () => {
  const [searchParams] = useSearchParams();
  // states
  const [form] = Form.useForm<FormValues>();
  const [record, setRecord] = useState<AcademicTermTimeRange | null>(null);
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [selectedYear, setSelectedYear] = useState<SelectTypes | null>(null);
  const [dates, setDates] = useState({
    startDate: "",
    endDate: "",
  });
  const qc = useQueryClient();
  const eduId = selectedEdu?.value;
  const yearId = selectedYear?.value;

  // queries
  const { data: academicYears, isLoading: loadingYears } = useFetch({
    queryFn: getAllYearsFn,
    queryKeys: yearKeys.list(),
  });
  const { data: eduLevels, isLoading: loadingEdu } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  const { data: academicTerms, isLoading: loadingTerms } = useFetch({
    queryFn: () => getTermsByEduIdFn(eduId!),
    queryKeys: termKeys.custom("edu-terms", { eduId }),
    enabled: !!eduId,
  });
  const { data: termTimeRanges, isLoading: loadingTermTimeRanges } = useFetch({
    queryFn: () => getTermsFromStateByEduId(eduId!, yearId!),
    queryKeys: termKeys.custom("edu-terms-from-state", { eduId, yearId }),
    enabled: !!yearId && !!eduId,
  });

  //   memoized values
  const eduOptions = useMemo(() => {
    if (!eduLevels) return [];
    return eduLevels.map((edu) => ({
      label: edu.educationalLevelName,
      value: edu.educationalLevelId,
    }));
  }, [eduLevels]);

  const termOptions = useMemo(() => {
    if (!academicTerms) return [];
    return academicTerms.map((term) => ({
      label: term.academicTermName,
      value: term.academicTermId,
    }));
  }, [academicTerms]);

  const yearOptions = useMemo(() => {
    if (!academicYears) return [];
    return academicYears.map((year) => ({
      label: `${year.startYear}-${year.endYear}`,
      value: year.academicYearId,
    }));
  }, [academicYears]);

  useEffect(() => {
    const urlEdu = searchParams.get("eduLevelId");
    const urlYear = searchParams.get("academicYearId");
    if (urlEdu && urlYear && eduOptions.length > 0 && yearOptions.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedEdu({
        label: eduOptions.find((e) => e.value === urlEdu)?.label ?? "",
        value: urlEdu,
      });
      setSelectedYear({
        label: yearOptions.find((y) => y.value === urlYear)?.label ?? "",
        value: urlYear,
      });
      form.setFieldsValue({
        AcademicYear: { value: selectedYear?.value },
        EducationalLevel: { value: selectedEdu?.value },
      });
    }
  }, [
    eduOptions,
    form,
    searchParams,
    selectedEdu?.value,
    selectedYear?.value,
    yearOptions,
  ]);

  const dataSource = useMemo(() => {
    if (!termTimeRanges) return [];
    return termTimeRanges;
  }, [termTimeRanges]);

  const { mutate: updateTermTimeRange, isPending: updating } = usePost({
    postFn: updateTermTimeRangeFn,
    mutationOptions: { mutationKey: ["term-time-range", "update"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();
        toast.success(responseMessage);
        setDates({
          startDate: "",
          endDate: "",
        });
        form.resetFields(["AcademicTerm", "EndDate", "StartDate"]);
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to update term time range`, {
        description: err?.message,
      });
    },
  });
  const { mutate: activateTerm, isPending: activatingTerm } = usePost({
    postFn: activeTermFn,
    mutationOptions: { mutationKey: ["term", "activate"] },
    onSuccess: async ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        await invalidate();
        toast.success(responseMessage);
      } else {
        toast.info(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create term`, {
        description: err?.message,
      });
    },
  });

  const invalidate = () =>
    qc.invalidateQueries({
      queryKey: termKeys.custom("edu-terms-time-range", { eduId, yearId }),
    });
  const reset = () => {
    setRecord(null);
    setDates({
      startDate: "",
      endDate: "",
    });
    setSelectedEdu(null);
    setSelectedYear(null);
    form.resetFields();
  };
  const onFinish = (values: FormValues) => {
    const payload: UpdateAcademicTermTimeRange = {
      EducationalLevelId: values.EducationalLevel.value,
      AcademicTermId: values.AcademicTerm,
      AcademicYearId: values.AcademicYear.value,
      StartDate: dates.startDate,
      EndDate: dates.endDate,
    };
    updateTermTimeRange(payload);
  };

  const columns: ColumnsType<AcademicTermTimeRange> = [
    {
      key: "academictermName",
      title: "Term",
      dataIndex: "academicTermName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "timeRange",
      title: "Time Range",
      render: (_, row) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">
          {formatDate(row.startDate)} - {formatDate(row.endDate)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      render: (v: string) => (
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
            v?.toLowerCase() === "active"
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-slate-50 text-slate-400 border border-slate-100",
          )}
        >
          {v}
        </span>
      ),
    },
    {
      key: "action",
      title: "",
      width: 100,
      align: "right",
      render: (_, row) => (
        <TableActions
          editProps={{
            title: "Activate",
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          }}
          node={{
            tooltipTitle: "Active",
            popConfirmConfig: {
              title: "Activate this term?",
              okText: "Activate",
              cancelText: "Cancel",
              okButtonProps: { size: "small" },
              cancelButtonProps: { size: "small" },
              onConfirm: () => {
                activateTerm({
                  AcademicTermId: row.academicTermId,
                  AcademicYearId: row.academicYearId,
                  EducationalLevelId: row.educationalLevelId,
                  Status: "Active",
                });
              },
              children: (
                <div className="w-full flex justify-center">
                  <Button
                    size="small"
                    disabled={activatingTerm}
                    loading={activatingTerm}
                    className="rounded-lg! w-8! h-8! p-0! flex items-center justify-center"
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  />
                </div>
              ),
            },
          }}
        />
      ),
    },
  ];

  return (
    <>
      <SetupPage
        title="Academic-Term-Time-Range"
        showClock={false}
        showTitle={false}
        icon={<ClockFading className="w-4 h-4" />}
        record={record}
        onClearRecord={reset}
        form={form}
        onFinish={onFinish}
        isPending={updating}
        pendingLabel={updating ? "Updating" : "Update"}
        tableProps={{
          columns,
          dataSource,
          loading: loadingTermTimeRanges,
          rowKey: "academicTermId",
          //   showHeader: false,
        }}
        formContent={
          <>
            <Form.Item
              label="Academic Year"
              name="AcademicYear"
              rules={[
                {
                  required: true,
                  message: "Please select Academic Year",
                },
              ]}
            >
              <Select
                options={yearOptions}
                placeholder="Select Academic Year"
                labelInValue
                loading={loadingYears}
                disabled={loadingYears}
                allowClear
                onChange={(opt) => {
                  setSelectedYear({
                    label: opt.label,
                    value: opt.value,
                  });
                }}
                className="w-full"
              />
            </Form.Item>
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
                allowClear
                loading={loadingEdu}
                disabled={loadingEdu}
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
              label="Academic Term"
              name="AcademicTerm"
              rules={[
                {
                  required: true,
                  message: "Please select Academic Term!",
                },
              ]}
            >
              <Select
                options={termOptions}
                placeholder="Select Academic Term"
                loading={loadingTerms}
                disabled={loadingTerms}
                allowClear
                className="w-full"
              />
            </Form.Item>
            <div className="w-full grid grid-cols-2 items-center gap-x-3">
              <Form.Item
                label="Select StartDate"
                name="StartDate"
                rules={[{ required: true, message: "Start date is required" }]}
              >
                <DatePicker
                  placeholder="Select StartDate"
                  allowClear
                  onChange={(_, dateString) =>
                    setDates((prev) => ({
                      ...prev,
                      startDate: dateString as string,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label="Select EndDate"
                name="EndDate"
                rules={[{ required: true, message: "End date is required" }]}
              >
                <DatePicker
                  placeholder="Select EndDate"
                  allowClear
                  onChange={(_, dateString) =>
                    setDates((prev) => ({
                      ...prev,
                      endDate: dateString as string,
                    }))
                  }
                />
              </Form.Item>
            </div>
          </>
        }
      />
    </>
  );
};
export default TermsUpdate;
