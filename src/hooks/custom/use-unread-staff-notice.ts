import type { NoticeGet } from "@/types/api/setup/notice";
import { useStaffNoticesQuery } from "./use-staff-notice-query";
import type { UseQueryResult } from "@tanstack/react-query";

export const useUnreadStaffNoticeCount = (
  teacherId?: string,
  selectedDate?: string,
) => {
  const qr = useStaffNoticesQuery(teacherId, selectedDate, {
    select: (notices) => {
      if (!notices) return 0 as unknown as NoticeGet[];

      const seen = new Set<string>();
      let count = 0;

      for (const n of notices) {
        if (n.status === "unread" && !seen.has(n.noticeId)) {
          seen.add(n.noticeId);
          count++;
        }
      }

      return count as unknown as NoticeGet[];
    },
  });
  return qr as unknown as UseQueryResult<number, unknown>;
};
