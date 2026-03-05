import { academicKeys, promotionPathKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import { getAllAcaLevelsFn } from "@/services/setup/academic-level";
import {
  chainPromotionPaths,
  createPromotionPathFn,
  deletePromotionPathFn,
  getPromotionPathsFn,
} from "@/services/setup/promotion-path";
import type {
  PromotionPathGet,
  PromotionPathPost,
} from "@/types/api/setup/promotion-path";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { toast } from "sonner";
import { TableActions } from "../../components/table-action";
import { SetupPage } from "../../components/setup-page";
import { DoorOpen } from "lucide-react";

const PromotionPath = () => {
  // states
  const [form] = Form.useForm();
  const qc = useQueryClient();

  // queries
  // get all academic levels
  const { data: acaLevels, isLoading: loadingAcaLevels } = useFetch({
    queryFn: getAllAcaLevelsFn,
    queryKeys: academicKeys.list(),
  });

  // get all promotion paths
  const { data: promotionPaths, isLoading: loadingPromotionPaths } = useFetch({
    queryFn: getPromotionPathsFn,
    queryKeys: promotionPathKeys.list(),
  });

  // memoized data source for table
  const dataSource = useMemo(() => {
    if (!promotionPaths) return [];
    return chainPromotionPaths(promotionPaths);
  }, [promotionPaths]);

  const acaLevelOptions = useMemo(() => {
    if (!acaLevels) return [];
    return acaLevels.map((a) => ({
      label: a.academicLevelName,
      value: a.academicLevelId,
    }));
  }, [acaLevels]);

  // mutations
  const { mutate: createPromotionPath, isPending: creatingPromotionPath } =
    usePost({
      postFn: createPromotionPathFn,
      mutationOptions: { mutationKey: ["promotion-path", "create"] },
      onSuccess: ({ responseCode, responseMessage }) => {
        if (responseCode === 1) {
          invalidate();
          form.resetFields();
          toast.success(responseMessage);
        } else {
          toast.error(responseMessage);
        }
      },
      onError: (err) => {
        toast.error(`Failed to create promotion path`, {
          description: err?.message,
        });
      },
    });

  const { mutate: deletePromotionPath, isPending: deletingPromotionPath } =
    usePost({
      postFn: deletePromotionPathFn,
      mutationOptions: { mutationKey: ["promotion-path", "delete"] },
      onSuccess: ({ responseCode, responseMessage }) => {
        if (responseCode === 1) {
          invalidate();
          form.resetFields();
          toast.success(responseMessage);
        } else {
          toast.error(responseMessage);
        }
      },
      onError: (err) => {
        toast.error(`Failed to delete promotion path`, {
          description: err?.message,
        });
      },
    });

  // fns
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: promotionPathKeys.list() });
  };

  const onFinish = (values: PromotionPathPost) => {
    createPromotionPath(values);
  };

  // data
  const columns: ColumnsType<PromotionPathGet> = [
    {
      key: "initialLevel",
      title: "From Level",
      dataIndex: "fromAcademicLevelName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "finalLevel",
      title: "To Level",
      dataIndex: "toAcademicLevelName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "actions",
      title: "",
      align: "right",
      render: (_, row) => (
        <TableActions
          onDelete={() => {}}
          onConfirmDelete={() =>
            deletePromotionPath(row.academicLevelPromotionPathId)
          }
          deleteTitle="Delete this promotion path?"
        />
      ),
    },
  ];

  const isPending = creatingPromotionPath || deletingPromotionPath;

  return (
    <SetupPage
      title="Promotion Paths"
      breadcrumb={["Institution Setup", "Promotion Path"]}
      icon={<DoorOpen className="w-4 h-4" />}
      hint={{
        note: "Promotion paths define how students move from one academic level to another. Make sure the starting and target levels are different and follow the correct order. For example, if a student is in Kindergarten 1, they should move to Kindergarten 2, not Primary 1",
        example:
          " Creche - Kindergaten 1, Kindergaten 1 - Kindergaten 2, Kindergaten 2 - P1, P1 - P2, etc",
      }}
      onClearRecord={() => form.resetFields()}
      form={form}
      onFinish={onFinish}
      isPending={isPending}
      pendingLabel={
        creatingPromotionPath
          ? "Creating..."
          : deletingPromotionPath
            ? "Deleting..."
            : undefined
      }
      tableProps={{
        columns,
        dataSource,
        loading: loadingPromotionPaths,
        rowKey: "academicLevelPromotionPathId",
        title: () => (
          <div className="flex items-center justify-between h-0! p-0!"></div>
        ),
      }}
      formContent={
        <>
          <Form.Item
            name="FromAcademicLevelId"
            label="From Academic Level"
            rules={[
              { required: true, message: "From academic level is required" },
            ]}
          >
            <Select
              options={acaLevelOptions}
              loading={loadingAcaLevels}
              disabled={loadingAcaLevels}
              showSearch
              size="large"
              placeholder="Select starting academic level"
            />
          </Form.Item>
          <Form.Item
            name="ToAcademicLevelId"
            label="To Academic Level"
            dependencies={["FromAcademicLevelId"]}
            rules={[
              { required: true, message: "Target academic level is required" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !value ||
                    getFieldValue("FromAcademicLevelId") !== value
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Target level must be different from Initial level",
                    ),
                  );
                },
              }),
            ]}
          >
            <Select
              options={acaLevelOptions}
              loading={loadingAcaLevels}
              disabled={loadingAcaLevels}
              showSearch
              size="large"
              placeholder="Select target academic level"
            />
          </Form.Item>
        </>
      }
    />
  );
};
export default PromotionPath;
