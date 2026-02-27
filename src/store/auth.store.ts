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
};

type States = LoginReturn & { expiresAt: number | null };

const initialAuthState: States = {
  user: null,
  token: null,
  isAuth: false,
  other: {} as LoginReturn["other"],
  responseCode: 0,
  responseMessage: "",
  expiresAt: null,
};

export const useAuth = create<States & AuthActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialAuthState,

        login: (payload) =>
          set(() => {
            const now = Date.now();
            const expiresAt = now + 24 * 60 * 60 * 1000; // 24hrs
            return {
              user: payload.user,
              token: payload.token,
              other: payload.other,
              isAuth: true,
              responseCode: payload.responseCode,
              responseMessage: payload.responseMessage,
              expiresAt,
            };
          }),

        logout: () =>
          set(() => ({
            ...initialAuthState,
          })),

        updateUser: (user) =>
          set((state) => ({
            ...state,
            user,
          })),

        updateInstitution: (institution) =>
          set((state) => ({
            ...state,
            other: {
              ...state.other,
              institution,
            },
          })),

        refreshTokenSuccess: (token) =>
          set((state) => ({
            ...state,
            token, // ✅ correct field
          })),

        resetAuth: () =>
          set(() => ({
            ...initialAuthState,
          })),
      }),
      {
        name: "authState",
        storage: createJSONStorage(() => localStorage),
        // optional: only persist what you want
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          other: state.other,
          isAuth: state.isAuth,
          expiresAt: state.expiresAt,
        }),
      },
    ),
  ),
);
