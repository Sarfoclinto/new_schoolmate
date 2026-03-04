import { useMemo } from "react";
import { useStaffNoticesQuery } from "./use-staff-notice-query";
import type { NoticeGet } from "@/types/api/setup/notice";

export const useStaffNotices = (teacherId?: string, selectedDate?: string) => {
  const query = useStaffNoticesQuery(teacherId, selectedDate);

  const deduped = useMemo(() => {
    if (!query.data) return [];

    const map = new Map<
      string,
      NoticeGet & {
        mergedTargets: string[];
        mergedTargetNames: string[];
      }
    >();

    for (const n of query.data) {
      if (map.has(n.noticeId)) {
        const existing = map.get(n.noticeId)!;
        if (!existing.mergedTargets.includes(n.targetType)) {
          existing.mergedTargets.push(n.targetType);
          existing.mergedTargetNames.push(n.targetName ?? "");
        }
      } else {
        map.set(n.noticeId, {
          ...n,
          mergedTargets: [n.targetType],
          mergedTargetNames: [n.targetName ?? ""],
        });
      }
    }

    return Array.from(map.values());
  }, [query.data]);

  const unreadCount = useMemo(
    () => deduped.filter((n) => n.status === "unread").length,
    [deduped],
  );

  const readCount = useMemo(
    () => deduped.filter((n) => n.status === "read").length,
    [deduped],
  );

  return {
    ...query,
    rawNotices: query.data ?? [],
    dedupedNotices: deduped,
    unreadCount,
    readCount,
  };
};
