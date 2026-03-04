export const createQueryKeys = <T extends string>(root: T) => ({
  all: [root] as const,

  lists: () => [root, "list"] as const,
  list: <P extends object>(params?: P) => [root, "list", params] as const,

  details: () => [root, "detail"] as const,
  detail: (id: string) => [root, "detail", id] as const,

  custom: <S extends string, P extends object | undefined = undefined>(
    scope: S,
    params?: P,
  ) => [root, scope, params] as const,
});

export const institutionKeys = createQueryKeys("institution");
export const dashboardKeys = createQueryKeys("dashboard");
export const educationKeys = createQueryKeys("education");
export const academicKeys = createQueryKeys("academic");
export const programKeys = createQueryKeys("program");
export const subjectKeys = createQueryKeys("subject");
export const promotionPathKeys = createQueryKeys("promotion-path");
export const facultyKeys = createQueryKeys("faculty");
export const classroomKeys = createQueryKeys("classroom");
export const eventKeys = createQueryKeys("events");
export const noticeKeys = createQueryKeys("notices");
export const roleKeys = createQueryKeys("roles");
export const infrastructureKeys = createQueryKeys("facilities");
export const yearKeys = createQueryKeys("years");
export const termKeys = createQueryKeys("terms");

export const studentKeys = createQueryKeys("students");
export const staffKeys = createQueryKeys("staff");
export const reportKeys = createQueryKeys("report");
export const financeKeys = createQueryKeys("finance");
export const ledgerKeys = createQueryKeys("ledgers");

export const academicRecordsKeys = createQueryKeys("academic-records");

export const attendanceKeys = createQueryKeys("attendance");



// educational level
export const eduKeys = {
  all: educationKeys.all,

  levels: () => educationKeys.custom("levels"),

  academicLevels: (eduId?: string) =>
    educationKeys.custom("academic-levels", { eduId }),

  sublevels: (params?: { eduId?: string; acaId?: string; acaIds?: string[] }) =>
    educationKeys.custom("sublevels", params),
};

export const educationMutationKeys = {
  create: ["education", "create"],
  update: ["education", "update"],
  delete: ["education", "delete"],
};
