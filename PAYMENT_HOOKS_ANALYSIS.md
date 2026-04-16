# Payment Hooks - Orchestration Analysis & Improvements

## Current Orchestration Flow

```
MoMoFlow Component
  ├── useVerifyPhone (dual-stage fetch)
  │   ├── Stage 1: verifyPhoneFn → validate network + phone
  │   └── Stage 2: getDetailsFn → fetch customer name (depends on Stage 1)
  │
  ├── useDebit (mutation + polling)
  │   ├── debit mutation: debitFn (initial charge request)
  │   └── polling: checkStatusFn (poll until success)
  │
  └── useSavePayment (auto-trigger on poll success)
      └── savePaymentFn (save transaction to DB)
```

---

## Issues Identified

### 🔴 Critical (Money-Related)
1. **No `isPolling` property** - Can't differentiate between "processing" and "checking"
2. **Infinite polling loop** - After max attempts, polls forever at 3s intervals
3. **No polling timeout** - Could run for hours if network is bad
4. **Race condition in state** - `status` state in component vs `pollAttempt` state in hook can desync
5. **No concurrent debit prevention** - User can click button multiple times during polling
6. **Silent failure mode** - If polling fails silently, no clear error indication to user

### 🟡 High (Edge Cases)
7. **Success state could be missed** - If status succeeds between polls, might get skipped
8. **No idempotency** - Same payment reference could be charged twice if retried
9. **Modal close doesn't stop polling** - Polling continues in background even if closed
10. **Network failures cascade** - Error in one poll attempt retries same interval endlessly
11. **No maximum attempt limit** - Tries indefinitely without upper bound

### 🟠 Medium (UX/Robustness)
12. **No request cancellation** - AbortSignal from useFetch not leveraged for debit
13. **Polling state not derivable** - Can't easily tell if actively polling vs waiting
14. **Error details lost** - Poll errors don't surface to user properly
15. **No retry backoff strategy** - Uses fixed delays, doesn't adapt to network

---

## Proposed Improvements

### Phase 1: Add `isPolling` + State Safety (Your Request)
```typescript
interface UseDebitReturn {
  // ... existing
  isPolling: boolean;              // NEW: True while actively polling
  pollError: TError | null;        // NEW: Surface polling errors
  pollAttemptMax: number;          // NEW: Show max attempt to user
  stopPolling: () => void;         // IMPROVED: Can stop anytime
}
```

### Phase 2: Robustness (High Priority for Payment)
- **Polling timeout**: 2 minute max (configurable)
- **Max attempts**: 20 attempts instead of infinite
- **Idempotency check**: Reference must be unique per transaction
- **Concurrent debit prevention**: Only allow one active debit per reference
- **Explicit error states**: Distinguish timeout vs network error vs declined

### Phase 3: State Synchronization
- Derive component state from hook state (single source of truth)
- Cancel polling on modal close
- Proper cleanup on unmount

### Phase 4: Recovery & UX
- Exponential backoff for network errors (with jitter)
- "Retry with new reference" option after timeout
- Manual confirmation with original reference option
- Transaction status check without new debit

---

## Hook Dependencies

```
useFetch (base query hook)
  ├─ useFetch<T>: Generic query wrapper
  │   └── handles signal, error formatting, notifications
  │
usePost (base mutation hook)
  ├─ usePost<T>: Generic mutation wrapper
  │   └── handles response formatting, error notifications
  │
useVerifyPhone (custom hook - STABLE)
  ├─ chains two fetches with dependent logic
  └─ no external state dependencies
  
useDebit (custom hook - NEEDS IMPROVEMENT)
  ├─ uses usePost for mutation
  ├─ uses useFetch for polling
  ├─ has internal state: pollAttempt, refs
  └─ no external dependencies ✓
  
useSavePayment (custom hook - ACCEPTABLE)
  ├─ uses usePost for mutation
  └─ triggers on transRes change (dependency injection)
```

---

## Safety Checklist for Payment Operations

- ✅ Schema validation (PaymentPostSchema)
- ❌ Idempotency tokens (reference is good start, needs enforcement)
- ❌ Concurrent operation prevention (can debit multiple times)
- ❌ Transaction timeout handling (polls forever)
- ⚠️ Partial failure recovery (polling gives up silently)
- ✅ Audit trail (saving to DB)
- ❌ Offline handling (no connectivity check)
- ✅ User consent (modal with clear actions)
- ❌ Error recovery options (no retry with backoff)

---

## Recommended Implementation Order

1. **Add `isPolling` property** ← Your immediate request
2. **Add polling timeout (2 min max)**
3. **Add max attempt limit (20 attempts)**
4. **Add explicit error states**
5. **Add concurrent debit prevention (lock per reference)**
6. **Refactor component state → hook-derived**
7. **Add exponential backoff for network errors**
8. **Add transaction lookup endpoint** (to verify outside polling)
