// ─────────────────────────────────────────────────────────
// Mock Data Generator (simulates backend until API is ready)

import type {
  ClassBill,
  StudentBill,
  BillingStatusReport,
  // AcaLevelBillingStatus,
  UnbilledStudent,
  BilledSubLedger,
  SubLevelBillingStatus,
} from "@/types/api/finance";

// ─────────────────────────────────────────────────────────
const MOCK_SUB_LEDGERS = [
  { slCode: "001", sl: "School fees" },
  { slCode: "002", sl: "TUITION" },
  { slCode: "003", sl: "LUNCH" },
  { slCode: "004", sl: "SPORTS & MAINTENANCE" },
  { slCode: "005", sl: "PTA DUES" },
  { slCode: "006", sl: "ABACUS" },
  { slCode: "008", sl: "EXTRA CURRICULUM ACTIVITIES" },
];

const MOCK_NAMES = [
  { first: "Kwame", last: "Johnson", other: "K. J." },
  { first: "Ama", last: "Bentil", other: "A. B." },
  { first: "Kofi", last: "Mensah", other: "K. M." },
  { first: "Abena", last: "Owusu", other: "A. O." },
  { first: "Yaw", last: "Boateng", other: "Y. B." },
  { first: "Akosua", last: "Asante", other: "A. A." },
  { first: "Kwesi", last: "Agyeman", other: "K. A." },
  { first: "Afua", last: "Brew", other: "A. B." },
  { first: "Osei", last: "Darko", other: "O. D." },
  { first: "Ama", last: "Dumoulin", other: "A. D." },
  { first: "Ekua", last: "Adomako", other: "E. A." },
  { first: "Nana", last: "Quarcoo", other: "N. Q." },
  { first: "Adjoa", last: "Nyarko", other: "A. N." },
  { first: "Kwadwo", last: "Addo", other: "K. A." },
  { first: "Afia", last: "Mensah", other: "A. M." },
];

export function generateMockStudentBill(
  studentId: string,
  index: number,
): StudentBill {
  const nameData = MOCK_NAMES[index % MOCK_NAMES.length];

  // Simulate varied payment statuses
  const paymentStatusRandom = Math.random();
  const totalDebit = 5000 + Math.random() * 3000;
  let totalCredit: number;

  if (paymentStatusRandom < 0.3) {
    // Fully paid or overpaid (30%)
    totalCredit = totalDebit + (Math.random() < 0.5 ? 0 : Math.random() * 200);
  } else if (paymentStatusRandom < 0.6) {
    // Partially paid (30%)
    totalCredit = totalDebit * (0.4 + Math.random() * 0.4);
  } else {
    // Outstanding (40%)
    totalCredit = totalDebit * (0.1 + Math.random() * 0.3);
  }

  const subLedgers = MOCK_SUB_LEDGERS.map((ledger) => {
    const ledgerDebit =
      (totalDebit / MOCK_SUB_LEDGERS.length) * (0.8 + Math.random() * 0.4);
    const ledgerCredit =
      (totalCredit / MOCK_SUB_LEDGERS.length) * (0.8 + Math.random() * 0.4);

    return {
      slCode: ledger.slCode,
      sl: ledger.sl,
      debit: ledgerDebit,
      credit: ledgerCredit,
      balance: ledgerDebit - ledgerCredit,
    };
  });

  return {
    studentId,
    fullName: `${nameData.first} ${nameData.last}`,
    otherName: nameData.other,
    subLedgerBill: subLedgers,
    totalDebit,
    totalCredit,
    balance: totalDebit - totalCredit,
  };
}

export function generateMockClassBill(): ClassBill {
  const studentCount = 15;
  const students: StudentBill[] = [];

  for (let i = 0; i < studentCount; i++) {
    students.push(generateMockStudentBill(`student-${i + 1}`, i));
  }

  return students;
}

export async function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING CENTER MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_EDU_LEVELS = [
  { id: "edu-001", name: "Primary 1" },
  { id: "edu-002", name: "Primary 2" },
  { id: "edu-003", name: "Primary 3" },
  { id: "edu-004", name: "Primary 4" },
  { id: "edu-005", name: "Primary 5" },
  { id: "edu-006", name: "Primary 6" },
  { id: "edu-007", name: "JSS 1" },
  { id: "edu-008", name: "JSS 2" },
  { id: "edu-009", name: "JSS 3" },
];

const MOCK_SUB_LEVELS = [
  { id: "sub-001", name: "A" },
  { id: "sub-002", name: "B" },
  { id: "sub-003", name: "C" },
];

/** Generate BillingStatusReport for the billing center overview */
export function generateMockBillingStatus(): BillingStatusReport {
  return {
    academicYearId: "year-2025",
    academicTermId: "term-1",
    academicLevels: MOCK_EDU_LEVELS.map((level, idx) => {
      // Vary billing status across levels
      const billingStatuses: Array<
        "fully_billed" | "partially_billed" | "not_billed" | "not_configured"
      > = ["fully_billed", "partially_billed", "not_billed", "not_configured"];
      const billingStatus = billingStatuses[idx % billingStatuses.length];
      const totalStudents = 25 + Math.floor(Math.random() * 15);
      let billedStudents: number;
      let unbilledStudents: number;

      if (billingStatus === "fully_billed") {
        billedStudents = totalStudents;
        unbilledStudents = 0;
      } else if (billingStatus === "partially_billed") {
        unbilledStudents = 5 + Math.floor(Math.random() * 8);
        billedStudents = totalStudents - unbilledStudents;
      } else if (billingStatus === "not_billed") {
        billedStudents = 0;
        unbilledStudents = totalStudents;
      } else {
        billedStudents = 0;
        unbilledStudents = totalStudents;
      }

      // Configured sub-ledgers
      const hasFeesConfigured = billingStatus !== "not_configured";
      const configuredSubLedgers = hasFeesConfigured
        ? [
            { slCode: "001", sl: "School fees", amount: 500 },
            { slCode: "002", sl: "TUITION", amount: 800 },
            { slCode: "003", sl: "LUNCH", amount: 300 },
            { slCode: "004", sl: "SPORTS & MAINTENANCE", amount: 200 },
          ]
        : [];

      // Missing sub-ledgers (not yet charged to students)
      const missingSubLedgers =
        billingStatus === "partially_billed"
          ? [{ slCode: "005", sl: "PTA DUES", amount: 150 }]
          : billingStatus === "not_billed"
            ? [
                { slCode: "005", sl: "PTA DUES", amount: 150 },
                { slCode: "006", sl: "ABACUS", amount: 100 },
              ]
            : [];
      // ----
      // Billed sub-ledgers with actual charge counts
      const billedSubLedgers: BilledSubLedger[] =
        billingStatus === "fully_billed"
          ? [
              {
                slCode: "001",
                sl: "School fees",
                amount: 500,
                studentsCharged: totalStudents,
                totalCharged: 500 * totalStudents,
              },
              {
                slCode: "002",
                sl: "TUITION",
                amount: 800,
                studentsCharged: totalStudents,
                totalCharged: 800 * totalStudents,
              },
            ]
          : billingStatus === "partially_billed"
            ? [
                {
                  slCode: "001",
                  sl: "School fees",
                  amount: 500,
                  studentsCharged: billedStudents,
                  totalCharged: 500 * billedStudents,
                },
              ]
            : [];

      // Sub-levels breakdown
      const subLevels: SubLevelBillingStatus[] = MOCK_SUB_LEVELS.map((sub) => {
        const subTotal = Math.ceil(totalStudents / 3);
        const subBilled = Math.floor(billedStudents / 3);
        return {
          subLevelId: sub.id,
          subLevelName: sub.name,
          totalStudents: subTotal,
          billedStudents: subBilled,
          unbilledStudents: subTotal - subBilled,
          billedSubLedgers:
            billingStatus === "fully_billed" ? ["001", "002"] : ["001"],
        };
      });

      return {
        academicLevelId: level.id,
        academicLevelName: level.name,
        feeConfigured: hasFeesConfigured,
        billingStatus,
        totalStudents,
        billedStudents,
        unbilledStudents,
        configuredSubLedgers,
        billedSubLedgers,
        missingSubLedgers,
        subLevels,
      };
    }),
  };
}

/** Generate UnbilledStudents list for individual student billing */
export function generateMockUnbilledStudents(
  subLevelId?: string,
): UnbilledStudent[] {
  const students: UnbilledStudent[] = [];
  const reasons: Array<"new_admission" | "omitted" | "unknown"> = [
    "new_admission",
    "omitted",
    "unknown",
  ];

  for (let i = 0; i < 18; i++) {
    const nameData = MOCK_NAMES[i % MOCK_NAMES.length];
    const subLevel = subLevelId || MOCK_SUB_LEVELS[i % MOCK_SUB_LEVELS.length];

    students.push({
      studentId: `student-unbilled-${i + 1}`,
      fullName: `${nameData.first} ${nameData.last}`,
      otherName: nameData.other,
      subLevelId: typeof subLevel === "object" ? subLevel.id : "-" + i,
      subLevelName: typeof subLevel === "object" ? subLevel.name : "n" + i,
      admittedOn: new Date(2024, 0, Math.floor(Math.random() * 28) + 1)
        .toISOString()
        .split("T")[0],
      reason: reasons[i % reasons.length],
    });
  }

  return students;
}
