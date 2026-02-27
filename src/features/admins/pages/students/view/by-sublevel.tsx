import { eduKeys, studentKeys } from "@/config/query-keys";
import {
  addressCol,
  dobCol,
  genderCol,
  studentCodeCol,
  studentImageCol,
  studentNameCol,
  subLevelCol,
  viewActionCol,
} from "@/features/admins/components/student/student-columns";
import { ListPage as StudentListPage } from "@/features/admins/components/list-page";
import useFetch from "@/hooks/api/use-fetch";
import { getAllSubLevelsFn } from "@/services/setup/sublevel";
import { getAllSubLevelStuFn } from "@/services/student";
import type { SubLevelStudentsGet } from "@/types/api/student";
import type { SelectTypes } from "@/types/ui";
import { Select } from "antd";
import { Filter, Building } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewBySubLevel = () => {
  // states
  const [selected, setSelected] = useState<SelectTypes | null>(null);
  const navigate = useNavigate();
  const subLevelId = selected?.value;

  // queries
  const { data, isLoading } = useFetch({
    queryFn: () => getAllSubLevelStuFn(subLevelId!),
    queryKeys: studentKeys.custom("by-sub-level", {
      subLevelId,
    }),
    enabled: !!subLevelId,
  });
  //   get all sublevels
  const { data: sublevels, isLoading: loadingSubLevels } = useFetch({
    queryFn: getAllSubLevelsFn,
    queryKeys: eduKeys.sublevels(),
  });

  // memoized values
  const subLevelOptions = useMemo(() => {
    if (!sublevels) return [];
    return [...sublevels]
      .sort((a, b) => a.subLevelName.localeCompare(b.subLevelName))
      .map((s) => ({
        label: s.subLevelName,
        value: s.subLevelId,
      }));
  }, [sublevels]);

  const dataSource = useMemo(() => {
    if (!data || !data) return [];
    return data;
  }, [data]);

  const columns = useMemo(
    () => [
      studentCodeCol<SubLevelStudentsGet>(),
      studentImageCol<SubLevelStudentsGet>(),
      studentNameCol<SubLevelStudentsGet>("25%"),
      genderCol<SubLevelStudentsGet>(130),
      dobCol<SubLevelStudentsGet>(160),
      addressCol<SubLevelStudentsGet>(),
      subLevelCol<SubLevelStudentsGet>(160),
      viewActionCol<SubLevelStudentsGet>(navigate),
    ],
    [navigate],
  );

  return (
    <StudentListPage<SubLevelStudentsGet>
      title="All Students"
      breadcrumb={["Students", "Educational Level Students"]}
      showCardHeader={false}
      icon={<Building className="w-4 h-4" />}
      stats={[
        {
          label: "Total",
          value: data?.length ?? "—",
          color: "navy",
        },
      ]}
      columns={columns}
      dataSource={dataSource}
      loading={isLoading}
      filters={
        <div className="flex items-center gap-x-3 w-full sm:w-auto">
          <div className="flex items-center gap-x-2 text-xs font-semibold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </div>
          <Select
            labelInValue
            placeholder="Select Sub-Level"
            className="w-64!"
            options={subLevelOptions}
            loading={loadingSubLevels}
            disabled={loadingSubLevels}
            allowClear
            onChange={(opt) => {
              setSelected({ value: opt.value, label: opt.label as string });
            }}
          />
        </div>
      }
      emptyText="No students registered yet"
    />
  );
};
export default ViewBySubLevel;
