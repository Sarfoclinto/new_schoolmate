import { MotionDiv } from "@/components/custom/motion";
import { educationKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getTeachersSublevelsFn } from "@/services/staff";
import { Building } from "lucide-react";
import { useMemo } from "react";

interface Props {
  teacherId?: string;
  isATeacher?: boolean;
}

const StaffSubLevels = ({ teacherId, isATeacher }: Props) => {
  const { data: sublevelData, isLoading: loadingSubs } = useFetch({
    queryFn: () => getTeachersSublevelsFn(teacherId!),
    queryKeys: educationKeys.custom("teacher-sublevels", { teacherId }),
    enabled: !!isATeacher && !!teacherId,
  });

  // memoized
  // ── Derived ──────────────────────────────────────────────
  const sublevels = useMemo(() => {
    if (!sublevelData) return [];
    return sublevelData?.subLevels;
  }, [sublevelData]);

  if (loadingSubs) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!sublevels?.length) {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Building className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-400">
          No sublevel assigned
        </p>
        <p className="text-xs text-slate-300">
          Sublevel should be assinged to the teacher via the Teacher Assignment
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {sublevels?.map((sub, i) => (
        <MotionDiv
          key={sub.subLevelId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.25 }}
          className="flex items-center gap-x-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-[#D0DCF0] hover:bg-[#F4F8FF] transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-[#EEF2F8] flex items-center justify-center shrink-0">
            <Building className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-semibold text-[#0D1B2E] capitalize truncate leading-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {sub.subLevelName}
            </p>
            {/* {subject.teacherName && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-x-1">
                <User className="w-3 h-3 shrink-0" />
                {subject.teacherName}
              </p>
            )} */}
          </div>
        </MotionDiv>
      ))}
    </div>
  );
};
export default StaffSubLevels;
