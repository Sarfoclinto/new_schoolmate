// grading

export interface GradePost {
  Grade: string;
  From: number;
  To: number;
  Remark?: string;
  EducationalLevelId: string;
}

export interface GradeGet {
  gradingSystemId: string;
  grade: string;
  from: number;
  to: number;
  remark: string;
  educationalLevelId: string;
  educationalLevelName: string;
  createdAt: string;
}

export interface GradeUpdate {
  data: GradePost;
  id: string;
}

// assessment

export interface AssessmentPost {
  EducationalLevelId: string;
  AssessmentName: string;
  AssessmentPercentage: number;
}

export interface AssessmentGet {
  assessmentId: string;
  assessmentName: string;
  assessmentPercentage: number;
}

export interface AssessmentUpdate {
  data: AssessmentPost;
  id: string;
}

export interface AssessmentGetResponse {
  educationalLevelId: string;
  educationalLevelName: string;
  assessments: AssessmentGet[];
}
