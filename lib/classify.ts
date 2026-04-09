// ---------------------------------------------------------------------------
// Unit tests for the scoring logic: floors, hard gates, classification,
// and the full assessment pipeline.
//
// Run with: npx tsx scripts/test-scoring.ts
// (This file is a lightweight test runner — no test framework needed.)
// ---------------------------------------------------------------------------

import type { Score, BasicData, SubTriggerAnswers } from "./types";
import { computeFloors, applyFloor } from "./floors";
import { checkHardGates, getSubTriggerVisibility } from "./hardgates";
import {
  calculateGaps,
  classify,
  calculateAvgComplexity,
  prioritiseGaps,
  runAssessment,
} from "./classify";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${label}`);
  }
}

// ---------------------------------------------------------------------------
// 1. Scoring Floors
// ---------------------------------------------------------------------------
console.log("\n=== Scoring Floors ===");

// Deterministic, non-autonomous, no device class → no floors
const basicDeterministic: BasicData = {
  toolName: "Test",
  category: 2,
  users: [],
  deviceClass: 1,
  determinism: 1,
};
const floors1 = computeFloors(basicDeterministic);
assert(floors1["C4"] === 0, "Deterministic tool: C4 floor = 0");
assert(floors1["C9"] === 0, "Deterministic tool: C9 floor = 0");
assert(floors1["C11"] === 0, "Deterministic tool: C11 floor = 0");

// Stochastic tool → C4 ≥ 2, C5 ≥ 2, C11 ≥ 2
const basicStochastic: BasicData = {
  toolName: "Test",
  category: 2,
  users: [],
  deviceClass: 1,
  determinism: 2,
};
const floors2 = computeFloors(basicStochastic);
assert(floors2["C4"] === 2, "Stochastic tool: C4 floor = 2");
assert(floors2["C5"] === 2, "Stochastic tool: C5 floor = 2");
assert(floors2["C11"] === 2, "Stochastic tool: C11 floor = 2");
assert(floors2["C9"] === 0, "Stochastic tool: C9 floor unchanged");

// Autonomous → C4 ≥ 2, C9 ≥ 2
const basicAutonomous: BasicData = {
  toolName: "Test",
  category: 4,
  users: [],
  deviceClass: 1,
  determinism: 1,
};
const floors3 = computeFloors(basicAutonomous);
assert(floors3["C4"] === 2, "Autonomous tool: C4 floor = 2");
assert(floors3["C9"] === 2, "Autonomous tool: C9 floor = 2");

// Class III → C9 = 3 (overrides Class IIb's C9 ≥ 2)
const basicClassIII: BasicData = {
  toolName: "Test",
  category: 2,
  users: [],
  deviceClass: 5,
  determinism: 1,
};
const floors4 = computeFloors(basicClassIII);
assert(floors4["C9"] === 3, "Class III device: C9 floor = 3");

// Cumulative: stochastic + autonomous + Class III
const basicCumulative: BasicData = {
  toolName: "Test",
  category: 4,
  users: [],
  deviceClass: 5,
  determinism: 2,
};
const floors5 = computeFloors(basicCumulative);
assert(floors5["C4"] === 2, "Cumulative: C4 floor = 2 (stochastic + autonomous)");
assert(floors5["C5"] === 2, "Cumulative: C5 floor = 2 (stochastic)");
assert(floors5["C9"] === 3, "Cumulative: C9 floor = 3 (Class III wins)");
assert(floors5["C11"] === 2, "Cumulative: C11 floor = 2 (stochastic)");

// applyFloor
assert(applyFloor(1 as Score, 2) === 2, "applyFloor(1, 2) = 2");
assert(applyFloor(3 as Score, 2) === 3, "applyFloor(3, 2) = 3");
assert(applyFloor(1 as Score, 0) === 1, "applyFloor(1, 0) = 1");

// ---------------------------------------------------------------------------
// 2. Hard Gates
// ---------------------------------------------------------------------------
console.log("\n=== Hard Gates ===");

// No gates fire when all scores are low
const lowC: Record<string, Score> = {};
const lowR: Record<string, Score> = {};
for (let i = 1; i <= 12; i++) {
  lowC[`C${i}`] = 1;
  lowR[`R${i}`] = 1;
}
const noSub: SubTriggerAnswers = {};
const gates1 = checkHardGates(lowC, lowR, noSub);
assert(gates1.length === 0, "All scores 1/1: no gates fire");

// Safety gate fires: C9=3, R9=1
const safetyC = { ...lowC, C9: 3 as Score };
const safetyR = { ...lowR, R9: 1 as Score };
const gates2 = checkHardGates(safetyC, safetyR, noSub);
assert(gates2.length === 1, "Safety gate: 1 gate fires");
assert(gates2[0]?.gate === "Safety", "Safety gate: correct gate name");
assert(gates2[0]?.firedOnPrimary === true, "Safety gate: fired on primary");

// Safety gate does NOT fire when R9=2
const safetyR2 = { ...lowR, R9: 2 as Score };
const gates3 = checkHardGates(safetyC, safetyR2, noSub);
assert(gates3.length === 0, "Safety gate: R9=2 prevents firing");

// Sub-trigger: CAPA process = false fires Safety gate independently
const capaC = { ...lowC, C9: 2 as Score }; // C9=2, not 3
const capaR = { ...lowR, R9: 2 as Score }; // R9=2, not 1
const capaSub: SubTriggerAnswers = { hasCAPAProcess: false };
const gates4 = checkHardGates(capaC, capaR, capaSub);
assert(gates4.length === 1, "CAPA sub-trigger: 1 gate fires");
assert(gates4[0]?.firedOnSubTrigger === true, "CAPA sub-trigger: fired on sub");
assert(gates4[0]?.firedOnPrimary === false, "CAPA sub-trigger: not on primary");

// Vendor gate: compound condition C6=3 AND C12=3 AND R12=1
const vendorC = { ...lowC, C6: 3 as Score, C12: 3 as Score };
const vendorR = { ...lowR, R12: 1 as Score };
const gates5 = checkHardGates(vendorC, vendorR, noSub);
assert(
  gates5.some((g) => g.gate === "Vendor"),
  "Vendor gate fires on compound condition"
);

// Vendor gate: C6=3 but C12=2 → should NOT fire
const vendorC2 = { ...lowC, C6: 3 as Score, C12: 2 as Score };
const gates6 = checkHardGates(vendorC2, vendorR, noSub);
assert(
  !gates6.some((g) => g.gate === "Vendor"),
  "Vendor gate: C12=2 prevents firing"
);

// Sub-trigger visibility
const vis1 = getSubTriggerVisibility(lowC);
assert(vis1.showCAPAQuestion === false, "Visibility: CAPA hidden when C9=1");
assert(
  vis1.showAutomationBiasQuestion === false,
  "Visibility: automation bias hidden when C4=1"
);

const vis2 = getSubTriggerVisibility({ ...lowC, C9: 2 as Score });
assert(vis2.showCAPAQuestion === true, "Visibility: CAPA shown when C9=2");

const vis3 = getSubTriggerVisibility({
  ...lowC,
  C4: 3 as Score,
});
assert(
  vis3.showAutomationBiasQuestion === true,
  "Visibility: automation bias shown when C4=3"
);

const vis4 = getSubTriggerVisibility({
  ...lowC,
  C6: 3 as Score,
  C12: 2 as Score,
});
assert(
  vis4.showExitProvisionQuestion === true,
  "Visibility: exit provision shown when C6=3 AND C12=2"
);

// ---------------------------------------------------------------------------
// 3. Classification
// ---------------------------------------------------------------------------
console.log("\n=== Classification ===");

// Helper: make ComplexityScore records from effective scores
function makeEffective(scores: Record<string, Score>) {
  const result: Record<string, { raw: Score; effective: Score; floor: 0 }> = {};
  for (const [k, v] of Object.entries(scores)) {
    result[k] = { raw: v, effective: v, floor: 0 };
  }
  return result;
}

// Quick win: all gaps = 0, low complexity
const qwC: Record<string, Score> = {};
const qwR: Record<string, Score> = {};
for (let i = 1; i <= 12; i++) {
  qwC[`C${i}`] = 1;
  qwR[`R${i}`] = 1;
}
const qwGaps = calculateGaps(makeEffective(qwC), qwR);
const qwClass = classify(qwGaps, [], calculateAvgComplexity(makeEffective(qwC)));
assert(qwClass === "Quick win", "All 1/1: Quick win");

// Avoid: 3 major gaps
const avoidC: Record<string, Score> = { ...qwC, C1: 3, C2: 3, C3: 3 } as Record<string, Score>;
const avoidR: Record<string, Score> = { ...qwR, R1: 1, R2: 1, R3: 1 } as Record<string, Score>;
const avoidGaps = calculateGaps(makeEffective(avoidC), avoidR);
const avoidClass = classify(avoidGaps, [], calculateAvgComplexity(makeEffective(avoidC)));
assert(avoidClass === "Avoid", "3 major gaps: Avoid");

// Avoid: hard gate triggered (even with 0 gaps)
const avoidClass2 = classify(qwGaps, [{ gate: "Safety", firedOnPrimary: true, firedOnSubTrigger: false, explanation: "" }], 1.0);
assert(avoidClass2 === "Avoid", "Hard gate triggered: Avoid");

// Build readiness first: 1 major gap
const brfC = { ...qwC, C1: 3 } as Record<string, Score>;
const brfR = { ...qwR, R1: 1 } as Record<string, Score>;
const brfGaps = calculateGaps(makeEffective(brfC), brfR);
const brfClass = classify(brfGaps, [], calculateAvgComplexity(makeEffective(brfC)));
assert(brfClass === "Build readiness first", "1 major gap: Build readiness first");

// Build readiness first: 6 minor gaps
const minorC: Record<string, Score> = {};
const minorR: Record<string, Score> = {};
for (let i = 1; i <= 12; i++) {
  minorC[`C${i}`] = i <= 6 ? (2 as Score) : (1 as Score);
  minorR[`R${i}`] = 1 as Score;
}
const minorGaps = calculateGaps(makeEffective(minorC), minorR);
const minorClass = classify(minorGaps, [], calculateAvgComplexity(makeEffective(minorC)));
assert(minorClass === "Build readiness first", "6 minor gaps: Build readiness first");

// Deploy and monitor: 3 minor gaps, 0 major
const dmC: Record<string, Score> = {};
const dmR: Record<string, Score> = {};
for (let i = 1; i <= 12; i++) {
  dmC[`C${i}`] = i <= 3 ? (2 as Score) : (1 as Score);
  dmR[`R${i}`] = 1 as Score;
}
const dmGaps = calculateGaps(makeEffective(dmC), dmR);
const dmClass = classify(dmGaps, [], calculateAvgComplexity(makeEffective(dmC)));
assert(dmClass === "Deploy and monitor", "3 minor gaps: Deploy and monitor");

// Deploy and monitor: avg complexity > 2.0 with 0 gaps
const highC: Record<string, Score> = {};
const highR: Record<string, Score> = {};
for (let i = 1; i <= 12; i++) {
  highC[`C${i}`] = 3 as Score;
  highR[`R${i}`] = 3 as Score;
}
const highGaps = calculateGaps(makeEffective(highC), highR);
const highClass = classify(highGaps, [], calculateAvgComplexity(makeEffective(highC)));
assert(highClass === "Deploy and monitor", "Avg complexity 3.0, 0 gaps: Deploy and monitor");

// ---------------------------------------------------------------------------
// 4. Gap Prioritisation
// ---------------------------------------------------------------------------
console.log("\n=== Gap Prioritisation ===");

// Safety dimension (9) should rank above a non-safety dimension (1) for same gap size
const prioC: Record<string, Score> = { ...qwC, C1: 3, C9: 3 } as Record<string, Score>;
const prioR: Record<string, Score> = { ...qwR, R1: 1, R9: 1 } as Record<string, Score>;
const prioGaps = calculateGaps(makeEffective(prioC), prioR);
const prioritised = prioritiseGaps(prioGaps, [], prioC, prioR);
assert(prioritised.length === 2, "2 gaps exist");
assert(
  prioritised[0]?.dimensionIndex === 9,
  "Safety dim (9) prioritised above precondition dim (1)"
);

// ---------------------------------------------------------------------------
// 5. Full Pipeline
// ---------------------------------------------------------------------------
console.log("\n=== Full Assessment Pipeline ===");

const result = runAssessment(
  basicCumulative,        // stochastic + autonomous + Class III
  qwC,                    // all raw scores = 1
  qwR,                    // all readiness = 1
  noSub
);

// With cumulative floors: C4≥2, C5≥2, C9=3, C11≥2
// So effective C4=2, C5=2, C9=3, C11=2 vs all R=1
// Gaps: C4(2-1=1), C5(2-1=1), C9(3-1=2), C11(2-1=1) = 1 major, 3 minor
// BUT also: Safety hard gate fires (C9=3, R9=1) → Avoid
assert(
  result.classification === "Avoid",
  "Full pipeline: Safety hard gate forces Avoid"
);
assert(result.majorGaps === 1, "Full pipeline: 1 major gap (C9)");
assert(result.minorGaps === 3, "Full pipeline: 3 minor gaps (C4, C5, C11)");
assert(
  result.effectiveScores["C9"]?.effective === 3,
  "Full pipeline: C9 effective = 3 (Class III floor)"
);
assert(
  result.triggeredGates.some((g) => g.gate === "Safety"),
  "Full pipeline: Safety hard gate fires (C9=3, R9=1)"
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${"=".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
