import type { AssessmentNGradingTabKey } from "@/types/ui";
import AddAssessment from "../../components/assessment-n-grading/add-assessment";
import AddGrading from "../../components/assessment-n-grading/add-grading";
import { GraduationCap, ClipboardList, ChevronRight } from "lucide-react";
import { useState } from "react";
import { MotionDiv, MotionSpan } from "@/components/custom/motion";
import { AnimatePresence } from "motion/react";

interface Tab {
  key: AssessmentNGradingTabKey;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const tabs: Tab[] = [
  {
    key: "grading",
    label: "Grading",
    shortLabel: "Grade",
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    component: <AddGrading />,
  },
  {
    key: "assessment",
    label: "Assessment",
    shortLabel: "Assessment",
    icon: <ClipboardList className="w-3.5 h-3.5" />,
    component: <AddAssessment />,
  },
];

const AssessmentnGrading = () => {
  const [active, setActive] = useState<AssessmentNGradingTabKey>("grading");

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
          ChevronRight &amp; Assessment
        </h1>
        <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
          <span className="text-[#1E3A5F] font-semibold">
            Institution Setup
          </span>
          <ChevronRight className="w-3 h-3" />
          <span>Grading &amp; Assessment</span>
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
        <div className="grid grid-cols-2 items-center gap-x-1 overflow-x-auto scrollbar-none">
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
export default AssessmentnGrading;
