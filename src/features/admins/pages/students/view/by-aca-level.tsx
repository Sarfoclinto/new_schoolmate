import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/config/constants";
import { eduKeys, studentKeys } from "@/config/query-keys";
import {
  acaLevelCol,
  addressCol,
  dobCol,
  genderCol,
  studentCodeCol,
  studentImageCol,
  studentNameCol,
  viewActionCol,
} from "@/features/admins/components/student/student-columns";
import { ListPage as StudentListPage } from "@/features/admins/components/list-page";
import useFetch from "@/hooks/api/use-fetch";
import { getAcaByEduIdFn } from "@/services/setup/academic-level";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { getAllAcaStuFn } from "@/services/student";
import type { AcademicLevelStudentsGet } from "@/types/api/student";
import type { SelectTypes } from "@/types/ui";
import { Select } from "antd";
import { Filter, LayoutGridIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import paths from "@/config/routes";

const df = {
  page: DEFAULT_PAGE.toString(),
  limit: DEFAULT_LIMIT.toString(),
};

const ViewByAcaLevel = () => {
  // states
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [selectedAca, setSelectedAca] = useState<SelectTypes | null>(null);
  const eduId = selectedEdu?.value;
  const acaId = selectedAca?.value;
  const [page, setPage] = useState(() =>
    parseInt(searchParams.get("page") || df.page, 10),
  );
  const navigate = useNavigate();

  // effects
  useEffect(() => {
    setSearchParams({ page: String(page), limit: String(DEFAULT_LIMIT) });
  }, [page, setSearchParams]);

  //   queries
  //   get all educational levels for dropdown
  const { data: eduLevels, isLoading: loadingEduLevels } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  // get all academic levels
  const { data: acaLevels, isLoading: loadingAcaLevels } = useFetch({
    queryFn: () => getAcaByEduIdFn(eduId!),
    queryKeys: eduKeys.academicLevels(eduId),
    enabled: !!eduId,
  });
  // acalevel students
  const { data, isLoading } = useFetch({
    queryFn: () => getAllAcaStuFn(acaId!, page, DEFAULT_LIMIT),
    queryKeys: studentKeys.custom("by-aca-level", {
      acaId,
      page,
      limit: DEFAULT_LIMIT,
    }),
    enabled: !!acaId,
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

  const acaOptions = useMemo(() => {
    if (!acaLevels) return [];
    return acaLevels.map((a) => ({
      label: a.academicLevelName,
      value: a.academicLevelId,
    }));
  }, [acaLevels]);

  const columns = useMemo(
    () => [
      studentCodeCol<AcademicLevelStudentsGet>(),
      studentImageCol<AcademicLevelStudentsGet>(),
      studentNameCol<AcademicLevelStudentsGet>("25%"),
      genderCol<AcademicLevelStudentsGet>(130),
      dobCol<AcademicLevelStudentsGet>(160),
      addressCol<AcademicLevelStudentsGet>(),
      acaLevelCol<AcademicLevelStudentsGet>(),
      viewActionCol<AcademicLevelStudentsGet>(navigate),
    ],
    [navigate],
  );

  return (
    <StudentListPage<AcademicLevelStudentsGet>
      title="All Students"
      breadcrumb={["Students", "Academic Level Students"]}
      showCardHeader={false}
      icon={<LayoutGridIcon className="w-4 h-4" />}
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
      onPrev={() => setPage((p) => Math.max(p - 1, 1))}
      onNext={() => setPage((p) => p + 1)}
      onRowClick={(r) =>
        navigate(paths.admin.studentDetails.href, {
          state: { studentId: r.studentId },
        })
      }
      emptyText="No students registered yet"
      filters={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-x-2 text-xs font-semibold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </div>
          <Select
            size="large"
            labelInValue
            placeholder="Educational Level"
            className="w-52!"
            allowClear
            onClear={() => {
              setSelectedEdu(null);
              setSelectedAca(null);
              setPage(1);
            }}
            options={eduOptions}
            loading={loadingEduLevels}
            disabled={loadingEduLevels}
            onChange={(opt) => {
              setSelectedEdu({ value: opt.value, label: opt.label as string });
              setSelectedAca(null);
              setPage(1);
            }}
          />
          <Select
            size="large"
            labelInValue
            placeholder={
              selectedEdu ? "Academic Level" : "Select edu level first"
            }
            className="w-52!"
            allowClear
            onClear={() => {
              setSelectedAca(null);
              setPage(1);
            }}
            options={acaOptions}
            loading={loadingAcaLevels}
            disabled={loadingAcaLevels || !selectedEdu}
            value={
              selectedAca
                ? { value: selectedAca.value, label: selectedAca.label }
                : undefined
            }
            onChange={(opt) => {
              setSelectedAca({ value: opt.value, label: opt.label as string });
              setPage(1);
            }}
          />
        </div>
      }
    />
  );
};
export default ViewByAcaLevel;
