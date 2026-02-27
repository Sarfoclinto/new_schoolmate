import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/config/constants";
import { eduKeys, studentKeys } from "@/config/query-keys";
import {
  acaLevelCol,
  addressCol,
  dobCol,
  genderCol,
  // programCol,
  studentCodeCol,
  // studentImageCol,
  studentNameCol,
  subLevelCol,
  viewActionCol,
} from "@/features/admins/components/student/student-columns";
import { ListPage as StudentListPage } from "@/features/admins/components/list-page";
import useFetch from "@/hooks/api/use-fetch";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { getAllEduStuFn } from "@/services/student";
import type { AllStudentGet } from "@/types/api/student";
import type { SelectTypes } from "@/types/ui";
import { Select } from "antd";
import { Filter, GraduationCapIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const df = {
  page: DEFAULT_PAGE.toString(),
  limit: DEFAULT_LIMIT.toString(),
};

const ByEduLevel = () => {
  // states
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const eduId = selectedEdu?.value;
  const [page, setPage] = useState(() =>
    parseInt(searchParams.get("page") || df.page, 10),
  );
  const navigate = useNavigate();

  // effects
  useEffect(() => {
    setSearchParams({ page: String(page), limit: String(DEFAULT_LIMIT) });
  }, [page, setSearchParams]);

  // queries
  const { data: eduLevels, isLoading: loadingEduLevels } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  const { data, isLoading } = useFetch({
    queryFn: () => getAllEduStuFn(eduId!, page, DEFAULT_LIMIT),
    queryKeys: studentKeys.custom("by-edu-level", {
      eduId,
      page,
      limit: DEFAULT_LIMIT,
    }),
    enabled: !!eduId,
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!data || !data.students) return [];
    return data.students;
  }, [data]);

  const eduOptions = useMemo(() => {
    if (!eduLevels) return [];
    return eduLevels.map((e) => ({
      label: e.educationalLevelName,
      value: e.educationalLevelId,
    }));
  }, [eduLevels]);

  const columns = useMemo(
    () => [
      studentCodeCol<AllStudentGet>(),
      // studentImageCol<AllStudentGet>(),
      studentNameCol<AllStudentGet>("25%"),
      genderCol<AllStudentGet>(130),
      dobCol<AllStudentGet>(160),
      addressCol<AllStudentGet>(),
      acaLevelCol<AllStudentGet>(),
      subLevelCol<AllStudentGet>(160),
      // programCol<AllStudentGet>(),
      viewActionCol<AllStudentGet>(navigate),
    ],
    [navigate],
  );

  return (
    <StudentListPage<AllStudentGet>
      title="All Students"
      breadcrumb={["Students", "Educational Level Students"]}
      showCardHeader={false}
      icon={<GraduationCapIcon className="w-4 h-4" />}
      stats={[
        {
          label: "Total",
          value: data?.pagination.totalRecords ?? "—",
          color: "navy",
        },
        {
          label: "Pages",
          value: data?.pagination.totalPages ?? "—",
          color: "slate",
        },
      ]}
      columns={columns}
      dataSource={dataSource}
      loading={isLoading}
      pagination={{
        page,
        totalPages: data?.pagination.totalPages ?? 1,
        pageSize: DEFAULT_LIMIT,
        totalItems: data?.pagination.totalRecords,
      }}
      filters={
        <div className="flex items-center gap-x-3 w-full sm:w-auto">
          <div className="flex items-center gap-x-2 text-xs font-semibold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </div>
          <Select
            labelInValue
            placeholder="Select Educational Level"
            className="w-64!"
            options={eduOptions}
            loading={loadingEduLevels}
            disabled={loadingEduLevels}
            allowClear
            onClear={() => {
              setPage(1);
            }}
            onChange={(opt) => {
              setSelectedEdu({ value: opt.value, label: opt.label as string });
              setPage(1);
            }}
          />
        </div>
      }
      onPrev={() => setPage((p) => Math.max(p - 1, 1))}
      onNext={() => setPage((p) => p + 1)}
      emptyText="No students registered yet"
    />
  );
};
export default ByEduLevel;
