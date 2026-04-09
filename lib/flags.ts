// ---------------------------------------------------------------------------
// Free-text consistency flag definitions.
//
// Each flag has: trigger condition (keyword match in a specified field),
// a target dimension + score direction, and an advisory message.
//
// Flags are advisory only — amber banners, not blockers.
// Source: Web spec, "Free-Text Consistency Flags" section.
// ---------------------------------------------------------------------------

export interface ConsistencyFlag {
  id: string;
  triggerField: "toolPurpose" | "toolProblem" | "justification";
  /** If triggerField is 'justification', which dimension's text to check */
  triggerDimension?: string;
  /** Case-insensitive patterns — match any to trigger */
  patterns: RegExp[];
  /** The dimension card where the warning appears */
  targetDimension: string;
  /** Fires only when this condition is true for the current score */
  scoreCondition: (score: number) => boolean;
  message: string;
}

// ---------------------------------------------------------------------------
// Helper: build case-insensitive word-boundary regex
// ---------------------------------------------------------------------------
function pat(word: string): RegExp {
  // Escape regex special chars, allow optional hyphens/spaces for compound words
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i");
}

// ---------------------------------------------------------------------------
// Complexity-side flags
// ---------------------------------------------------------------------------

const complexityFlags: ConsistencyFlag[] = [
  {
    id: "c6-integration-multiple",
    triggerField: "justification",
    triggerDimension: "C6",
    patterns: [
      pat("multiple"),
      pat("several"),
      pat("all"),
      pat("many"),
      pat("a lot"),
    ],
    targetDimension: "C6",
    scoreCondition: (s) => s <= 1,
    message:
      "Your description suggests integration across more than one system or component. Consider whether C6 should be scored higher.",
  },
  {
    id: "c2-realtime-data",
    triggerField: "justification",
    triggerDimension: "C2",
    patterns: [
      pat("real-time"),
      pat("real time"),
      pat("near-real-time"),
      pat("live data"),
    ],
    targetDimension: "C2",
    scoreCondition: (s) => s <= 1,
    message:
      "Real-time data requirements typically indicate moderate to high data complexity.",
  },
  {
    id: "c3-ig-complexity",
    triggerField: "justification",
    triggerDimension: "C3",
    patterns: [
      pat("cloud"),
      pat("offshoring"),
      pat("offshore"),
      pat("off-shoring"),
      pat("personal data"),
      pat("identifiable"),
      pat("linkage"),
      pat("linked"),
      pat("multi-modal"),
      pat("multimodal"),
      pat("multi modal"),
      pat("multiple data sources"),
      pat("cross-organisational"),
      pat("cross-organizational"),
      pat("data sharing"),
    ],
    targetDimension: "C3",
    scoreCondition: (s) => s <= 1,
    message:
      "Cloud hosting, offshoring, identifiable or linked data, or multi-modal data sources typically require substantive IG work.",
  },
  {
    id: "c4-autonomous",
    triggerField: "justification",
    triggerDimension: "C4",
    patterns: [
      pat("autonomous"),
      pat("autonomously"),
      pat("without clinician"),
      pat("automated decision"),
      pat("no human review"),
      pat("replace clinician"),
      pat("replace clinical"),
      pat("automate"),
      pat("decides"),
    ],
    targetDimension: "C4",
    scoreCondition: (s) => s <= 1,
    message:
      "Autonomous or unsupervised clinical functions typically indicate high oversight complexity.",
  },
  {
    id: "c4-opacity",
    triggerField: "justification",
    triggerDimension: "C4",
    patterns: [
      pat("opaque"),
      pat("black box"),
      pat("cannot explain"),
      pat("no transparency"),
    ],
    targetDimension: "C4",
    scoreCondition: (s) => s <= 2,
    message:
      "Limited explainability suggests human oversight may be structurally difficult.",
  },
  {
    id: "c11-adaptive",
    triggerField: "justification",
    triggerDimension: "C11",
    patterns: [
      pat("continuously learn"),
      pat("continuous learning"),
      pat("adaptive"),
      pat("self-updating"),
      pat("self-supervised"),
      pat("automatically updated"),
      pat("automatically updating"),
      pat("automatic update"),
      pat("re-training"),
      pat("retraining"),
      pat("reinforcement learning"),
      pat("prompt engineering"),
      pat("prompting"),
    ],
    targetDimension: "C11",
    scoreCondition: (s) => s <= 1,
    message:
      "Adaptive, self-supervised, or continuously updated systems typically require proactive monitoring and drift detection.",
  },
  {
    id: "c9-clinical-severity",
    triggerField: "justification",
    triggerDimension: "C9",
    patterns: [
      pat("diagnosis"),
      pat("diagnostic"),
      pat("prescribe"),
      pat("prescribing"),
      pat("prescription"),
      pat("treatment decision"),
      pat("therapy decision"),
      pat("dose"),
      pat("dosing"),
      pat("class IIa"),
      pat("class IIb"),
      pat("class III"),
      pat("invasive"),
      pat("life-sustaining"),
      pat("life sustaining"),
    ],
    targetDimension: "C9",
    scoreCondition: (s) => s <= 1,
    message:
      "Tools informing diagnostic, treatment, or dosing decisions — or those touching higher medical device classifications — typically carry at least moderate safety consequences.",
  },
  {
    id: "c7-workflow-change",
    triggerField: "justification",
    triggerDimension: "C7",
    patterns: [
      pat("new roles"),
      pat("restructure"),
      pat("restructuring"),
      pat("staff displacement"),
      pat("workflow redesign"),
      pat("efficiency"),
      pat("new skills"),
      pat("new function"),
      pat("new functions"),
      pat("reskill"),
      pat("upskill"),
    ],
    targetDimension: "C7",
    scoreCondition: (s) => s <= 1,
    message:
      "Significant workflow changes, new roles, or efficiency-driven redesigns suggest moderate to high organisational change complexity.",
  },
];

// ---------------------------------------------------------------------------
// Readiness-side flag (single universal flag)
// ---------------------------------------------------------------------------

const readinessFlagPatterns = [
  pat("plan to"),
  pat("planning to"),
  pat("intend to"),
  pat("will have"),
  pat("soon"),
  pat("in development"),
  pat("working on"),
  pat("going to"),
  pat("about to"),
  pat("shortly"),
  pat("in the pipeline"),
  pat("being developed"),
  pat("being built"),
  pat("under development"),
];

// Generate one flag per readiness dimension
const readinessFlags: ConsistencyFlag[] = Array.from(
  { length: 12 },
  (_, i) => ({
    id: `r${i + 1}-aspirational`,
    triggerField: "justification" as const,
    triggerDimension: `R${i + 1}`,
    patterns: readinessFlagPatterns,
    targetDimension: `R${i + 1}`,
    scoreCondition: (s: number) => s >= 2,
    message:
      "A score of 2 or 3 indicates current capability. If the described capacity is planned rather than in place, consider scoring lower. Readiness means ready now.",
  }),
);

// ---------------------------------------------------------------------------
// Cross-field flags (basic data → dimension scores)
// ---------------------------------------------------------------------------

const crossFieldFlags: ConsistencyFlag[] = [
  {
    id: "cross-category-clinical",
    triggerField: "toolPurpose",
    patterns: [
      pat("diagnostic"),
      pat("treatment"),
      pat("prescribe"),
      pat("prescribing"),
      pat("triage"),
    ],
    targetDimension: "CATEGORY",
    scoreCondition: (s) => s <= 2,
    message:
      "The described use case suggests clinical decision support or autonomous function. Check whether the tool category is correct.",
  },
  {
    id: "cross-c1-documentation",
    triggerField: "toolPurpose",
    patterns: [
      pat("ambient"),
      pat("dictation"),
      pat("transcribe"),
      pat("transcription"),
      pat("documentation"),
    ],
    targetDimension: "C1",
    scoreCondition: (s) => s >= 3,
    message:
      "Documentation and transcription tools typically involve well-defined tasks. Consider whether C1 is overscored.",
  },
];

// ---------------------------------------------------------------------------
// "I don't know" detection patterns
// ---------------------------------------------------------------------------

export const I_DONT_KNOW_PATTERNS = [
  /\bi\s*don'?t\s*know\b/i,
  /\bno\s*idea\b/i,
  /\bnot\s*sure\b/i,
  /\bunsure\b/i,
  /\bdunno\b/i,
];

/**
 * Check if text contains an "I don't know" variant.
 */
export function containsIDontKnow(text: string): boolean {
  return I_DONT_KNOW_PATTERNS.some((p) => p.test(text));
}

// ---------------------------------------------------------------------------
// All flags combined
// ---------------------------------------------------------------------------

export const ALL_FLAGS: ConsistencyFlag[] = [
  ...complexityFlags,
  ...readinessFlags,
  ...crossFieldFlags,
];

// ---------------------------------------------------------------------------
// Flag evaluation
// ---------------------------------------------------------------------------

export interface FiredFlag {
  flagId: string;
  targetDimension: string;
  message: string;
}

/**
 * Evaluate all flags given the current state.
 *
 * @param scores      Current dimension scores (e.g. { C1: 2, R3: 1, ... })
 * @param texts       Free-text content keyed by field: { toolPurpose: "...", C1: "...", R3: "..." }
 * @param category    Current tool category (Q4) for cross-field flags
 */
export function evaluateFlags(
  scores: Record<string, number>,
  texts: Record<string, string>,
  category: number,
): FiredFlag[] {
  const fired: FiredFlag[] = [];

  for (const flag of ALL_FLAGS) {
    // Determine which text to check
    let textToCheck = "";
    if (flag.triggerField === "toolPurpose") {
      textToCheck = texts["toolPurpose"] ?? "";
    } else if (flag.triggerField === "toolProblem") {
      textToCheck = texts["toolProblem"] ?? "";
    } else if (flag.triggerField === "justification" && flag.triggerDimension) {
      textToCheck = texts[flag.triggerDimension] ?? "";
    }

    if (!textToCheck.trim()) continue;

    // Check if any pattern matches
    const matched = flag.patterns.some((p) => p.test(textToCheck));
    if (!matched) continue;

    // Determine the score to check against
    let scoreToCheck: number;
    if (flag.targetDimension === "CATEGORY") {
      scoreToCheck = category;
    } else {
      scoreToCheck = scores[flag.targetDimension] ?? 0;
    }

    if (scoreToCheck === 0) continue; // Unscored, skip

    // Check score condition
    if (flag.scoreCondition(scoreToCheck)) {
      fired.push({
        flagId: flag.id,
        targetDimension: flag.targetDimension,
        message: flag.message,
      });
    }
  }

  return fired;
}
