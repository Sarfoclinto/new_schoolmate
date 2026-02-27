import type { NoticeGet } from "@/types/api/setup/notice";
import { formatDateOutDatetime } from "@/utils/date-n-time";
import { List } from "antd";
import { Bell, Clock } from "lucide-react";

interface Props {
  sortedNotices: NoticeGet[];
  noticesLoading: boolean;
}

const noticeColors = ["text-rose-600", "text-emerald-600", "text-blue-600"];

const NoticePreview = ({ sortedNotices, noticesLoading }: Props) => {
  return (
    <div
      className="bg-white rounded-xl border border-slate-100 flex flex-col"
      style={{ boxShadow: "0 2px 8px rgba(13,27,46,0.06)" }}
    >
      <div className="flex items-center justify-between gap-x-2.5 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0D1B2E] flex items-center justify-center">
            <Bell className="w-4 h-4 text-[#C9A84C]" />
          </div>
          <span className="font-semibold text-[#0D1B2E] text-sm">
            Notice Board
          </span>
        </div>
        {sortedNotices.length > 0 && (
          <span className="text-[11px] font-bold bg-[#C9A84C]/15 text-[#8B6914] px-2 py-0.5 rounded-full">
            {sortedNotices.length}
          </span>
        )}
      </div>

      <div className="p-3 flex-1 overflow-auto">
        <List
          itemLayout="vertical"
          dataSource={sortedNotices}
          pagination={{
            pageSize: 3,
            showSizeChanger: false,
            hideOnSinglePage: true,
            size: "small",
          }}
          loading={noticesLoading}
          locale={{
            emptyText: (
              <div className="flex flex-col items-center py-8 gap-2">
                <Bell className="w-8 h-8 text-slate-200" />
                <span className="text-sm text-slate-400">No notices yet</span>
              </div>
            ),
          }}
          renderItem={(notice, index) => (
            <List.Item className="p-0! mb-2! border-0!">
              <div
                className="rounded-lg border border-slate-100 overflow-hidden hover:border-slate-200 transition-colors duration-150"
                style={{
                  borderLeft: `3px solid ${
                    notice.status === "unread" ? "#1E3A5F" : "#d1d5db"
                  }`,
                }}
              >
                {/* Notice header */}
                <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
                  <span
                    className={`text-sm font-semibold truncate max-w-[60%] ${noticeColors[index % 3]}`}
                  >
                    {notice.title}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 shrink-0">
                    {notice.userFullName}
                  </span>
                </div>

                {/* Notice body */}
                <div className="px-3 pb-2.5">
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-1.5">
                    {notice.body}
                  </p>
                  <div className="flex items-center gap-x-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDateOutDatetime(notice.createdOn)}</span>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};
export default NoticePreview;
