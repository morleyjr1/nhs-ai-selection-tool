// ---------------------------------------------------------------------------
// Recommendation summary generator.
//
// Produces a structured, rule-based natural language summary of the
// assessment results. Used in both the results page and the PDF export.
//
// The summary answers three questions:
//   1. What is the recommendation? (classification + one-line rationale)
//   2. Why? (the key drivers — hard gates, critical gaps, overall profile)
//   3. What needs to happen? (priority actions for gap closure)
// ---------------------------------------------------------------------------

import type { AssessmentResult } from "./classify";
import type { DimensionGap, TriggeredGate, BasicData } from "./types";
import { complexityDimensions, readinessDimensions } from "./dimensions";

// ── Public interface ──

export interface RecommendationSummary {
  /** One-line headline, e.g. "CogStack is classified as Build Readiness First." */
  headline: string;
  /** 2-4 sentence explanation of why this classification was reached. */
  rationale: string;
  /** Ordered list of priority actions (empty for Quick Win). */
  priorityActions: string[];
  /** Short closing note. */
  closing: string;
  /** Full text concatenation for PDF use. */
  fullText: string;
}

// ── Dimension label lookups ──

const cLabels: Record<string, string> = {};
const rLabels: Record<string, string> = {};

complexityDimensions.forEach((d) => {
  cLabels[d.id] = d.shortLabel;
});
readinessDimensions.forEach((d) => {
  rLabels[d.id] = d.shortLabel;
});

function cLabel(i: number): string {
  return cLabels[`C${i}`] ?? `C${i}`;
}
function rLabel(i: number): string {
  return rLabels[`R${i}`] ?? `R${i}`;
}

// ── Generator ──

export function generateRecommendation(
  assessment: AssessmentResult,
  basicData: BasicData,
): RecommendationSummary {
  const toolName = basicData.toolName || "this tool";
  const classification = assessment.classification;

  const headline = `${toolName} is classified as ${classification}.`;

  const rationale = buildRationale(assessment, toolName);
  const priorityActions = buildPriorityActions(assessment);
  const closing = buildClosing(classification, toolName);

  const fullText = [
    headline,
    "",
    rationale,
    ...(priorityActions.length > 0
      ? ["", "Priority actions:", ...priorityActions.map((a, i) => `${i + 1}. ${a}`)]
      : []),
    "",
    closing,
  ].join("\n");

  return { headline, rationale, priorityActions, closing, fullText };
}

// ── Rationale builder ──

function buildRationale(
  assessment: AssessmentResult,
  toolName: string,
): string {
  const {
    classification,
    triggeredGates,
    majorGaps,
    minorGaps,
    avgComplexity,
    gaps,
    prioritisedGaps,
  } = assessment;

  const parts: string[] = [];

  switch (classification) {
    case "Avoid": {
      if (triggeredGates.length > 0) {
        const gateNames = triggeredGates.map((g) => g.gate);
        if (gateNames.length === 1) {
          parts.push(
            `The ${gateNames[0]} hard gate has been triggered, indicating a non-negotiable barrier to safe deployment.`,
          );
          parts.push(describeGateReason(triggeredGates[0]));
        } else {
          parts.push(
            `${gateNames.length} hard gates have been triggered (${joinList(gateNames)}), each indicating a non-negotiable barrier to safe deployment.`,
          );
        }
      }
      if (majorGaps >= 3) {
        const majorDims = gaps
          .filter((g) => g.gap === 2)
          .map((g) => rLabel(g.dimensionIndex));
        parts.push(
          `There are ${majorGaps} major readiness gaps (${joinList(majorDims)}), exceeding the threshold of 3 that triggers an Avoid classification regardless of hard gates.`,
        );
      }
      break;
    }

    case "Build readiness first": {
      if (majorGaps > 0) {
        const majorDims = gaps
          .filter((g) => g.gap === 2)
          .map((g) => `${rLabel(g.dimensionIndex)} (R${g.dimensionIndex})`);
        parts.push(
          `${majorGaps} major readiness gap${majorGaps > 1 ? "s were" : " was"} identified: ${joinList(majorDims)}. In each case, the organisation's readiness falls significantly short of the complexity demands.`,
        );
      }
      if (minorGaps >= 6) {
        parts.push(
          `Additionally, ${minorGaps} minor gaps were found across the framework, indicating a pattern of under-preparedness that compounds the risk.`,
        );
      } else if (minorGaps > 0) {
        parts.push(
          `A further ${minorGaps} minor gap${minorGaps > 1 ? "s were" : " was"} identified, requiring attention but not individually blocking.`,
        );
      }
      break;
    }

    case "Deploy and monitor": {
      parts.push(
        `No major readiness gaps were identified, suggesting the organisation has the foundational capacity to deploy ${toolName}.`,
      );
      if (minorGaps > 0) {
        const minorDims = gaps
          .filter((g) => g.gap === 1)
          .map((g) => rLabel(g.dimensionIndex));
        parts.push(
          `However, ${minorGaps} minor gap${minorGaps > 1 ? "s were" : " was"} found (${joinList(minorDims)}), and the overall complexity profile (average: ${avgComplexity.toFixed(1)}/3) warrants active monitoring during deployment.`,
        );
      } else if (avgComplexity > 2.0) {
        parts.push(
          `The overall complexity profile is elevated (average: ${avgComplexity.toFixed(1)}/3), which warrants active monitoring even in the absence of specific readiness gaps.`,
        );
      }
      break;
    }

    case "Quick win": {
      parts.push(
        `The complexity profile is low (average: ${avgComplexity.toFixed(1)}/3) and the organisation demonstrates strong readiness across all dimensions.`,
      );
      if (minorGaps > 0) {
        parts.push(
          `${minorGaps} minor gap${minorGaps > 1 ? "s were" : " was"} noted but ${minorGaps > 1 ? "are" : "is"} within acceptable limits for deployment.`,
        );
      } else {
        parts.push(
          `No readiness gaps were identified. This tool can proceed to deployment through normal governance channels.`,
        );
      }
      break;
    }
  }

  return parts.join(" ");
}

// ── Gate reason helper ──

function describeGateReason(gate: TriggeredGate): string {
  const explanations: Record<string, string> = {
    Safety:
      "The tool presents high safety consequences and the organisation currently has minimal clinical safety and risk management capacity for AI.",
    "Human Oversight":
      "The tool requires substantial human oversight that the organisation is not yet equipped to provide.",
    "Information Governance":
      "The information governance demands significantly exceed the organisation's current capacity.",
    "Technical Integration":
      "The technical integration requirements far exceed the organisation's current infrastructure readiness.",
    Monitoring:
      "The monitoring and lifecycle management demands cannot be met with current organisational capacity.",
    "Values, Trust & Equity":
      "There is a significant gap between the ethical complexity of the tool and the organisation's current ethics and engagement infrastructure.",
    Vendor:
      "The vendor and supply chain risks are compounded by high technical integration complexity without adequate organisational safeguards.",
  };
  return explanations[gate.gate] ?? gate.explanation;
}

// ── Priority actions builder ──

function buildPriorityActions(assessment: AssessmentResult): string[] {
  const { classification, prioritisedGaps, triggeredGates } = assessment;

  if (classification === "Quick win") return [];

  const actions: string[] = [];

  // Hard gate actions first
  for (const gate of triggeredGates) {
    actions.push(gateAction(gate));
  }

  // Then gap-based actions (take top 5 prioritised gaps)
  const topGaps = prioritisedGaps.slice(0, 5);
  for (const gap of topGaps) {
    const dim = rLabel(gap.dimensionIndex);
    const id = `R${gap.dimensionIndex}`;
    if (gap.gap === 2) {
      actions.push(
        `Close the major gap in ${dim} (${id}): readiness is at ${gap.readinessScore}/3 against complexity of ${gap.complexityScore}/3. This requires substantive capacity building before deployment can proceed.`,
      );
    } else {
      actions.push(
        `Address the minor gap in ${dim} (${id}): readiness is at ${gap.readinessScore}/3 against complexity of ${gap.complexityScore}/3.`,
      );
    }
  }

  return actions;
}

function gateAction(gate: TriggeredGate): string {
  const actions: Record<string, string> = {
    Safety:
      "Establish a clinical safety and risk management process for AI, including CAPA procedures, before this tool can be reconsidered.",
    "Human Oversight":
      "Develop and implement a human oversight framework with automation bias mitigation before this tool can be reconsidered.",
    "Information Governance":
      "Build information governance capacity to match the data complexity of this tool.",
    "Technical Integration":
      "Develop the technical infrastructure and integration capacity required to support this tool safely.",
    Monitoring:
      "Establish post-deployment monitoring and lifecycle management processes for AI tools.",
    "Values, Trust & Equity":
      "Invest in ethics review, patient and public involvement, and transparency infrastructure.",
    Vendor:
      "Strengthen vendor management and procurement processes, including contractual exit provisions.",
  };
  return actions[gate.gate] ?? `Resolve the ${gate.gate} hard gate before proceeding.`;
}

// ── Closing builder ──

function buildClosing(classification: string, toolName: string): string {
  switch (classification) {
    case "Avoid":
      return `${toolName} should not be deployed in its current organisational context. The barriers identified above must be resolved before the assessment is repeated.`;
    case "Build readiness first":
      return `Deployment of ${toolName} should be deferred until the priority actions above have been addressed. The assessment should be repeated once readiness-building activities are complete.`;
    case "Deploy and monitor":
      return `${toolName} can proceed to deployment, subject to a monitoring plan that tracks the minor gaps identified above. A review point should be scheduled within 6 months of go-live.`;
    case "Quick win":
      return `${toolName} can proceed to deployment through standard governance channels. Routine post-deployment review is still recommended.`;
    default:
      return "";
  }
}

// ── Utility ──

function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
