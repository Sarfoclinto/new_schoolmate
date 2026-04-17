export interface CardData {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalSubLevels: number;
  totalMaleStudents: number;
  totalFemaleStudents: number;
  totalMaleStaff: number;
  totalFemaleStaff: number;
  totalNonTeachingStaff: number;
}
export interface StaffCardData {
  totalSubjects: number;
  totalSubLevels: number;
}

// export interface DashboardData {
//   dashboardDetails: CardData;
// }

// ─── Stat card config ─────────────────────────────────────
export interface StatConfig {
  label: string;
  key: keyof CardData;
  icon: React.ReactNode;
  accent: string; // tailwind bg color for icon bubble
  iconColor: string; // tailwind text color
  link: string;
}
export interface StaffStatConfig {
  label: string;
  key: keyof StaffCardData;
  icon: React.ReactNode;
  accent: string; // tailwind bg color for icon bubble
  iconColor: string; // tailwind text color
  link: string;
}


// ─────────────────────────────────────────────────────────────────────────────
// types/api/setup/admin.ts  (additions — append to existing file)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * NEW: Finance summary for the admin dashboard.
 *
 * Backend query guidance:
 *
 *   KPI aggregates — pull from StudentTransactions for the active
 *   academic year + term (or all-time if not filtered):
 *
 *   totalBilled      = SUM(Debit)   WHERE AcademicYearId = ? AND AcademicTermId = ?
 *   totalCollected   = SUM(Credit)  WHERE ...
 *   outstanding      = totalBilled - totalCollected
 *   collectionRate   = (totalCollected / totalBilled) * 100
 *   pendingCheques   = COUNT(*)  FROM Payments WHERE Status = 'pending' AND PaymentMethod = 'cheque'
 *   pendingChequeAmt = SUM(Amount) FROM Payments WHERE Status = 'pending' AND PaymentMethod = 'cheque'
 *
 *   revenueByMonth   = GROUP BY MONTH(TransactionDate), SUM(Credit) — last 6 months
 *
 *   paymentMethodBreakdown — FROM Payments WHERE Status = 'paid':
 *     GROUP BY PaymentMethod → { method, count, totalAmount }
 *
 *   paymentStatusBreakdown — FROM Payments:
 *     GROUP BY Status → { status, count, totalAmount }
 *
 *   outstandingBySubLedger — JOIN StudentTransactions + SubsidiaryLedgers:
 *     GROUP BY SlCode → net balance (Debit - Credit) per sub-ledger, top 6
 *
 *   billedVsCollectedByLevel — JOIN StudentTransactions + EducationalLevels:
 *     GROUP BY EducationalLevelId → { levelName, totalBilled, totalCollected }
 *
 *   studentsWithBalance — COUNT(DISTINCT StudentId) WHERE
 *     (SUM(Debit) - SUM(Credit)) > 0  (grouped by StudentId)
 *
 *   fullyPaidStudents — COUNT(DISTINCT StudentId) WHERE
 *     (SUM(Debit) - SUM(Credit)) <= 0
 */

// ── Monthly revenue point ──────────────────────────────────────────────────
export interface RevenueMonth {
  /** e.g. "Jan", "Feb" */
  month:     string;
  /** numeric month 1-12 for ordering */
  monthNum:  number;
  year:      number;
  collected: number;
  billed:    number;
}

// ── Payment method breakdown ───────────────────────────────────────────────
export interface PaymentMethodStat {
  method:      "cash" | "momo" | "cheque";
  count:       number;
  totalAmount: number;
}

// ── Payment status breakdown ───────────────────────────────────────────────
export interface PaymentStatusStat {
  status:      "paid" | "pending" | "failed" | "cancelled";
  count:       number;
  totalAmount: number;
}

// ── Outstanding per sub-ledger ─────────────────────────────────────────────
export interface SubLedgerOutstanding {
  slCode:      string;
  sl:          string;
  totalBilled: number;
  totalPaid:   number;
  outstanding: number;
}

// ── Billed vs collected per educational level ──────────────────────────────
export interface LevelFinanceStat {
  educationalLevelId:   string;
  educationalLevelName: string;
  totalBilled:          number;
  totalCollected:       number;
  outstanding:          number;
  /** percentage collected */
  collectionRate:       number;
}

// ── Finance KPIs (top-level) ───────────────────────────────────────────────
export interface FinanceKPIs {
  totalBilled:          number;
  totalCollected:       number;
  outstanding:          number;
  /** 0–100 */
  collectionRate:       number;
  studentsWithBalance:  number;
  fullyPaidStudents:    number;
  pendingCheques:       number;
  pendingChequeAmount:  number;
  /**
   * Scope of the data — the backend should indicate whether these
   * figures are for the current term or all-time.
   */
  scope: "term" | "all_time";
  scopeLabel?: string; // e.g. "Term 1 · 2024/2025"
}

// ── Full finance dashboard payload ────────────────────────────────────────
export interface FinanceDashboardData {
  kpis:                      FinanceKPIs;
  revenueByMonth:            RevenueMonth[];
  paymentMethodBreakdown:    PaymentMethodStat[];
  paymentStatusBreakdown:    PaymentStatusStat[];
  outstandingBySubLedger:    SubLedgerOutstanding[];  // top 6
  billedVsCollectedByLevel:  LevelFinanceStat[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Updated DashboardData — add financeDashboard field
// ─────────────────────────────────────────────────────────────────────────────
export interface DashboardData {
  dashboardDetails:   CardData;          // existing
  financeDashboard:   FinanceDashboardData; // NEW
}

// ─────────────────────────────────────────────────────────────────────────────
// services/setup/admin.ts  (append getFinanceDashboardData if you want a
// separate endpoint, or the backend can bundle it into dashboardData above)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Option A (recommended): Bundle into existing /admin/dashboardData endpoint.
 * The backend simply adds a `financeDashboard` key to the existing response.
 * Zero extra round-trips. The frontend already calls getAdminDashboardData().
 *
 * Option B: Separate endpoint  GET /admin/finance-dashboard?yearId=&termId=
 * Use this if the finance data is heavy and you want to lazy-load it.
 *
 * The stub below demonstrates Option B:
 */

/*
import { getHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { FinanceDashboardData } from "@/types/api/setup/admin";

export const getFinanceDashboardData = async (params?: {
  academicYearId?: string;
  academicTermId?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.academicYearId) query.set("yearId",  params.academicYearId);
  if (params?.academicTermId) query.set("termId",  params.academicTermId);
  return getHelper<FinanceDashboardData>(
    `${endpoints.admin.financeDashboard}?${query}`
  );
};
*/