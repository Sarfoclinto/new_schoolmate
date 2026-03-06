import type { ClassesnSubjects } from "@/types/ui";
import { BookOpen, Building2Icon, ChevronRight, Layers } from "lucide-react";
import Classes from "../../components/classes-n-subjects/classes";
import Subjects from "../../components/classes-n-subjects/subjects";
import { useMemo, useState } from "react";
import { MotionDiv, MotionSpan } from "@/components/custom/motion";
import { AnimatePresence } from "motion/react";
import { useAuth } from "@/store/auth.store";
import useFetch from "@/hooks/api/use-fetch";
import { getTeacherMappingFn } from "@/services/staff";
import { subjectKeys } from "@/config/query-keys";
import { useSearchParams } from "react-router-dom";
import SubLevelSubjects from "../../components/classes-n-subjects/sublevel-subjects";

interface Tab {
  key: ClassesnSubjects;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const ClassesnSubjects = () => {
  const [searchParams, setSeacrchParams] = useSearchParams();
  const param = searchParams.get("selected") as ClassesnSubjects | null;
  const user = useAuth((s) => s.user);
  const teacherId = user?.userId;

  const { data: data, isLoading } = useFetch({
    queryFn: () => getTeacherMappingFn(teacherId!),
    queryKeys: subjectKeys.custom("teacher", { teacherId }),
    enabled: !!teacherId,
  });

  const subjects = useMemo(() => {
    if (!data) return [];
    return data.subjects;
  }, [data]);

  const subLevels = useMemo(() => {
    if (!data) return [];
    return data.subLevels;
  }, [data]);

  const tabs: Tab[] = [
    {
      key: "classes",
      shortLabel: "Classes",
      label: "Classes",
      icon: <Building2Icon className="w-3.5 h-3.5" />,
      component: <Classes loading={isLoading} subLevels={subLevels} />,
    },
    {
      key: "subjects",
      shortLabel: "Subjects",
      label: "Subjects",
      icon: <BookOpen className="w-3.5 h-3.5" />,
      component: <Subjects loading={isLoading} subjects={subjects} />,
    },
    {
      key: "sublevel-subject",
      shortLabel: "Sublevel Subjects",
      label: "Sublevel Subjects",
      icon: <Layers className="w-3.5 h-3.5" />,
      component: (
        <SubLevelSubjects subLevels={subLevels} teacherId={teacherId} />
      ),
    },
  ];

  const [active, setActive] = useState<ClassesnSubjects>(param ?? "classes");
  const activeTab = tabs.find((t) => t.key === active)!;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5"
      >
        <h1
          className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Classes &amp; Subjects
        </h1>
        <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
          <span className="text-[#1E3A5F] font-semibold">My Assignments</span>
          <ChevronRight className="w-3 h-3" />
          <span>Classes &amp; Subjects</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0D1B2E] font-semibold">
            {activeTab.label}
          </span>
        </nav>
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="mb-5 bg-white rounded-2xl border border-slate-100 p-1.5"
        style={{ boxShadow: "0 2px 12px rgba(13,27,46,0.06)" }}
      >
        <div
          className={`grid grid-cols-${tabs.length} items-center gap-x-1 overflow-x-auto scrollbar-none`}
        >
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActive(tab.key);
                  setSeacrchParams({ selected: tab.key });
                }}
                className={`
                    relative flex items-center justify-center gap-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold
                    whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer
                    ${
                      isActive
                        ? "text-white"
                        : "text-slate-500 hover:text-[#1E3A5F] hover:bg-slate-50"
                    }
                  `}
              >
                {/* Active pill background */}
                {isActive && (
                  <MotionSpan
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                    }}
                  />
                )}
                <span
                  className={`relative z-10 shrink-0 ${isActive ? "text-[#C9A84C]" : ""}`}
                >
                  {tab.icon}
                </span>
                <span className="relative z-10 hidden sm:block">
                  {tab.label}
                </span>
                <span className="relative z-10 block sm:hidden">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </MotionDiv>

      {/* ── Tab content (animated swap) ── */}
      <AnimatePresence mode="wait">
        <MotionDiv
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {activeTab.component}
        </MotionDiv>
      </AnimatePresence>
    </div>
  );
};
export default ClassesnSubjects;
