export interface EventGet {
  academicTermCalendarId: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  calendarType: "Event" | "Holiday" | "Break";
  academicTermId: string;
  academicTermName: string;
}

export interface EventPost {
  Title: string;
  StartDate: string;
  EndDate: string;
  Description: string;
  CalendarType: "Event" | "Holiday" | "Break";
  AcademicTermId: string;
  UserId: string;
}

export interface EventUpdate {
  id: string;
  data: EventPost;
}
