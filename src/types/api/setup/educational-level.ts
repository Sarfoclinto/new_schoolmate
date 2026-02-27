export interface EduLevelGet {
  educationalLevelId: string;
  educationalLevelName: string;
  alias: string | null;
  createdAt: string;
}

export interface EduLevelPost {
  EducationalLevelName: string;
  Alias?: string;
}

export interface EduUpdate {
  data: EduLevelPost;
  id: string;
}
