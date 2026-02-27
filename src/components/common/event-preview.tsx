import { CalendarDays, Clock, Info, User } from "lucide-react";
import { Divider, Tag } from "antd";
import type { CalendarItem } from "@/types/api/setup/year-n-term";

interface Props {
  selected: CalendarItem | null;
}

const EventPreview = ({ selected }: Props) => {
  return (
    <div
      className="bg-white rounded-xl border border-slate-100 flex flex-col"
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
    >
      <div className="flex items-center gap-x-2.5 px-5 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-[#0D1B2E] flex items-center justify-center">
          <Info className="w-4 h-4 text-[#C9A84C]" />
        </div>
        <span className="font-semibold text-[#0D1B2E] text-sm">
          Event Preview
        </span>
      </div>

      <div className="p-5 flex-1">
        {selected ? (
          <div className="flex flex-col gap-3">
            {/* Title */}
            <h3 className="font-bold text-[#0D1B2E] text-base leading-snug">
              {selected.title !== "null" ? selected.title : "Untitled"}
            </h3>

            {"academicTermCalendarId" in selected.extendedProps ? (
              <>
                <div className="flex items-center gap-x-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Type
                  </span>
                  <Tag
                    className="font-semibold! text-xs! rounded-full! px-3!"
                    color={
                      selected.extendedProps.calendarType.toLowerCase() ===
                      "break"
                        ? "gold"
                        : selected.extendedProps.calendarType.toLowerCase() ===
                            "event"
                          ? "blue"
                          : "cyan"
                    }
                  >
                    {selected.extendedProps.calendarType}
                  </Tag>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Date range
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {selected.start?.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                    {" → "}
                    {selected.end?.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </span>
                </div>

                {selected.extendedProps.description && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Description
                    </span>
                    <div
                      className="text-sm text-slate-600 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: selected.extendedProps.description,
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-x-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">
                    {selected.extendedProps.userFullName}
                  </span>
                </div>
                <div className="flex items-center gap-x-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selected.start.toLocaleDateString()}</span>
                </div>
                <Divider className="my-1!" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selected.extendedProps.body}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-10">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400 max-w-45 leading-relaxed">
              Click an event or notice on the calendar to preview it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default EventPreview;
