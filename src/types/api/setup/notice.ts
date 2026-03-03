export interface NoticeGet {
  noticeId: string;
  title: string;
  body: string;
  userId: string;
  userFullName: string;
  createdOn: string;
  updatedOn: string;
  status: string;
  userImage: string;
  targetType: string;
  targetName: string;
}

export interface Target {
  TargetType: string;
  TargetId: string;
}

export interface NoticePost {
  Title: string;
  Body: string;
  UserId: string;
  Targets: Target[];
}
export interface NoticeUpdate {
  id: string;
  userId: string;
  data: {
    Title: string;
    Body: string;
  };
}
