import type { Network } from "@/features/admins/components/finance/network-selector";
import type { SubLedgerBill } from "@/types/api/finance";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Store Interface
interface PaymentState {
  // Payment modal
  isOpen: boolean;
  open: () => void;
  close: () => void;

  //   amount
  amount: number;
  setAmount: (amount: number) => void;

  //   network
  network: Network;
  setNetwork: (network: Network) => void;

  phone: string;
  setPhone: (phone: string) => void;

  //   payer
  payer: string;
  setPayer: (payer: string) => void;

  // description
  description: string;
  setDescription: (description: string) => void;

  reference: string;
  setReference: (reference: string) => void;

  //   subLedgers
  studentSubLedgers: SubLedgerBill[];
  selectedSubLedger: string | undefined;
  setStudentSubLedgers: (subLedgers: SubLedgerBill[]) => void;
  setSelectedSubLedger: (subLedgerId: string) => void;

  // student
  studentId: string | null;
  studentName: string | null;
  setStudentId: (studentId: string | null) => void;
  setStudentName: (studentName: string | null) => void;
}

// ── Store ──────────────────────────────────────────────────────────────────────
export const usePayment = create<PaymentState>()(
  persist(
    (set) => ({
      // ── Payment modal ──
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),

      //   amount
      amount: 0,
      setAmount: (amount) => set({ amount }),

      phone: "",
      setPhone: (phone) => set({ phone }),

      reference: "",
      setReference: (reference) => set({ reference }),

      // payer
      payer: "",
      setPayer: (payer) => set({ payer }),

      // description
      description: "",
      setDescription: (description) => set({ description }),

      // subledgers
      studentSubLedgers: [],
      selectedSubLedger: undefined,
      setSelectedSubLedger: (subLedgerId) =>
        set({ selectedSubLedger: subLedgerId }),
      setStudentSubLedgers: (subLedgers) =>
        set({ studentSubLedgers: subLedgers }),

      //   network
      network: "mtn",
      setNetwork: (network) => set({ network }),

      //   student
      studentId: null,
      studentName: null,
      setStudentId: (studentId) => set({ studentId }),
      setStudentName: (studentName) => set({ studentName }),
    }),
    {
      name: "schoolmate-payment",
      storage: createJSONStorage(() => sessionStorage), // clears on tab close
      // partialize: (state) => ({
      //   cart: state.cart,
      //   customer: state.customer,
      //   discount: state.discount,
      //   shift: state.shift,
      // }),
    },
  ),
);
