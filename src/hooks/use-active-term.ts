import { useMemo } from "react";
import { signalRSelectors, useSignalRStore } from "@/store/signalr.store";

/**
 * Custom hook to find the active academic term for a specific educational level.
 *
 * @param educationalLevelId - The ID of the educational level to check.
 * @returns The matching term object from the auth store, or null if not found or if ID is missing.
 */
export const useActiveTerm = (educationalLevelId?: string | null) => {
  // Extract terms from the auth store using shallow comparison for performance
  const terms = useSignalRStore(signalRSelectors.academicTerms);

  const activeTerm = useMemo(() => {
    // Early return if no ID is provided or if terms list is empty/undefined
    if (!educationalLevelId || !terms || terms.length === 0) {
      return null;
    }

    // Find the term where the educationalLevelId matches
    // We assume 'active' status is implicit in the terms provided by the store for that level
    const foundTerm = terms.find(
      (term) => term.educationalLevelId === educationalLevelId,
    );

    return foundTerm || null;
  }, [educationalLevelId, terms]);

  return activeTerm;
};

/**
 * Usage Example:
 *
 * const activeTerm = useActiveTerm(subLevel?.educationalLevelId);
 *
 * if (activeTerm) {
 *   console.log(`Current Term: ${activeTerm.termName}`);
 * }
 */
