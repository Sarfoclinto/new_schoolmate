import { MotionDiv } from "@/components/custom/motion";
import { educationKeys, subjectKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import {
  getTeachersSublevelsFn,
  getTeacherSublevelSubjectsFn,
} from "@/services/staff";
import type { SelectTypes } from "@/types/ui";
import { Select } from "antd";
import { BookOpen, Filter } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  teacherId?: string;
  isATeacher?: boolean;
}

const StaffSubjects = ({ teacherId, isATeacher }: Props) => {
  const [sublevel, setSublevel] = useState<SelectTypes | null>(null);
  const sublevelId = sublevel?.value;

  const { data: teachersData, isLoading: loadingTeacherData } = useFetch({
    queryFn: () => getTeacherSublevelSubjectsFn(teacherId!, sublevelId!),
    queryKeys: subjectKeys.custom("teacher-subjects", {
      sublevelId,
      teacherId,
    }),
    enabled: !!isATeacher && !!teacherId && !!sublevelId,
  });

  const { data: sublevelData, isLoading: loadingSubs } = useFetch({
    queryFn: () => getTeachersSublevelsFn(teacherId!),
    queryKeys: educationKeys.custom("teacher-sublevels", { teacherId }),
    enabled: !!teacherId,
  });

  // memoized
  // ── Derived ──────────────────────────────────────────────
  const sublevels = useMemo(() => {
    if (!sublevelData) return [];
    return sublevelData.subLevels.map((s) => ({
      label: s.subLevelName,
      value: s.subLevelId,
    }));
  }, [sublevelData]);

  const filteredSubjects = useMemo(() => {
    if (!teachersData) return [];
    return teachersData.subjects;
  }, [teachersData]);

  if (loadingTeacherData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!filteredSubjects?.length) {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-400">
          No subjects assigned
        </p>
        <p className="text-xs text-slate-300">
          Subjects are assigned via the program or by the teacher
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Filter className="size-3.5" />
        <Select
          placeholder="Select a sublevel"
          options={sublevels}
          loading={loadingSubs}
          disabled={loadingSubs}
          onChange={(opt) => setSublevel(opt)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSubjects.map((subject, i) => (
          <MotionDiv
            key={subject.subjectId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className="flex items-center gap-x-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-[#D0DCF0] hover:bg-[#F4F8FF] transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[#EEF2F8] flex items-center justify-center shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-[#C9A84C]" />
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-semibold text-[#0D1B2E] capitalize truncate leading-tight"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {subject.subjectName}
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
    </div>
  );
};
export default StaffSubjects;
