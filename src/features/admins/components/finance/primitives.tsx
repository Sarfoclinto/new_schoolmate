import { fmt } from "@/services/currency";
import type { StudentBill, SubLedgerBill } from "@/types/api/finance";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  TrendingUp,
} from "lucide-react";
import type React from "react";

const SortIcon = ({
  col,
  active,
  dir,
}: {
  col: string;
  active: string;
  dir: "asc" | "desc";
}) => {
  if (active !== col)
    return (
      <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline-block shrink-0" />
    );
  return dir === "asc" ? (
    <ArrowUp className="w-3 h-3 text-[#C9A84C] ml-1 inline-block shrink-0" />
  ) : (
    <ArrowDown className="w-3 h-3 text-[#C9A84C] ml-1 inline-block shrink-0" />
  );
};

function balanceColor(balance: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (balance <= 0)
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    };
  if (balance <= 200)
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    };
  return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
}

type TableProps = {
  children: React.ReactNode;
  tableMinW: number;
};
export const ClassBillTable = ({ children, tableMinW }: TableProps) => {
  return (
    <table
      style={{
        minWidth: `${tableMinW}px`,
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
      }}
    >
      {children}
    </table>
  );
};

type TableHeadProps = {
  toggleSort: (col: string) => void;
  sortCol: string;
  sortDir: "asc" | "desc";
  allSubLedgers: { code: string; name: string }[];
  slSpotlight: string | null;
  actionColWidth: number;
};
export const ClassBillTabelHead = ({
  toggleSort,
  allSubLedgers,
  slSpotlight,
  sortCol,
  sortDir,
  actionColWidth,
}: TableHeadProps) => {
  return (
    <thead>
      <tr style={{ background: "#F8FAFC" }}>
        {/* # sticky */}
        <th
          style={{
            position: "sticky",
            left: 0,
            zIndex: 3,
            background: "#F8FAFC",
            width: 44,
            minWidth: 44,
            padding: "10px 8px",
            borderBottom: "1px solid #E2E8F0",
            borderRight: "1px solid #E2E8F0",
            textAlign: "center",
            fontSize: "11px",
            fontWeight: 700,
            color: "#64748B",
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          #
        </th>

        {/* Name sticky */}
        <th
          onClick={() => toggleSort("fullName")}
          style={{
            position: "sticky",
            left: 44,
            zIndex: 3,
            background: "#F8FAFC",
            minWidth: 200,
            padding: "10px 14px",
            cursor: "pointer",
            borderBottom: "1px solid #E2E8F0",
            borderRight: "1px solid #E2E8F0",
            textAlign: "left",
            fontSize: "11px",
            fontWeight: 700,
            color: "#64748B",
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          Student <SortIcon col="fullName" active={sortCol} dir={sortDir} />
        </th>

        {/* Sub-ledger columns */}
        {allSubLedgers.map((sl) => (
          <th
            key={sl.code}
            onClick={() => toggleSort(sl.code)}
            style={{
              minWidth: 120,
              padding: "10px 10px",
              cursor: "pointer",
              borderBottom: "1px solid #E2E8F0",
              borderRight: "1px solid #EEF2F8",
              textAlign: "center",
              fontSize: "10px",
              fontWeight: 700,
              color: slSpotlight === sl.code ? "#1E3A5F" : "#94A3B8",
              background: slSpotlight === sl.code ? "#EEF2F8" : "#F8FAFC",
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
              maxWidth: 150,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {sl.name.length > 14 ? sl.name.slice(0, 13) + "…" : sl.name}
            <br />
            <span
              style={{
                fontWeight: 400,
                fontSize: "9px",
                color: "#CBD5E1",
              }}
            >
              balance
            </span>
            <SortIcon col={sl.code} active={sortCol} dir={sortDir} />
          </th>
        ))}

        {/* Sticky right: Debit / Credit / Balance */}
        {[
          { key: "totalDebit", label: "Billed", sub: "total debit" },
          { key: "totalCredit", label: "Paid", sub: "total credit" },
          { key: "balance", label: "Balance", sub: "outstanding" },
        ].map((col) => (
          <th
            key={col.key}
            onClick={() => toggleSort(col.key)}
            style={{
              position: col.key === "balance" ? "sticky" : undefined,
              right: col.key === "balance" ? 56 : undefined,
              zIndex: col.key === "balance" ? 3 : 1,
              background: "#EEF2F8",
              minWidth: 100,
              padding: "10px 10px",
              cursor: "pointer",
              borderBottom: "1px solid #E2E8F0",
              borderLeft: "1px solid #D0DCF0",
              textAlign: "center",
              fontSize: "11px",
              fontWeight: 700,
              color: "#1E3A5F",
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {col.label}
            <br />
            <span
              style={{
                fontWeight: 400,
                fontSize: "9px",
                color: "#94A3B8",
              }}
            >
              {col.sub}
            </span>
            <SortIcon col={col.key} active={sortCol} dir={sortDir} />
          </th>
        ))}

        {/* Action sticky far-right */}
        <th
          style={{
            position: "sticky",
            right: 0,
            zIndex: 3,
            background: "#EEF2F8",
            width: actionColWidth,
            minWidth: actionColWidth,
            padding: "10px 8px",
            borderBottom: "1px solid #E2E8F0",
            borderLeft: "1px solid #D0DCF0",
            textAlign: "center",
            fontSize: "10px",
            fontWeight: 700,
            color: "#94A3B8",
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          Pay / View
        </th>
      </tr>
    </thead>
  );
};
type SnColTypes = {
  rowBg: "#FFFFFF" | "#FAFBFD";
  sn: number;
};
export const ClassBillSnCol = ({ sn, rowBg }: SnColTypes) => (
  <td
    style={{
      position: "sticky",
      left: 0,
      zIndex: 1,
      background: rowBg,
      width: 44,
      padding: "9px 6px",
      borderBottom: "1px solid #F1F5F9",
      borderRight: "1px solid #E2E8F0",
      textAlign: "center",
      fontSize: "12px",
      color: "#94A3B8",
      fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    {sn}
  </td>
);

type SubLedgerRole = {
  allSubLedgers: {
    code: string;
    name: string;
  }[];
  slSpotlight: string | null;
  rowBg: "#FFFFFF" | "#FAFBFD";
  overrideCollors: boolean;
  subLedgerBills: SubLedgerBill[];
};

export const SubLedgerBalanceCell = ({
  allSubLedgers,
  rowBg,
  slSpotlight,
  overrideCollors,
  subLedgerBills,
}: SubLedgerRole) => {
  return allSubLedgers.map((sl) => {
    const found = subLedgerBills.find((s) => s.slCode === sl.code);
    const bal = found?.balance;
    const isSpot = slSpotlight === sl.code;
    const heat = typeof bal === "number" ? balanceColor(bal) : null;
    const barPct =
      found && found.debit > 0
        ? Math.min(100, (found.credit / found.debit) * 100)
        : 0;

    return (
      <td
        key={sl.code}
        style={{
          minWidth: 120,
          padding: "7px 10px",
          borderBottom: "1px solid #F1F5F9",
          borderRight: "1px solid #EEF2F8",
          textAlign: "center",
          background: isSpot ? "#EEF2F8" : rowBg,
        }}
      >
        {found && typeof bal === "number" ? (
          <div>
            <span
              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${overrideCollors ? "bg-emerald-50" : heat!.bg} ${overrideCollors ? "text-emerald-700" : heat!.text} ${overrideCollors ? "border-emerald-200" : heat!.border}`}
            >
              {fmt(bal)}
            </span>
            <div
              style={{
                display: "flex",
                gap: "4px",
                marginTop: 2,
                justifyContent: "center",
                fontSize: "9px",
                color: "#94A3B8",
              }}
            >
              <span>Dr:{found.debit.toFixed(0)}</span>
              <span>Cr:{found.credit.toFixed(0)}</span>
            </div>
            <div
              style={{
                height: 2,
                background: "#E2E8F0",
                borderRadius: 4,
                marginTop: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 4,
                  width: overrideCollors ? "100%" : `${barPct}%`,
                  background: overrideCollors
                    ? "#10B981"
                    : barPct >= 100
                      ? "#10B981"
                      : barPct >= 60
                        ? "#F59E0B"
                        : "#EF4444",
                }}
              />
            </div>
          </div>
        ) : (
          <span style={{ color: "#E2E8F0", fontSize: "11px" }}>—</span>
        )}
      </td>
    );
  });
};

type StudentRowProps = {
  student: StudentBill;
  idx: number;
  allSubLedgers: {
    code: string;
    name: string;
  }[];
  setDrawerStudent: (value: React.SetStateAction<StudentBill | null>) => void;
  handlePayment: (student: StudentBill) => void;
  slSpotlight: string | null;
  actionColWidth: number;
};
export const StudentRow = ({
  student,
  idx,
  allSubLedgers,
  slSpotlight,
  actionColWidth,
  handlePayment,
  setDrawerStudent,
}: StudentRowProps) => {
  const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#FAFBFD";
  const balHeat = balanceColor(student.balance);
  const isFullyPaid = student.balance <= 0;
  const isOverpaid = student.balance < 0;
  const overrideCollors = isFullyPaid || isOverpaid;
  const initials = student.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
  const creditPct =
    student.totalDebit > 0
      ? Math.min(100, (student.totalCredit / student.totalDebit) * 100)
      : 0;
  return (
    <tr key={student.studentId}>
      {/* # */}
      <ClassBillSnCol rowBg={rowBg} sn={idx + 1} />

      {/* Name */}
      <td
        style={{
          position: "sticky",
          left: 44,
          zIndex: 1,
          background: rowBg,
          minWidth: 200,
          padding: "8px 14px",
          borderBottom: "1px solid #F1F5F9",
          borderRight: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              color: "#C9A84C",
              background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#0D1B2E",
                fontFamily: "'DM Sans', sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {student.fullName}
            </div>
            {student.otherName && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#94A3B8",
                  marginTop: 1,
                }}
              >
                {student.otherName}
              </div>
            )}
            {/* Mini progress bar */}
            <div
              style={{
                height: 2,
                background: "#EEF2F8",
                borderRadius: 4,
                marginTop: 3,
                overflow: "hidden",
                width: "100%",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 4,
                  width: `${creditPct}%`,
                  background:
                    creditPct >= 100
                      ? "#10B981"
                      : creditPct >= 60
                        ? "#F59E0B"
                        : "#EF4444",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
          {/* Status icon */}
          {isOverpaid && (
            <span title="Overpaid" style={{ color: "#7C3AED", flexShrink: 0 }}>
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          )}
          {isFullyPaid && !isOverpaid && (
            <span
              title="Fully Paid"
              style={{ color: "#059669", flexShrink: 0 }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </td>

      {/* Sub-ledger balance cells */}
      <SubLedgerBalanceCell
        allSubLedgers={allSubLedgers}
        rowBg={rowBg}
        slSpotlight={slSpotlight}
        overrideCollors={overrideCollors}
        subLedgerBills={student.subLedgerBill}
      />

      {/* Billed (Debit) */}
      <td
        style={{
          minWidth: 100,
          padding: "8px 10px",
          borderBottom: "1px solid #F1F5F9",
          borderLeft: "1px solid #D0DCF0",
          textAlign: "right",
          background: "#F8FAFC",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#0D1B2E",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {fmt(student.totalDebit)}
        </span>
      </td>

      {/* Paid (Credit) */}
      <td
        style={{
          minWidth: 100,
          padding: "8px 10px",
          borderBottom: "1px solid #F1F5F9",
          borderLeft: "1px solid #D0DCF0",
          textAlign: "right",
          background: "#F8FAFC",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: student.totalCredit > 0 ? "#059669" : "#94A3B8",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {fmt(student.totalCredit)}
        </span>
      </td>

      {/* Balance — sticky right, heat-coloured */}
      <td
        style={{
          position: "sticky",
          right: 56,
          zIndex: 1,
          minWidth: 100,
          padding: "8px 5px",
          borderBottom: "1px solid #D0DCF0",
          borderLeft: "1px solid #D0DCF0",
          textAlign: "right",
          background: rowBg,
        }}
      >
        <div
          className={`inline-flex items-center justify-center flex-col gap-1. px-2.5 py-1.5. rounded-lg border ${balHeat.bg} ${balHeat.text} ${balHeat.border}`}
          style={{
            minWidth: "100px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              fontFamily: "'DM Sans', sans-serif",
            }}
            className="text-nowrap! min-w-fit"
          >
            {fmt(student.balance)}
          </span>
          {isOverpaid && (
            <div
              style={{
                fontSize: "9px",
                fontWeight: 600,
              }}
            >
              overpaid
            </div>
          )}
          {isFullyPaid && !isOverpaid && (
            <div
              style={{
                fontSize: "9px",
                fontWeight: 600,
              }}
            >
              cleared
            </div>
          )}
        </div>
      </td>

      {/* Action */}
      <td
        style={{
          position: "sticky",
          right: 0,
          zIndex: 1,
          background: rowBg,
          width: actionColWidth,
          minWidth: actionColWidth,
          padding: "8px 3px",
          borderBottom: "1px solid #F1F5F9",
          borderLeft: "1px solid #D0DCF0",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60px",
          columnGap: "2px",
        }}
      >
        <button
          type="button"
          onClick={() => setDrawerStudent(student)}
          title={`View ${student.fullName}'s ledger`}
          className="w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-110"
          style={{
            background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
          }}
        >
          <Eye className="w-3.5 h-3.5 text-[#C9A84C]" />
        </button>
        <button
          type="button"
          onClick={() => handlePayment(student)}
          title={`Pay ${student.fullName}'s ledger`}
          className="w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-110"
          style={{
            background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
          }}
        >
          <CircleDollarSign className="w-3.5 h-3.5 text-[#C9A84C]" />
        </button>
      </td>
    </tr>
  );
};

type TableBodyProps = {
  filteredRows: StudentBill[];
  allSubLedgers: { code: string; name: string }[];
  slSpotlight: string | null;
  setDrawerStudent: (value: React.SetStateAction<StudentBill | null>) => void;
  handlePayment: (student: StudentBill) => void;
  actionColWidth: number;
};

export const ClassBillTableBody = ({
  filteredRows,
  allSubLedgers,
  slSpotlight,
  actionColWidth,
  handlePayment,
  setDrawerStudent,
}: TableBodyProps) => {
  return filteredRows.map((student, idx) => (
    <StudentRow
      key={student.studentId}
      student={student}
      idx={idx}
      allSubLedgers={allSubLedgers}
      slSpotlight={slSpotlight}
      handlePayment={handlePayment}
      setDrawerStudent={setDrawerStudent}
      actionColWidth={actionColWidth}
    />
  ));
};

type ClassBillFooterMetaProps = {
  filteredRowsLength: number;
  subLevelName?: string;
  isTermScoped: boolean;
  termName?: string;
  yearName?: string;
  classBillLength: number;
};

export const ClassBillTableFooterMeta = ({
  filteredRowsLength,
  isTermScoped,
  subLevelName,
  termName,
  yearName,
  classBillLength,
}: ClassBillFooterMetaProps) => {
  if (filteredRowsLength === 0) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex-wrap gap-2">
      <span className="text-[11px] text-slate-400 font-medium">
        {filteredRowsLength} of {classBillLength || 0} students
        {subLevelName && ` · ${subLevelName}`}
        {isTermScoped ? ` · ${termName} (${yearName})` : " · All time"}
      </span>
      <div className="flex items-center gap-x-3 text-[10px] text-slate-400 flex-wrap gap-y-1">
        <span className="flex items-center gap-x-1">
          <span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" />
          Balance cleared
        </span>
        <span className="flex items-center gap-x-1">
          <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
          Balance ≤ 200
        </span>
        <span className="flex items-center gap-x-1">
          <span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" />
          Balance &gt; 200
        </span>
        <span className="flex items-center gap-x-1">
          <span className="w-2 h-2 rounded-sm bg-violet-400 inline-block" />
          Overpaid
        </span>
      </div>
    </div>
  );
};

type ClassBillFooterProps = {
  filteredRows: StudentBill[];
  allSubLedgers: { code: string; name: string }[];
  slSpotlight: string | null;
};

export const ClassbillFooter = ({
  allSubLedgers,
  filteredRows,
  slSpotlight,
}: ClassBillFooterProps) => {
  if (filteredRows.length === 0) return null;
  return (
    <tfoot>
      <tr
        style={{
          background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
        }}
      >
        <td
          style={{
            position: "sticky",
            left: 0,
            zIndex: 2,
            background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
            padding: "10px 8px",
            textAlign: "center",
            borderTop: "1px solid #1E3A5F",
          }}
        />
        <td
          style={{
            position: "sticky",
            left: 44,
            zIndex: 2,
            background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
            padding: "10px 14px",
            borderTop: "1px solid #1E3A5F",
            fontSize: "12px",
            fontWeight: 800,
            color: "#C9A84C",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Class Total
        </td>
        {allSubLedgers.map((sl) => {
          const total = filteredRows.reduce((sum, s) => {
            const found = s.subLedgerBill.find((sl2) => sl2.slCode === sl.code);
            return sum + (found?.balance ?? 0);
          }, 0);
          const heat = balanceColor(total);
          return (
            <td
              key={sl.code}
              style={{
                minWidth: 120,
                padding: "10px 10px",
                borderTop: "1px solid #1E3A5F",
                textAlign: "center",
                background:
                  slSpotlight === sl.code
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
              }}
            >
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${heat.bg} ${heat.text} ${heat.border}`}
              >
                {fmt(total)}
              </span>
            </td>
          );
        })}
        {/* Billed total */}
        <td
          style={{
            minWidth: 100,
            padding: "10px 10px",
            borderTop: "1px solid #1E3A5F",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            textAlign: "right",
            fontSize: "12px",
            fontWeight: 800,
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {fmt(filteredRows.reduce((s, r) => s + r.totalDebit, 0))}
        </td>
        {/* Paid total */}
        <td
          style={{
            minWidth: 100,
            padding: "10px 10px",
            borderTop: "1px solid #1E3A5F",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            textAlign: "right",
            fontSize: "12px",
            fontWeight: 800,
            color: "#C9A84C",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {fmt(filteredRows.reduce((s, r) => s + r.totalCredit, 0))}
        </td>
        {/* Balance total sticky */}
        <td
          style={{
            position: "sticky",
            right: 56,
            zIndex: 2,
            minWidth: 100,
            padding: "10px 10px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            textAlign: "right",
            fontSize: "12px",
            fontWeight: 800,
            color:
              filteredRows.reduce((s, r) => s + r.balance, 0) <= 0
                ? "#10B981"
                : "#F87171",
            background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {fmt(filteredRows.reduce((s, r) => s + r.balance, 0))}
        </td>
        {/* Action col spacer */}
        <td
          style={{
            position: "sticky",
            right: 0,
            zIndex: 2,
            background: "linear-gradient(135deg,#0D1B2E 0%,#1E3A5F 100%)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
          }}
        />
      </tr>
    </tfoot>
  );
};
