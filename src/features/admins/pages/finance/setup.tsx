import { ReceiptCent } from "lucide-react";
import { SetupPage } from "../../components/setup-page";
import { Form, InputNumber, Select } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import useFetch from "@/hooks/api/use-fetch";
import {
  createFeesFn,
  deleteFeesFn,
  getAllSubsidiaryLedgerFn,
  getFeesFn,
  updateFeesFn,
} from "@/services/finance";
import {
  eduKeys,
  financeKeys,
  ledgerKeys,
  termKeys,
  yearKeys,
} from "@/config/query-keys";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { getAcaByEduIdFn } from "@/services/setup/academic-level";
import { getAllYearsFn, getTermsByEduIdFn } from "@/services/setup/year-n-term";
import usePost from "@/hooks/api/use-post";
import { toast } from "sonner";
import useUpdate from "@/hooks/api/use-update";
import type { ColumnsType } from "antd/es/table";
import type { TuitionGet, TuitionPost } from "@/types/api/finance";
import type { AcademicTermGet } from "@/types/api/setup/year-n-term";
import { formatCurrency } from "@/services/currency";
import { TableActions } from "../../components/table-action";

type FormValues = Omit<TuitionPost, "id"> & {
  educationalLevelId: { value: string; label: string };
  academicLevelId: { value: string; label: string };
};

const FeesSetup = () => {
  // states
  const [form] = Form.useForm<FormValues>();
  const [record, setRecord] = useState<TuitionGet | null>(null);
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [selectedAca, setSelectedAca] = useState<SelectTypes | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | undefined>();
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>();

  const eduId = selectedEdu?.value;
  const academicLevelId = selectedAca?.value;
  const academicYearId = selectedYear;
  const academicTermId = selectedTerm;

  const qc = useQueryClient();

  // queries
  const { data: subLedgers, isLoading: loadingSubLedgers } = useFetch({
    queryFn: getAllSubsidiaryLedgerFn,
    queryKeys: ledgerKeys.custom("sub"),
  });
  const { data: eduLevels, isLoading: loadingEduLevels } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  const { data: acaLevels, isLoading: loadingAcaLevels } = useFetch({
    queryFn: () => getAcaByEduIdFn(eduId!),
    queryKeys: eduKeys.academicLevels(eduId),
    enabled: !!eduId,
  });
  const { data: academicTerms, isLoading: loadingAcademicTerms } = useFetch({
    queryFn: () => getTermsByEduIdFn(eduId!),
    queryKeys: termKeys.custom("edu-terms", { eduId }),
    enabled: !!eduId,
  });
  const { data: academicYears, isLoading: loadingYears } = useFetch({
    queryFn: getAllYearsFn,
    queryKeys: yearKeys.list(),
  });
  const { data: fees, isLoading: loadingFees } = useFetch({
    queryFn: () =>
      getFeesFn({
        educationalLevelId: eduId,
        academicLevelId,
        academicYearId,
        academicTermId,
      }),
    queryKeys: financeKeys.custom("fees", {
      educationalLevelId: eduId,
      academicLevelId,
      academicYearId,
      academicTermId,
    }),
  });

  useEffect(() => {
    if (record) {
      setSelectedEdu({
        label: record.educationalLevelName,
        value: record.educationalLevelId,
      });
      setSelectedAca({
        label: record.academicLevelName,
        value: record.academicLevelId,
      });
      setSelectedYear(record.academicYear.academicYearId);
      setSelectedTerm(record.academicTerm.academicTermId);
      form.setFieldsValue({
        academicLevelId: {
          value: record.academicLevelId,
          label: record.academicLevelName,
        },
        educationalLevelId: {
          value: record.educationalLevelId,
          label: record.educationalLevelName,
        },
        academicYearId: record.academicYear.academicYearId,
        academicTermId: record.academicTerm.academicTermId,
        amount: record.amount,
        slCode: record.slCode,
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  // memoized values
  const dataSource = useMemo(() => {
    if (!fees) return [];
    return fees;
  }, [fees]);

  const totaFees = useMemo(
    () => dataSource.reduce((acc, cur) => acc + cur.amount, 0),
    [dataSource],
  );
  // options
  const subLedgerOptions = useMemo(() => {
    if (!subLedgers) return [];
    return subLedgers.map((s) => ({
      label: s.sl,
      value: s.slCode,
    }));
  }, [subLedgers]);
  const eduOptions = useMemo(() => {
    if (!eduLevels) return [];
    return eduLevels.map((e) => ({
      label: e.educationalLevelName,
      value: e.educationalLevelId,
    }));
  }, [eduLevels]);
  const acaOptions = useMemo(() => {
    if (!acaLevels) return [];
    return acaLevels.map((a) => ({
      label: a.academicLevelName,
      value: a.academicLevelId,
    }));
  }, [acaLevels]);

  const termOptions = useMemo(() => {
    if (!academicTerms) return [];
    return academicTerms.map((t) => ({
      label: t.academicTermName,
      value: t.academicTermId,
    }));
  }, [academicTerms]);
  const yearOptions = useMemo(() => {
    if (!academicYears) return [];
    return academicYears.map((y) => ({
      label: `${y.startYear}-${y.endYear}`,
      value: y.academicYearId,
    }));
  }, [academicYears]);

  // fns
  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: financeKeys.all });
  };

  // mutations
  const { mutate: addFees, isPending: addingFees } = usePost({
    postFn: createFeesFn,
    mutationOptions: { mutationKey: ["fees", "create"] },
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
      toast.error(`Failed to setup fee`, {
        description: err?.message,
      });
    },
  });
  const { mutate: updateFees, isPending: updatingFees } = useUpdate({
    updateFn: updateFeesFn,
    mutationOptions: { mutationKey: ["fees", "update"] },
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
      toast.error(`Failed to update fee`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteFees, isPending: deletingFees } = usePost({
    postFn: deleteFeesFn,
    mutationOptions: { mutationKey: ["fees", "delete"] },
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
      toast.error(`Failed to delete fee`, {
        description: err?.message,
      });
    },
  });

  // fns
  const onFinish = (values: FormValues) => {
    const payload: TuitionPost = {
      ...values,
      id: record?.id ? record.id : "",
      academicLevelId: values.academicLevelId.value,
      educationalLevelId: values.educationalLevelId.value,
    };
    if (record && record.id) {
      updateFees({ id: record.id, data: payload });
    } else {
      addFees(payload);
    }
  };
  const onReset = () => {
    setRecord(null);
    setSelectedEdu(null);
    setSelectedYear(undefined);
    setSelectedTerm(undefined);
    form.resetFields();
  };

  // data
  const isPending = addingFees || updatingFees || deletingFees;
  const columns: ColumnsType<TuitionGet> = [
    {
      key: "sl",
      title: "Ledger",
      dataIndex: "sl",
      render: (v: string) => (
        <span className="font-semibold capitalize! text-xs text-[#0D1B2E]">
          {v}
        </span>
      ),
    },
    {
      key: "academicLevelName",
      title: "Level",
      dataIndex: "academicLevelName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-xs text-[#0D1B2E]">
          {v}
        </span>
      ),
    },
    {
      key: "amount",
      title: "Amount",
      dataIndex: "amount",
      render: (v) => (
        <span className="font-semibold capitalize text-xs text-[#0D1B2E]">
          {formatCurrency(v, "GHS", { type: "currency" })}
        </span>
      ),
    },
    {
      key: "academicYearName",
      title: "Year",
      dataIndex: "academicYear",
      render: (_, record) => (
        <span className="font-semibold capitalize text-xs text-[#0D1B2E]">
          {record.academicYear.startYear}-{record.academicYear.endYear}
        </span>
      ),
    },
    {
      key: "academicTermName",
      title: "Term",
      dataIndex: "academicTerm",
      render: (v: AcademicTermGet) => (
        <span className="font-semibold capitalize text-xs text-[#0D1B2E]">
          {v.academicTermName}
        </span>
      ),
    },
    {
      key: "action",
      title: "",
      render: (_, row) => (
        <TableActions
          onEdit={() => setRecord(row)}
          onDelete={() => {}}
          onConfirmDelete={() => {
            deleteFees(row.id);
          }}
          deleteTitle="Delete fees?"
        />
      ),
    },
  ];

  return (
    <SetupPage
      title="Fees Setup"
      breadcrumb={["Finance Setup", "Fees Setup"]}
      icon={<ReceiptCent className="w-4 h-4" />}
      hint={{
        note: "Setup all the various fees categories you can in the school",
        example:
          "Tuition fee, Exams fees, Transportation fees, Canteen fees, etc.",
      }}
      replaceCount
      countReplacement={formatCurrency(totaFees, "GHS", { type: "currency" })}
      record={record}
      onFinish={onFinish}
      onClearRecord={onReset}
      form={form}
      isPending={isPending}
      pendingLabel={
        updatingFees
          ? "Updating…"
          : deletingFees
            ? "Deleting…"
            : addingFees
              ? "Adding…"
              : "Add Fees"
      }
      tableProps={{ columns, dataSource, rowKey: "id", loading: loadingFees }}
      formContent={
        <>
          <Form.Item
            name="educationalLevelId"
            label="Educational Level"
            rules={[
              {
                required: true,
                message: "Educational level is required",
              },
            ]}
          >
            <Select
              placeholder="Select Educational Level"
              options={eduOptions}
              loading={loadingEduLevels}
              disabled={loadingEduLevels}
              value={selectedEdu}
              labelInValue
              showSearch
              allowClear
              onChange={(opt) => {
                setSelectedEdu({ value: opt.value, label: opt.label });
                form.resetFields(["academicLevelId"]);
              }}
            />
          </Form.Item>
          <div className="grid w-full grid-cols-2 gap-x-1">
            <Form.Item
              name="slCode"
              label="Sub Ledger"
              rules={[
                {
                  required: true,
                  message: "Sub-leger is required",
                },
              ]}
            >
              <Select
                placeholder="Select Sub Ledger"
                showSearch
                options={subLedgerOptions}
                loading={loadingSubLedgers}
                disabled={loadingSubLedgers}
                allowClear
              />
            </Form.Item>
            <Form.Item
              name="academicLevelId"
              label="Academic Level"
              rules={[
                {
                  required: true,
                  message: "Academic level is required",
                },
              ]}
            >
              <Select
                placeholder={
                  selectedEdu
                    ? "Select Academic Level"
                    : "Select edu level first"
                }
                options={acaOptions}
                value={selectedAca}
                labelInValue
                loading={loadingAcaLevels}
                disabled={loadingAcaLevels || !selectedEdu?.value}
                onChange={(opt) => {
                  setSelectedAca({ value: opt.value, label: opt.label });
                }}
                showSearch
                allowClear
              />
            </Form.Item>
          </div>

          <div className="grid w-full grid-cols-2 gap-x-1">
            <Form.Item
              name="academicYearId"
              label="Academic Year"
              rules={[
                {
                  required: true,
                  message: "Year is required",
                },
              ]}
            >
              <Select
                placeholder="Academic Year"
                options={yearOptions}
                loading={loadingYears}
                value={selectedYear}
                onChange={setSelectedYear}
              />
            </Form.Item>
            <Form.Item
              name="academicTermId"
              label="Academic Term"
              rules={[
                {
                  required: true,
                  message: "Term is required",
                },
              ]}
            >
              <Select
                placeholder={
                  selectedEdu ? "Select Term" : "Select edu level first"
                }
                options={termOptions}
                loading={loadingAcademicTerms}
                disabled={!selectedEdu}
                value={selectedTerm}
                onChange={setSelectedTerm}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              {
                required: true,
                message: "Fee is required",
              },
            ]}
          >
            <InputNumber
              size="large"
              className="w-full! rounded-xl!"
              min={1}
              step={100}
              placeholder="Fee eg. 5000, 500.59"
            />
          </Form.Item>
        </>
      }
    />
  );
};
export default FeesSetup;
