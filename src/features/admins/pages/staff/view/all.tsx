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
import { getAllStaffUnPnFn } from "@/services/staff";
import type { StaffGet } from "@/types/api/staff";
import { Input } from "antd";
import { UsersRoundIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewAllStaff = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // queries
  const { data: staff, isLoading: loadingStaff } = useFetch({
    queryFn: () => getAllStaffUnPnFn(),
    queryKeys: staffKeys.list(),
  });
  const { data: roles } = useFetch({
    queryFn: getAllRolesFn,
    queryKeys: roleKeys.list(),
  });

  // memoized values
  const dataSource = useMemo(() => {
    if (!staff) return [];
    if (!search) return staff;
    return staff?.filter(
      (s) =>
        s.firstName.toLowerCase().includes(search.toLowerCase()) ||
        s.lastName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, staff]);

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
          value: staff?.length ?? "—",
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
      loading={loadingStaff}
      emptyText="No staff registered yet"
    />
  );
};
export default ViewAllStaff;
