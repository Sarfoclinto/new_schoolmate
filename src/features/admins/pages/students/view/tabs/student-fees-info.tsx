import { MotionDiv } from "@/components/custom/motion";
import { Construction } from "lucide-react";

const StudentFeesInfo = () => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="mt-5 bg-white rounded-2xl border border-dashed border-slate-200 overflow-hidden"
      style={{ boxShadow: "0 1px 6px rgba(13,27,46,0.04)" }}
    >
      <div className="flex items-start gap-x-4 px-5 py-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
          <Construction className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-x-3 flex-wrap gap-y-1">
            <p
              className="font-bold text-slate-600 text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Student - Fee
            </p>
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Reviewing and management of studens fees — tuition, canteen, and
            others — will be available here in a future update.
          </p>
        </div>
      </div>
    </MotionDiv>
  );
};
export default StudentFeesInfo;
