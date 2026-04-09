"use client";

import { useState, useCallback } from "react";
import type { Score, BasicData, SubTriggerAnswers } from "../lib/types";
import type { AssessmentResult } from "../lib/classify";
import { complexityDimensions, readinessDimensions } from "../lib/dimensions";
import { computeFloors, applyFloor } from "../lib/floors";
import { getSubTriggerVisibility } from "../lib/hardgates";
import { runAssessment } from "../lib/classify";
import { NHS_COLOURS } from "../lib/constants";

import ProgressBar from "./ProgressBar";
import FramingStep from "./FramingStep";
import BasicDataStep from "./BasicDataStep";
import ScoringStep from "./ScoringStep";
import ResultsStep from "./ResultsStep";

// Category, deviceClass, and determinism start at 0 (unselected) — this is
// outside the valid Score range but the UI enforces selection before advancing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EMPTY_BASIC_DATA: BasicData = {
  toolName: "",
  category: 0 as any,
  users: [],
  deviceClass: 0 as any,
  determinism: 0 as any,
};

export default function SelectionTool() {
  // ── Wizard state ──
  const [step, setStep] = useState(0);

  // ── Data state ──
  const [basicData, setBasicData] = useState<BasicData>(EMPTY_BASIC_DATA);
  const [cScores, setCScores] = useState<Record<string, Score | null>>(
    Object.fromEntries(complexityDimensions.map((d) => [d.id, null])),
  );
  const [rScores, setRScores] = useState<Record<string, Score | null>>(
    Object.fromEntries(readinessDimensions.map((d) => [d.id, null])),
  );
  const [subAnswers, setSubAnswers] = useState<SubTriggerAnswers>({});
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);

  // ── Derived: scoring floors ──
  const floors =
    basicData.category > 0 && basicData.deviceClass > 0 && basicData.determinism > 0
      ? computeFloors(basicData)
      : {};

  // ── Derived: sub-trigger visibility ──
  const cScoresForVis: Record<string, Score> = {};
  for (const [k, v] of Object.entries(cScores)) {
    if (v !== null) cScoresForVis[k] = v;
  }
  const subVis = getSubTriggerVisibility(cScoresForVis);

  // ── Handlers ──
  function handleBasicDataNext(data: BasicData) {
    setBasicData(data);
    setStep(2);
  }

  function handleCScore(dimId: string, score: Score) {
    const floor = floors[dimId] ?? 0;
    const effective = applyFloor(score, floor) as Score;
    setCScores((prev) => ({ ...prev, [dimId]: effective }));
  }

  function handleRScore(dimId: string, score: Score) {
    setRScores((prev) => ({ ...prev, [dimId]: score }));
  }

  function handleSubAnswer(field: keyof SubTriggerAnswers, value: boolean) {
    setSubAnswers((prev) => ({ ...prev, [field]: value }));
  }

  const handleRunAssessment = useCallback(() => {
    // Convert nullable scores to definite scores (all should be filled by this point)
    const cFinal: Record<string, Score> = {};
    const rFinal: Record<string, Score> = {};
    for (const [k, v] of Object.entries(cScores)) {
      if (v !== null) cFinal[k] = v;
    }
    for (const [k, v] of Object.entries(rScores)) {
      if (v !== null) rFinal[k] = v;
    }

    const result = runAssessment(basicData, cFinal, rFinal, subAnswers);
    setAssessment(result);
    setStep(4);
  }, [basicData, cScores, rScores, subAnswers]);

  function handleExport() {
    if (!assessment) return;
    const blob = new Blob([JSON.stringify(assessment, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nhs-ai-assessment-${basicData.toolName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Build sub-trigger props for readiness step ──
  const readinessSubTriggers: Record<
    string,
    { question: string; answer: boolean | undefined; onAnswer: (v: boolean) => void }
  > = {};

  if (subVis.showCAPAQuestion) {
    readinessSubTriggers["R9"] = {
      question:
        "Does the organisation have a corrective and preventive action (CAPA) process in place for AI-specific safety incidents?",
      answer: subAnswers.hasCAPAProcess,
      onAnswer: (v) => handleSubAnswer("hasCAPAProcess", v),
    };
  }
  if (subVis.showAutomationBiasQuestion) {
    readinessSubTriggers["R4"] = {
      question:
        "Has the organisation identified and put in place a mitigation strategy for automation bias risk for this tool?",
      answer: subAnswers.hasAutomationBiasMitigation,
      onAnswer: (v) => handleSubAnswer("hasAutomationBiasMitigation", v),
    };
  }
  if (subVis.showExitProvisionQuestion) {
    readinessSubTriggers["R12"] = {
      question:
        "Does the contract include an exit or sunsetting provision?",
      answer: subAnswers.hasExitProvision,
      onAnswer: (v) => handleSubAnswer("hasExitProvision", v),
    };
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: NHS_COLOURS.white }}>
      {/* Header */}
      <header
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: NHS_COLOURS.white,
          borderColor: NHS_COLOURS.lightGrey,
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-xl font-bold"
            style={{ color: NHS_COLOURS.darkBlue }}
          >
            NHS AI Selection Tool
          </h1>
          <p className="text-xs" style={{ color: NHS_COLOURS.grey }}>
            12×12 Paired Complexity–Readiness Framework
          </p>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <ProgressBar currentStep={step} />
      </div>

      {/* Step content */}
      <main className="max-w-4xl mx-auto px-6 pb-16">
        {step === 0 && <FramingStep onNext={() => setStep(1)} />}

        {step === 1 && (
          <BasicDataStep
            initialData={basicData}
            onNext={handleBasicDataNext}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <ScoringStep
            title="Complexity Assessment (C1–C12)"
            description="Score each dimension based on the properties of the AI tool. Higher scores indicate greater complexity."
            dimensions={complexityDimensions}
            scores={cScores}
            floors={floors}
            onScore={handleCScore}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            nextLabel="Continue to Readiness Assessment →"
          />
        )}

        {step === 3 && (
          <ScoringStep
            title="Readiness Assessment (R1–R12)"
            description="Score each dimension based on the deploying organisation's current capabilities. Higher scores indicate greater readiness."
            dimensions={readinessDimensions}
            scores={rScores}
            onScore={handleRScore}
            onBack={() => setStep(2)}
            onNext={handleRunAssessment}
            nextLabel="Calculate Results →"
            subTriggers={readinessSubTriggers}
          />
        )}

        {step === 4 && assessment && (
          <ResultsStep
            assessment={assessment}
            onBack={() => setStep(3)}
            onExport={handleExport}
          />
        )}
      </main>
    </div>
  );
}
