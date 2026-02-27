import { MotionDiv } from "@/components/custom/motion";
import { subjectKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getTeachersSubjectsFn } from "@/services/staff";
import type { SelectTypes } from "@/types/ui";
import { BookOpen } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  teacherId?: string;
  isATeacher?: boolean;
}

const StaffSubjects = ({ teacherId, isATeacher }: Props) => {
  const { data: teachersData, isLoading: loadingTeacherData } = useFetch({
    queryFn: () => getTeachersSubjectsFn(teacherId!),
    queryKeys: subjectKeys.custom("teacher", { teacherId }),
    enabled: !!isATeacher && !!teacherId,
  });
  const [sublevel] = useState<SelectTypes | null>(null);

  //   TODO: filter subjects by subleves and render
  // memoized
  // ── Derived ──────────────────────────────────────────────
  //   const sublevels = useMemo(() => {
  //     if (!teachersData) return [];
  //     return teachersData.subLevels;
  //   }, [teachersData]);

  const filteredSubjects = useMemo(() => {
    if (!teachersData) return [];
    return teachersData.subjects.filter(() => {
      if (!sublevel || !sublevel.value) return true;
      return true;
    });
  }, [sublevel, teachersData]);

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
  );
};
export default StaffSubjects;
