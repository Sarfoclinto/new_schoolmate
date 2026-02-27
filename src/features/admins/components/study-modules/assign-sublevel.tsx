import { educationKeys, eduKeys, programKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import {
  createModuleMappingFn,
  deleteProgramSubLevelFn,
  getAllProgramsFn,
  getProgramSubjectsFn,
} from "@/services/setup/study-module";
import {
  getAllSubLevelsFn,
  getSublevelsWithoutProgramFn,
} from "@/services/setup/sublevel";
import type { SubLevelGet } from "@/types/api/setup/sublevel";
import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Form, Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TableActions } from "../table-action";
import { MotionDiv } from "@/components/custom/motion";
import { CardHeader, FL } from "../util-components";
import { AlertOctagon, Link2 } from "lucide-react";

const AssignSubLevel = () => {
  // states
  const [form] = Form.useForm();
  const qc = useQueryClient();
  const [record, setRecord] = useState<SelectTypes | null>(null);

  const programId = record?.value;

  // queries
  const { data: programs, isLoading: loadingPrograms } = useFetch({
    queryFn: getAllProgramsFn,
    queryKeys: programKeys.list(),
  });
  const { data: programData, isLoading: loadingProgramData } = useFetch({
    queryFn: () => getProgramSubjectsFn(programId!),
    queryKeys: programKeys.list({ programId }),
    enabled: !!programId,
  });
  const { data: unassignedSublevels, isLoading: loadingUnassignedSublevels } =
    useFetch({
      queryFn: getSublevelsWithoutProgramFn,
      queryKeys: educationKeys.custom("sublevels-without-program"),
    });
  //   get all sublevels
  const { data: allSubLevels, isLoading: loadingAllSubLevels } = useFetch({
    queryFn: getAllSubLevelsFn,
    queryKeys: eduKeys.sublevels(),
  });

  // memoized values
  const dataSource = useMemo(() => {
    return programData?.subLevels ?? [];
  }, [programData?.subLevels]);

  const unassignedDataSource = useMemo(() => {
    return unassignedSublevels ?? [];
  }, [unassignedSublevels]);

  const assignedSubLevelIds = useMemo(
    () => new Set(programData?.subLevels?.map((s) => s.subLevelId) ?? []),
    [programData],
  );
  const sublevelOptions = useMemo(
    () =>
      allSubLevels
        ?.filter((s) => !assignedSubLevelIds.has(s.subLevelId))
        .map((s) => ({ label: s.subLevelName, value: s.subLevelId })) ?? [],
    [allSubLevels, assignedSubLevelIds],
  );
  const programOptions = useMemo(
    () =>
      programs?.map((p) => ({ label: p.programName, value: p.programId })) ??
      [],
    [programs],
  );

  // mutations
  const { mutate: assignSublevels, isPending: assigningSublevels } = usePost({
    postFn: createModuleMappingFn,
    mutationOptions: { mutationKey: ["study-modules-mapping", "create"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        form.resetFields(["SubLevelIds"]);
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to create module mapping`, {
        description: err?.message,
      });
    },
  });
  const { mutate: deleteProgramSubLevel } = usePost({
    postFn: deleteProgramSubLevelFn,
    mutationOptions: { mutationKey: ["study-modules-mapping", "delete"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        toast.success(responseMessage);
      } else {
        toast.error(responseMessage);
      }
    },
    onError: (err) => {
      toast.error(`Failed to delete program sublevel`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: programKeys.list({ programId }) });
    qc.invalidateQueries({
      queryKey: educationKeys.custom("sublevels-without-program"),
    });
  };

  // data
  const columns: ColumnsType<SubLevelGet> = [
    {
      key: "subLevelName",
      title: "Sub Level",
      dataIndex: "subLevelName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "action",
      title: "",
      width: 60,
      align: "right",
      render: (_, row) => (
        <TableActions
          onEdit={() => {}}
          onDelete={() => {}}
          onConfirmDelete={() =>
            deleteProgramSubLevel({
              programId: record?.value ?? "",
              subLevelId: row.subLevelId,
            })
          }
          editDisabled
          deleteTitle="Remove this sublevel from program?"
        />
      ),
    },
  ];
  const unAssingColumns: ColumnsType<SubLevelGet> = [
    {
      key: "subLevelName",
      title: "Sub Level",
      dataIndex: "subLevelName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Form
        layout="vertical"
        requiredMark={false}
        form={form}
        onFinish={(values) => {
          assignSublevels({
            ProgramId: values.ProgramId.value,
            SubLevelIds: values.SubLevelIds,
          });
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* ── LEFT: Assignment form ── */}
          <MotionDiv
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
          >
            {CardHeader(
              <Link2 className="w-4 h-4" />,
              "Assign Sublevels to Program",
            )}

            <div className="p-6 flex flex-col gap-y-0">
              {/* Hint */}
              <div className="mb-5 p-4 rounded-xl border border-blue-100 bg-blue-50/60">
                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-[#1E3A5F]">Note: </span>
                  Select a program then pick the sublevels you want to assign to
                  it. Sublevels already assigned are automatically excluded from
                  the list.
                </p>
              </div>

              <Form.Item
                name="ProgramId"
                label={<FL>Program</FL>}
                rules={[{ required: true, message: "Please select a program" }]}
              >
                <Select
                  size="large"
                  labelInValue
                  placeholder="Select program"
                  options={programOptions}
                  loading={loadingPrograms}
                  disabled={loadingPrograms}
                  onChange={(opt) => {
                    setRecord({
                      value: opt.value,
                      label: opt.label as string,
                    });
                    form.resetFields(["SubLevelIds"]);
                  }}
                />
              </Form.Item>

              <Form.Item
                name="SubLevelIds"
                label={<FL>Sublevels to Assign</FL>}
                rules={[
                  { required: true, message: "Select at least one sublevel" },
                ]}
                extra={
                  <span className="text-xs text-slate-400">
                    You can select multiple sublevels at once.
                  </span>
                }
              >
                <Select
                  size="large"
                  mode="multiple"
                  placeholder={
                    record ? "Select sublevels" : "Select a program first"
                  }
                  options={sublevelOptions}
                  loading={loadingAllSubLevels}
                  disabled={loadingAllSubLevels || !record}
                  maxTagCount="responsive"
                />
              </Form.Item>

              <Button
                htmlType="submit"
                type="primary"
                size="large"
                block
                loading={assigningSublevels}
                className="h-11! rounded-xl! font-bold! tracking-wide!"
              >
                Assign Sublevels
              </Button>
            </div>
          </MotionDiv>

          {/* ── RIGHT: Assigned subjects table ── */}
          <MotionDiv
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
          >
            {CardHeader(
              <Link2 className="w-4 h-4" />,
              record
                ? `${record.label} — Assigned Sublevels`
                : "Assigned Sublevels",
              dataSource.length,
            )}

            <div className="overflow-x-auto">
              <Table
                columns={columns}
                rowKey="sublevelId"
                dataSource={dataSource}
                loading={loadingProgramData}
                showHeader={false}
                size="middle"
                pagination={{ pageSize: 6, showSizeChanger: false }}
                locale={{
                  emptyText: (
                    <div className="flex flex-col items-center py-8 gap-2 text-slate-400">
                      <Link2 className="w-8 h-8 text-slate-200" />
                      <p className="text-sm">
                        {record
                          ? "No sublevels assigned yet"
                          : "Select a program to view its sublevels"}
                      </p>
                    </div>
                  ),
                }}
              />
            </div>
          </MotionDiv>
        </div>

        <MotionDiv
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden mt-10"
          style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
        >
          {CardHeader(
            <AlertOctagon className="w-4 h-4" />,
            "Unassigned Sublevels",
            dataSource.length,
          )}

          <div className="overflow-x-auto">
            <Table
              columns={unAssingColumns}
              rowKey="sublevelId"
              dataSource={unassignedDataSource}
              loading={loadingUnassignedSublevels}
              showHeader={false}
              size="middle"
              pagination={{ pageSize: 6, showSizeChanger: false }}
              locale={{
                emptyText: (
                  <div className="flex flex-col items-center py-8 gap-2 text-slate-400">
                    <Link2 className="w-8 h-8 text-slate-200" />
                    <p className="text-sm">
                      No unassigned sublevels found. All sublevels are currently
                      assigned to programs.
                    </p>
                  </div>
                ),
              }}
            />
          </div>
        </MotionDiv>
      </Form>
    </div>
  );
};
export default AssignSubLevel;
