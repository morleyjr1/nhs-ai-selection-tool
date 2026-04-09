// ---------------------------------------------------------------------------
// Classification logic — gap calculation, classification thresholds,
// and gap prioritisation sequencing.
//
// Source: PDF pages 18–19 and web spec lines 112–171, 442–444.
//
// The classification is deterministic and order-dependent: thresholds are
// applied as a decision tree where the first match wins.
// ---------------------------------------------------------------------------

import type {
  Score,
  Classification,
  DimensionGap,
  ComplexityScore,
  TriggeredGate,
  BasicData,
  SubTriggerAnswers,
} from "./types";
import { computeFloors, applyFloor } from "./floors";
import { checkHardGates, isNearHardGate } from "./hardgates";

// ---------------------------------------------------------------------------
// 1. Gap calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the gap for each of the 12 paired dimensions.
 * Gap = max(0, effective complexity score − readiness score).
 *
 * @returns Array of 12 DimensionGap objects, one per paired dimension.
 */
export function calculateGaps(
  cScores: Record<string, ComplexityScore>,
  rScores: Record<string, Score>
): DimensionGap[] {
  const gaps: DimensionGap[] = [];

  for (let i = 1; i <= 12; i++) {
    const cId = `C${i}`;
    const rId = `R${i}`;
    const cScore = cScores[cId]?.effective ?? 1;
    const rScore = rScores[rId] ?? 1;
    const gap = Math.max(0, cScore - rScore) as 0 | 1 | 2;

    gaps.push({
      dimensionIndex: i,
      complexityId: cId,
      readinessId: rId,
      complexityScore: cScore,
      readinessScore: rScore,
      gap,
    });
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// 2. Classification thresholds
// ---------------------------------------------------------------------------

/**
 * Apply classification rules in order (first match wins).
 *
 * 1. Avoid — any hard gate triggered, OR ≥ 3 major gaps (gap = 2)
 * 2. Build readiness first — 1–2 major gaps, OR ≥ 6 minor gaps (gap = 1)
 * 3. Deploy and monitor — 0 major AND (3–5 minor OR avg complexity > 2.0)
 * 4. Quick win — 0 major AND ≤ 2 minor AND avg complexity ≤ 2.0
 */
export function classify(
  gaps: DimensionGap[],
  triggeredGates: TriggeredGate[],
  avgComplexity: number
): Classification {
  const majorGaps = gaps.filter((g) => g.gap === 2).length;
  const minorGaps = gaps.filter((g) => g.gap === 1).length;

  // Rule 1: Avoid
  if (triggeredGates.length > 0 || majorGaps >= 3) {
    return "Avoid";
  }

  // Rule 2: Build readiness first
  if (majorGaps >= 1 || minorGaps >= 6) {
    return "Build readiness first";
  }

  // Rule 3: Deploy and monitor
  if (minorGaps >= 3 || avgComplexity > 2.0) {
    return "Deploy and monitor";
  }

  // Rule 4: Quick win
  return "Quick win";
}

/**
 * Calculate the average effective complexity score across all 12 dimensions.
 */
export function calculateAvgComplexity(
  cScores: Record<string, ComplexityScore>
): number {
  let total = 0;
  for (let i = 1; i <= 12; i++) {
    total += cScores[`C${i}`]?.effective ?? 1;
  }
  return total / 12;
}

// ---------------------------------------------------------------------------
// 3. Gap prioritisation sequencing
// ---------------------------------------------------------------------------

// Which dimensions map to the "safety and oversight" priority band
const SAFETY_OVERSIGHT_DIMS = new Set([4, 9]);

// Precondition dimensions (R3, R2, R1) — must be closed before downstream gaps
const PRECONDITION_DIMS = new Set([1, 2, 3]);

// Cross-cutting dimensions: dimensions that affect multiple success criteria.
// From the web spec's meta-level grouping (lines 744–751):
//   Technically feasible: C6, C11, R2, R6, R11
//   Socially acceptable: C1, C7, C10, R1, R7, R10
//   Ethically justifiable: C4, C10, R4, R10
//   Legally compliant: C3, C5, C8, C9, R3, R5, R8, R9
//
// Readiness dimensions appearing in more than one group:
//   R1 → 1 group (socially acceptable) — not cross-cutting
//   R2 → 1 group — not cross-cutting
//   R3 → 1 group — not cross-cutting (but is a precondition)
//   R4 → 1 group — not cross-cutting
//   R5 → 1 group — not cross-cutting
//   R6 → 1 group — not cross-cutting
//   R10 → 2 groups (socially acceptable + ethically justifiable) — CROSS-CUTTING
//
// Complexity dimensions appearing in more than one group:
//   C10 → 2 groups — CROSS-CUTTING
//
// In practice, the spec highlights R6 when it constrains both C2 (data) and
// C6 (integration). We treat dimensions 6 and 10 as cross-cutting.
const CROSS_CUTTING_DIMS = new Set([6, 10]);

/**
 * Sort gaps by the framework's five-level priority order for gap closure.
 *
 * 1. Hard gate proximity — currently firing, then one score point away
 * 2. Safety and oversight gaps (dimensions 4 and 9)
 * 3. Precondition dimensions (dimensions 1, 2, 3)
 * 4. Major gaps (gap = 2) before minor gaps (gap = 1)
 * 5. Cross-cutting dimensions above single-criterion gaps of the same size
 *
 * Only gaps where gap > 0 are included in the output.
 */
export function prioritiseGaps(
  gaps: DimensionGap[],
  triggeredGates: TriggeredGate[],
  cScores: Record<string, Score>,
  rScores: Record<string, Score>
): DimensionGap[] {
  // Filter to only gaps that exist
  const withGaps = gaps.filter((g) => g.gap > 0);

  // Set of dimension indices where a hard gate is currently firing
  const firingGateDims = new Set<number>();
  for (const tg of triggeredGates) {
    switch (tg.gate) {
      case "Safety":
        firingGateDims.add(9);
        break;
      case "Human Oversight":
        firingGateDims.add(4);
        break;
      case "Information Governance":
        firingGateDims.add(3);
        break;
      case "Technical Integration":
        firingGateDims.add(6);
        break;
      case "Monitoring":
        firingGateDims.add(11);
        break;
      case "Values, Trust & Equity":
        firingGateDims.add(10);
        break;
      case "Vendor":
        firingGateDims.add(12);
        break;
    }
  }

  return withGaps.sort((a, b) => {
    // Priority 1: Hard gate proximity
    const aFiring = firingGateDims.has(a.dimensionIndex) ? 0 : 1;
    const bFiring = firingGateDims.has(b.dimensionIndex) ? 0 : 1;
    if (aFiring !== bFiring) return aFiring - bFiring;

    const aNear = isNearHardGate(a.dimensionIndex, cScores, rScores) ? 0 : 1;
    const bNear = isNearHardGate(b.dimensionIndex, cScores, rScores) ? 0 : 1;
    if (aNear !== bNear) return aNear - bNear;

    // Priority 2: Safety and oversight
    const aSafety = SAFETY_OVERSIGHT_DIMS.has(a.dimensionIndex) ? 0 : 1;
    const bSafety = SAFETY_OVERSIGHT_DIMS.has(b.dimensionIndex) ? 0 : 1;
    if (aSafety !== bSafety) return aSafety - bSafety;

    // Priority 3: Precondition dimensions
    const aPrecon = PRECONDITION_DIMS.has(a.dimensionIndex) ? 0 : 1;
    const bPrecon = PRECONDITION_DIMS.has(b.dimensionIndex) ? 0 : 1;
    if (aPrecon !== bPrecon) return aPrecon - bPrecon;

    // Priority 4: Major before minor
    if (a.gap !== b.gap) return b.gap - a.gap;

    // Priority 5: Cross-cutting dimensions
    const aCross = CROSS_CUTTING_DIMS.has(a.dimensionIndex) ? 0 : 1;
    const bCross = CROSS_CUTTING_DIMS.has(b.dimensionIndex) ? 0 : 1;
    if (aCross !== bCross) return aCross - bCross;

    // Stable fallback: dimension index order
    return a.dimensionIndex - b.dimensionIndex;
  });
}

// ---------------------------------------------------------------------------
// 4. Full assessment pipeline
// ---------------------------------------------------------------------------

export interface AssessmentResult {
  classification: Classification;
  triggeredGates: TriggeredGate[];
  gaps: DimensionGap[];
  prioritisedGaps: DimensionGap[];
  majorGaps: number;
  minorGaps: number;
  avgComplexity: number;
  effectiveScores: Record<string, ComplexityScore>;
}

/**
 * Run the full assessment pipeline:
 * 1. Compute and apply scoring floors
 * 2. Check hard gates
 * 3. Calculate gaps
 * 4. Classify
 * 5. Prioritise gaps
 */
export function runAssessment(
  basicData: BasicData,
  rawComplexityScores: Record<string, Score>,
  readinessScores: Record<string, Score>,
  subTriggerAnswers: SubTriggerAnswers
): AssessmentResult {
  // Step 1: Compute floors and apply them
  const floors = computeFloors(basicData);
  const effectiveScores: Record<string, ComplexityScore> = {};

  for (let i = 1; i <= 12; i++) {
    const id = `C${i}`;
    const raw = rawComplexityScores[id] ?? (1 as Score);
    const floor = floors[id] ?? 0;
    effectiveScores[id] = {
      raw,
      effective: applyFloor(raw, floor),
      floor,
    };
  }

  // Extract effective scores as plain Score records for gate/gap checks
  const cEffective: Record<string, Score> = {};
  for (const [id, cs] of Object.entries(effectiveScores)) {
    cEffective[id] = cs.effective;
  }

  // Step 2: Check hard gates
  const triggeredGates = checkHardGates(
    cEffective,
    readinessScores,
    subTriggerAnswers
  );

  // Step 3: Calculate gaps
  const gaps = calculateGaps(effectiveScores, readinessScores);

  // Step 4: Classify
  const avgComplexity = calculateAvgComplexity(effectiveScores);
  const majorGaps = gaps.filter((g) => g.gap === 2).length;
  const minorGaps = gaps.filter((g) => g.gap === 1).length;
  const classification = classify(gaps, triggeredGates, avgComplexity);

  // Step 5: Prioritise gaps
  const prioritisedGaps = prioritiseGaps(
    gaps,
    triggeredGates,
    cEffective,
    readinessScores
  );

  return {
    classification,
    triggeredGates,
    gaps,
    prioritisedGaps,
    majorGaps,
    minorGaps,
    avgComplexity,
    effectiveScores,
  };
}
