# Use-Debit Hook - Implementation Guide & Recommendations

## Changes Made ✅

### 1. Added `isPolling` Property

```typescript
isPolling: boolean; // Explicitly tracks active polling state
```

- Uses `isPollingRef` to maintain state across renders
- Prevents concurrent polling attempts
- Allows component to conditionally show "Stop" button

**Component Usage:**

```tsx
{
  isPolling && (
    <button
      onClick={() => {
        stopPolling();
        setStatus("idle");
      }}
    >
      ✕ Stop polling
    </button>
  );
}
```

---

### 2. Added Error & Timeout Tracking

```typescript
pollError: Error | null; // Last polling error
hasExceededTimeout: boolean; // Polling exceeded max time
hasExceededMaxAttempts: boolean; // Exceeded max attempts
```

**Why Important for Payment:**

- Can differentiate between "still trying" vs "gave up"
- Allows recovery UI (Retry, Confirm Manually)
- Prevents indefinite polling

---

### 3. Added Safety Limits

```typescript
maxPollingTime = 2 * 60 * 1000; // 2 minutes default
maxAttempts = 20; // Max polling attempts
```

**Configurable at call site:**

```tsx
useDebit({
  refNo: ref,
  maxPollingTime: 90_000, // 90 seconds if needed
  maxAttempts: 25, // More attempts if needed
});
```

---

### 4. Improved Polling Logic

#### Before (Infinite Loop Risk):

```typescript
// Could poll forever at 3s intervals after max attempts
if (attemptRef.current < POLL_DELAYS.length - 1) {
  attemptRef.current += 1;
}
timerRef.current = setTimeout(pollStatus, POLL_DELAYS[attemptRef.current]);
```

#### After (Bounded & Safe):

```typescript
// Check both timeout AND attempt limits
if (elapsedTime > maxPollingTime) {
  setHasExceededTimeout(true);
  clearPolling();
  return;
}

if (attemptRef.current >= maxAttempts) {
  setHasExceededMaxAttempts(true);
  clearPolling();
  return;
}
```

---

### 5. Concurrent Polling Prevention

```typescript
const isPollingRef = useRef(false);

const startPolling = () => {
  // Safety: prevent concurrent polling
  if (isPollingRef.current) {
    console.warn("Polling already in progress for reference:", refNo);
    return;
  }

  isPollingRef.current = true;
  // ... start polling
};
```

**Why Critical for Payment:**

- User could trigger multiple debit requests via multiple clicks
- Same reference could be charged multiple times

---

### 6. Better Success Detection

```typescript
// Check multiple success indicators
if (result.data?.responseMessage === SUCCESS_MESSAGE) {
  clearPolling();
  return;
}

// Also stop on explicit failure
if (result.data?.responseMessage?.toLowerCase().includes("fail")) {
  clearPolling();
  setPollError(new Error(result.data.responseMessage));
  return;
}
```

---

### 7. Proper Cleanup

```typescript
// Reset method for clean state
const reset = () => {
  stopPolling();
  attemptRef.current = 0;
  pollStartTimeRef.current = 0;
  setPollAttempt(0);
};

// Unmount cleanup prevents memory leaks
useEffect(() => {
  return () => {
    clearPolling(); // Cancel pending timers
  };
}, []);

// Auto-cleanup on success
useEffect(() => {
  if (isTransactionSuccess) {
    clearPolling();
  }
}, [isTransactionSuccess]);
```

---

## Updated Component Usage

### Before:

```tsx
const {
  mutate: debit,
  transRes,
  stopPolling,
  pollAttempt,
} = useDebit({ refNo: ref });

if (status === "pending") {
  return (
    <div>
      <button
        onClick={() => {
          stopPolling();
          setStatus("idle");
        }}
      >
        Cancel request
      </button>
    </div>
  );
}
```

### After:

```tsx
const {
  mutate: debit,
  transRes,
  stopPolling,
  pollAttempt,
  isPolling, // NEW: explicit polling state
  pollError, // NEW: error details
  hasExceededTimeout, // NEW: timeout status
  hasExceededMaxAttempts, // NEW: attempt limit status
} = useDebit({ refNo: ref });

if (status === "pending") {
  return (
    <div>
      {/* Only show stop button when actively polling */}
      {isPolling && (
        <button
          onClick={() => {
            stopPolling();
            setStatus("idle");
          }}
        >
          ✕ Stop polling
        </button>
      )}

      {/* Show error if polling failed */}
      {pollError && <p className="text-red-500">⚠️ {pollError.message}</p>}

      {/* Recovery options after timeout */}
      {(hasExceededTimeout || hasExceededMaxAttempts) && !isPolling && (
        <div>
          <Button onClick={() => setStatus("idle")}>Retry</Button>
          <Button onClick={() => onConfirmManual(ref)}>Confirm Manually</Button>
        </div>
      )}
    </div>
  );
}
```

---

## Additional Recommendations (Phase 2)

### ⚠️ Priority 1: Idempotency

**Current Risk:** Same payment reference could be charged twice if:

- User closes modal during polling → payment processes
- User reopens modal with same reference → mints new debit request

**Recommendation:**

```typescript
// Add transaction lookup endpoint to check if already processed
export const getTransactionStatusFn = async (refNo: string) => {
  return paymentPost<{ processed: boolean; status: string }>(
    payment.getStatus, // NEW endpoint
    { refNo },
  );
};

// In useDebit, check first if already processed
useEffect(() => {
  const checkExisting = async () => {
    const existing = await getTransactionStatusFn(refNo);
    if (existing.processed) {
      // Skip debit, jump to success
      setTransactionSuccess(true);
    }
  };
  checkExisting();
}, [refNo]);
```

---

### ⚠️ Priority 2: Exponential Backoff

**Current:** Linear polling delays: 10s, 7s, 5s, 3s, 3s, 3s...

**Better:** Exponential backoff with jitter for network resilience

```typescript
// Instead of fixed array
const calculateBackoff = (attemptNumber: number) => {
  // Base delay: 1s, cap at 5s, add jitter
  const baseDelay = Math.min(1000 * Math.pow(1.5, attemptNumber), 5000);
  const jitter = Math.random() * 1000; // 0-1s random
  return baseDelay + jitter;
};

// Usage in pollStatus
const nextDelay = calculateBackoff(attemptRef.current);
timerRef.current = setTimeout(pollStatus, nextDelay);
```

---

### 🔧 Priority 3: Transaction Status Endpoint

**Add new endpoint to check payment without re-debiting:**

```typescript
// In finance.ts
export const checkTransactionFn = async (refNo: string) => {
  return paymentPost<TransStatRes>(
    payment.checkTransactionStatus, // Different from debit status check
    { refNo },
  );
};

// Hook usage: Can query transaction status without new debit request
const { data: transactionInfo } = useFetch({
  queryKeys: ["transaction", refNo],
  queryFn: () => checkTransactionFn(refNo),
  enabled: !!refNo,
});
```

---

### 🔧 Priority 4: Store Transaction State

**Track processed transactions in payment store to prevent duplicates:**

```typescript
// In payment.store.ts
interface PaymentState {
  // ... existing
  processedTransactions: Set<string>; // Set of processed reference IDs
  addProcessedTransaction: (refNo: string) => void;
  hasBeenProcessed: (refNo: string) => boolean;
}

// In useDebit hook
const hasBeenProcessed = usePayment((s) => s.hasBeenProcessed(refNo));

// Before debit request
if (hasBeenProcessed) {
  console.warn("Transaction already processed:", refNo);
  return;
}
```

---

### 🔧 Priority 5: Better Error Recovery

**Distinguish error types for better UX:**

```typescript
enum PollingErrorType {
  NETWORK_ERROR = "network",
  PAYMENT_DECLINED = "declined",
  TIMEOUT = "timeout",
  MAX_ATTEMPTS = "max_attempts",
  UNKNOWN = "unknown",
}

// Then component can show appropriate recovery message:
{pollErrorType === PollingErrorType.NETWORK_ERROR && (
  <p>Network connection issue - Please retry</p>
)}
{pollErrorType === PollingErrorType.PAYMENT_DECLINED && (
  <p>Payment declined by customer</p>
)}
{pollErrorType === PollingErrorType.TIMEOUT && (
  <p>Payment may have been processed - Check transaction log</p>
)}
```

---

## Testing Checklist

- [ ] Normal flow: debit request → status check succeeds → saves payment
- [ ] Stop polling: User clicks stop → no more status checks
- [ ] Timeout: Polling exceeds 2 minutes → shows timeout message
- [ ] Max attempts: Polling exceeds 20 attempts → shows max attempts message
- [ ] Network error during polling → retries with backoff
- [ ] Modal closes during polling → polling stops on unmount
- [ ] User double-clicks charge button → only one debit request sent
- [ ] Success state while unmounted → cleanup timers properly
- [ ] Rapid component remounts → no ghost polling timers
- [ ] Payment declined → stops polling and shows error
- [ ] Slow network (10+ seconds to first success) → continues polling

---

## Migration Path

### Step 1: Current PR ✅ Done

- Add `isPolling` property
- Add error tracking
- Add timeout/attempt limits
- Update component to use new return values

### Step 2: Next PR

- Add idempotency check endpoint
- Implement transaction lookup before debit

### Step 3: Following PR

- Add transaction state to store
- Implement exponential backoff
- Add error type classification

### Step 4: Polish PR

- Add transaction status endpoint
- Improve error messages
- Add offline detection

---

## References

- [React Query useMutation Docs](https://tanstack.com/query/latest/docs/react/reference/useMutation)
- [Payment Retry Strategies](https://stripe.com/docs/payments/payment-methods/retries)
- [Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
