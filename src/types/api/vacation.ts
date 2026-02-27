export interface VacationPost {
  EducationalLevelId: string;
  VacationName: string;
  VacationDate: string;
  ReopeningDate: string;
  Notice: string;
  HeaderMasterRemarks: string;
  UserId: string;
}
// calendar
export interface VacationGet {
  vacationId: string;
  vacationName: string;
  vacationDate: string;
  reopeningDate: string;
  headerMasterRemarks: string;
  notice: string;
}

export interface VacationUpdate {
  id: string;
  data: VacationPost;
}
