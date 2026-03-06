import { cn } from "@/lib/utils";
import { AlertCircle, CalendarCheck2 } from "lucide-react";

interface Props {
  active: boolean;
  name?: string;
  className?: string;
}

const ActiveTermBadge = ({ active, name, className }: Props) => {
  return (
    <div className={cn("mb-4 flex justify-center", className)}>
      {active && name ? (
        <div className="inline-flex items-center gap-x-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
          <CalendarCheck2 className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            Active Term:
          </span>
          <span className="text-[10px] font-bold">{name}</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-x-2 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            No Active Term Found
          </span>
        </div>
      )}
    </div>
  );
};
export default ActiveTermBadge;
