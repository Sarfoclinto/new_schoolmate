// export const queryKeys = {
//   institution: {
//     profile: () => ["institution", "profile"] as const,
//     dashboard: () => ["institution", "dashboard"] as const,
//   },

//   education: {
//     levels: () => ["education", "levels"] as const,
//     academicLevels: () => ["education", "academic-levels"] as const,

//     academicLevelsByEdu: (eduId?: string) =>
//       ["education", "academic-levels", { eduId }] as const,

//     sublevels: () => ["education", "sublevels"] as const,

//     sublevelsByAcademic: (acaIds: string[]) =>
//       ["education", "sublevels", { acaIds }] as const,

//     sublevelsByEdu: (eduId?: string) =>
//       ["education", "sublevels", { eduId }] as const,

//     sublevelsByEduAndAcademic: (eduId?: string, acaId?: string) =>
//       ["education", "sublevels", { eduId, acaId }] as const,
//   },

//   events: {
//     all: () => ["events"] as const,
//     byDate: (date?: string) => ["events", { date }] as const,
//   },

//   notices: {
//     byDate: (date?: string) => ["notices", { date }] as const,
//   },

//   roles: {
//     all: () => ["roles"] as const,
//   },
// };
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
