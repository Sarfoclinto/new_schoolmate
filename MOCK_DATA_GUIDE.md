# Using Mock Data for Testing

This guide explains how to use the mock data generators while waiting for the backend implementation.

## File Location

- Mock data generators: `src/services/mock-data.ts`

## Quick Usage

### Option 1: Direct Import (Recommended for component testing)

```typescript
import {
  mockSearchStudentFn,
  mockSearchGuardianFn,
} from "@/services/mock-data";

// Use directly in components
const response = await mockSearchStudentFn({
  search: "kwame",
  page: 1,
  limit: 10,
});
const guardians = await mockSearchGuardianFn({
  search: "mensah",
  page: 1,
  limit: 10,
});
```

### Option 2: Swap in Service Files (Recommended for full integration)

Update `src/services/student.ts`:

```typescript
// import { getHelper } from "@/api/crud";
// Replace searchStudentFn with mock version
export const searchStudentFn = mockSearchStudentFn;
```

Update `src/services/guardian.ts`:

```typescript
// import { getHelper } from "@/api/crud";
// Replace searchGuardianFn with mock version
export const searchGuardianFn = mockSearchGuardianFn;
```

## Features

### Mock Data Includes:

- **Students**: 150 total records with realistic names, dates of birth, guardian info
- **Guardians**: 200 total records with names, relationships, occupations, contact info
- **Pagination**: Full support for page/limit parameters with correct pagination metadata
- **Search Filtering**: Filters by name, contact, occupation, etc.
- **Randomization**: Different data on each generation for realistic testing

### Available Generators:

```typescript
// Generate single items
generateMockStudent(): StudentOption
generateMockGuardian(): GuardianWithoutWards

// Generate multiple items
generateMockStudents(count: number): StudentOption[]
generateMockGuardians(count: number): GuardianWithoutWards[]

// Full search functions (match exact API signatures)
mockSearchStudentFn(params): Promise<PaginatedRes<StudentOption[]>>
mockSearchGuardianFn(params): Promise<PaginatedRes<GuardianWithoutWards[]>>
```

## Example Component Usage

```typescript
import { mockSearchStudentFn } from "@/services/mock-data";

// In your component
const handleSearch = async (searchTerm: string) => {
  const result = await mockSearchStudentFn({
    search: searchTerm,
    page: 1,
    limit: 10,
  });

  setStudents(result.data);
  setPagination(result.pagination);
};
```

## Switching to Real Backend

When your backend is ready, simply:

1. Remove the mock imports from components
2. Restore the original `getHelper` calls in service files
3. No component changes needed if you use the service functions

## Data Structure

Both functions return:

```typescript
{
  data: StudentOption[] | GuardianWithoutWards[],
  pagination: {
    page: number
    pageSize: number
    pageCount: number
    total: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}
```

## Customization

Edit the constants in `mock-data.ts` to customize:

- Names (FIRST_NAMES, LAST_NAMES)
- Relationships and occupations
- School levels
- Total record counts (change 150/200 in functions)
