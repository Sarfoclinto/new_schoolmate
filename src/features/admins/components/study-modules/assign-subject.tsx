import { programKeys, subjectKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import usePost from "@/hooks/api/use-post";
import {
  createModuleMappingFn,
  deleteProgramSubjectFn,
  getAllProgramsFn,
  getAllSubjectsFn,
  getProgramSubjectsFn,
} from "@/services/setup/study-module";
import type { SubjectGet } from "@/types/api/setup/study-modules";
import type { SelectTypes } from "@/types/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Form, Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TableActions } from "../table-action";
import { MotionDiv } from "@/components/custom/motion";
import { CardHeader, FL } from "../util-components";
import { Link2 } from "lucide-react";

const AssignSubjects = () => {
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
  const { data: allSubjects, isLoading: loadingAllSubjects } = useFetch({
    queryFn: getAllSubjectsFn,
    queryKeys: subjectKeys.list(),
  });
  const { data: programData, isLoading: loadingProgramData } = useFetch({
    queryFn: () => getProgramSubjectsFn(programId!),
    queryKeys: programKeys.list({ programId }),
    enabled: !!programId,
  });

  // memoized values
  const assignedSubjectIds = useMemo(
    () =>
      new Set(programData?.subjects?.subjects?.map((s) => s.subjectId) ?? []),
    [programData],
  );
  const subjectOptions = useMemo(
    () =>
      allSubjects
        ?.filter((s) => !assignedSubjectIds.has(s.subjectId))
        .map((s) => ({ label: s.subjectName, value: s.subjectId })) ?? [],
    [allSubjects, assignedSubjectIds],
  );
  const programOptions = useMemo(
    () =>
      programs?.map((p) => ({ label: p.programName, value: p.programId })) ??
      [],
    [programs],
  );
  const assignedDataSource = useMemo(
    () => programData?.subjects.subjects ?? [],
    [programData],
  );

  // mutations
  const { mutate: assignSubjects, isPending: assigningSubjects } = usePost({
    postFn: createModuleMappingFn,
    mutationOptions: { mutationKey: ["study-modules-mapping", "create"] },
    onSuccess: ({ responseCode, responseMessage }) => {
      if (responseCode === 1) {
        invalidate();
        form.resetFields(["SubjectIds"]);
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
  const { mutate: deleteProgramSubject } = usePost({
    postFn: deleteProgramSubjectFn,
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
      toast.error(`Failed to delete program subject`, {
        description: err?.message,
      });
    },
  });

  // fns
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: programKeys.all });
  };

  // data
  const columns: ColumnsType<SubjectGet> = [
    {
      key: "subjectName",
      title: "Subject",
      dataIndex: "subjectName",
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
            deleteProgramSubject({
              programId: record?.value ?? "",
              subjectId: row.subjectId,
            })
          }
          editDisabled
          deleteTitle="Remove this subject from program?"
        />
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
          assignSubjects({
            ProgramId: values.ProgramId.value,
            SubjectIds: values.SubjectIds,
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
              "Assign Subjects to Program",
            )}

            <div className="p-6 flex flex-col gap-y-0">
              {/* Hint */}
              <div className="mb-5 p-4 rounded-xl border border-blue-100 bg-blue-50/60">
                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-[#1E3A5F]">Note: </span>
                  Select a program then pick the subjects you want to assign to
                  it. Subjects already assigned are automatically excluded from
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
                  onChange={(opt) =>
                    setRecord({
                      value: opt.value,
                      label: opt.label as string,
                    })
                  }
                />
              </Form.Item>

              <Form.Item
                name="SubjectIds"
                label={<FL>Subjects to Assign</FL>}
                rules={[
                  { required: true, message: "Select at least one subject" },
                ]}
                extra={
                  <span className="text-xs text-slate-400">
                    You can select multiple subjects at once.
                  </span>
                }
              >
                <Select
                  size="large"
                  mode="multiple"
                  placeholder={
                    record ? "Select subjects" : "Select a program first"
                  }
                  options={subjectOptions}
                  loading={loadingAllSubjects}
                  disabled={loadingAllSubjects || !record}
                  maxTagCount="responsive"
                />
              </Form.Item>

              <Button
                htmlType="submit"
                type="primary"
                size="large"
                block
                loading={assigningSubjects}
                className="h-11! rounded-xl! font-bold! tracking-wide!"
              >
                Assign Subjects
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
                ? `${record.label} — Assigned Subjects`
                : "Assigned Subjects",
              assignedDataSource.length,
            )}

            <div className="overflow-x-auto">
              <Table
                columns={columns}
                rowKey="subjectId"
                dataSource={assignedDataSource}
                loading={loadingProgramData}
                showHeader={false}
                size="middle"
                pagination={{ pageSize: 6, showSizeChanger: false }}
                styles={{ header: { cell: { color: "white" } } }}
                locale={{
                  emptyText: (
                    <div className="flex flex-col items-center py-8 gap-2 text-slate-400">
                      <Link2 className="w-8 h-8 text-slate-200" />
                      <p className="text-sm">
                        {record
                          ? "No subjects assigned yet"
                          : "Select a program to view its subjects"}
                      </p>
                    </div>
                  ),
                }}
              />
            </div>
          </MotionDiv>
        </div>
      </Form>
    </div>
  );
};
export default AssignSubjects;
