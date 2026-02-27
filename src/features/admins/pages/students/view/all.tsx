import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/config/constants";
import { studentKeys } from "@/config/query-keys";
import {
  acaLevelCol,
  // addressCol,
  // dobCol,
  eduLevelCol,
  genderCol,
  studentCodeCol,
  studentImageCol,
  studentNameCol,
  subLevelCol,
  viewActionCol,
} from "@/features/admins/components/student/student-columns";
import { ListPage as StudentListPage } from "@/features/admins/components/list-page";
import useFetch from "@/hooks/api/use-fetch";
import { getAllStuPnFn } from "@/services/student";
import type { AllStudentGet } from "@/types/api/student";
import { UsersRoundIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const df = {
  page: DEFAULT_PAGE.toString(),
  limit: DEFAULT_LIMIT.toString(),
};

const ViewAllStudents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(() =>
    parseInt(searchParams.get("page") || df.page, 10),
  );
  const navigate = useNavigate();

  // effects
  useEffect(() => {
    setSearchParams({ page: String(page), limit: String(DEFAULT_LIMIT) });
  }, [page, setSearchParams]);

  // queries
  const { data, isLoading } = useFetch({
    queryFn: () => getAllStuPnFn(page, DEFAULT_LIMIT),
    queryKeys: studentKeys.custom("all", { page, limit: DEFAULT_LIMIT }),
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!data || !data.students) return [];
    return data.students;
  }, [data]);

  const columns = useMemo(
    () => [
      studentCodeCol<AllStudentGet>(130),
      studentImageCol<AllStudentGet>(),
      studentNameCol<AllStudentGet>(""),
      genderCol<AllStudentGet>(130),
      eduLevelCol<AllStudentGet>(160),
      acaLevelCol<AllStudentGet>(170),
      subLevelCol<AllStudentGet>(170),
      viewActionCol<AllStudentGet>(navigate),
    ],
    [navigate],
  );

  return (
    <StudentListPage<AllStudentGet>
      title="All Students"
      breadcrumb={["Students", "All Students"]}
      showCardHeader={false}
      icon={<UsersRoundIcon className="w-4 h-4" />}
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
      emptyText="No students registered yet"
    />
  );
};
export default ViewAllStudents;
