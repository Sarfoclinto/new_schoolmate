import { eduKeys, studentKeys, termKeys, yearKeys } from "@/config/query-keys";
import useFetch from "@/hooks/api/use-fetch";
import { getAcaByEduIdFn } from "@/services/setup/academic-level";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { getSubLevelsByAcaIdFn } from "@/services/setup/sublevel";
import { getAllSubLevelStuFn } from "@/services/student";
import type { SubLevelStudentsGet } from "@/types/api/student";
import type { SelectTypes } from "@/types/ui";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  dobCol,
  genderCol,
  generateReportCol,
  studentCodeCol,
  studentImageCol,
  studentNameCol,
  subLevelCol,
} from "@/features/admins/components/student/student-columns";
import { ListPage as StudentListPage } from "@/features/admins/components/list-page";
import { Building, Filter, CalendarDays } from "lucide-react";
import { Select, Divider } from "antd";
import { getAllYearsFn, getTermsByEduIdFn } from "@/services/setup/year-n-term";

const ViewTerminalReport = () => {
  // states
  const navigate = useNavigate();
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [selectedAca, setSelectedAca] = useState<SelectTypes | null>(null);
  const [selectedSub, setSelectedSub] = useState<SelectTypes | null>(null);
  const eduId = selectedEdu?.value;
  const acaId = selectedAca?.value;
  const subId = selectedSub?.value;
  const [selectedYear, setSelectedYear] = useState<string | undefined>();
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>();

  //   queries
  //   get all educational levels for dropdown
  const { data: eduLevels, isLoading: loadingEduLevels } = useFetch({
    queryFn: getAllEduLevelsFn,
    queryKeys: eduKeys.levels(),
  });
  // get all academic levels
  const { data: acaLevels, isLoading: loadingAcaLevels } = useFetch({
    queryFn: () => getAcaByEduIdFn(eduId!),
    queryKeys: eduKeys.academicLevels(eduId),
    enabled: !!eduId,
  });
  //   get all sublevels of that academic level
  const { data: subLevels, isLoading: loadingSubLevels } = useFetch({
    queryFn: () => getSubLevelsByAcaIdFn(acaId!),
    queryKeys: eduKeys.sublevels({ acaId }),
    enabled: !!acaId,
  });
  const { data, isLoading } = useFetch({
    queryFn: () => getAllSubLevelStuFn(subId!),
    queryKeys: studentKeys.custom("by-sub-level", {
      subId,
    }),
    enabled: !!subId,
  });
  const { data: academicTerms, isLoading: loadingAcademicTerms } = useFetch({
    queryFn: () => getTermsByEduIdFn(eduId!),
    queryKeys: termKeys.custom("edu-terms", { eduId }),
    enabled: !!eduId,
  });
  const { data: academicYears, isLoading: loadingYears } = useFetch({
    queryFn: getAllYearsFn,
    queryKeys: yearKeys.list(),
  });

  // memoized values
  const eduOptions = useMemo(() => {
    if (!eduLevels) return [];
    return eduLevels.map((e) => ({
      label: e.educationalLevelName,
      value: e.educationalLevelId,
    }));
  }, [eduLevels]);
  const acaOptions = useMemo(() => {
    if (!acaLevels) return [];
    return acaLevels.map((a) => ({
      label: a.academicLevelName,
      value: a.academicLevelId,
    }));
  }, [acaLevels]);
  const subLevelOptions = useMemo(() => {
    if (!subLevels) return [];
    return [...subLevels]
      .sort((a, b) => a.subLevelName.localeCompare(b.subLevelName))
      .map((s) => ({
        label: s.subLevelName,
        value: s.subLevelId,
      }));
  }, [subLevels]);
  const termOptions = useMemo(() => {
    if (!academicTerms) return [];
    return academicTerms.map((t) => ({
      label: t.academicTermName,
      value: t.academicTermId,
    }));
  }, [academicTerms]);
  const yearOptions = useMemo(() => {
    if (!academicYears) return [];
    return academicYears.map((y) => ({
      label: `${y.startYear}-${y.endYear}`,
      value: y.academicYearId,
    }));
  }, [academicYears]);

  const dataSource = useMemo(() => {
    if (!data || !data) return [];
    return data;
  }, [data]);

  const columns = useMemo(
    () => [
      studentCodeCol<SubLevelStudentsGet>(120),
      studentImageCol<SubLevelStudentsGet>(),
      studentNameCol<SubLevelStudentsGet>("25%"),
      genderCol<SubLevelStudentsGet>(130),
      dobCol<SubLevelStudentsGet>(160),
      subLevelCol<SubLevelStudentsGet>(),
      generateReportCol<SubLevelStudentsGet>(
        navigate,
        selectedYear,
        selectedTerm,
      ),
    ],
    [navigate, selectedYear, selectedTerm],
  );

  const filters = (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
      {/* Section 1: Hierarchy Selection */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-x-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Class Filter
        </div>
        <div className="flex flex-wrap gap-0.5">
          <Select
            labelInValue
            placeholder="Educational Level"
            className="w-48!"
            allowClear
            onClear={() => {
              setSelectedEdu(null);
              setSelectedAca(null);
              setSelectedSub(null);
            }}
            options={eduOptions}
            loading={loadingEduLevels}
            disabled={loadingEduLevels}
            value={selectedEdu}
            onChange={(opt) => {
              setSelectedEdu({ value: opt.value, label: opt.label as string });
              setSelectedAca(null);
              setSelectedSub(null);
            }}
          />
          <Select
            labelInValue
            placeholder={selectedEdu ? "Academic Level" : "Select edu level"}
            className="w-48!"
            allowClear
            onClear={() => {
              setSelectedAca(null);
              setSelectedSub(null);
            }}
            options={acaOptions}
            loading={loadingAcaLevels}
            disabled={loadingAcaLevels || !selectedEdu}
            value={
              selectedAca
                ? { value: selectedAca.value, label: selectedAca.label }
                : undefined
            }
            onChange={(opt) => {
              setSelectedAca({ value: opt.value, label: opt.label as string });
              setSelectedSub(null);
            }}
          />
          <Select
            labelInValue
            placeholder="Select Class"
            className="w-48!"
            options={subLevelOptions}
            loading={loadingSubLevels}
            disabled={loadingSubLevels || !selectedAca}
            allowClear
            value={selectedSub}
            onChange={(opt) => {
              setSelectedSub({ value: opt.value, label: opt.label as string });
            }}
          />
        </div>
      </div>

      <Divider
        orientation="vertical"
        className="hidden lg:block h-8 border-slate-200"
      />

      {/* Section 2: Report Context (Year & Term) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-x-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
          <CalendarDays className="w-3.5 h-3.5" />
          Report Context
        </div>
        <div className="flex gap-x-0.5">
          <Select
            placeholder="Academic Year"
            className="w-40!"
            options={yearOptions}
            loading={loadingYears}
            value={selectedYear}
            onChange={setSelectedYear}
          />
          <Select
            placeholder={selectedEdu ? "Select Term" : "Select edu level"}
            className="w-40!"
            options={termOptions}
            loading={loadingAcademicTerms}
            disabled={!selectedEdu}
            value={selectedTerm}
            onChange={setSelectedTerm}
          />
        </div>
      </div>
    </div>
  );

  return (
    <StudentListPage<SubLevelStudentsGet>
      title="Terminal Reports"
      breadcrumb={["Reports", "Terminal Reports"]}
      showCardHeader={false}
      icon={<Building className="w-4 h-4" />}
      columns={columns}
      dataSource={dataSource}
      loading={isLoading}
      filters={filters}
      emptyText="No students yet"
    />
  );
};
export default ViewTerminalReport;
