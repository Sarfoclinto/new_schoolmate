/**
 * util-component.tsx
 *
 * ALL styling is inline (no Tailwind classes on the report components).
 * This guarantees html2canvas never encounters oklch() color values,
 * and the print window receives a fully self-contained document.
 *
 * Screen-only components (StatChip) may still use Tailwind — they are
 * never captured by html2canvas or copied into the print window.
 */

import type {
  StudentTerminalReportGet,
  SubjectReport,
} from "@/types/api/student";
import { round2 } from "./util-fn";
import { capitalizeWords, getInitials, getOrdinal } from "@/utils/string";
// import { QRCode } from "antd";
import { buildMediaUrl } from "@/utils/media";
import { formatDate } from "@/utils/date-n-time";

// ─── Shared inline style tokens ───────────────────────────────────────────────
const BORDER = "1px solid #000";
const FONT_SZ = "11px";
const FONT = "'Times New Roman', Times, serif";
const COLOR = "#000";
const BG = "#fff";

// ─────────────────────────────────────────────────────────────────────────────
// ReportHeader
// ─────────────────────────────────────────────────────────────────────────────
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
    style={{
      display: "grid",
      gridTemplateColumns: "165px 1fr 165px",
      gap: "20px",
      alignItems: "center",
      padding: "10px 20px 14px",
      borderBottom: "2px solid #000",
      marginBottom: "8px",
      backgroundColor: BG,
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
        marginLeft: "auto",
        display: "block",
      }}
    />

    {/* Centre text */}
    <div
      style={{
        textAlign: "center",
        lineHeight: "1.6",
        fontFamily: FONT,
        color: COLOR,
      }}
    >
      <p
        style={{
          fontFamily: "'Playfair Display', 'Georgia', serif",
          fontSize: "17px",
          fontWeight: 700,
          textTransform: "uppercase",
          margin: 0,
          color: "#0D1B2E",
        }}
      >
        {institutionName ?? "Institution Name"}
      </p>
      <p
        style={{
          fontFamily: "'Playfair Display', 'Georgia', serif",
          fontSize: "13px",
          fontWeight: 600,
          textTransform: "uppercase",
          margin: "2px 0",
          color: "#0D1B2E",
        }}
      >
        {postalAddress ? `${postalAddress}, ` : ""}
        {city ?? ""}
      </p>
      <p
        style={{
          fontSize: "11px",
          margin: "1px 0",
          fontFamily: FONT,
          color: COLOR,
        }}
      >
        Tel: {contact ?? "—"}
      </p>
      <p
        style={{
          fontSize: "11px",
          margin: "1px 0",
          fontFamily: FONT,
          color: COLOR,
        }}
      >
        Email: {email ?? "—"}
      </p>
      <p
        style={{
          fontFamily: "'Playfair Display', 'Georgia', serif",
          fontWeight: 700,
          fontSize: "14px",
          textTransform: "uppercase",
          marginTop: "10px",
          letterSpacing: "0.12em",
          borderTop: "1px solid #ccc",
          paddingTop: "6px",
          color: "#0D1B2E",
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

// ─────────────────────────────────────────────────────────────────────────────
// StudentInfoGrid
// ─────────────────────────────────────────────────────────────────────────────

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

// Tiny helpers for the grid info rows
const cellStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  padding: "3px 6px",
  fontSize: FONT_SZ,
  fontFamily: FONT,
  color: COLOR,
  ...extra,
});

const labelStyle: React.CSSProperties = {
  fontWeight: 400,
  color: "#555",
  fontSize: FONT_SZ,
  fontFamily: FONT,
};

const valueStyle: React.CSSProperties = {
  fontWeight: 700,
  textTransform: "uppercase",
  fontSize: FONT_SZ,
  fontFamily: FONT,
  color: COLOR,
};

const F = ({ l, v }: { l: string; v?: string | number }) => (
  <span>
    <span style={labelStyle}>{l}: </span>
    <span style={valueStyle}>{v ?? "—"}</span>
  </span>
);

const InfoRow = ({
  cols,
  borderBottom = true,
}: {
  cols: React.ReactNode[];
  borderBottom?: boolean;
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
      borderBottom: borderBottom ? BORDER : undefined,
    }}
  >
    {cols.map((col, i) => (
      <div
        key={i}
        style={cellStyle({
          borderRight: i < cols.length - 1 ? BORDER : undefined,
        })}
      >
        {col}
      </div>
    ))}
  </div>
);

const StudentInfoGrid = (p: StudentInfoProps) => (
  <div style={{ border: BORDER, marginBottom: 10, backgroundColor: BG }}>
    <InfoRow
      cols={[<F l="Student Name" v={p.name} />, <F l="Gender" v={p.gender} />]}
    />
    <InfoRow
      cols={[
        <F l="Student ID" v={p.studentId} />,
        <F l="Status" v={p.status} />,
        <F l="Academic Year" v={`${p.startYear} – ${p.endYear}`} />,
      ]}
    />
    <InfoRow
      cols={[
        <F l="Sub-Level (Class)" v={p.subLevelName} />,
        <F l="Term" v={p.academicTermName} />,
        <F
          l="Date Vacated"
          v={p.vacationDate ? formatDate(p.vacationDate) : "Not Set"}
        />,
      ]}
    />
    <InfoRow
      cols={[
        <F l="Programme" v={p.programName} />,
        <F
          l="Next Term Begins"
          v={p.reopeningDate ? formatDate(p.reopeningDate) : "Not Set"}
        />,
      ]}
    />
    <InfoRow
      borderBottom={false}
      cols={[
        <F l="Average Mark" v={Math.round(p.averageMark)} />,
        <F l="No. On Roll" v={p.numberOfStudents} />,
        <F l="Position in Class" v={getOrdinal(p.positionInClass)} />,
      ]}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// AssessmentTable
// ─────────────────────────────────────────────────────────────────────────────

interface AssessmentTableProps {
  subjects: SubjectReport[];
  assessmentIds: string[];
  assessmentMap: Record<
    string,
    { AssessmentName: string; AssessmentPercentage: number }
  >;
}

const thStyle: React.CSSProperties = {
  border: BORDER,
  padding: "4px 5px",
  backgroundColor: "#f0f0f0",
  textAlign: "center",
  fontSize: "10px",
  fontWeight: 700,
  fontFamily: FONT,
  color: COLOR,
};

const tdStyle: React.CSSProperties = {
  border: BORDER,
  padding: "3px 5px",
  textAlign: "center",
  fontSize: "10px",
  fontFamily: FONT,
  color: COLOR,
};

const AssessmentTable = ({
  subjects,
  assessmentIds,
  assessmentMap,
}: AssessmentTableProps) => (
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "12px",
      backgroundColor: BG,
    }}
  >
    <thead>
      <tr>
        <th style={{ ...thStyle, width: 28 }}>S/N</th>
        <th style={{ ...thStyle, textAlign: "left" }}>Subject</th>
        {assessmentIds.map((id) => (
          <th key={id} style={{ ...thStyle, minWidth: 60 }}>
            {capitalizeWords(assessmentMap[id].AssessmentName ?? "")}
            <br />
            <span style={{ fontWeight: 400, fontSize: "9px" }}>
              ({assessmentMap[id].AssessmentPercentage}%)
            </span>
          </th>
        ))}
        <th style={{ ...thStyle, minWidth: 54 }}>
          Total
          <br />
          <span style={{ fontWeight: 400, fontSize: "9px" }}>(100%)</span>
        </th>
        <th style={{ ...thStyle, minWidth: 44 }}>Pos.</th>
        <th style={{ ...thStyle, minWidth: 40 }}>Grade</th>
        <th style={{ ...thStyle, minWidth: 60 }}>Remark</th>
        <th style={{ ...thStyle, minWidth: 42 }}>Tchr.</th>
      </tr>
    </thead>
    <tbody>
      {subjects.map((row, i) => (
        <tr
          key={row.subjectId}
          style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}
        >
          <td style={tdStyle}>{i + 1}</td>
          <td style={{ ...tdStyle, textAlign: "left", paddingLeft: 8 }}>
            {row.subjectName}
          </td>
          {assessmentIds.map((id) => {
            const found = row.assessments.find((a) => a.assessmentId === id);
            return (
              <td key={id} style={tdStyle}>
                {found ? round2(found.scaledMarks) : "—"}
              </td>
            );
          })}
          <td style={{ ...tdStyle, fontWeight: 700 }}>{round2(row.total)}</td>
          <td style={tdStyle}>
            {row.positionInSubject > 0 ? row.positionInSubject : "—"}
          </td>
          <td style={{ ...tdStyle, fontWeight: 700 }}>
            {row.gradings?.grade || "—"}
          </td>
          <td style={tdStyle}>
            {capitalizeWords(row.gradings?.remark ?? "") || "—"}
          </td>
          <td style={tdStyle}>{getInitials(row.teacherName)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

// ─────────────────────────────────────────────────────────────────────────────
// ReportFooter
// ─────────────────────────────────────────────────────────────────────────────

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

const sectionBar: React.CSSProperties = {
  textAlign: "center",
  fontWeight: 700,
  fontSize: "12px",
  padding: "4px",
  borderBottom: BORDER,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  fontFamily: FONT,
  color: COLOR,
  backgroundColor: "#f0f0f0",
};

const ReportFooter = ({
  headmasterRemarks,
  gradingSystem,
  // qrValue,
}: ReportFooterProps) => (
  <>
    {/* Attendance + Headmaster block */}
    <div style={{ border: BORDER, marginBottom: 10, backgroundColor: BG }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: BORDER,
        }}
      >
        <div style={cellStyle({ borderRight: BORDER })}>
          <span style={labelStyle}>Attendance: </span>
          <span style={valueStyle}>—</span>
        </div>
        <div style={cellStyle()}>
          <span style={labelStyle}>Aggregate: </span>
          <span style={valueStyle}>—</span>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: BORDER,
        }}
      >
        <div style={cellStyle({ borderRight: BORDER })}>
          <span style={labelStyle}>Headmaster/Mistress Name</span>
        </div>
        <div style={cellStyle()}>
          <span style={valueStyle}>—</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={cellStyle({ borderRight: BORDER })}>
          <span style={labelStyle}>Class Teacher's Remark</span>
        </div>
        <div style={cellStyle()}>
          <span style={valueStyle}>{headmasterRemarks ?? "Not Provided"}</span>
        </div>
      </div>
    </div>

    {/* Grading system + QR */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "12px",
        backgroundColor: BG,
      }}
    >
      <div style={{ border: BORDER }}>
        <div style={sectionBar}>Grade Interpretation</div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2px 10px",
            padding: "5px 8px",
            fontFamily: FONT,
            color: COLOR,
          }}
        >
          {gradingSystem.map((g, idx) => (
            <span
              key={`${g.educationalLevelId}-${idx}`}
              style={{ fontSize: "10px", whiteSpace: "nowrap" }}
            >
              <strong>{g.grade}</strong> ({g.from}–{g.to}):{" "}
              {capitalizeWords(g.remark ?? "")}
            </span>
          ))}
        </div>
      </div>

      {/* QR code */}
      {/* <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <QRCode value={qrValue} size={100} />
        <span
          style={{
            fontSize: "8px",
            textAlign: "center",
            color: "#666",
            fontFamily: FONT,
          }}
        >
          Scan to verify
        </span>
      </div> */}
    </div>
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// ReportDocument — the printable root
// ─────────────────────────────────────────────────────────────────────────────

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
      style={{
        fontFamily: FONT,
        fontSize: FONT_SZ,
        lineHeight: "1.5",
        color: COLOR,
        backgroundColor: BG,
        padding: 0,
        width: "100%",
      }}
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
        // vacationDate={vac?.vacationDate}
        // reopeningDate={vac?.reopeningDate}
        vacationDate={data.dates.vacationTermDate}
        reopeningDate={data.dates.reopeningTermDate}
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

// ─────────────────────────────────────────────────────────────────────────────
// StatChip — screen-only, Tailwind is fine here (never captured)
// ─────────────────────────────────────────────────────────────────────────────

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
