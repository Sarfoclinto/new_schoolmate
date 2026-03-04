import type { NoticeGet } from "@/types/api/setup/notice";
import type { FetchProps } from "@/types/hooks";
import useFetch from "../api/use-fetch";
import { getStaffNotices } from "@/services/setup/notice";
import { noticeKeys } from "@/config/query-keys";

export const useStaffNoticesQuery = (
  teacherId?: string,
  selectedDate?: string,
  options?: FetchProps<NoticeGet[], unknown>["queryOptions"],
) => {
  return useFetch({
    queryFn: () => getStaffNotices(teacherId!, selectedDate),
    queryKeys: noticeKeys.custom("by-date", {
      teacherId,
      date: selectedDate,
    }),
    enabled: !!teacherId && !!selectedDate,
    queryOptions: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
      ...options,
    },
  });
};
