import type { LoginReturn, User } from "@/types/api/setup/auth-n-user";
import type { InstitutionGet } from "@/types/api/setup/institution";
import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";

type AuthActions = {
  login: (payload: LoginReturn) => void;
  updateInstitution: (institution: InstitutionGet) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshTokenSuccess: (token: string) => void;
  resetAuth: () => void;
  /**
   * Call this while your app is hydrating persisted auth on first load
   * (e.g. during a token-validation request). Prevents the route protectors
   * from flashing a redirect before auth state is confirmed.
   */
  setLoading: (loading: boolean) => void;
};

type States = LoginReturn & {
  expiresAt: number | null;
  /**
   * True only while auth state is being resolved asynchronously —
   * e.g. on first load when you're validating a persisted token.
   * Initialises to `true` so protectors wait before rendering.
   */
  isLoading: boolean;
};

// =============================================================================
// Initial state
// =============================================================================

const initialAuthState: States = {
  user: null,
  token: null,
  isAuth: false,
  other: {} as LoginReturn["other"],
  responseCode: 0,
  responseMessage: "",
  expiresAt: null,
  isLoading: true, // start as loading until hydration is confirmed
};

// =============================================================================
// Store
// =============================================================================

export const useAuth = create<States & AuthActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialAuthState,

        // ── login ─────────────────────────────────────────────────────────────
        // Called after a successful /login API response.
        // The user object now carries dashboardType + permissions from the API.
        login: (payload) =>
          set(() => {
            const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hrs
            return {
              user: payload.user,
              token: payload.token,
              other: payload.other,
              isAuth: true,
              responseCode: payload.responseCode,
              responseMessage: payload.responseMessage,
              expiresAt,
              isLoading: false,
            };
          }),

        // ── logout / reset ────────────────────────────────────────────────────
        logout: () => set(() => ({ ...initialAuthState, isLoading: false })),
        resetAuth: () => set(() => ({ ...initialAuthState, isLoading: false })),

        // ── updateUser ────────────────────────────────────────────────────────
        // Use after a profile-update API call that returns a fresh User object.
        // Preserves dashboardType + permissions unless the API sends new ones.
        updateUser: (user) =>
          set((state) => ({
            ...state,
            user,
          })),

        // ── updateInstitution ─────────────────────────────────────────────────
        updateInstitution: (institution) =>
          set((state) => ({
            ...state,
            other: {
              ...state.other,
              institution,
            },
          })),

        // ── refreshTokenSuccess ───────────────────────────────────────────────
        // Called by your token-refresh interceptor.
        // Resets the 24-hr expiry window alongside the new token.
        refreshTokenSuccess: (token) =>
          set((state) => ({
            ...state,
            token,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            isLoading: false,
          })),

        // ── setLoading ────────────────────────────────────────────────────────
        setLoading: (loading) =>
          set((state) => ({
            ...state,
            isLoading: loading,
          })),
      }),
      {
        name: "authState",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          other: state.other,
          isAuth: state.isAuth,
          expiresAt: state.expiresAt,
          // isLoading is intentionally NOT persisted — always recomputed
        }),
        // ── onRehydrateStorage ─────────────────────────────────────────────────
        // Zustand calls this after it finishes reading from localStorage.
        // We use it to flip isLoading off so the app knows hydration is done.
        // If you later add a token-validation API call on load, call setLoading
        // manually around that request instead.
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Check if the persisted token has expired before marking as ready
            const isExpired =
              state.expiresAt !== null && Date.now() > state.expiresAt;

            if (isExpired) {
              // Wipe everything — token is stale
              state.resetAuth();
            } else {
              state.setLoading(false);
            }
          }
        },
      },
    ),
    {
      name: "AuthStore",
    },
  ),
);
