export interface EventGet {
  academicTermCalendarId: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  calendarType: "Event" | "Holiday" | "Break";
  academicTermId: string;
}
