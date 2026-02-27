export interface PromotionPathPost {
  ToAcademicLevelId: string;
  FromAcademicLevelId: string;
}

export interface PromotionPathGet {
  academicLevelPromotionPathId: string;
  toAcademicLevelId: string;
  toAcademicLevelName: string;
  fromAcademicLevelId: string;
  fromAcademicLevelName: string;
}

// example of an array of the promotionpathget

export interface PromotionPathUpdate {
  id: string;
  data: PromotionPathPost;
}
