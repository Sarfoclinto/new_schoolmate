import { MotionButton } from "@/components/custom/motion";
import type { SubLevelGet } from "@/types/api/setup/sublevel";
import { Building2Icon, BuildingIcon } from "lucide-react";

interface Props {
  loading: boolean;
  subLevels: SubLevelGet[];
}

const Classes = ({ loading, subLevels }: Props) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!subLevels?.length) {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Building2Icon className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-400">
          No sub-level assigned
        </p>
        <p className="text-xs text-slate-300">
          Sublevels are assigned to you by admin
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {subLevels.map((sub, i) => (
        <MotionButton
          key={sub.subLevelId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.25 }}
          className="flex items-center gap-x-3 p-3.5 bg-slate-200 border border-slate-100 rounded-xl hover:border-[#D0DCF0] hover:bg-[#F4F8FF] transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-[#EEF2F8] flex items-center justify-center shrink-0">
            <BuildingIcon className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-semibold text-[#0D1B2E] capitalize truncate leading-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {sub.subLevelName}
            </p>
            {/* {sub.teacherName && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-x-1">
                <User className="w-3 h-3 shrink-0" />
                {sub.teacherName}
              </p>
            )} */}
          </div>
        </MotionButton>
      ))}
    </div>
  );
};
export default Classes;
