import { CalendarDays } from "lucide-react";
import EventPreview from "./event-preview";
import { Spin } from "antd";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarItem } from "@/types/api/setup/year-n-term";
import type { NoticeGet } from "@/types/api/setup/notice";
import NoticePreview from "./notice-preview";

interface Props {
  selected: CalendarItem | null;
  sortedNotices: NoticeGet[];
  noticesLoading: boolean;
  loadingEvents: boolean;
  handleEventClick(arg: EventClickArg): void;
  calendarData: CalendarItem[];
}

const CalendarnPreviewBoard = ({
  loadingEvents,
  selected,
  sortedNotices,
  noticesLoading,
  handleEventClick,
  calendarData,
}: Props) => {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-[1fr_280px_280px] gap-4">
      {/* Calendar */}
      <div
        className="bg-white rounded-xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
      >
        <div className="flex items-center gap-x-2.5 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-[#0D1B2E] flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-[#C9A84C]" />
          </div>
          <span className="font-semibold text-[#0D1B2E] text-sm">
            Academic Calendar
          </span>
        </div>
        <div className="p-4">
          <Spin spinning={noticesLoading || loadingEvents}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarData}
              eventClick={handleEventClick}
              height="auto"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "",
              }}
              dayMaxEvents={3}
              eventDisplay="block"
            />
            {/* Color legend */}
            <div className="fc-legend">
              <div className="fc-legend-item">
                <span
                  className="fc-legend-dot"
                  style={{ background: "#1E3A5F" }}
                />
                Event
              </div>
              <div className="fc-legend-item">
                <span
                  className="fc-legend-dot"
                  style={{ background: "#4caf50" }}
                />
                Holiday
              </div>
              <div className="fc-legend-item">
                <span
                  className="fc-legend-dot"
                  style={{ background: "#ff9800" }}
                />
                Break
              </div>
              <div className="fc-legend-item">
                <span
                  className="fc-legend-dot"
                  style={{ background: "#C9A84C" }}
                />
                Notice
              </div>
            </div>
          </Spin>
        </div>
      </div>

      {/* Event Preview */}
      <EventPreview selected={selected} />

      {/* Notice Board */}
      <NoticePreview
        noticesLoading={noticesLoading}
        sortedNotices={sortedNotices}
      />
    </section>
  );
};
export default CalendarnPreviewBoard;
