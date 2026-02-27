import type {
  AcademicYearGet,
  AcademicYearPost,
  ActivateYear,
} from "@/types/api/setup/year-n-term";
import { useQueryClient } from "@tanstack/react-query";
import { Button, DatePicker, Form } from "antd";
import { useEffect, useMemo, useState } from "react";
import dayjs from "@/lib/dayjs";
import useFetch from "@/hooks/api/use-fetch";
import {
  activeYearFn,
  createYearFn,
  getAllYearsFn,
  updateYearFn,
} from "@/services/setup/year-n-term";
import { yearKeys } from "@/config/query-keys";
import usePost from "@/hooks/api/use-post";
import { toast } from "sonner";
import useUpdate from "@/hooks/api/use-update";
import type { ColumnsType } from "antd/es/table";
import { TableActions, type UsePopOrWithoutPop } from "../table-action";
import { SetupPage } from "../setup-page";
import { CheckCircle2, Clock10 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dayjs } from "dayjs";

interface FormValues {
  StartYear: Dayjs;
  EndYear: Dayjs;
}

const nodeConfig = (
  row: AcademicYearGet,
  activateYear: (variables: ActivateYear) => void,
  activatingYear: boolean,
): UsePopOrWithoutPop => ({
  tooltipTitle: "Activate",
  popConfirmConfig: {
    title: "Activate this year?",
    okText: "Activate",
    cancelText: "Cancel",
    okButtonProps: { danger: true, size: "small" },
    cancelButtonProps: { size: "small" },
    onConfirm: () => {
      const payload: ActivateYear = {
        data: { Status: "Activate" },
        id: row.academicYearId,
      };
      if (row.academicYearId) {
        activateYear(payload);
      }
    },
    onCancel: () => {},
    children: (
      <Button
        size="small"
        disabled={activatingYear}
        className="border-[#1E3A5F]/20! text-[#1E3A5F]! hover:bg-[#1E3A5F]! hover:text-white! rounded-lg! w-8! h-8! p-0! flex items-center justify-center"
        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
      />
    ),
  },
});

const Years = () => {
  // states
  const [form] = Form.useForm();
  const [record, setRecord] = useState<AcademicYearGet | null>(null);
  const qc = useQueryClient();

  // effects
  useEffect(() => {
    if (record && record.academicYearId) {
      form.setFieldsValue({
        StartYear: record.startYear
          ? dayjs(record.startYear, "YYYY")
          : undefined,
        EndYear: record.startYear ? dayjs(record.endYear, "YYYY") : undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  // queries
  const { data: academicYears, isLoading: loadingYears } = useFetch({
    queryFn: getAllYearsFn,
    queryKeys: yearKeys.list(),
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!academicYears) return [];
    return academicYears;
  }, [academicYears]);

  // mutations
  const { mutate: createYear, isPending: creatingYear } = usePost({
    postFn: createYearFn,
    mutationOptions: { mutationKey: ["year", "create"] },
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
      toast.error(`Failed to create year`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateYear, isPending: updatingYear } = useUpdate({
    updateFn: updateYearFn,
    mutationOptions: { mutationKey: ["year", "update"] },
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
      toast.error(`Failed to update year`, {
        description: err?.message,
      });
    },
  });
  const { mutate: activateYear, isPending: activatingYear } = useUpdate({
    updateFn: activeYearFn,
    mutationOptions: { mutationKey: ["year", "activate"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      // TODO: recieve newly activated and replace in store: AcademicYearGet
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage);
        onReset();
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to update year`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () => qc.invalidateQueries({ queryKey: yearKeys.all });
  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };
  const onFinish = (values: FormValues) => {
    const payload: AcademicYearPost = {
      StartYear: values.StartYear.year().toString(),
      EndYear: values.EndYear.year().toString(),
    };
    if (record?.academicYearId) {
      updateYear({ data: payload, id: record.academicYearId });
    } else {
      createYear(payload);
    }
  };

  // data
  const columns: ColumnsType<AcademicYearGet> = [
    {
      key: "startYear",
      title: "Start Year",
      dataIndex: "startYear",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "endYear",
      title: "End Year",
      dataIndex: "endYear",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
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
          onEdit={() => setRecord(row)}
          node={nodeConfig(row, activateYear, activatingYear)}
        />
      ),
    },
  ];
  const isPending = creatingYear || updatingYear || activatingYear;

  return (
    <SetupPage
      title="Academic-Year"
      showClock={false}
      showTitle={false}
      icon={<Clock10 className="w-4 h-4" />}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        updatingYear ? "Updating…" : creatingYear ? "Creating…" : "Activating…"
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingYears,
        rowKey: "academicYearId",
        showHeader: false,
      }}
      formContent={
        <>
          <Form.Item
            label="Start Year"
            name="StartYear"
            rules={[
              {
                required: true,
                message: "Please select Start Year!",
              },
            ]}
          >
            <DatePicker picker="year" className="w-full" />
          </Form.Item>

          <Form.Item
            label="End Year"
            name="EndYear"
            dependencies={["StartYear"]} // Watch StartYear changes
            rules={[
              {
                required: true,
                message: "Please select End Year!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startYear = getFieldValue("StartYear");
                  if (
                    !value ||
                    !startYear ||
                    dayjs(value).year() >= dayjs(startYear).year()
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "End Year must be greater than or equal to Start Year!",
                    ),
                  );
                },
              }),
            ]}
          >
            <DatePicker picker="year" className="w-full" />
          </Form.Item>
        </>
      }
    />
  );
};
export default Years;
