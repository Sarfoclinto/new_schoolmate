import { staffKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getPrincipalTeachersFn } from "@/services/staff";
import { SetupPage } from "../../setup-page";
import { GraduationCap } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import type { PrincipalTeacherGet } from "@/types/api/staff";

const PrincipalTeachers = () => {
  // queries
  const { data: principalTeachers = [], isLoading: loadingPrincipalTeachers } =
    useFetch({
      queryFn: getPrincipalTeachersFn,
      queryKeys: staffKeys.custom("principal-teachers"),
    });

  const columns: ColumnsType<PrincipalTeacherGet> = [
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
  ];

  return (
    <SetupPage
      title="Principal Teachers"
      showClock={false}
      showTitle={false}
      icon={<GraduationCap className="w-4 h-4" />}
      showForm={false}
      tableProps={{
        columns,
        dataSource: principalTeachers,
        loading: loadingPrincipalTeachers,
        rowKey: "teacherId",
      }}
    />
  );
};
export default PrincipalTeachers;
