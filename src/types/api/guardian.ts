export type GuardianWithoutWards = {
  guardianId: string;
  guardianName: string;
  guardianRelationship: string; // parent/spouse/sibling/relative/other
  guardianAddress: string;
  guardianImage: string;
  guardianLivingStatus: string; // deceased/alive
  guardianOccupation: string;
  guardianContact: string;
  guardianEmail?: string;
  guardianWardsCount: number;
};

export type GuardianWithWard = GuardianWithoutWards & {
  wards: GuardianWard[];
};

export type GuardianWard = {
  wardId: string;
  wardName: string;

  subLevelId: string;
  subLevelName: string;

  academicLevelId: string;
  academicLevelName: string;

  educationalLevelId: string;
  educationalLevelName: string;
};

export type GuardianStudentMapPost = {
  studentIds: string[];
  guardianId: string;
};

// ── Types ──────────────────────────────────────────────────────────────────────
export interface GuardianOption {
  guardianId: string;
  guardianName: string;
  guardianWardCount: number;
  guardianContact: string;
}
