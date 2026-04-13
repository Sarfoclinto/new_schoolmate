import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  ClassBill,
  SubsidiaryLedger,
  SubsidiaryLedgerPost,
  SubsidiaryLedgerUpdate,
  TuitionGet,
  TuitionPost,
  TuitionUpdate,
  StudentBill,
} from "@/types/api/finance";

const {
  finance: { fees, ledgers, bills },
} = endpoints;

// ledgers
export const getAllSubsidiaryLedgerFn = async () => {
  return getHelper<SubsidiaryLedger[]>(ledgers.getAllSub);
};
export const createSubsidiaryLedgerFn = async (data: SubsidiaryLedgerPost) => {
  return postHelper(ledgers.create, data);
};
export const updateSubsidiaryLedgerFn = async (
  update: SubsidiaryLedgerUpdate,
) => {
  return updateHelper(ledgers.update(update.id), update.data);
};

// fees
export const createFeesFn = async (data: TuitionPost) => {
  return postHelper(fees.setup, data);
};
export const updateFeesFn = async (update: TuitionUpdate) => {
  return updateHelper(fees.update(update.id), update.data);
};
export const deleteFeesFn = async (id: string) => {
  return deleteHelper(fees.delete(id));
};
type FeesParams = {
  educationalLevelId?: string;
  academicLevelId?: string;
  academicTermId?: string;
  academicYearId?: string;
};
export const getFeesFn = async (params: FeesParams) => {
  return getHelper<TuitionGet[]>(fees.getAll, params);
};

// ─────────────────────────────────────────────────────────
// Mock Data Generator (simulates backend until API is ready)
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
    subLedgers,
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

// bills
export const getClassBillFn = async (_p: {
  subLevelId: string;
  academicYearId?: string;
  academicTermId?: string;
}): Promise<ClassBill> => {
  // TODO: Remove this mock when backend is ready
  // For now, simulate API call with sample data
  // await delayMs(1200); // Simulate network delay
  // return generateMockClassBill();
  return getHelper<ClassBill>(bills.class, _p);
};
