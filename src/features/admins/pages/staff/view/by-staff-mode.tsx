import { staffKeys } from "@/config/query-keys";
import {
  staffCodeCol,
  staffGenderCol,
  staffImageCol,
  staffNameCol,
  staffPhoneCol,
  staffRoleCol,
  staffSnCol,
  staffTitleCol,
  staffViewActionCol,
} from "@/features/admins/components/staff/staff-columns";
import { ListPage as StaffListPage } from "@/features/admins/components/list-page";
import useFetch from "@/hooks/api/use-fetch";
import { getAllStaffUnPnFn } from "@/services/staff";
import type { StaffGet } from "@/types/api/staff";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, UserCog } from "lucide-react";
import { Select } from "antd";

type Modes = "ALL" | "TEACHING" | "NON-TEACHING";
type Mode = { label: string; value: Modes };
const options: Mode[] = [
  { label: "All", value: "ALL" },
  { label: "Teaching Staff", value: "TEACHING" },
  { label: "Non-Teaching Staff", value: "NON-TEACHING" },
];
const ViewByStaffMode = () => {
  // state
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(options[0]);

  // queries
  const { data: staff, isLoading: loadingStaff } = useFetch({
    queryFn: getAllStaffUnPnFn,
    queryKeys: staffKeys.lists(),
  });

  // memoized values
  const filteredDataSource = useMemo(() => {
    if (!staff || staff.length === 0) return [];
    return staff.filter((s) => {
      if (mode.value === "ALL") return true;
      return s.staffMode === mode.value;
    });
  }, [staff, mode]);

  const columns = useMemo(
    () => [
      staffSnCol<StaffGet>(),
      staffCodeCol<StaffGet>(130),
      staffImageCol<StaffGet>(),
      staffTitleCol<StaffGet>(130),
      staffNameCol<StaffGet>(""),
      staffGenderCol<StaffGet>(130),
      staffRoleCol<StaffGet>(160),
      staffPhoneCol<StaffGet>(160),
      staffViewActionCol<StaffGet>(navigate),
    ],
    [navigate],
  );

  return (
    <StaffListPage<StaffGet>
      title="Staff by mode"
      breadcrumb={["Staff", mode.value]}
      showCardHeader={false}
      icon={<UserCog className="w-4 h-4" />}
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
            placeholder="Select staff mode"
            className="w-64!"
            options={options}
            value={mode}
            loading={loadingStaff}
            disabled={loadingStaff}
            onChange={(opt) => {
              setMode(opt);
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
export default ViewByStaffMode;
