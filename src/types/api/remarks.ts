export type RemarkPayload = {
  academicTermId: string;
  academicYearId: string;
  teacherId: string;
  remarks: string;
  studentId: string;
  subLevelId: string;
  id: string | null;
};

// year term sublevel teacherId?
export type Remark = RemarkPayload & {
  firstName: string;
  lastName: string;
  otherName: string;
};
