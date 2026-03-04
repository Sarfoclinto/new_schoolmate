import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  NoticeGet,
  NoticePost,
  NoticeUpdate,
  StaffNoticeGet,
  UserNoticeAction,
} from "@/types/api/setup/notice";

const { notice } = endpoints;

// users (adminstration)
export const getUserNotices = async (userId: string, date?: string) => {
  return getHelper<NoticeGet[]>(notice.userNotice(userId, date));
};

// staff
export const getStaffNotices = async (userId: string, date?: string) => {
  return getHelper<StaffNoticeGet[]>(notice.staffNotice(userId, date));
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

export const noticeActionFn = async (update: UserNoticeAction) => {
  return postHelper(notice.teacherNoticeAction, update);
};
export const markAllAsReadFn = async (update: UserNoticeAction[]) => {
  return Promise.all(update.map((u) => noticeActionFn(u)));
};

type DeleteNoticeMap = {
  noticeId: string;
  userId: string;
};
export const deleteNoticeFn = async (map: DeleteNoticeMap) => {
  return deleteHelper(notice.deleteNotice(map.noticeId, map.userId));
};
