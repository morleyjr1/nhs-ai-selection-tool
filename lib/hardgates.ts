// ---------------------------------------------------------------------------
// Hard gates — non-negotiable requirements that force an "Avoid" classification.
//
// Source: PDF page 18 (hard gates table) and web spec lines 128–150, 334–344.
//
// Seven hard gates. Each has a primary trigger (a pairing condition) and,
// for three of them, an independent sub-component trigger that fires the
// gate on its own regardless of the paired scores.
//
// The sub-component triggers require a direct yes/no answer from the assessor.
// They are asked conditionally — only when the underlying scores indicate the
// risk is live — to avoid cluttering the assessment flow.
// ---------------------------------------------------------------------------

import type {
  Score,
  HardGateName,
  TriggeredGate,
  SubTriggerAnswers,
} from "./types";

interface HardGateDefinition {
  gate: HardGateName;
  /** Primary trigger: check against effective complexity and readiness scores. */
  primaryCheck: (
    cScores: Record<string, Score>,
    rScores: Record<string, Score>
  ) => boolean;
  /** Independent sub-component trigger: check against yes/no answers. */
  subTriggerCheck?: (answers: SubTriggerAnswers) => boolean;
  /** Explanation text for the results page when gate fires on primary trigger. */
  primaryExplanation: string;
  /** Explanation text for the results page when gate fires on sub-trigger. */
  subTriggerExplanation?: string;
}

/**
 * Conditions under which each sub-trigger question should be shown to the assessor.
 * The question only appears when these score conditions are met.
 */
export interface SubTriggerVisibility {
  /** CAPA question: shown when C9 ≥ 2 */
  showCAPAQuestion: boolean;
  /** Automation bias question: shown when C4 = 3 */
  showAutomationBiasQuestion: boolean;
  /** Exit provision question: shown when C6 = 3 AND C12 ≥ 2 */
  showExitProvisionQuestion: boolean;
}

/**
 * Determine which sub-trigger questions should be visible to the assessor
 * based on the current effective complexity scores.
 */
export function getSubTriggerVisibility(
  cScores: Record<string, Score>
): SubTriggerVisibility {
  return {
    showCAPAQuestion: (cScores["C9"] ?? 1) >= 2,
    showAutomationBiasQuestion: (cScores["C4"] ?? 1) === 3,
    showExitProvisionQuestion:
      (cScores["C6"] ?? 1) === 3 && (cScores["C12"] ?? 1) >= 2,
  };
}

const HARD_GATES: HardGateDefinition[] = [
  {
    gate: "Safety",
    primaryCheck: (c, r) => c["C9"] === 3 && r["R9"] === 1,
    subTriggerCheck: (a) => a.hasCAPAProcess === false,
    primaryExplanation:
      "The tool carries high safety consequences (C9 = 3) and the organisation has no systematic AI safety process (R9 = 1). Deployment in this pairing risks serious patient harm.",
    subTriggerExplanation:
      "The organisation has no corrective and preventive action (CAPA) process for AI-specific safety incidents.",
  },
  {
    gate: "Human Oversight",
    primaryCheck: (c, r) => c["C4"] === 3 && r["R4"] === 1,
    subTriggerCheck: (a) => a.hasAutomationBiasMitigation === false,
    primaryExplanation:
      "The tool\u2019s outputs are structurally difficult to verify (C4 = 3) and the organisation has no oversight policies, training, or escalation routes (R4 = 1).",
    subTriggerExplanation:
      "Automation bias risk is assessed as high and the organisation has no mitigation strategy.",
  },
  {
    gate: "Information Governance",
    primaryCheck: (c, r) => c["C3"] === 3 && r["R3"] === 1,
    primaryExplanation:
      "The tool involves complex cross-organisational data flows (C3 = 3) and the organisation has only standard IG capability with no AI-specific experience (R3 = 1).",
  },
  {
    gate: "Technical Integration",
    primaryCheck: (c, r) => c["C6"] === 3 && r["R6"] === 1,
    primaryExplanation:
      "The tool requires bespoke multi-system integration (C6 = 3) and the organisation has only basic IT with no integration engineering resource (R6 = 1).",
  },
  {
    gate: "Monitoring",
    primaryCheck: (c, r) => c["C11"] === 3 && r["R11"] === 1,
    primaryExplanation:
      "The tool requires bespoke drift detection (C11 = 3) and the organisation has no post-deployment monitoring process (R11 = 1).",
  },
  {
    gate: "Values, Trust & Equity",
    primaryCheck: (c, r) => c["C10"] === 3 && r["R10"] === 1,
    primaryExplanation:
      "The tool raises contested ethical questions (C10 = 3) and the organisation has no patient/public engagement or equity impact process (R10 = 1).",
  },
  {
    gate: "Vendor",
    primaryCheck: (c, r) =>
      c["C6"] === 3 && c["C12"] === 3 && r["R12"] === 1,
    subTriggerCheck: (a) => a.hasExitProvision === false,
    primaryExplanation:
      "The tool creates both high technical integration complexity (C6 = 3) and high vendor dependency (C12 = 3), and the organisation has no AI-specific procurement process or exit strategy (R12 = 1).",
    subTriggerExplanation:
      "No exit or sunsetting provision exists for a deeply integrated tool.",
  },
];

/**
 * Check all seven hard gates and return an array of those that fired.
 * Each result indicates whether it fired on the primary condition,
 * the sub-component trigger, or both.
 *
 * @param cScores — effective complexity scores (after floors applied)
 * @param rScores — readiness scores
 * @param subAnswers — yes/no answers to the conditional sub-trigger questions
 */
export function checkHardGates(
  cScores: Record<string, Score>,
  rScores: Record<string, Score>,
  subAnswers: SubTriggerAnswers
): TriggeredGate[] {
  const triggered: TriggeredGate[] = [];

  for (const gate of HARD_GATES) {
    const primary = gate.primaryCheck(cScores, rScores);
    const sub = gate.subTriggerCheck
      ? gate.subTriggerCheck(subAnswers)
      : false;

    if (primary || sub) {
      let explanation = "";
      if (primary && sub) {
        explanation = `${gate.primaryExplanation} Additionally: ${gate.subTriggerExplanation}`;
      } else if (primary) {
        explanation = gate.primaryExplanation;
      } else if (sub && gate.subTriggerExplanation) {
        explanation = gate.subTriggerExplanation;
      }

      triggered.push({
        gate: gate.gate,
        firedOnPrimary: primary,
        firedOnSubTrigger: sub,
        explanation,
      });
    }
  }

  return triggered;
}

/**
 * Check whether a specific dimension pairing is one score point away
 * from triggering a hard gate. Used for gap prioritisation (hard gate
 * proximity is the highest priority sort key).
 */
export function isNearHardGate(
  dimensionIndex: number,
  cScores: Record<string, Score>,
  rScores: Record<string, Score>
): boolean {
  const cId = `C${dimensionIndex}`;
  const rId = `R${dimensionIndex}`;
  const cScore = cScores[cId] ?? 1;
  const rScore = rScores[rId] ?? 1;

  // Check each gate's primary condition for near-miss
  // (complexity is at threshold and readiness is one step above minimum)
  switch (dimensionIndex) {
    case 3: // IG: C3=3, R3=1 fires → near if C3=3, R3=2
      return cScore === 3 && rScore === 2;
    case 4: // Oversight: C4=3, R4=1 → near if C4=3, R4=2
      return cScore === 3 && rScore === 2;
    case 6: // Technical: C6=3, R6=1 → near if C6=3, R6=2
      return cScore === 3 && rScore === 2;
    case 9: // Safety: C9=3, R9=1 → near if C9=3, R9=2
      return cScore === 3 && rScore === 2;
    case 10: // Values: C10=3, R10=1 → near if C10=3, R10=2
      return cScore === 3 && rScore === 2;
    case 11: // Monitoring: C11=3, R11=1 → near if C11=3, R11=2
      return cScore === 3 && rScore === 2;
    case 12: // Vendor: C6=3 AND C12=3, R12=1 → near if conditions met and R12=2
      return (
        (cScores["C6"] ?? 1) === 3 && cScore === 3 && rScore === 2
      );
    default:
      return false;
  }
}
