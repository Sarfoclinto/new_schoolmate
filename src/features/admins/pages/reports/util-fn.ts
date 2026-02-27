import type { SubjectReport } from "@/types/api/student";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const normalizeSubjects = (raw: any[]): SubjectReport[] =>
  raw.map((s) => ({
    ...s,
    gradings: typeof s.gradings === "string" ? JSON.parse(s.gradings) : s.gradings,
    assessments: s.assessments || [],
  }));

export const round2 = (n: number) => (typeof n === "number" && !isNaN(n) ? n.toFixed(2) : "—");

export 
// ─────────────────────────────────────────────────────────
// Print styles — injected once into <head>
// ─────────────────────────────────────────────────────────
const PRINT_STYLES = `
@media print {
  /* Hide everything except the report document */
  body > * { display: none !important; }
  #report-print-host { display: block !important; }

  #report-print-host {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: #fff;
    z-index: 99999;
    padding: 0;
    margin: 0;
  }

  @page {
    size: A4 portrait;
    margin: 10mm 12mm;
  }
}

/* Report document base styles — applied both on-screen (inside the card)
   and at print time */
.rpt-root {
  font-family: 'Times New Roman', Times, serif;
  font-size: 11px;
  line-height: 1.5;
  color: #000;
  background: #fff;
}
.rpt-root * { box-sizing: border-box; }

/* Grid helper */
.rpt-grid { display: grid; }
.rpt-g3   { grid-template-columns: repeat(3, 1fr); }
.rpt-g21  { grid-template-columns: 2fr 1fr; }
.rpt-g12  { grid-template-columns: 1fr 2fr; }
.rpt-g51  { grid-template-columns: 5fr 1fr; }

/* Border helpers */
.rpt-border     { border: 1px solid #000; }
.rpt-bt         { border-top: 1px solid #000; }
.rpt-bb         { border-bottom: 1px solid #000; }
.rpt-br         { border-right: 1px solid #000; }
.rpt-bl         { border-left: 1px solid #000; }

/* Cell */
.rpt-cell       { padding: 3px 6px; }
.rpt-label      { font-weight: 400; color: #555; }
.rpt-value      { font-weight: 700; text-transform: uppercase; }

/* Table */
.rpt-table      { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
.rpt-th         { border: 1px solid #000; padding: 4px 5px; background: #f0f0f0; text-align: center; font-size: 10px; font-weight: 700; }
.rpt-th-left    { text-align: left; }
.rpt-td         { border: 1px solid #000; padding: 3px 5px; text-align: center; font-size: 10px; }
.rpt-td-left    { text-align: left; padding-left: 8px; }

/* Section title bar */
.rpt-section-bar {
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  padding: 4px;
  border-bottom: 1px solid #000;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
`;