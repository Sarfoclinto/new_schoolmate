import { DEFAULT_LIMIT, df } from "@/config/constants";
import { roleKeys, staffKeys } from "@/config/query-keys";
import { ListPage as StaffListPage } from "@/features/admins/components/list-page";
import {
  staffCodeCol,
  staffGenderCol,
  staffImageCol,
  staffModeCol,
  staffNameCol,
  staffPhoneCol,
  staffRoleCol,
  staffSnCol,
  staffTitleCol,
  staffViewActionCol,
} from "@/features/admins/components/staff/staff-columns";
import useFetch from "@/hooks/api/use-fetch";
import { getAllRolesFn } from "@/services/setup/roles";
import { getAllStaffPnFn } from "@/services/staff";
import type { StaffGet } from "@/types/api/staff";
import { UsersRoundIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ViewAllStaff = () => {
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
  const { data: staff, isLoading: loadingStaff } = useFetch({
    queryFn: () => getAllStaffPnFn(page, DEFAULT_LIMIT),
    queryKeys: staffKeys.list({ page }),
  });
  const { data: roles } = useFetch({
    queryFn: getAllRolesFn,
    queryKeys: roleKeys.list(),
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!staff || !staff.data) return [];
    return staff.data;
  }, [staff]);

  const roleFilters = useMemo(() => {
    if (!roles) return [];
    return roles.map((r) => ({ text: r.roleName, value: r.roleName }));
  }, [roles]);

  const columns = useMemo(
    () => [
      staffSnCol<StaffGet>(),
      staffCodeCol<StaffGet>(130),
      staffImageCol<StaffGet>(),
      staffTitleCol<StaffGet>(130),
      staffNameCol<StaffGet>(""),
      staffGenderCol<StaffGet>(130),
      staffModeCol<StaffGet>(170),
      staffRoleCol<StaffGet>(160, roleFilters),
      staffPhoneCol<StaffGet>(160),
      staffViewActionCol<StaffGet>(navigate),
    ],
    [navigate, roleFilters],
  );

  return (
    <StaffListPage<StaffGet>
      title="All Staff"
      breadcrumb={["Staff", "All Staff"]}
      showCardHeader={false}
      icon={<UsersRoundIcon className="w-4 h-4" />}
      stats={[
        {
          label: "Total",
          value: staff?.pagination.totalRecords ?? "—",
          color: "navy",
        },
        {
          label: "Pages",
          value: staff?.pagination.totalPages ?? "—",
          color: "slate",
        },
      ]}
      columns={columns}
      dataSource={dataSource}
      loading={loadingStaff}
      pagination={{
        page,
        totalPages: staff?.pagination.totalPages ?? 1,
        pageSize: DEFAULT_LIMIT,
        totalItems: staff?.pagination.totalRecords,
      }}
      onPrev={() => setPage((p) => Math.max(p - 1, 1))}
      onNext={() => setPage((p) => p + 1)}
      emptyText="No staff registered yet"
    />
  );
};
export default ViewAllStaff;
