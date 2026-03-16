import type { SubLevelGet } from "@/types/api/setup/sublevel";
import useFetch from "@/hooks/api/use-fetch";
import { useState } from "react";
import { getTeacherSublevelSubjectsFn } from "@/services/staff";
import { subjectKeys } from "@/config/query-keys";
import { BookOpen, Filter, Layers } from "lucide-react";
import { MotionDiv } from "@/components/custom/motion";
import { Select } from "antd";

interface Props {
  subLevels: SubLevelGet[];
  teacherId?: string;
}

const Skeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
};

const SubLevelSubjects = ({ subLevels, teacherId }: Props) => {
  const [sublevelId, setSublevelId] = useState<string | undefined>(undefined);
  const { data: subjectsData, isLoading } = useFetch({
    queryFn: () => getTeacherSublevelSubjectsFn(teacherId!, sublevelId!),
    queryKeys: subjectKeys.custom("teacher-sublevel-subjects", {
      sublevelId,
      teacherId,
    }),
    enabled: !!sublevelId && !!teacherId,
  });

  const subjects = subjectsData?.subjects;
  const options = subLevels.map((sub) => ({
    label: sub.subLevelName,
    value: sub.subLevelId,
  }));

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 text-[#1E3A5F] shrink-0">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Filter by Class:
          </span>
        </div>
        <Select
          size="large"
          className="w-full sm:w-72"
          placeholder="Select a sublevel"
          options={options}
          value={sublevelId}
          onChange={setSublevelId}
          allowClear
          suffixIcon={<Layers className="w-3.5 h-3.5 text-slate-400" />}
        />
      </div>

      {isLoading ? (
        <Skeleton />
      ) : !sublevelId ? (
        <div className="flex flex-col items-center py-16 gap-3 text-slate-300 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-7 h-7 text-slate-200" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-400">
              No sublevel selected
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Select a sublevel to view subjects
            </p>
          </div>
        </div>
      ) : !subjects?.length ? (
        <div className="flex flex-col items-center py-16 gap-3 text-slate-300 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-7 h-7 text-slate-200" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-400">
              No subjects assigned
            </p>
            <p className="text-xs text-slate-300 mt-1">
              No subjects found for this specific sublevel
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((subject, i) => (
            <MotionDiv
              key={subject.subjectId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="flex items-center gap-x-3 p-4 bg-white border border-slate-100 rounded-xl hover:border-[#D0DCF0] hover:bg-[#F4F8FF] transition-all shadow-sm group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#EEF2F8] group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
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
      )}
    </div>
  );
};
export default SubLevelSubjects;
