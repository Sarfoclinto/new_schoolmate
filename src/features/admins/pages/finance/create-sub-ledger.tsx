import { ledgerKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import {
  createSubsidiaryLedgerFn,
  getAllSubsidiaryLedgerFn,
} from "@/services/finance";
import type {
  SubsidiaryLedger,
  SubsidiaryLedgerPost,
} from "@/types/api/finance";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { toast } from "sonner";
import { SetupPage } from "../../components/setup-page";
import { CoinsIcon } from "lucide-react";
import { useState, useEffect } from "react";

const CreateSubLedger = () => {
  const [form] = Form.useForm<SubsidiaryLedgerPost>();
  const [record, setRecord] = useState<SubsidiaryLedger | null>(null);
  const qc = useQueryClient();

  // queries
  const { data: subLedgers = [], isLoading: loadingSubLedgers } = useFetch({
    queryFn: getAllSubsidiaryLedgerFn,
    queryKeys: ledgerKeys.custom("sub"),
  });

  useEffect(() => {
    if (record) {
      form.setFieldsValue({ sl: record.sl });
    } else {
      form.resetFields();
    }
  }, [record, form]);

  //  mutations
  const { mutate: create, isPending: creating } = usePost({
    postFn: createSubsidiaryLedgerFn,
    mutationOptions: { mutationKey: ["sub-ledger", "create"] },
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
      toast.error(`Failed to setup ledger`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = async () => {
    qc.invalidateQueries({ queryKey: ledgerKeys.custom("sub") });
  };

  const onReset = () => {
    setRecord(null);
    form.resetFields();
  };

  const onFinish = (values: SubsidiaryLedgerPost) => {
    create(values);
  };

  const isPending = creating;

  const columns: ColumnsType<SubsidiaryLedger> = [
    {
      key: "sl",
      title: "Ledger",
      dataIndex: "sl",
      render: (v: string) => (
        <span className="font-semibold text-xs text-[#0D1B2E] uppercase">
          {v}
        </span>
      ),
      width: "40%",
    },
    {
      key: "description",
      title: "Description",
      dataIndex: "description",
      render: (v: string) => (
        <span className="font-semibold capitalize text-xs text-[#0D1B2E]">
          {v ?? "-"}
        </span>
      ),
      width: "60%",
      align: "center",
    },
  ];

  return (
    <SetupPage
      title="Sub-Ledgers"
      breadcrumb={["Finance Setup", "Sub-Ledgers"]}
      icon={<CoinsIcon className="w-4 h-4" />}
      hint={{
        note: "Set up the sub-ledgers to categorize different types of income or fees.",
        example: "School Fees, Canteen Fees, Transportation Fees, etc",
      }}
      record={record}
      onClearRecord={onReset}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={creating ? "Creating" : "Create"}
      tableProps={{
        columns,
        dataSource: subLedgers,
        loading: loadingSubLedgers,
        rowKey: "slCode",
        showHeader: false,
      }}
      formContent={
        <>
          <Form.Item
            name="sl"
            label="Ledger Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input
              size="large"
              className="rounded-xl!"
              placeholder="e.g. School Fees, Canteen Fees, Transportation Fees, etc"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            extra={
              <span className="text-xs font-mono">
                Add a detailed description of the sub-ledger...
              </span>
            }
          >
            <Input.TextArea
              size="large"
              className="rounded-xl!"
              placeholder="Description eg. Sports fee of GHS 50 for a complete PE-Kit"
            />
          </Form.Item>
        </>
      }
    />
  );
};
export default CreateSubLedger;
