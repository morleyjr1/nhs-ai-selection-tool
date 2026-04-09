// ---------------------------------------------------------------------------
// Scoring floors — minimum complexity scores enforced by tool properties.
//
// Source: PDF page 5 (scoring floors table) and web spec lines 76–81, 438–440.
//
// Floors are cumulative. A stochastic, autonomous, Class III tool accumulates
// floors on C4 ≥ 2, C5 ≥ 2, C9 = 3, and C11 ≥ 2 — automatically elevating
// four of twelve complexity dimensions.
// ---------------------------------------------------------------------------

import type { BasicData, Score, FloorValue } from "./types";

/**
 * A single floor rule: if the condition on BasicData is met,
 * the specified complexity dimension cannot score below `floor`.
 */
interface FloorRule {
  /** Human-readable label for the property that triggers this floor. */
  label: string;
  /** Which BasicData property triggers the floor. */
  condition: (data: BasicData) => boolean;
  /** Which complexity dimension is affected (e.g. "C4"). */
  dimension: string;
  /** Minimum score enforced. */
  floor: Score;
}

/**
 * All floor rules, derived from the PDF scoring floors table.
 *
 * | Property               | Condition                        | Floors applied              |
 * |------------------------|----------------------------------|-----------------------------|
 * | Stochastic (Q10 = 2)   | Outputs vary with same input     | C4 ≥ 2; C5 ≥ 2; C11 ≥ 2   |
 * | Autonomous (Q4 = 4)    | No mandatory human review        | C4 ≥ 2; C9 ≥ 2             |
 * | Class IIb (Q8 = 4)     | Medium-risk device               | C9 ≥ 2                     |
 * | Class III (Q8 = 5)     | High-risk device                 | C9 = 3                     |
 */
const FLOOR_RULES: FloorRule[] = [
  // Stochastic
  {
    label: "Stochastic (Q10)",
    condition: (d) => d.determinism === 2,
    dimension: "C4",
    floor: 2,
  },
  {
    label: "Stochastic (Q10)",
    condition: (d) => d.determinism === 2,
    dimension: "C5",
    floor: 2,
  },
  {
    label: "Stochastic (Q10)",
    condition: (d) => d.determinism === 2,
    dimension: "C11",
    floor: 2,
  },
  // Autonomous clinical function
  {
    label: "Autonomous clinical function (Q4)",
    condition: (d) => d.category === 4,
    dimension: "C4",
    floor: 2,
  },
  {
    label: "Autonomous clinical function (Q4)",
    condition: (d) => d.category === 4,
    dimension: "C9",
    floor: 2,
  },
  // Class IIb
  {
    label: "Class IIb device (Q8)",
    condition: (d) => d.deviceClass === 4,
    dimension: "C9",
    floor: 2,
  },
  // Class III
  {
    label: "Class III device (Q8)",
    condition: (d) => d.deviceClass === 5,
    dimension: "C9",
    floor: 3,
  },
];

/**
 * For a given set of basic data, compute the effective floor for each
 * complexity dimension. Returns a record keyed by dimension ID (e.g. "C4")
 * with the highest applicable floor value. Dimensions with no applicable
 * floor get 0.
 */
export function computeFloors(
  data: BasicData
): Record<string, FloorValue> {
  const floors: Record<string, FloorValue> = {};

  // Initialise all complexity dimensions to 0 (no floor)
  for (let i = 1; i <= 12; i++) {
    floors[`C${i}`] = 0;
  }

  for (const rule of FLOOR_RULES) {
    if (rule.condition(data)) {
      const current = floors[rule.dimension] ?? 0;
      if (rule.floor > current) {
        floors[rule.dimension] = rule.floor as FloorValue;
      }
    }
  }

  return floors;
}

/**
 * Given a raw complexity score and the applicable floor, return the
 * effective score. The effective score is always ≥ the floor.
 */
export function applyFloor(raw: Score, floor: FloorValue): Score {
  return Math.max(raw, floor) as Score;
}

/**
 * Returns the human-readable labels of all floor rules that fired
 * for a given dimension, given the basic data. Useful for displaying
 * badges on the UI (e.g. "Floor: ≥2 (Stochastic)").
 */
export function getFloorLabels(
  data: BasicData,
  dimensionId: string
): string[] {
  return FLOOR_RULES.filter(
    (rule) => rule.dimension === dimensionId && rule.condition(data)
  ).map((rule) => rule.label);
}
