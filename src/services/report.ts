import { getFileHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";

const { reports } = endpoints;
type PrintMode = "school" | "class" | "classes" | "students";
type ClassReportParam = {
  academicYearId: string;
  academicTermId: string;
  mode: PrintMode;
  subLevelIds?: string[];
  studentIds?: string[];
};
export const getClassReport = async (params: ClassReportParam) => {
  const { academicYearId, academicTermId, subLevelIds } = params;
  return getFileHelper<{ blob: Blob; fileName: string }>(
    reports.classBulkReport,
    {
      academicTermId,
      academicYearId,
      subLevelId: Array.isArray(subLevelIds) ? subLevelIds?.[0] : subLevelIds,
    },
    "blob",
  );
};

export const getStudentReport = async (
  params: ClassReportParam & { studentId: string },
) => {
  return getFileHelper<{ blob: Blob; fileName: string }>(
    reports.singleReport,
    params,
    "blob",
  );
};
