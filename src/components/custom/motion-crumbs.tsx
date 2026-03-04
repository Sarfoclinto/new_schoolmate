import { ChevronRight } from "lucide-react";
import { LiveClock } from "./live-clock";
import { MotionDiv } from "./motion";

interface Props {
  title: string;
  breadcrumbs: [string, string];
  /** Live clock props */
  showClock?: boolean;
  clockProps?: React.ComponentProps<typeof LiveClock>;
}

const MotionHeaderWithCrumbs = ({
  breadcrumbs,
  title,
  clockProps,
  showClock = true,
}: Props) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-5 flex items-center justify-between"
    >
      <div className="flex flex-col gap-1">
        <h1
          className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h1>
        <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
          <span className="text-[#1E3A5F] font-semibold">{breadcrumbs[0]}</span>
          <ChevronRight className="w-3 h-3" />
          <span>{breadcrumbs[1]}</span>
          <ChevronRight className="w-3 h-3" />
        </nav>
      </div>

      {showClock && <LiveClock {...clockProps} />}
    </MotionDiv>
  );
};
export default MotionHeaderWithCrumbs;
