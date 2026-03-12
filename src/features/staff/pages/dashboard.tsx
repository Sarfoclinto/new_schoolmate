import { eventKeys, mappingsKeys, noticeKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getUserNotices } from "@/services/setup/notice";
import { getTeacherMappingFn } from "@/services/staff";
import { useAuth } from "@/store/auth.store";
import { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "@/lib/dayjs";
import { get30daysEvents } from "@/services/event";
import type { CalendarItem } from "@/types/api/setup/year-n-term";
import type { EventApi, EventClickArg } from "@fullcalendar/core";
import { PageHeader, type Crumb } from "@/components/common/page-header";
import CalendarnPreviewBoard from "@/components/common/calendar_n_preview_board";
import { STAFFSTATS } from "@/data/dashboard";
import { StatCard } from "@/features/admins/components/stat-card";
import type { StaffCardData } from "@/types/api/setup/admin";

const StaffDashboard = () => {
  const user = useAuth((s) => s.user);
  const [date] = useState<Dayjs | null>(dayjs());
  const [selected, setSelected] = useState<CalendarItem | null>(null);

  const teacherId = user?.userId;
  const selectedDate = useMemo(() => {
    return date ? date.format("YYYY-MM-DD") : undefined;
  }, [date]);

  const { data: data, isLoading } = useFetch({
    queryFn: () => getTeacherMappingFn(teacherId!),
    queryKeys: mappingsKeys.custom("teacher", { teacherId }),
    enabled: !!teacherId,
  });

  const { data: notices, isLoading: noticesLoading } = useFetch({
    queryFn: () => getUserNotices(teacherId!, selectedDate),
    queryKeys: noticeKeys.custom("by-date", {
      teacherId,
      date: selectedDate,
    }),
    enabled: !!teacherId && !!selectedDate,
  });

  const { data: events, isLoading: loadingEvents } = useFetch({
    queryFn: get30daysEvents,
    queryKeys: eventKeys.custom("by-date", {
      date: selectedDate,
    }),
    enabled: !!selectedDate,
  });

  const calendarData = useMemo(() => {
    const evItems: CalendarItem[] = (events ?? []).map((e) => ({
      id: e.academicTermCalendarId,
      title: e.title,
      start: new Date(e.startDate),
      end: new Date(e.endDate),
      backgroundColor:
        e.calendarType === "Holiday"
          ? "#4caf50"
          : e.calendarType === "Break"
            ? "#ff9800"
            : "#2196f3",
      borderColor: "transparent",
      extendedProps: e,
    }));
    const noticeItems: CalendarItem[] = (notices ?? []).map((n) => ({
      id: n.noticeId,
      title: n.title,
      start: new Date(n.createdOn),
      allDay: true,
      backgroundColor: "#e91e63",
      borderColor: "transparent",
      extendedProps: n,
    }));

    return [...evItems, ...noticeItems];
  }, [notices, events]);

  const dataSource = useMemo(() => {
    return notices
      ? notices.map((notice) => ({
          ...notice,
          status: "unread",
        }))
      : [];
  }, [notices]);

  const sortedNotices = useMemo(() => {
    return [...dataSource].sort((a, b) => {
      // 1) Push all status==="read" to the front
      const aRead = a.status === "read" ? 1 : 0;
      const bRead = b.status === "read" ? 1 : 0;
      const statusDiff = bRead - aRead;
      //   – if a is read (1) and b isn’t (0): 0 - 1 = -1 → a comes first
      //   – if b is read and a isn’t: 1 - 0 = 1 → b comes first
      if (statusDiff !== 0) return statusDiff;

      // 2) Same status, so compare createdOn timestamps (newest first)
      //    Format is "YYYY-MM-DD HH:mm:ss.SSS"
      const dateA = dayjs(a.createdOn, "YYYY-MM-DD HH:mm:ss.SSS");
      const dateB = dayjs(b.createdOn, "YYYY-MM-DD HH:mm:ss.SSS");
      return dateB.valueOf() - dateA.valueOf();
    });
  }, [dataSource]);

  function handleEventClick(arg: EventClickArg) {
    const ev: EventApi = arg.event;
    setSelected({
      id: ev.id,
      title: ev.title,
      start: ev.start!,
      end: ev.end ?? undefined,
      allDay: ev.allDay,
      backgroundColor: ev.backgroundColor ?? undefined,
      borderColor: ev.borderColor ?? undefined,
      extendedProps: ev.extendedProps as CalendarItem["extendedProps"],
    });
  }

  const crumbs: Crumb[] = [
    {
      label: user?.role ?? "",
    },
    {
      label: "Dashboard",
    },
  ];

  const subjects = useMemo(() => {
    if (!data) return [];
    return data.subjects;
  }, [data]);

  const subLevels = useMemo(() => {
    if (!data) return [];
    return data.subLevels;
  }, [data]);

  const stats: StaffCardData = useMemo(
    () => ({
      totalSubjects: subjects.length,
      totalSubLevels: subLevels.length,
    }),
    [subjects, subLevels],
  );

  return (
    <section className="flex-1 p-2 min-w-fit w-full h-full overflow-auto">
      {/* ── Page header ── */}
      <PageHeader className="mb-6" title="Dashboard" breadcrumbs={crumbs} />

      {/* ── Stat cards grid ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-20">
        {STAFFSTATS.map((stat, i) => (
          <StatCard
            key={stat.key}
            stat={stat}
            index={i}
            loading={isLoading}
            value={stats[stat.key]}
            link={stat.link}
          />
        ))}
      </section>

      {/* ── Calendar / Preview / Notice Board -- */}
      <CalendarnPreviewBoard
        loadingEvents={loadingEvents}
        selected={selected}
        sortedNotices={sortedNotices}
        noticesLoading={noticesLoading}
        handleEventClick={handleEventClick}
        calendarData={calendarData}
      />
    </section>
  );
};
export default StaffDashboard;
