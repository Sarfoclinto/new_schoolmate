import { roleKeys, staffKeys } from "@/config/query-keys";
import {
  staffCodeCol,
  staffGenderCol,
  staffImageCol,
  staffModeCol,
  staffNameCol,
  staffPhoneCol,
  staffSnCol,
  staffTitleCol,
  staffViewActionCol,
} from "@/features/admins/components/staff/staff-columns";
import { ListPage as StaffListPage } from "@/features/admins/components/list-page";
import useFetch from "@/hooks/api/use-fetch";
import { getAllRolesFn } from "@/services/setup/roles";
import { getAllStaffUnPnFn } from "@/services/staff";
import type { StaffGet } from "@/types/api/staff";
import type { SelectTypes } from "@/types/ui";
import { useMemo, useState } from "react";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";
import { ShieldCheckIcon, Filter } from "lucide-react";

const ViewByRole = () => {
  // state
  const navigate = useNavigate();
  const [role, setRole] = useState<SelectTypes | null>(null);

  // queries
  const { data: staff, isLoading: loadingStaff } = useFetch({
    queryFn: getAllStaffUnPnFn,
    queryKeys: staffKeys.lists(),
  });
  const { data: roles, isLoading: loadingRoles } = useFetch({
    queryFn: getAllRolesFn,
    queryKeys: roleKeys.list(),
  });

  // memoized values
  const roleOption = useMemo(() => {
    if (!roles) return [];
    return roles.map((role) => ({
      label: role.roleName,
      value: role.roleId,
    }));
  }, [roles]);

  const filteredDataSource = useMemo(() => {
    if (!staff || staff.length === 0) return [];
    return staff.filter((s) => {
      if (!role || !role.value) return true;
      return s.staffRole === role.label;
    });
  }, [staff, role]);

  const columns = useMemo(
    () => [
      staffSnCol<StaffGet>(),
      staffCodeCol<StaffGet>(130),
      staffImageCol<StaffGet>(),
      staffTitleCol<StaffGet>(130),
      staffNameCol<StaffGet>(""),
      staffGenderCol<StaffGet>(130),
      staffModeCol<StaffGet>(170),
      staffPhoneCol<StaffGet>(160),
      staffViewActionCol<StaffGet>(navigate),
    ],
    [navigate],
  );

  return (
    <StaffListPage<StaffGet>
      title="Staff by mode"
      breadcrumb={["Staff", role?.value ?? "All"]}
      showCardHeader={false}
      icon={<ShieldCheckIcon className="w-4 h-4" />}
      stats={[
        {
          label: "Total",
          value: filteredDataSource?.length ?? "—",
          color: "navy",
        },
      ]}
      filters={
        <div className="flex items-center gap-x-3 w-full sm:w-auto">
          <div className="flex items-center gap-x-2 text-xs font-semibold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </div>
          <Select
            labelInValue
            placeholder="Select staff role"
            className="w-64!"
            options={roleOption}
            loading={loadingRoles}
            disabled={loadingRoles}
            onChange={(opt) => {
              setRole(opt);
            }}
          />
        </div>
      }
      columns={columns}
      dataSource={filteredDataSource}
      loading={loadingStaff}
      emptyText="No staff registered yet"
    />
  );
};
export default ViewByRole;
