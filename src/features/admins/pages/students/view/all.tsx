import { studentKeys } from "@/config/query-keys";
import {
  // addressCol,
  // dobCol,
  // eduLevelCol,
  // subLevelCol,
  acaLevelCol,
  genderCol,
  studentCodeCol,
  studentImageCol,
  studentNameCol,
  viewActionCol,
} from "@/features/admins/components/student/student-columns";
import { ListPage as StudentListPage } from "@/features/admins/components/list-page";
import useFetch from "@/hooks/api/use-fetch";
import { getAllStuUnPnFn } from "@/services/student";
import type { AcademicLevelStudentsGet } from "@/types/api/student";
import { UsersRoundIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";

const ViewAllStudents = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // queries
  const { data, isLoading } = useFetch({
    queryFn: () => getAllStuUnPnFn(),
    queryKeys: studentKeys.list(),
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    return data?.filter((s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, search]);

  const columns = useMemo(
    () => [
      studentCodeCol<AcademicLevelStudentsGet>(130),
      studentImageCol<AcademicLevelStudentsGet>(),
      studentNameCol<AcademicLevelStudentsGet>(""),
      genderCol<AcademicLevelStudentsGet>(130),
      // eduLevelCol<AcademicLevelStudentsGet>(160),
      acaLevelCol<AcademicLevelStudentsGet>(170),
      // subLevelCol<AcademicLevelStudentsGet>(170),
      viewActionCol<AcademicLevelStudentsGet>(navigate),
    ],
    [navigate],
  );

  return (
    <StudentListPage<AcademicLevelStudentsGet>
      title="All Students"
      breadcrumb={["Students", "All Students"]}
      showCardHeader={false}
      icon={<UsersRoundIcon className="w-4 h-4" />}
      stats={[
        {
          label: "Total",
          value: data?.length ?? "—",
          color: "navy",
        },
      ]}
      filters={
        <div className="w-full flex items-center justify-between gap-x-4">
          <Input
            placeholder="Quick search name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64! h-8! text-xs rounded-lg!"
            allowClear
          />
        </div>
      }
      columns={columns}
      dataSource={dataSource}
      loading={isLoading}
      emptyText="No students registered yet"
    />
  );
};
export default ViewAllStudents;
