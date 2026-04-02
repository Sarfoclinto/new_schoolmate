/**
 * StudentTerminalReport.tsx
 *
 * Redesign goals:
 *  ─ The on-screen view: navy × gold design system, DM Sans + Playfair Display.
 *  ─ The print/PDF content: a clean, formal report document with proper
 *    typography, borders, and density — totally separate from the screen UI.
 *  ─ Print: uses a dedicated CSS @media print rule that hides the screen
 *    chrome and shows only #report-print-root at full A4 width.
 *  ─ PDF download: uses html2canvas + jsPDF against the same #report-print-root
 *    element (not the whole page), so you get exactly what you'd get on paper.
 *
 * Key architecture:
 *  ─ <ReportDocument>  — the printable/PDF content (has id="report-print-root")
 *  ─ <ReportScreen>    — screen wrapper with toolbar and styled card
 *  ─ The two are rendered together; CSS hides the chrome on print.
 */

import { useLocation } from "react-router-dom";
import { normalizeSubjects, PRINT_STYLES } from "./util-fn";
import { useEffect, useMemo, useRef, useState } from "react";
import useFetch from "@/hooks/api/use-fetch";
import { getAllSubLevelStuFn, getStuReportFn } from "@/services/student";
import type { ReportPaths, SelectTypes } from "@/types/ui";
import { eduKeys, studentKeys, termKeys, yearKeys } from "@/config/query-keys";
import {
  BarChart2,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Download,
  GraduationCap,
  Hash,
  Layers,
  Printer,
  User,
} from "lucide-react";
import { MotionDiv } from "@/components/custom/motion";
import { ReportDocument, StatChip } from "./util-component-2";
import { getOrdinal } from "@/utils/string";
import { downloadReportPdf, printReport } from "./util-fn-2";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Button, Drawer, Form, Select } from "antd";
import { getAllEduLevelsFn } from "@/services/setup/educational-level";
import { getAcaByEduIdFn } from "@/services/setup/academic-level";
import { getSubLevelsByAcaIdFn } from "@/services/setup/sublevel";
import { getAllYearsFn, getTermsByEduIdFn } from "@/services/setup/year-n-term";
// import { useReactToPrint } from "react-to-print";

// Inject once
if (
  typeof document !== "undefined" &&
  !document.getElementById("rpt-print-styles")
) {
  const el = document.createElement("style");
  el.id = "rpt-print-styles";
  el.textContent = PRINT_STYLES;
  document.head.appendChild(el);
}

const ReportDetails = () => {
  const location = useLocation();
  const { studentId, subLevelId, year, term } = location.state || {};
  const reportRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm();
  const [selectedEdu, setSelectedEdu] = useState<SelectTypes | null>(null);
  const [selectedAca, setSelectedAca] = useState<SelectTypes | null>(null);
  const [selectedSub, setSelectedSub] = useState<SelectTypes | null>(null);
  const eduId = selectedEdu?.value;
  const acaId = selectedAca?.value;
  const subId = selectedSub?.value;
  const { isOpen, open, close } = useDisclosure();
  const [params, setParams] = useState<ReportPaths>({
    studentId,
    academicTermId: term,
    academicYearId: year,
    subLevelId,
  });

  const reqPy = useMemo(() => params, [params]);
  useEffect(() => {
    if (studentId && subLevelId && year && term) {
      form.setFieldsValue({
        studentId,
        subLevelId,
        year,
        term,
      });
    }
  }, [studentId, subLevelId, year, term, form]);

  const { data, isLoading } = useFetch({
    queryFn: () => getStuReportFn(reqPy),
    queryKeys: studentKeys.custom("terminal-report", reqPy),
    enabled:
      !!reqPy.studentId &&
      !!reqPy.subLevelId &&
      !!reqPy.academicTermId &&
      !!reqPy.academicYearId,
  });
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
  const { data: students, isLoading: loadingStudents } = useFetch({
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

  const normalizedSubjects = useMemo(
    () => normalizeSubjects(data?.subjectReports ?? []),
    [data],
  );

  const averageMark = useMemo(() => {
    if (!normalizedSubjects.length) return 0;
    return (
      normalizedSubjects.reduce((sum, s) => sum + s.total, 0) /
      normalizedSubjects.length
    );
  }, [normalizedSubjects]);

  const assessmentMap = useMemo(() => {
    const map: Record<
      string,
      { AssessmentName: string; AssessmentPercentage: number }
    > = {};
    data?.subjectReports?.forEach((s) =>
      s.assessments?.forEach((a) => {
        if (!map[a.assessmentId]) {
          map[a.assessmentId] = {
            AssessmentName: a.assessmentName,
            AssessmentPercentage: Number(a.assessmentPercentage),
          };
        }
      }),
    );
    return map;
  }, [data]);

  const assessmentIds = useMemo(
    () => Object.keys(assessmentMap),
    [assessmentMap],
  );

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
  const studentsOptions = useMemo(() => {
    if (!students) return [];
    return students.map((s) => ({
      label: `${s.fullName} ${s.otherName ?? ""}`,
      value: s.studentId,
    }));
  }, [students]);

  // ── Loading state
  if (isLoading) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="mb-5 flex items-center gap-x-3">
          <div className="h-6 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-[80vh] bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="flex flex-col items-center py-20 text-slate-400 gap-3"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <GraduationCap className="w-12 h-12 text-slate-300" />
        <p className="text-sm font-semibold">No report data found</p>
      </div>
    );
  }

  const d = data.studentDetails;
  const studentName = `${d.firstName} ${d.surname}`;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2">
      {/* ── Page header ──────────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5 flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1
            className="text-xl font-bold text-[#0D1B2E] leading-none mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Terminal Report
          </h1>
          <nav className="flex items-center gap-x-1.5 text-xs text-slate-400 font-medium">
            <span className="text-[#1E3A5F] font-semibold">Reports</span>
            <ChevronRight className="w-3 h-3" />
            <span>Students</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#0D1B2E] font-semibold">{studentName}</span>
          </nav>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-x-2.5">
          <button
            type="button"
            onClick={() => {
              printReport(reportRef);
              // handlePrint();
            }}
            className="flex items-center gap-x-2 px-4 py-2.5 rounded-xl font-bold text-xs text-[#0D1B2E] bg-white border border-slate-200 hover:border-[#1E3A5F] hover:bg-[#EEF2F8] transition-all cursor-pointer"
            style={{ boxShadow: "0 1px 4px rgba(13,27,46,0.06)" }}
          >
            <Printer className="w-3.5 h-3.5 text-[#1E3A5F]" />
            Print
          </button>
          <button
            type="button"
            onClick={() => {
              const name = data?.studentDetails
                ? `${data.studentDetails.firstName}_${data.studentDetails.surname}_Report.pdf`
                : "Student_Terminal_Report.pdf";
              downloadReportPdf(reportRef, name);
            }}
            className="flex items-center gap-x-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
            }}
          >
            <Download className="w-3.5 h-3.5 text-[#C9A84C]" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={open}
            className="flex items-center gap-x-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
            }}
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
            New Report
          </button>
        </div>
      </MotionDiv>

      {/* ── Quick stat chips ──────────────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.07 }}
        className="flex flex-wrap gap-3 mb-5"
      >
        <StatChip
          icon={<User className="w-3.5 h-3.5" />}
          label="Student"
          value={studentName}
        />
        <StatChip
          icon={<Layers className="w-3.5 h-3.5" />}
          label="Class"
          value={d.subLevelName}
        />
        <StatChip
          icon={<CalendarDays className="w-3.5 h-3.5" />}
          label="Term"
          value={d.academicTermName}
        />
        <StatChip
          icon={<BarChart2 className="w-3.5 h-3.5" />}
          label="Average"
          value={`${Math.round(averageMark)}%`}
        />
        <StatChip
          icon={<Hash className="w-3.5 h-3.5" />}
          label="Position"
          value={getOrdinal(data.subLevelPosition.positionInSubLevel)}
        />
        <StatChip
          icon={<BookOpen className="w-3.5 h-3.5" />}
          label="Subjects"
          value={normalizedSubjects.length}
        />
      </MotionDiv>

      {/* ── Report card (screen view) ─────────────────── */}
      <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 16px rgba(13,27,46,0.07)" }}
      >
        {/* Card top bar */}
        <div
          className="flex items-center gap-x-3 px-6 py-3.5"
          style={{
            background: "linear-gradient(135deg, #0D1B2E 0%, #1E3A5F 100%)",
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A84C] shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span
            className="text-white font-semibold text-sm flex-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {data.institution.name ?? "Institution"} — Terminal Report
          </span>
          <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] bg-white/10 px-2 py-0.5 rounded-full">
            {d.startYear}/{d.endYear} · {d.academicTermName}
          </span>
        </div>

        {/* The actual report document — this div is captured for PDF/print */}
        <div className="p-6 overflow-x-auto">
          <div
            style={{
              position: "relative",
            }}
          >
            <div
              ref={reportRef}
              style={{
                minWidth: 640,
                background: "#fff",
              }}
            >
              <ReportDocument
                data={data}
                normalizedSubjects={normalizedSubjects}
                assessmentIds={assessmentIds}
                assessmentMap={assessmentMap}
                averageMark={averageMark}
              />
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* New report form drawer */}
      <Drawer
        open={isOpen}
        onClose={close}
        placement="right"
        title="New Report"
        size={400}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={(values) => {
            const payload = {
              studentId: values.studentId,
              subLevelId: values.subLevelId,
              academicYearId: values.year,
              academicTermId: values.term,
            };

            setParams(payload); // THIS triggers refetch
            close(); // optional: close drawer
          }}
        >
          <Form.Item
            label="Educational Level"
            name="eduId"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select an educational level"
              options={eduOptions}
              loading={loadingEduLevels}
              onChange={() => {
                setSelectedAca(null);
                setSelectedSub(null);
              }}
              onSelect={(_, opt) => setSelectedEdu(opt as SelectTypes)}
            />
          </Form.Item>

          <Form.Item
            label="Academic Level"
            name="acaId"
            rules={[{ required: true }]}
          >
            <Select
              placeholder={
                eduId
                  ? "Select an academic level"
                  : "Select an educational level"
              }
              options={acaOptions}
              loading={loadingAcaLevels}
              disabled={!eduId}
              onChange={() => setSelectedSub(null)}
              onSelect={(_, opt) => setSelectedAca(opt as SelectTypes)}
            />
          </Form.Item>

          <Form.Item
            label="Class (Sub-Level)"
            name="subLevelId"
            rules={[{ required: true }]}
          >
            <Select
              placeholder={
                acaId
                  ? "Select a class (sub-level)"
                  : "Select an academic level"
              }
              options={subLevelOptions}
              loading={loadingSubLevels}
              disabled={!acaId}
              onSelect={(_, opt) => setSelectedSub(opt as SelectTypes)}
            />
          </Form.Item>

          <Form.Item
            label="Academic Year"
            name="year"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select an academic year"
              options={yearOptions}
              loading={loadingYears}
            />
          </Form.Item>

          <Form.Item label="Term" name="term" rules={[{ required: true }]}>
            <Select
              placeholder={
                eduId ? "Select a term" : "Select an educational level"
              }
              options={termOptions}
              loading={loadingAcademicTerms}
              disabled={!eduId}
            />
          </Form.Item>

          <Form.Item
            label="Student"
            name="studentId"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              options={studentsOptions}
              loading={loadingStudents}
              disabled={!subId}
              placeholder={
                subId ? "Select a student" : "Select a class (sub-level)"
              }
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            className="mt-4 h-10 bg-[#0D1B2E]"
          >
            Generate Report
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};
export default ReportDetails;
