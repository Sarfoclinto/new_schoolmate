import { MotionDiv } from "@/components/custom/motion";
import { educationKeys, studentKeys } from "@/config/query-keys";
import { FL } from "@/features/admins/components/util-components";
import useFetch from "@/hooks/api/use-fetch";
import { getTeachersSublevelsFn } from "@/services/staff";
import { getAllSubLevelStuFn } from "@/services/student";
import { useAuth } from "@/store/auth.store";
import type { SubLevelStudentsGet } from "@/types/api/student";
import { Select, Table } from "antd";
import { Users2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  addressCol,
  dobCol,
  genderCol,
  studentCodeCol,
  studentImageCol,
  studentNameCol,
  subLevelCol,
} from "@/features/admins/components/student/student-columns";
import MotionHeaderWithCrumbs from "@/components/custom/motion-crumbs";
import { useIsMobile } from "@/hooks/use-mobile";

const Students = () => {
  const user = useAuth((s) => s.user);
  const teacherId = user?.userId;
  const [sublevel, setSubLevel] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const { data, isLoading } = useFetch({
    queryFn: () => getTeachersSublevelsFn(teacherId!),
    queryKeys: educationKeys.custom("teacher-sublevels", { teacherId }),
    enabled: !!teacherId,
  });

  const { data: students, isLoading: loadingStu } = useFetch({
    queryFn: () => getAllSubLevelStuFn(sublevel!),
    queryKeys: studentKeys.custom("by-sub-level", {
      subLevelId: sublevel,
    }),
    enabled: !!sublevel,
  });

  const sublevels = useMemo(() => {
    if (!data) return [];
    return data.subLevels.map((sub) => ({
      label: sub.subLevelName,
      value: sub.subLevelId,
    }));
  }, [data]);
  const dataSource = useMemo(() => {
    if (!students || !students) return [];
    return students;
  }, [students]);

  const columns = useMemo(
    () => [
      studentCodeCol<SubLevelStudentsGet>(),
      studentImageCol<SubLevelStudentsGet>(),
      studentNameCol<SubLevelStudentsGet>("25%"),
      genderCol<SubLevelStudentsGet>(130),
      dobCol<SubLevelStudentsGet>(160),
      addressCol<SubLevelStudentsGet>(),
      subLevelCol<SubLevelStudentsGet>(160),
    ],
    [],
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      <MotionHeaderWithCrumbs
        title="My Students"
        breadcrumbs={["My Assingments", "Students"]}
      />

      <MotionDiv
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex items-center gap-1 p-4"
        // style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <FL>SubLevel:</FL>
        <Select
          size="large"
          className="w-1/3"
          placeholder="Select sublevel to view students"
          options={sublevels}
          loading={isLoading}
          disabled={isLoading}
          onChange={setSubLevel}
        />
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <div
          className="flex items-center gap-x-3 px-6 py-4 border-b border-slate-100"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
            <Users2Icon className="w-5 h-5" />
          </div>
          <span className="text-white font-semibold text-sm">
            Students Overview
          </span>

          <span className="ml-auto text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2.5 py-0.5 rounded-full">
            {dataSource.length} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            loading={loadingStu}
            dataSource={dataSource}
            pagination={{ pageSize: 6, showSizeChanger: false }}
            className="setup-table"
            size="middle"
            scroll={{ x: isMobile ? "max-content" : "" }}
            styles={{ header: { cell: { color: "white" } } }}
            locale={{
              emptyText: (
                <div className="flex flex-col items-center py-14 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <svg
                      className="text-slate-300 w-7 h-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-400">
                    No Student here
                  </p>
                  <p className="text-xs text-slate-300">
                    Try adjusting your filter
                  </p>
                </div>
              ),
            }}
          />
        </div>
      </MotionDiv>
    </div>
  );
};
export default Students;
