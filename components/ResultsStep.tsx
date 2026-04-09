"use client";

import type { AssessmentResult } from "../lib/classify";
import type { BasicData } from "../lib/types";
import type { LookupResults } from "../lib/lookup";
import type { FiredFlag } from "../lib/flags";
import { NHS_COLOURS, CLASSIFICATION_COLOURS } from "../lib/constants";
import { generatePDFReport } from "../lib/pdf-report";
import GapMap from "./GapMap";

interface ResultsStepProps {
  assessment: AssessmentResult;
  basicData: BasicData;
  justifications: Record<string, string>;
  firedFlags: FiredFlag[];
  lookupResults?: LookupResults | null;
  onBack: () => void;
  onExportJSON: () => void;
  onClearSave?: () => void;
}

export default function ResultsStep({
  assessment,
  basicData,
  justifications,
  firedFlags,
  lookupResults,
  onBack,
  onExportJSON,
  onClearSave,
}: ResultsStepProps) {
  const classColour =
    CLASSIFICATION_COLOURS[assessment.classification] ?? NHS_COLOURS.grey;

  function handleExportPDF() {
    generatePDFReport({
      assessment,
      basicData,
      justifications,
      firedFlags,
      lookupResults,
    });
    // Clear saved state after export
    onClearSave?.();
  }

  function handleExportJSON() {
    onExportJSON();
    onClearSave?.();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: NHS_COLOURS.darkBlue }}
      >
        Assessment Results
      </h2>

      {/* Classification badge */}
      <div
        className="rounded-lg p-6 mb-8 text-center"
        style={{ backgroundColor: classColour + "15" }}
      >
        <p
          className="text-sm font-medium mb-2"
          style={{ color: NHS_COLOURS.secondaryText }}
        >
          Classification
        </p>
        <span
          className="inline-block px-6 py-3 rounded-full text-xl font-bold text-white"
          style={{ backgroundColor: classColour }}
        >
          {assessment.classification}
        </span>
      </div>

      {/* Hard gate warnings */}
      {assessment.triggeredGates.length > 0 && (
        <div
          className="rounded-lg p-5 mb-6 border-l-4"
          style={{
            backgroundColor: "#FEF3F2",
            borderLeftColor: NHS_COLOURS.red,
          }}
        >
          <h3
            className="font-semibold mb-3"
            style={{ color: NHS_COLOURS.red }}
          >
            Hard Gate{assessment.triggeredGates.length > 1 ? "s" : ""} Triggered
          </h3>
          {assessment.triggeredGates.map((gate) => (
            <div key={gate.gate} className="mb-2 last:mb-0">
              <p
                className="text-sm font-medium"
                style={{ color: NHS_COLOURS.darkText }}
              >
                {gate.gate}
                {gate.firedOnPrimary && gate.firedOnSubTrigger
                  ? " (primary condition and sub-trigger)"
                  : gate.firedOnSubTrigger
                    ? " (sub-trigger)"
                    : " (primary condition)"}
              </p>
              <p
                className="text-sm"
                style={{ color: NHS_COLOURS.secondaryText }}
              >
                {gate.explanation}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Summary statistics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div
          className="rounded-lg p-4 text-center"
          style={{ backgroundColor: NHS_COLOURS.lightGrey }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: NHS_COLOURS.secondaryText }}
          >
            Major Gaps
          </p>
          <p
            className="text-3xl font-bold mt-1"
            style={{
              color:
                assessment.majorGaps > 0
                  ? NHS_COLOURS.red
                  : NHS_COLOURS.green,
            }}
          >
            {assessment.majorGaps}
          </p>
        </div>
        <div
          className="rounded-lg p-4 text-center"
          style={{ backgroundColor: NHS_COLOURS.lightGrey }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: NHS_COLOURS.secondaryText }}
          >
            Minor Gaps
          </p>
          <p
            className="text-3xl font-bold mt-1"
            style={{
              color:
                assessment.minorGaps > 0
                  ? NHS_COLOURS.amber
                  : NHS_COLOURS.green,
            }}
          >
            {assessment.minorGaps}
          </p>
        </div>
        <div
          className="rounded-lg p-4 text-center"
          style={{ backgroundColor: NHS_COLOURS.lightGrey }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: NHS_COLOURS.secondaryText }}
          >
            Avg Complexity
          </p>
          <p
            className="text-3xl font-bold mt-1"
            style={{ color: NHS_COLOURS.darkText }}
          >
            {assessment.avgComplexity.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Gap map */}
      <div className="mb-8">
        <h3
          className="text-lg font-semibold mb-3"
          style={{ color: NHS_COLOURS.darkText }}
        >
          Gap Map
        </h3>
        <GapMap gaps={assessment.gaps} />
      </div>

      {/* Prioritised action list */}
      {assessment.prioritisedGaps.length > 0 && (
        <div className="mb-8">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Prioritised Gaps
          </h3>
          <div className="space-y-2">
            {assessment.prioritisedGaps.map((gap, i) => (
              <div
                key={gap.dimensionIndex}
                className="flex items-center gap-3 rounded px-4 py-3"
                style={{ backgroundColor: NHS_COLOURS.lightGrey }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{
                    backgroundColor:
                      gap.gap === 2 ? NHS_COLOURS.red : NHS_COLOURS.amber,
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <span
                    className="text-sm font-medium"
                    style={{ color: NHS_COLOURS.darkText }}
                  >
                    Dimension {gap.dimensionIndex}
                  </span>
                  <span
                    className="text-sm ml-2"
                    style={{ color: NHS_COLOURS.secondaryText }}
                  >
                    — {gap.gap === 2 ? "Major" : "Minor"} gap (C:
                    {gap.complexityScore}, R:{gap.readinessScore})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scope and limitations */}
      <div
        className="rounded-lg p-5 mb-8"
        style={{ backgroundColor: NHS_COLOURS.lightGrey }}
      >
        <h3
          className="text-sm font-semibold mb-2"
          style={{ color: NHS_COLOURS.darkText }}
        >
          Scope and Limitations
        </h3>
        <p className="text-sm" style={{ color: NHS_COLOURS.secondaryText }}>
          The framework identifies and prioritises gaps between the complexity
          demands of a specific AI tool and the readiness of a specific deploying
          organisation. It does not generate specific readiness-building actions
          (e.g. &ldquo;create a clinical safety case&rdquo; or &ldquo;establish a
          monitoring dashboard&rdquo;). Translating prioritised gaps into concrete
          action plans requires domain expertise, organisational knowledge, and
          professional judgement that sit outside the scope of a standardised
          assessment instrument. This is a deliberate design choice: the framework
          tells you <em>where</em> to focus; determining <em>what to do</em> is
          the work of the implementation team.
        </p>
      </div>

      {/* Navigation & Export */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded font-medium text-sm"
          style={{
            color: NHS_COLOURS.blue,
            border: `1px solid ${NHS_COLOURS.blue}`,
            backgroundColor: NHS_COLOURS.white,
          }}
        >
          ← Back to Readiness
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleExportJSON}
            className="px-6 py-3 rounded font-medium text-sm"
            style={{
              color: NHS_COLOURS.blue,
              border: `1px solid ${NHS_COLOURS.blue}`,
              backgroundColor: NHS_COLOURS.white,
            }}
          >
            Export JSON
          </button>
          <button
            onClick={handleExportPDF}
            className="px-8 py-3 rounded font-medium text-sm"
            style={{
              backgroundColor: NHS_COLOURS.blue,
              color: NHS_COLOURS.white,
            }}
          >
            Export PDF Report ↓
          </button>
        </div>
      </div>
    </div>
  );
}
