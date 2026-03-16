import { MotionDiv } from "@/components/custom/motion";
import { subjectKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getTeacherSubjectsFn } from "@/services/staff";
import { BookOpen } from "lucide-react";
import { useMemo } from "react";

interface Props {
  teacherId?: string;
  isATeacher?: boolean;
}

const StaffSubjects = ({ teacherId, isATeacher }: Props) => {
  const { data: subjectData, isLoading: loadingTeacherData } = useFetch({
    queryFn: () => getTeacherSubjectsFn(teacherId!),
    queryKeys: subjectKeys.custom("teacher-subjects", {
      teacherId,
    }),
    enabled: !!isATeacher && !!teacherId,
  });

  const filteredSubjects = useMemo(() => {
    if (!subjectData) return [];
    return subjectData?.subjects;
  }, [subjectData]);

  if (loadingTeacherData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full place-content-center">
        {filteredSubjects?.map((subject, i) => (
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
            </div>
          </MotionDiv>
        ))}
      </div>
    </div>
  );
};
export default StaffSubjects;
