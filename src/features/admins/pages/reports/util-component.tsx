// ─────────────────────────────────────────────────────────
// Sub-component: Report Header (school + student photo)

import type {
  StudentTerminalReportGet,
  SubjectReport,
} from "@/types/api/student";
import { round2 } from "./util-fn";
import { capitalizeWords, getInitials, getOrdinal } from "@/utils/string";
import { QRCode } from "antd";
import { buildMediaUrl } from "@/utils/media";
import { formatDate } from "@/utils/date-n-time";

// ─────────────────────────────────────────────────────────
interface ReportHeaderProps {
  institutionName?: string;
  postalAddress?: string;
  city?: string;
  contact?: string;
  email?: string;
  logo?: string;
  studentImage?: string;
}

export const ReportHeader = ({
  institutionName,
  postalAddress,
  city,
  contact,
  email,
  logo,
  studentImage,
}: ReportHeaderProps) => (
  <div
    className="rpt-grid"
    style={{
      gridTemplateColumns: "165px 1fr 165px",
      gap: "20px",
      alignItems: "center",
      padding: "10px 20px 14px",
      borderBottom: "2px solid #000",
      marginBottom: "8px",
    }}
  >
    {/* Student photo */}
    <img
      src={studentImage ? buildMediaUrl(studentImage) : "/man.png"}
      alt="Student"
      style={{
        width: 150,
        height: 150,
        objectFit: "cover",
        objectPosition: "center",
        // border: "1px solid #000",
        marginLeft: "auto",
        display: "block",
      }}
    />
    {/* Centre text */}
    <div style={{ textAlign: "center", lineHeight: 1.6 }}>
      <p
        style={{
          color: "#0D1B2E",
          fontFamily: "Playfair Display, serif",
          fontSize: "17px",
          fontWeight: 700,
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {institutionName ?? "Institution Name"}
      </p>
      <p
        style={{
          color: "#0D1B2E",
          fontFamily: "Playfair Display, serif",
          fontSize: "13px",
          fontWeight: 600,
          textTransform: "uppercase",
          margin: "2px 0",
        }}
      >
        {postalAddress ? `${postalAddress}, ` : ""}
        {city ?? ""}
      </p>
      <p style={{ fontSize: "11px", margin: "1px 0" }}>Tel: {contact ?? "—"}</p>
      <p style={{ fontSize: "11px", margin: "1px 0" }}>Email: {email ?? "—"}</p>
      <p
        style={{
          fontFamily: "Playfair Display, serif",
          fontWeight: 700,
          fontSize: "14px",
          textTransform: "uppercase",
          marginTop: "10px",
          letterSpacing: "0.12em",
          borderTop: "1px solid #ccc",
          paddingTop: "6px",
        }}
      >
        Student's Terminal Report
      </p>
    </div>

    {/* School logo */}
    <img
      src={buildMediaUrl(logo)}
      alt="School logo"
      style={{
        width: 150,
        height: 150,
        objectFit: "cover",
        objectPosition: "center",
      }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────
// Sub-component: Student Info Grid
// ─────────────────────────────────────────────────────────
interface StudentInfoProps {
  name: string;
  gender: string;
  studentId: string;
  status: string;
  startYear: string;
  endYear: string;
  subLevelName: string;
  academicTermName: string;
  vacationDate?: string;
  reopeningDate?: string;
  programName?: string;
  averageMark: number;
  numberOfStudents: number;
  positionInClass: number;
}

const Row = ({
  left,
  right,
  leftSpan = 2,
  rightSpan = 1,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  leftSpan?: number;
  rightSpan?: number;
}) => (
  <div className="rpt-grid rpt-g3 rpt-bb">
    <div className="rpt-cell rpt-br" style={{ gridColumn: `span ${leftSpan}` }}>
      {left}
    </div>
    <div className="rpt-cell" style={{ gridColumn: `span ${rightSpan}` }}>
      {right}
    </div>
  </div>
);

const F = ({ l, v }: { l: string; v?: string | number }) => (
  <span>
    <span className="rpt-label">{l}: </span>
    <span className="rpt-value">{v ?? "—"}</span>
  </span>
);
const StudentInfoGrid = (p: StudentInfoProps) => {
  return (
    <div className="rpt-border" style={{ marginBottom: 10 }}>
      <Row
        left={<F l="Student Name" v={p.name} />}
        right={<F l="Gender" v={p.gender} />}
      />
      <Row
        leftSpan={1}
        rightSpan={2}
        left={<F l="Student ID" v={p.studentId} />}
        right={
          <div className="rpt-grid rpt-g3">
            <div className="rpt-cell rpt-br">
              <F l="Status" v={p.status} />
            </div>
            <div className="rpt-cell" style={{ gridColumn: "span 2" }}>
              <F l="Academic Year" v={`${p.startYear} – ${p.endYear}`} />
            </div>
          </div>
        }
      />
      <Row
        leftSpan={1}
        rightSpan={2}
        left={<F l="Sub-Level (Class)" v={p.subLevelName} />}
        right={
          <div className="rpt-grid rpt-g3">
            <div className="rpt-cell rpt-br">
              <F l="Term" v={p.academicTermName} />
            </div>
            <div className="rpt-cell" style={{ gridColumn: "span 2" }}>
              <F
                l="Date Vacated"
                v={p.vacationDate ? formatDate(p.vacationDate) : "Not Set"}
              />
            </div>
          </div>
        }
      />
      <Row
        left={<F l="Programme" v={p.programName} />}
        right={
          <F
            l="Next Term Begins"
            v={p.reopeningDate ? formatDate(p.reopeningDate) : "Not Set"}
          />
        }
      />
      {/* Stats row — no bottom border */}
      <div className="rpt-grid rpt-g3">
        <div className="rpt-cell rpt-br">
          <F l="Average Mark" v={Math.round(p.averageMark)} />
        </div>
        <div className="rpt-cell rpt-br">
          <F l="No. On Roll" v={p.numberOfStudents} />
        </div>
        <div className="rpt-cell">
          <F l="Position in Class" v={getOrdinal(p.positionInClass)} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Sub-component: Assessments Table
// ─────────────────────────────────────────────────────────
interface AssessmentTableProps {
  subjects: SubjectReport[];
  assessmentIds: string[];
  assessmentMap: Record<
    string,
    { AssessmentName: string; AssessmentPercentage: number }
  >;
}

const AssessmentTable = ({
  subjects,
  assessmentIds,
  assessmentMap,
}: AssessmentTableProps) => (
  <table className="rpt-table">
    <thead>
      <tr>
        <th className="rpt-th" style={{ width: 28 }}>
          S/N
        </th>
        <th className="rpt-th rpt-th-left">Subject</th>
        {assessmentIds.map((id) => (
          <th key={id} className="rpt-th" style={{ minWidth: 60 }}>
            {capitalizeWords(assessmentMap[id].AssessmentName ?? "")}
            <br />
            <span style={{ fontWeight: 400, fontSize: "9px" }}>
              ({assessmentMap[id].AssessmentPercentage}%)
            </span>
          </th>
        ))}
        <th className="rpt-th" style={{ minWidth: 54 }}>
          Total
          <br />
          <span style={{ fontWeight: 400, fontSize: "9px" }}>(100%)</span>
        </th>
        <th className="rpt-th" style={{ minWidth: 44 }}>
          Pos.
        </th>
        <th className="rpt-th" style={{ minWidth: 40 }}>
          Grade
        </th>
        <th className="rpt-th" style={{ minWidth: 60 }}>
          Remark
        </th>
        <th className="rpt-th" style={{ minWidth: 42 }}>
          Tchr.
        </th>
      </tr>
    </thead>
    <tbody>
      {subjects.map((row, i) => (
        <tr
          key={row.subjectId}
          style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}
        >
          <td className="rpt-td">{i + 1}</td>
          <td className="rpt-td rpt-td-left">{row.subjectName}</td>
          {assessmentIds.map((id) => {
            const found = row.assessments.find((a) => a.assessmentId === id);
            return (
              <td key={id} className="rpt-td">
                {found ? round2(found.scaledMarks) : "—"}
              </td>
            );
          })}
          <td className="rpt-td" style={{ fontWeight: 700 }}>
            {round2(row.total)}
          </td>
          <td className="rpt-td">
            {row.positionInSubject > 0 ? row.positionInSubject : "—"}
          </td>
          <td className="rpt-td" style={{ fontWeight: 700 }}>
            {row.gradings?.grade || "—"}
          </td>
          <td className="rpt-td">
            {capitalizeWords(row.gradings?.remark ?? "") || "—"}
          </td>
          <td className="rpt-td">{getInitials(row.teacherName)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

// ─────────────────────────────────────────────────────────
// Sub-component: Footer section (attendance, remarks, notice)
// ─────────────────────────────────────────────────────────
interface ReportFooterProps {
  attendedDays?: number;
  schoolDays?: number;
  headmasterRemarks?: string;
  notice?: string;
  gradingSystem: Array<{
    from: number;
    to: number;
    grade: string;
    remark: string;
    educationalLevelId: string;
  }>;
  qrValue: string;
}

const ReportFooter = ({
  // attendedDays,
  // schoolDays,
  headmasterRemarks,
  // notice,
  gradingSystem,
  qrValue,
}: ReportFooterProps) => (
  <>
    {/* Attendance + Headmaster */}
    <div className="rpt-border" style={{ marginBottom: 10 }}>
      <div
        className="rpt-grid rpt-bb"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        <div className="rpt-cell rpt-br">
          <span className="rpt-label">Attendance: </span>
          <span className="rpt-value">
            {/* {attendedDays ?? "—"} / {schoolDays ?? "—"} days */}
            {"--"}
          </span>
        </div>
        <div className="rpt-cell">
          <span className="rpt-label">Aggregate: </span>
          <span className="rpt-value">—</span>
        </div>
      </div>
      <div
        className="rpt-grid rpt-bb"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        <div className="rpt-cell rpt-br">
          <span className="rpt-label">Headmaster/Mistress Name</span>
        </div>
        <div className="rpt-cell">
          <span className="rpt-value">
            {/* {headmasterRemarks ?? "Not Provided"} */}--
          </span>
        </div>
      </div>
      <div className="rpt-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="rpt-cell rpt-br">
          <span className="rpt-label">Class Teacher's Remark</span>
        </div>
        <div className="rpt-cell">
          <span className="rpt-value">
            {headmasterRemarks ?? "Not Provided"}
          </span>
        </div>
      </div>
    </div>

    {/* Notice + Grading system + QR */}
    <div className="rpt-grid rpt-g51" style={{ gap: 12 }}>
      <div className="rpt-border">
        {/* <div className="rpt-section-bar">Notice</div>
        <div
          className="rpt-cell"
          style={{ minHeight: 40, padding: "6px" }}
          dangerouslySetInnerHTML={{ __html: notice ?? "—" }}
        /> */}
        <div className="rpt-section-bar" style={{ marginTop: 4 }}>
          Grade Interpretation
        </div>
        <div
          className="rpt-cell"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2px 10px",
            padding: "5px 8px",
          }}
        >
          {gradingSystem.map((g) => (
            <span
              key={g.educationalLevelId}
              style={{ fontSize: "10px", whiteSpace: "nowrap" }}
            >
              <strong>{g.grade}</strong> ({g.from}–{g.to}):{" "}
              {capitalizeWords(g.remark ?? "")}
            </span>
          ))}
        </div>
      </div>

      {/* QR code */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <QRCode value={qrValue} size={100} />
        <span style={{ fontSize: "8px", textAlign: "center", color: "#666" }}>
          Scan to verify
        </span>
      </div>
    </div>
  </>
);

// ─────────────────────────────────────────────────────────
// THE REPORT DOCUMENT — id="report-print-root"
// This is what gets printed and PDF-exported.
// ─────────────────────────────────────────────────────────
interface ReportDocumentProps {
  data: StudentTerminalReportGet;
  normalizedSubjects: SubjectReport[];
  assessmentIds: string[];
  assessmentMap: Record<
    string,
    { AssessmentName: string; AssessmentPercentage: number }
  >;
  averageMark: number;
}

export const ReportDocument = ({
  data,
  normalizedSubjects,
  assessmentIds,
  assessmentMap,
  averageMark,
}: ReportDocumentProps) => {
  const d = data.studentDetails;
  const vac = data.vacation?.[0];
  const fullName = `${d.firstName} ${d.surname}${d.otherName ? " " + d.otherName : ""}`;

  return (
    <div
      id="report-print-root"
      className="rpt-root"
      style={{ padding: "0", width: "100%" }}
    >
      <ReportHeader
        institutionName={data.institution.name}
        postalAddress={data.institution.postalAddress}
        city={data.institution.city}
        contact={data.institution.contact}
        email={data.institution.email}
        logo={data.institution.logo}
        studentImage={d.studentImage}
      />

      <StudentInfoGrid
        name={fullName}
        gender={d.gender}
        studentId={d.studentId}
        status={d.status}
        startYear={d.startYear}
        endYear={d.endYear}
        subLevelName={d.subLevelName}
        academicTermName={d.academicTermName}
        vacationDate={vac?.vacationDate}
        reopeningDate={vac?.reopeningDate}
        programName={d.programName}
        averageMark={averageMark}
        numberOfStudents={d.numberOfStudentInSublevel}
        positionInClass={data.subLevelPosition.positionInSubLevel}
      />

      <AssessmentTable
        subjects={normalizedSubjects}
        assessmentIds={assessmentIds}
        assessmentMap={assessmentMap}
      />

      <ReportFooter
        attendedDays={data.studentAttendance.attendedDays}
        schoolDays={data.studentAttendance.schoolDays}
        headmasterRemarks={data.remarks}
        notice={vac?.notice}
        gradingSystem={data.gradingSystem}
        qrValue={`${window.location.origin}/verify/report/${d.studentId}`}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Screen UI helpers
// ─────────────────────────────────────────────────────────
export const StatChip = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div
    className="flex items-center gap-x-2.5 bg-white border border-slate-100 rounded-xl px-3.5 py-2.5"
    style={{ boxShadow: "0 1px 6px rgba(13,27,46,0.06)" }}
  >
    <div className="w-7 h-7 rounded-lg bg-[#EEF2F8] flex items-center justify-center text-[#1E3A5F] shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">
        {label}
      </p>
      <p
        className="text-sm font-bold text-[#0D1B2E] leading-tight mt-0.5"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {value}
      </p>
    </div>
  </div>
);
