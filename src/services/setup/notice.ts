import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  NoticeGet,
  NoticePost,
  NoticeUpdate,
} from "@/types/api/setup/notice";

const { notice } = endpoints;

export const getUserNotices = async (userId: string, date?: string) => {
  return getHelper<NoticeGet[]>(notice.userNotice(userId, date));
};

export const createNoticeFn = async (data: NoticePost) => {
  return postHelper(notice.createNotice, data);
};
export const updateNoticeFn = async (update: NoticeUpdate) => {
  return updateHelper(
    notice.updateNotice(update.id, update.userId),
    update.data,
  );
};

type DeleteNoticeMap = {
  noticeId: string;
  userId: string;
};
export const deleteNoticeFn = async (map: DeleteNoticeMap) => {
  return deleteHelper(notice.deleteNotice(map.noticeId, map.userId));
};
