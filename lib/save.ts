// ---------------------------------------------------------------------------
// Save and resume functionality using localStorage.
//
// Auto-saves wizard state on every change. Offers resume on landing page
// if a saved assessment exists. Clears on export/completion.
// ---------------------------------------------------------------------------

import type { Score, BasicData, SubTriggerAnswers } from "./types";

const STORAGE_KEY = "nhs-ai-assessment-draft";

export interface SavedState {
  version: 1;
  savedAt: string;
  step: number;
  basicData: BasicData;
  cScores: Record<string, Score | null>;
  rScores: Record<string, Score | null>;
  subAnswers: SubTriggerAnswers;
  cJustifications: Record<string, string>;
  rJustifications: Record<string, string>;
  cUnknowns: Record<string, boolean>;
  rUnknowns: Record<string, boolean>;
}

/**
 * Save the current wizard state to localStorage.
 * Call this on every meaningful state change.
 */
export function saveState(state: Omit<SavedState, "version" | "savedAt">): void {
  try {
    const payload: SavedState = {
      ...state,
      version: 1,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be unavailable or full — silently fail
  }
}

/**
 * Load a previously saved state, or return null if none exists.
 */
export function loadState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SavedState;

    // Basic validation
    if (parsed.version !== 1 || !parsed.basicData || !parsed.cScores) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Check whether a saved assessment exists (lightweight — does not parse).
 */
export function hasSavedState(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Get a brief summary of the saved state for display on the landing page.
 */
export function getSavedSummary(): {
  toolName: string;
  savedAt: string;
  step: number;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      toolName: parsed?.basicData?.toolName || "Untitled",
      savedAt: parsed?.savedAt || "",
      step: parsed?.step ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Clear the saved state (call after export or when starting fresh).
 */
export function clearSavedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}
