import type { Pagination, PaginatedRes } from "@/types/api";
import type { StudentOption, GuardianWithoutWards } from "@/types/api/guardian";

// ── Mock Data Generators ────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Kwame",
  "Ama",
  "Kofi",
  "Aba",
  "Yaw",
  "Abena",
  "Akosua",
  "Osei",
  "Ekua",
  "Kojo",
  "Sophia",
  "Emmanuel",
  "Grace",
  "Samuel",
  "Victoria",
];

const LAST_NAMES = [
  "Mensah",
  "Owusu",
  "Boateng",
  "Anane",
  "Asare",
  "Adomako",
  "Kwakye",
  "Ofori",
  "Agyeman",
  "Bediako",
];

const RELATIONSHIPS = ["Parent", "Spouse", "Sibling", "Relative", "Other"];

const OCCUPATIONS = [
  "Engineer",
  "Doctor",
  "Teacher",
  "Nurse",
  "Merchant",
  "Farmer",
  "Carpenter",
  "Trader",
  "Businessman",
  "Businessman",
];

const SUBLEVEL_NAMES = [
  "Form 1",
  "Form 2",
  "Form 3",
  "Form 4",
  "Form 5",
  "Form 6",
  "Junior High 1",
  "Junior High 2",
  "Junior High 3",
];

const GENDERS = ["Male", "Female"];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateFullName(): string {
  return `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
}

function generatePhone(): string {
  return `+233${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

function generateEmail(name: string): string {
  const [firstName] = name.toLowerCase().split(" ");
  return `${firstName}${Math.floor(Math.random() * 999)}@email.com`;
}

function generateDateOfBirth(): string {
  const year = Math.floor(Math.random() * (2020 - 2010)) + 2010;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generatePagination(
  page: number,
  limit: number,
  total: number,
): Pagination {
  const pageCount = Math.ceil(total / limit);
  return {
    page,
    pageSize: limit,
    pageCount,
    total,
    hasNextPage: page < pageCount,
    hasPrevPage: page > 1,
  };
}

// ── Student Mock Data ────────────────────────────────────────────────────────

export function generateMockStudent(): StudentOption {
  const guardianName = generateFullName();
  return {
    studentId: generateId(),
    fullName: generateFullName(),
    gender: getRandomItem(GENDERS),
    dateOfBirth: generateDateOfBirth(),
    subLevelId: generateId(),
    subLevelName: getRandomItem(SUBLEVEL_NAMES),
    guardianId: generateId(),
    guardianName,
    guardianContact: generatePhone(),
  };
}

export function generateMockStudents(count: number): StudentOption[] {
  return Array.from({ length: count }, () => generateMockStudent());
}

export async function mockSearchStudentFn(params: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedRes<StudentOption[]>> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const search = params.search?.toLowerCase() || "";

  // Generate a larger pool of mock students
  const allStudents = generateMockStudents(150);

  // Filter by search term
  let filtered = allStudents;
  if (search) {
    filtered = allStudents.filter(
      (student) =>
        student.fullName.toLowerCase().includes(search) ||
        student.guardianName.toLowerCase().includes(search) ||
        student.subLevelName.toLowerCase().includes(search),
    );
  }

  // Paginate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = filtered.slice(startIndex, endIndex);

  return {
    data,
    pagination: generatePagination(page, limit, filtered.length),
  };
}

// ── Guardian Mock Data ──────────────────────────────────────────────────────

export function generateMockGuardian(): GuardianWithoutWards {
  const guardianName = generateFullName();
  return {
    guardianId: generateId(),
    guardianName,
    guardianRelationship: getRandomItem(RELATIONSHIPS),
    guardianAddress: `${Math.floor(Math.random() * 999) + 1} Street, Accra`,
    guardianImage: `https://via.placeholder.com/150?text=${guardianName.replace(" ", "+")}`,
    guardianLivingStatus: "alive",
    guardianOccupation: getRandomItem(OCCUPATIONS),
    guardianContact: generatePhone(),
    guardianEmail: generateEmail(guardianName),
    guardianWardsCount: Math.floor(Math.random() * 4) + 1,
  };
}

export function generateMockGuardians(count: number): GuardianWithoutWards[] {
  return Array.from({ length: count }, () => generateMockGuardian());
}

export async function mockSearchGuardianFn(params: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedRes<GuardianWithoutWards[]>> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const search = params.search?.toLowerCase() || "";

  // Generate a larger pool of mock guardians
  const allGuardians = generateMockGuardians(200);

  // Filter by search term
  let filtered = allGuardians;
  if (search) {
    filtered = allGuardians.filter(
      (guardian) =>
        guardian.guardianName.toLowerCase().includes(search) ||
        guardian.guardianContact.includes(search) ||
        guardian.guardianOccupation.toLowerCase().includes(search),
    );
  }

  // Paginate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = filtered.slice(startIndex, endIndex);

  return {
    data,
    pagination: generatePagination(page, limit, filtered.length),
  };
}
