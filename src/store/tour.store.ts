import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import type { FeatureTour } from "@/config/feature-tours";

type Targets = {
  search: React.RefObject<HTMLDivElement> | undefined;
  sidebar: React.RefObject<HTMLDivElement> | undefined;
  [key: string]: React.RefObject<HTMLElement> | undefined;
};

interface TourState {
  // Automatic feature tours
  acknowledgedTours: Record<string, boolean>;
  currentFeatureTourIndex: number;
  showAutoTour: boolean;

  // targetRefs?: Record<string, React.RefObject<HTMLElement> | undefined>;
  targetRefs: Targets;
  setTargetRef: (key: keyof Targets, ref: React.RefObject<HTMLElement> | undefined) => void;

  // Manual general tour
  currentGeneralTourStep: number;
  isManualTourActive: boolean;

  // Actions for automatic tours
  acknowledgeTour: (tourId: string) => void;
  skipCurrentTour: () => void;
  nextFeatureTour: () => void;
  previousFeatureTour: () => void;
  startAutoTours: (pendingTours: FeatureTour[]) => void;
  closeAutoTours: () => void;

  // Actions for manual tours
  startManualTour: () => void;
  nextGeneralTourStep: () => void;
  previousGeneralTourStep: () => void;
  endManualTour: () => void;
  setGeneralTourStep: (step: number) => void;

  // Helpers
  hasTourBeenAcknowledged: (tourId: string) => boolean;
}

export const useTourStore = create<TourState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        acknowledgedTours: {},
        currentFeatureTourIndex: 0,
        showAutoTour: false,
        currentGeneralTourStep: 0,
        isManualTourActive: false,

        // target
        targetRefs: {
          search: undefined,
          sidebar: undefined,
        },

        // Automatic tour actions
        acknowledgeTour: (tourId: string) => {
          set((state) => ({
            acknowledgedTours: {
              ...state.acknowledgedTours,
              [tourId]: true,
            },
          }));
        },

        skipCurrentTour: () => {
          set((state) => ({
            currentFeatureTourIndex: state.currentFeatureTourIndex + 1,
          }));
        },

        nextFeatureTour: () => {
          set((state) => ({
            currentFeatureTourIndex: state.currentFeatureTourIndex + 1,
          }));
        },

        previousFeatureTour: () => {
          set((state) => ({
            currentFeatureTourIndex: Math.max(
              0,
              state.currentFeatureTourIndex - 1,
            ),
          }));
        },

        startAutoTours: (pendingTours: FeatureTour[]) => {
          set({
            showAutoTour: pendingTours.length > 0,
            currentFeatureTourIndex: 0,
          });
        },

        closeAutoTours: () => {
          set({
            showAutoTour: false,
            currentFeatureTourIndex: 0,
          });
        },

        // Manual tour actions
        startManualTour: () => {
          set({
            isManualTourActive: true,
            currentGeneralTourStep: 0,
          });
        },

        nextGeneralTourStep: () => {
          set((state) => ({
            currentGeneralTourStep: state.currentGeneralTourStep + 1,
          }));
        },

        previousGeneralTourStep: () => {
          set((state) => ({
            currentGeneralTourStep: Math.max(
              0,
              state.currentGeneralTourStep - 1,
            ),
          }));
        },

        setGeneralTourStep: (step: number) => {
          set({ currentGeneralTourStep: step });
        },

        endManualTour: () => {
          set({
            isManualTourActive: false,
            currentGeneralTourStep: 0,
          });
        },

        setTargetRef: (key: keyof Targets, ref: React.RefObject<HTMLElement> | undefined) =>
          set((state) => ({
            targetRefs: {
              ...state.targetRefs,
              [key]: ref,
            },
          })),

        // Helpers
        hasTourBeenAcknowledged: (tourId: string) => {
          return get().acknowledgedTours[tourId] ?? false;
        },
      }),
      {
        name: "tourState",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          acknowledgedTours: state.acknowledgedTours,
        }),
      },
    ),
    {
      name: "TourStore",
    },
  ),
);
