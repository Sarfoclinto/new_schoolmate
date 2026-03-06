import dayjs from "@/lib/dayjs";
import type { ReportPaths } from "@/types/ui";

const endpoints = {
  auth: {
    login: "/Login",
  },
  admin: {
    dashboardData: "/AdminDashboard",
  },
  institution: {
    profile: "/GetInstitution",
    create: "/CreateInstitution",
    update: (instId: string) => `/UpdateInstitution/${instId}`,
  },
  roles: {
    getAllRoles: "/GetAllRoles",
    createRole: "/CreateRole",
    updateRole: (roleId: string) => `/UpdateRole/${roleId}`,
    deleteRole: (roleId: string) => `/DeleteRole/${roleId}`,
  },
  eduLevel: {
    getAll: "/GetAllEducationalLevels",
    create: "/CreateEducationalLevel",
    getById: (id: string) => `/GetEducationalLevel/${id}`,
    update: (id: string) => `/UpdateEducationalLevel/${id}`,
    delete: (id: string) => `/DeleteEducationalLevel/${id}`,
  },
  acaLevel: {
    getAll: "/GetAllAcademicLevels",
    create: "/CreateAcademicLevel",
    getById: (id: string) => `/GetAcademicLevelByLevel/${id}`,
    getByEduId: (id: string) =>
      `/GetAllAcademicLevelsByEducationalLevelId/${id}`,
    update: (id: string) => `/UpdateAcademicLevel/${id}`,
    delete: (id: string) => `/DeleteAcademicLevel/${id}`,
  },
  sublevel: {
    create: "/CreateSubLevel",
    getAll: "/GetAllSubLevels",
    withoutProgram: "/GetAllSubLevelsWithoutProgram",
    getById: (id: string) => `/GetSubLevelById/${id}`,
    getByAcaId: (id: string) => `/GetAllSubLevelsByAcademicLevelId/${id}`,
    update: (id: string) => `/UpdateSubLevel/${id}`,
    delete: (id: string) => `/DeleteSubLevel/${id}`,
  },
  promotionPath: {
    create: "/CreateAcademicLevelPromotionPath",
    update: (id: string) => `/UpdatePromotionPath/${id}`,
    delete: (id: string) => `/DeleteAcademicLevelPromotionPath/${id}`,
    deleteMultiple: "/DeleteMultiplePromotionPath",
    getAll: "/GetAllAcademicLevelPromotionPaths",
  },
  notice: {
    createNotice: "/CreateNotice",
    teacherNoticeAction: "/NoticeReadLog",
    userNotice: (userId: string, date: string = dayjs().format("YYYY-MM-DD")) =>
      `/GetUserNotices/User/${userId}/${date}`,
    staffNotice: (
      teacherId: string,
      date: string = dayjs().format("YYYY-MM-DD"),
    ) => `/GetTeacherNotices/Teacher/${teacherId}/${date}`,
    deleteNotice: (noticeId: string, userId: string) =>
      `/DeleteNotice/${noticeId}/User/${userId}`,
    updateNotice: (noticeId: string, userId: string) =>
      `/UpdateNotice/${noticeId}/User/${userId}`,
  },
  event: {
    "30daysEvents": "/Get30daysEvent",
    getAll: (termId: string, year?: string) =>
      `/GetEvents/AcademicYear/${year ?? null}/AcademicTerm/${termId}`,
    create: "/CreateCalendar",
    update: (id: string) => `/UpdateCalendar/${id}`,
    delete: (id: string) => `/DeleteCalendar/${id}`,
  },
  studyModules: {
    createMapping: "/SubjectProgramMapping",
    subject: {
      create: "/CreateSubject",
      getAll: "/GetAllSubjects",
      update: (id: string) => `/UpdateSubject/${id}`,
      delete: (id: string) => `/DeleteSubject/${id}`,
    },
    program: {
      create: "/CreateProgram",
      getAll: "/GetAllPrograms",
      getOmittedSubjects: (stuId: string) =>
        `/GetStudentExcludedSubjects/${stuId}`,
      getById: (id: string) => `/GetProgramById/${id}`,
      update: (id: string) => `/UpdateProgram/${id}`,
      delete: (id: string) => `/DeleteProgram/${id}`,
      subjects: (programId: string) => `/GetProgramSubjects/${programId}`,
      deleteSubject: (programId: string, subjectId: string) =>
        `/DeleteProgramSubject/Program/${programId}/Subject/${subjectId}`,
      deleteSublevel: (programId: string, subLevelId: string) =>
        `/DeleteProgramSubLevel/Program/${programId}/SubLevel/${subLevelId}`,
    },
  },
  facultyNClassroom: {
    faculty: {
      getAll: "/GetAllFaculties",
      create: "/CreateFaculty",
      getById: (id: string) => `/GetFacultyById/${id}`,
      update: (id: string) => `/UpdateFaculty/${id}`,
      delete: (id: string) => `/DeleteFaculty/${id}`,
    },
    classroom: {
      getAll: "/GetAllClassRooms",
      getByFacultyId: (facultyId: string) =>
        `/GetAllClassRoomsByFacultyId/${facultyId}`,
      create: "/CreateClassRoom",
      getById: (id: string) => `/GetClassRoomById/${id}`,
      update: (id: string) => `/UpdateClassRoom/${id}`,
      delete: (id: string) => `/DeleteClassRoom/${id}`,
    },
    mapping: {
      assign: (roomId: string, sublevelId: string) =>
        `/AssignClassRoomToSubLevel/ClassRoom/${roomId}/SubLevel/${sublevelId}`,
      unassign: (roomId: string, sublevelId: string) =>
        `/DeleteClassroomAssignment/ClassRoom/${roomId}/SubLevel/${sublevelId}`,
    },
  },
  assessmentNGrading: {
    grading: {
      create: "/CreateGradingSystem",
      getAll: "/GetAllGradingSystems",
      getById: (id: string) => `/GetGradingSystemById/${id}`,
      getByEduId: (id: string) =>
        `/GetAllGradingSystemsByEducationalLevelId/${id}`,
      update: (id: string) => `/UpdateGradingSystem/${id}`,
      delete: (id: string) => `/DeleteGradingSystem/${id}`,
    },
    assessment: {
      getAll: "/GetAllAssessments",
      getBySubId: (id: string) => `/GetSubLevelAssessments/${id}`,
      getByEduId: (id: string) => `/GetEducationalLevelAssessments/${id}`,
      create: "/CreateAssessment",
      update: (id: string) => `/UpdateAssessment/${id}`,
      delete: (id: string) => `/DeleteAssessment/${id}`,
    },
  },
  facilities: {
    getAll: "/GetAllInfrastructures",
    create: "/CreateInfrastructure",
    update: (id: string) => `/UpdateInfrastructure/${id}`,
    delete: (id: string) => `/DeleteInfrastructure/${id}`,
  },
  yearsnTerms: {
    year: {
      getAll: "/GetAllAcademicYears",
      create: "/createAcademicYear",
      getById: (id: string) => `/GetAcademicYearById/${id}`,
      update: (id: string) => `/UpdateAcademicYear/${id}`,
      active: (id: string) => `/ActivateAcademicYear/${id}`,
    },
    term: {
      getAll: "/GetAllAcademicTerms",
      create: "/CreateAcademicTerm",
      getById: (id: string) => `/GetAcademicTermById/${id}`,
      getBySubId: (id: string) => `/GetAllAcademicTermsBySubLevelId/${id}`,
      getByEduId: (id: string) =>
        `/GetAllAcademicTermsByEducationalLevelById/${id}`,
      delete: (id: string) => `/DeleteAcademicTerm/${id}`,
      active: (id: string) => `/ActivateAcademicTerm/${id}`,
    },
  },
  students: {
    register: "/StudentRegistrationAndEnrollment",
    updates: {
      personal: (id: string) => `/UpdateStudentDetails/${id}`,
      parents: (id: string) => `/UpdateStudentParentDetails/${id}`,
      guardians: (id: string) => `/UpdateStudentGuardianDetails/${id}`,
      enrollment: (id: string) => `/UpdateStudentEnrollmentDetails/${id}`,
    },
    reports: {
      terminal: (paths: ReportPaths) =>
        `/GetStudentTerminalReport/Student/${paths.studentId}/AcademicYear/${paths.academicYearId}/AcademicTerm/${paths.academicTermId}/SubLevel/${paths.subLevelId}`,
    },

    getAllPn: "/GetAllStudents",
    getAllUnPn: "/GetUnPaginatedStudents",
    getById: (id: string) => `/GetStudentProfile/${id}`,
    getByEduId: (id: string) => `/GetAllEducationalLevelStudents/${id}`,
    getByAcaId: (id: string) => `/GetAllAcademicLevelStudents/${id}`,
    getBySubId: (id: string) => `/GetAllSubLevelStudents/${id}`,
    getByAcaIdUnPn: (id: string) =>
      `/GetUnPaginatedAcademicLevelStudents/${id}`,
  },
  staffMn: {
    create: "/CreateStaff",
    updateProfile: (id: string) => `/UpdateStaff/${id}`,
    updatePassword: (id: string) => `/UpdateStaffPassword/${id}`,
    updateStaff: (id: string) => `/StaffUpdatedByAdmin/${id}`,
    createMapping: "/CreateTeacherMappings",
    getAllPn: "/GetPaginatedStaff",
    getAllUnPn: "/GetAllStaff",
    allTeachers: "/GetAllTeachers",
    teacherSubjects: (id: string) => `/GetTeacherMappings/${id}`,
    teacherSublevels: (id: string) => `/GetTeacherSubLevels/${id}`,
    subLevelSubjects: (teacherId: string, sublevelId: string) =>
      `/GetTeacherSubLevelSubjects/Teacher/${teacherId}/SubLevel/${sublevelId}`,

    delTeacherSubject: (teachId: string, subId: string) =>
      `/DeleteTeacherSubject/Teacher/${teachId}/Subject/${subId}`,
    delTeacherSublevel: (teachId: string, sublevelId: string) =>
      `/DeleteTeacherSubLevel/Teacher/${teachId}/SubLevel/${sublevelId}`,
    getById: (id: string) => `/GetStaffById/${id}`,
  },
  finance: {
    ledgers: {
      getAllSub: "/GetAllSubsidiaryLedgers",
    },
    fees: {
      setup: "/CreateTuitionSetup",
      getAll: "/GetAllTuitionFees",
      getById: (id: string) => `/GetTuitionSetupById/${id}`,
      update: (id: string) => `/UpdateTuitionSetup/${id}`,
      delete: (id: string) => `/DeleteTuitionSetup/${id}`,
    },
  },
  academicRecords: {
    passmark: {
      create: "/CreatePassMark",
      teacherSublevelSubject: (teacherId: string, sublevelId: string) =>
        `/GetTeacherSubLevelSubjectsPassMarks/Teacher/${teacherId}/SubLevel/${sublevelId}`,
      update: (id: string) => `/UpdatePassMark/${id}`,
      delete: (id: string) => `/DeletePassMark/${id}`,
    },
    records: {
      add: "/CreateAcademicRecord",
      sublevelSubjectsRecords: (
        assessId: string,
        sublevelId: string,
        subjectId: string,
      ) =>
        `/GetSubLevelSubjectAcademicRecords/Assessment/${assessId}/SubLevel/${sublevelId}/Subject/${subjectId}`,
      sublevelAcademicRecords: (
        sublevelId: string,
        assessId: string,
        teacherId: string,
      ) =>
        `/GetSubLevelAcademicRecords/Assessment/${assessId}/SubLevel/${sublevelId}/Teacher/${teacherId}`,
    },
  },
  attendance: {
    mark: "/MarkStudentAttendance",
    update: (id: string) => `/UpdateAttendanceStatus/${id}`,
    sublevelAttByDate: (
      sublevelId: string,
      date: string = dayjs().format("YYYY-MM-DD"),
    ) =>
      `/GetStudentAttendancePreviews/SubLevel/${sublevelId}/AttendanceDate/${date}`,
    monthly: (subId: string, date: string) =>
      `/GetMonthlyStudentAttendances/SubLevel/${subId}/Month/${date}`,
  },
};

export default endpoints;
