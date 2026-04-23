import { create } from "zustand";
import { persist } from "zustand/middleware";

type InfoState = {
  modalOpen: boolean;
  acknowledged: boolean;
  dontShowAgain: boolean;
  acknowledgedAt?: Date;
  lastDismissedAt?: Date;

  closeModal: () => void;
  openModal: () => void;

  acknowledge: () => void;
  dontShowAgainFn: () => void;
  dismissModal: () => void;
  shouldShowModal: (hasUnopenedLevels: boolean) => boolean;
};

const initialInfoState: InfoState = {
  modalOpen: false,
  acknowledged: false,
  dontShowAgain: false,

  closeModal: () => {},
  openModal: () => {},

  acknowledge: () => {},
  dontShowAgainFn: () => {},
  dismissModal: () => {},
  shouldShowModal: () => false,
};

export const useInfo = create<InfoState>()(
  persist(
    (set, get) => ({
      ...initialInfoState,
      closeModal: () => set({ modalOpen: false }),
      openModal: () => set({ modalOpen: true }),

      acknowledge: () =>
        set({
          acknowledged: true,
          acknowledgedAt: new Date(),
          lastDismissedAt: new Date(),
        }),
      dontShowAgainFn: () => set({ dontShowAgain: true }),
      dismissModal: () =>
        set({
          modalOpen: false,
          lastDismissedAt: new Date(),
        }),

      shouldShowModal: (hasUnopenedLevels: boolean) => {
        const state = get();
        // if (state.dontShowAgain) return false;
        if (!hasUnopenedLevels) return false;

        const now = new Date();
        const lastDismissed = state.lastDismissedAt;

        if (!lastDismissed) return true; // Never dismissed, show modal

        // Check if 5 minutes have passed since last dismissal
        const fiveMinutes = 5 * 60 * 1000;
        return now.getTime() - new Date(lastDismissed).getTime() > fiveMinutes;
      },
    }),
    { name: "infoState" },
  ),
);
