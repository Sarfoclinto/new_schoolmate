import AddSubject from "../../components/study-modules/add-subject";
import AddProgram from "../../components/study-modules/add-program";
import AssignSubjects from "../../components/study-modules/assign-subject";
import ViewProgramSubject from "../../components/study-modules/view-program-subject";
import AssignSubLevels from "../../components/study-modules/assign-sublevel";

import { MotionDiv, MotionSpan } from "@/components/custom/motion";
import type { StudyModuleTabKey } from "@/types/ui";
import {
  BookOpen,
  ChevronRight,
  Eye,
  GitBranch,
  LayoutList,
  Link2,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";

interface Tab {
  key: StudyModuleTabKey;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const tabs: Tab[] = [
  {
    key: "subjects",
    label: "Subjects",
    shortLabel: "Subjects",
    icon: <BookOpen className="w-3.5 h-3.5" />,
    component: <AddSubject />,
  },
  {
    key: "programs",
    label: "Programs",
    shortLabel: "Programs",
    icon: <LayoutList className="w-3.5 h-3.5" />,
    component: <AddProgram />,
  },
  {
    key: "assign-subjects",
    label: "Assign Subjects",
    shortLabel: "Assign Subjects",
    icon: <Link2 className="w-3.5 h-3.5" />,
    component: <AssignSubjects />,
  },
  {
    key: "assign-sublevels",
    label: "Assign Sub-Levels",
    shortLabel: "Sub-Levels",
    icon: <GitBranch className="w-3.5 h-3.5" />,
    component: <AssignSubLevels />,
  },
  {
    key: "view",
    label: "View Program Mapping",
    shortLabel: "Mapping",
    icon: <Eye className="w-3.5 h-3.5" />,
    component: <ViewProgramSubject />,
  },
];

const StudyModules = () => {
  const [active, setActive] = useState<StudyModuleTabKey>("subjects");

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
          Programs &amp; Subjects
        </h1>
        <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
          <span className="text-[#1E3A5F] font-semibold">
            Institution Setup
          </span>
          <ChevronRight className="w-3 h-3" />
          <span>Programs &amp; Subjects</span>
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
        <div className="grid grid-cols-5 items-center gap-x-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
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
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
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
export default StudyModules;
