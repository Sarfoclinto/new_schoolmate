// passmarks
export interface PassmarkPost {
  PassMark: number;
  TeacherId: string;
  SubLevelId: string;
  SubjectId: string;
}
export interface PassmarkGet {
  passMarkId: string;
  passMark: number;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherFullName: string;
  subLevelId: string;
  subLevelName: string;
  createdOn: string;
}
export interface PassmarkUpdate {
  id: string;
  data: PassmarkPost;
}

// records

export interface AcademicRecordPost {
  StudentId: string;
  SubjectId: string;
  SubLevelId: string;
  AssessmentId: string;
  Marks: number;
  MarkedOver: number;
  UserId: string;
}

export interface SubLevelSubjectAcademicRecordGet {
  academicRecordId: string;
  studentId: string;
  studentFullName: string;
  marks: number;
  markedOver: number;
  scaledMarks: number;

  assessmentId: string;
  assessmentName: string;

  subjectId: string;
  subjectName: string;

  subLevelId: string;
  subLevelName: string;
}

interface academicRec {
  marks: number;
  markedOver: number;
}

interface subjectObj {
  subjectId: string;
  subjectName: string;
  academicRecord: academicRec[];
  // marks: number;
  // markedOver: number;
}

export interface ClassRecordsGet {
  studentId: string;
  studentFullName: string;
  subjects: subjectObj[];
}

/*
  student Subject1  Subject2 Subject3 Subjectn
  Clinton   80          40     50       22
  Virgile    40         12      99       100
  John      70         60      80       90

*/
