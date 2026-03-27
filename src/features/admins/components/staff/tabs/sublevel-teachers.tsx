import { eduKeys, staffKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getSublevelTeachersFn } from "@/services/staff";
import type { SubLevelTeachersGet } from "@/types/api/staff";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { SetupPage } from "../../setup-page";
import { GraduationCap } from "lucide-react";
import { FL } from "../../util-components";
import { Select } from "antd";
import { getAllSubLevelsFn } from "@/services/setup/sublevel";

const SubLevelTeachers = () => {
  const [sublevel, setSublevel] = useState<string | null>(null);

  // queries
  const { data: teachers = [], isLoading: loadingTeachers } = useFetch({
    queryFn: () => getSublevelTeachersFn(sublevel!),
    queryKeys: staffKeys.custom("subleevel-teachers", { sublevel }),
    enabled: !!sublevel,
  });

  const { data: allSubLevels = [], isLoading: loadingAllSubLevels } = useFetch({
    queryFn: getAllSubLevelsFn,
    queryKeys: eduKeys.sublevels(),
  });

  const subLevelsOptions = useMemo(() => {
    return allSubLevels.map((t) => ({
      label: t.subLevelName,
      value: t.subLevelId,
    }));
  }, [allSubLevels]);

  const columns: ColumnsType<SubLevelTeachersGet> = [
    {
      key: "S/N",
      title: "S/N",
      render: (_, __, idx) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{idx}</span>
      ),
    },
    {
      key: "staffId",
      title: "Staff ID",
      dataIndex: "teacherId",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "teacherName",
      title: "Teacher Name",
      dataIndex: "teacherName",
      render: (v: string) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">{v}</span>
      ),
    },
    {
      key: "sublevel",
      title: "Sub-Level",
      dataIndex: "subLevelAlias",
      render: (v: string, row) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">
          {v ?? row.subLevelName}
        </span>
      ),
    },
    {
      key: "isPrincipal",
      title: "Principal",
      dataIndex: "isPrincipal",
      render: (v: boolean) => (
        <span className="font-semibold capitalize text-[#0D1B2E]">
          {v ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5 pl-4">
        <FL>Sublevel</FL>
        <Select
          className="w-1/3"
          placeholder="Select sublevel"
          size="large"
          loading={loadingAllSubLevels}
          disabled={loadingAllSubLevels}
          options={subLevelsOptions}
          onChange={setSublevel}
        />
      </div>
      <SetupPage
        title="Principal Teachers"
        showClock={false}
        showTitle={false}
        icon={<GraduationCap className="w-4 h-4" />}
        showForm={false}
        tableProps={{
          columns,
          dataSource: teachers,
          loading: loadingTeachers,
          rowKey: "teacherId",
        }}
      />
    </div>
  );
};
export default SubLevelTeachers;
