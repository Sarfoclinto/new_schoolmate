import { getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  AttendancePost,
  StudentsMonthlyAttendance,
  SubLevelAttendanceGet,
} from "@/types/api/attendance";

const { attendance } = endpoints;

export const getMonthlyAttendanceFn = async (subId: string, date: string) => {
  return getHelper<StudentsMonthlyAttendance[]>(
    attendance.monthly(subId, date),
  );
};
export const getSublevelAttendanceFn = async (
  sublevelId: string,
  date?: string,
) => {
  return getHelper<SubLevelAttendanceGet[]>(
    attendance.sublevelAttByDate(sublevelId, date),
  );
};

export const markAttendanceFn = async (data: AttendancePost[]) => {
  return postHelper(attendance.mark, data);
};

export const updateAttendanceFn = async (id: string) => {
  return updateHelper(attendance.update(id), {});
};
