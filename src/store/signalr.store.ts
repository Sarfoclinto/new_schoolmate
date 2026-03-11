import type { Permission } from "@/config/permissions";
import type { InstitutionGet } from "@/types/api/setup/institution";
import type {
  AcademicTermGet,
  AcademicYearGet,
  Others,
} from "@/types/api/setup/year-n-term";
import type { ConnectionState } from "@/types/signalr.type";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

/**
 * SignalR Store State
 */
interface SignalRState {
  // Connection state
  connectionState: ConnectionState;
  connectionError: Error | null;

  // permissions
  permissions: Permission[];

  // active sessions (years n terms)
  academicYear: AcademicYearGet | null;
  academicTerms: AcademicTermGet[];

  // institution
  institution: InstitutionGet | null;
}

/**
 * SignalR Store Actions
 */
interface SignalRActions {
  // Connection actions
  setConnectionState: (state: ConnectionState) => void;
  setConnectionError: (error: Error | null) => void;

  // permissions
  setPermissions: (permissions: Permission[]) => void;
  addPermission: (permission: Permission) => void;
  removePermission: (permission: Permission) => void;
  clearPermissions: () => void;

  // institution
  setInstitution: (institution: InstitutionGet | null) => void;

  // sessions (year and terms)
  setActiveYear: (year: AcademicYearGet | null) => void;
  setActiveTerms: (term: AcademicTermGet[]) => void;

  // all
  setPermissionAndSessions: (data: Others) => void;
}

/**
 * SignalR Store
 */
export type SignalRStore = SignalRState & SignalRActions;

/**
 * Initial state
 */
const initialState: SignalRState = {
  // connection state
  connectionState: "Disconnected",
  connectionError: null,

  // permissions
  permissions: [],

  academicYear: null,
  academicTerms: [],
  institution: null,
};

/**
 * SignalR Store
 * Manages real-time connection status and synchronized global state (permissions, active sessions, institution details).
 *
 * @example
 * useSignalR.addPermission({ name: "Write", description: "Write access" }); // Add a new permission
 * useSignalR.removePermission({ name: "Read", description: "Read access" }); // Remove a permission
 * useSignalR.clearPermissions(); // Clear all permissions
 */
export const useSignalRStore = create<SignalRStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Connection actions
        setConnectionState: (connectionState) =>
          set({ connectionState }, false, "setConnectionState"),

        setConnectionError: (connectionError) =>
          set({ connectionError }, false, "setConnectionError"),

        // permissions
        setPermissions: (permissions) =>
          set({ permissions }, false, "setPermissions"),

        addPermission: (permission) =>
          set(
            (state) => {
              if (state.permissions.includes(permission)) return state;

              return {
                permissions: [...state.permissions, permission],
              };
            },
            false,
            "addPermission",
          ),
        removePermission: (permission) =>
          set(
            (state) => ({
              permissions: state.permissions.filter((p) => p !== permission),
            }),
            false,
            "removePermission",
          ),
        clearPermissions: () =>
          set({ permissions: [] }, false, "clearPermissions"),

        // institution
        setInstitution: (institution) =>
          set({ institution }, false, "setInstitution"),

        // sessions
        setActiveYear: (academicYear) =>
          set({ academicYear }, false, "setActiveYear"),

        setActiveTerms: (academicTerms) =>
          set({ academicTerms }, false, "setActiveTerms"),

        // all
        setPermissionAndSessions: (data) =>
          set(
            {
              permissions: data.permissions,
              academicYear: data.academicYear,
              academicTerms: data.academicTerm,
              institution: data.institution,
            },
            false,
            "setPermissionAndSessions",
          ),
      }),
      {
        name: "signalRState",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          connectionState: state.connectionState,
          connectionError: state.connectionError,
          permissions: state.permissions,
          academicYear: state.academicYear,
          academicTerms: state.academicTerms,
          institution: state.institution,
        }),
      },
    ),
    {
      name: "SignalRStore",
    },
  ),
);

/**
 * Selectors for optimized re-renders
 */
export const signalRSelectors = {
  // Connection selectors
  connectionState: (state: SignalRStore) => state.connectionState,
  isConnected: (state: SignalRStore) => state.connectionState === "Connected",
  isDisconnected: (state: SignalRStore) =>
    state.connectionState === "Disconnected",
  isConnecting: (state: SignalRStore) => state.connectionState === "Connecting",
  isReconnecting: (state: SignalRStore) =>
    state.connectionState === "Reconnecting",

  // permissions
  permissions: (state: SignalRStore) => state.permissions,
  hasPermissions: (state: SignalRStore) => state.permissions.length > 0,
  hasPermission: (state: SignalRStore) => (permission: Permission) =>
    state.permissions.includes(permission),
  hasNoPermissions: (state: SignalRStore) => state.permissions.length === 0,

  addPermission: (state: SignalRStore) => state.addPermission,
  removePermission: (state: SignalRStore) => state.removePermission,
  clearPermissions: (state: SignalRStore) => state.clearPermissions,
  setPermissions: (state: SignalRStore) => state.setPermissions,
  setPermissionAndSessions: (state: SignalRStore) =>
    state.setPermissionAndSessions,

  // institution & sessions
  institution: (state: SignalRStore) => state.institution,
  academicYear: (state: SignalRStore) => state.academicYear,
  academicTerms: (state: SignalRStore) => state.academicTerms,
  activeTermByEduLevel: (state: SignalRStore) => (eduLevelId: string) =>
    state.academicTerms.find((t) => t.educationalLevelId === eduLevelId) ||
    null,

  setInstitution:
    (state: SignalRStore) => (institution: InstitutionGet | null) =>
      state.setInstitution(institution),
  setActiveYear: (state: SignalRStore) => (year: AcademicYearGet | null) =>
    state.setActiveYear(year),
  setActiveTerms: (state: SignalRStore) => (terms: AcademicTermGet[]) =>
    state.setActiveTerms(terms),
};
