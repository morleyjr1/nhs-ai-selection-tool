// ---------------------------------------------------------------------------
// Shared TypeScript interfaces for the NHS AI Adoption Assessment Tool.
// Designed for Phase 1 (client-side) with Phase 2 backend in mind.
// ---------------------------------------------------------------------------

export type Score = 1 | 2 | 3;
export type FloorValue = 0 | 1 | 2 | 3;

export type Classification =
  | "Quick win"
  | "Deploy and monitor"
  | "Build readiness first"
  | "Avoid";

// ---- Basic Data Entry (Step 1 of the wizard) ----

export type AutonomyTier = 1 | 2 | 3 | 4 | 5;
// 1: Administrative
// 2: Administrative in clinical setting
// 3: Clinical decision support
// 4: Bounded autonomous clinical function (narrow, single-decision, fixed protocol)
// 5: Fully autonomous clinical function (open-ended / multi-step, no clinician gate)
//
// "Agency" (whether the tool plans and executes multi-step action sequences) is an
// orthogonal property captured by BasicData.agentic — NOT a higher tier here.
// See docs/decisions/0001-autonomy-tier-and-agentic-flag.md.

export type DeviceClass = 1 | 2 | 3 | 4 | 5 | 6;
// 1: Not a medical device / no classification required
// 2: Class I (low risk)
// 3: Class IIa (medium risk)
// 4: Class IIb (medium risk)
// 5: Class III (high risk)
// 6: Unknown

export type Determinism = 1 | 2 | 3;
// 1: Deterministic
// 2: Stochastic
// 3: Unknown

export interface BasicData {
  toolName: string;
  manufacturerName?: string;
  productUrl?: string;
  toolPurpose?: string;
  toolProblem?: string;
  orgName?: string;
  autonomyTier: AutonomyTier;
  /** Does the tool plan and execute multi-step action sequences? Orthogonal to autonomyTier. */
  agentic: boolean;
  users: string[];
  scope?: string;
  adoptionStage?: string;
  deviceClass: DeviceClass;
  determinism: Determinism;
  developer?: string;
  regulatoryAwareness?: string;
}

// ---- Scoring ----

export interface ComplexityScore {
  raw: Score;
  effective: Score; // After floor applied
  floor: FloorValue;
}

// ---- Sub-component trigger answers (yes/no questions) ----

export interface SubTriggerAnswers {
  /** Shown when C9 ≥ 2. "Does the org have a CAPA process for AI safety incidents?" */
  hasCAPAProcess?: boolean;
  /** Shown when C4 = 3. "Has the org put in place an automation bias mitigation strategy?" */
  hasAutomationBiasMitigation?: boolean;
  /** Shown when C6 = 3 AND C12 ≥ 2. "Does the contract include exit/sunsetting provision?" */
  hasExitProvision?: boolean;
}

// ---- Hard Gates ----

export type HardGateName =
  | "Safety"
  | "Human Oversight"
  | "Information Governance"
  | "Technical Integration"
  | "Monitoring"
  | "Values, Trust & Equity"
  | "Vendor";

export interface TriggeredGate {
  gate: HardGateName;
  firedOnPrimary: boolean;
  firedOnSubTrigger: boolean;
  explanation: string;
}

// ---- Gap Map ----

export interface DimensionGap {
  dimensionIndex: number; // 1–12
  complexityId: string; // e.g. "C9"
  readinessId: string; // e.g. "R9"
  complexityScore: Score; // effective
  readinessScore: Score;
  gap: 0 | 1 | 2;
}

// ---- Full Assessment ----

export interface Assessment {
  id: string;
  createdAt: string;
  updatedAt: string;

  basicData: BasicData;

  complexityScores: Record<string, ComplexityScore>;
  readinessScores: Record<string, Score>;
  subTriggerAnswers: SubTriggerAnswers;

  // Justification notes (optional free-text per dimension)
  justifications: Record<string, string>;

  // Computed results
  classification: Classification;
  triggeredGates: TriggeredGate[];
  majorGaps: number;
  minorGaps: number;
  avgComplexity: number;
  gapMap: DimensionGap[];
}
