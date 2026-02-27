import { getHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { NoticeGet } from "@/types/api/setup/notice";

export const getUserNotices = async (userId: string, date?: string) => {
  return getHelper<NoticeGet[]>(endpoints.notice.userNotice(userId, date));
};
