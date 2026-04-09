"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { Score, BasicData, SubTriggerAnswers } from "../lib/types";
import type { AssessmentResult } from "../lib/classify";
import type { LookupResults } from "../lib/lookup";
import { runLookup } from "../lib/lookup";
import { complexityDimensions, readinessDimensions } from "../lib/dimensions";
import { computeFloors, applyFloor } from "../lib/floors";
import { getSubTriggerVisibility } from "../lib/hardgates";
import { runAssessment } from "../lib/classify";
import { NHS_COLOURS } from "../lib/constants";
import { evaluateFlags, containsIDontKnow } from "../lib/flags";
import type { FiredFlag } from "../lib/flags";

import LandingPage from "./LandingPage";
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
  // ── Landing page vs wizard ──
  const [showLanding, setShowLanding] = useState(true);

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

  // ── Justification text state ──
  const [cJustifications, setCJustifications] = useState<Record<string, string>>(
    Object.fromEntries(complexityDimensions.map((d) => [d.id, ""])),
  );
  const [rJustifications, setRJustifications] = useState<Record<string, string>>(
    Object.fromEntries(readinessDimensions.map((d) => [d.id, ""])),
  );

  // ── "I don't know" state ──
  const [cUnknowns, setCUnknowns] = useState<Record<string, boolean>>(
    Object.fromEntries(complexityDimensions.map((d) => [d.id, false])),
  );
  const [rUnknowns, setRUnknowns] = useState<Record<string, boolean>>(
    Object.fromEntries(readinessDimensions.map((d) => [d.id, false])),
  );

  // ── Tool Intelligence lookup state ──
  const [lookupResults, setLookupResults] = useState<LookupResults | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | undefined>(undefined);
  const lookupCacheRef = useRef<Record<string, LookupResults>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLookupKeyRef = useRef<string>("");

  // ── Real-time lookup fields (updated by BasicDataStep callback) ──
  const [lookupToolName, setLookupToolName] = useState(basicData.toolName);
  const [lookupManufacturer, setLookupManufacturer] = useState(
    basicData.manufacturerName ?? "",
  );

  /** Called by BasicDataStep whenever tool name or manufacturer changes */
  function handleLookupFieldsChange(
    toolName: string,
    manufacturerName?: string,
  ) {
    setLookupToolName(toolName);
    setLookupManufacturer(manufacturerName ?? "");
  }

  // ── Debounced lookup — triggers on real-time field changes ──
  useEffect(() => {
    const toolName = lookupToolName.trim();
    const manufacturer = lookupManufacturer.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (toolName.length < 3) {
      if (lookupResults && toolName.length === 0) {
        setLookupResults(null);
        setLookupError(undefined);
      }
      return;
    }

    // Cache key includes manufacturer so changing manufacturer re-triggers
    const cacheKey = `${toolName}||${manufacturer}`;
    if (cacheKey === lastLookupKeyRef.current) return;

    if (lookupCacheRef.current[cacheKey]) {
      setLookupResults(lookupCacheRef.current[cacheKey]);
      setLookupLoading(false);
      setLookupError(undefined);
      lastLookupKeyRef.current = cacheKey;
      return;
    }

    debounceRef.current = setTimeout(async () => {
      lastLookupKeyRef.current = cacheKey;
      setLookupLoading(true);
      setLookupError(undefined);

      try {
        const results = await runLookup(
          toolName,
          manufacturer || undefined,
        );
        lookupCacheRef.current[cacheKey] = results;
        setLookupResults(results);
      } catch (e) {
        setLookupError(
          e instanceof Error ? e.message : "Lookup failed — please try again.",
        );
      } finally {
        setLookupLoading(false);
      }
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [lookupToolName, lookupManufacturer, lookupResults]);

  // ── Derived: scoring floors ──
  const floors =
    basicData.category > 0 &&
    basicData.deviceClass > 0 &&
    basicData.determinism > 0
      ? computeFloors(basicData)
      : {};

  // ── Derived: sub-trigger visibility ──
  const cScoresForVis: Record<string, Score> = {};
  for (const [k, v] of Object.entries(cScores)) {
    if (v !== null) cScoresForVis[k] = v;
  }
  const subVis = getSubTriggerVisibility(cScoresForVis);

  // ── Derived: consistency flags ──
  const firedFlags = useMemo(() => {
    const allScores: Record<string, number> = {};
    for (const [k, v] of Object.entries(cScores)) {
      if (v !== null) allScores[k] = v;
    }
    for (const [k, v] of Object.entries(rScores)) {
      if (v !== null) allScores[k] = v;
    }

    const allTexts: Record<string, string> = {
      toolPurpose: basicData.toolPurpose ?? "",
      toolProblem: basicData.toolProblem ?? "",
      ...cJustifications,
      ...rJustifications,
    };

    return evaluateFlags(allScores, allTexts, basicData.category);
  }, [cScores, rScores, cJustifications, rJustifications, basicData]);

  const flagsByDimension = useMemo(() => {
    const grouped: Record<string, FiredFlag[]> = {};
    for (const f of firedFlags) {
      if (!grouped[f.targetDimension]) grouped[f.targetDimension] = [];
      grouped[f.targetDimension].push(f);
    }
    return grouped;
  }, [firedFlags]);

  // ── Handlers ──
  function handleBasicDataNext(data: BasicData) {
    setBasicData(data);
    setStep(2);
  }

  function handleCScore(dimId: string, score: Score) {
    const floor = floors[dimId] ?? 0;
    const effective = applyFloor(score, floor) as Score;
    setCScores((prev) => ({ ...prev, [dimId]: effective }));
    setCUnknowns((prev) => ({ ...prev, [dimId]: false }));
  }

  function handleRScore(dimId: string, score: Score) {
    setRScores((prev) => ({ ...prev, [dimId]: score }));
    setRUnknowns((prev) => ({ ...prev, [dimId]: false }));
  }

  function handleSubAnswer(field: keyof SubTriggerAnswers, value: boolean) {
    setSubAnswers((prev) => ({ ...prev, [field]: value }));
  }

  function handleCJustification(dimId: string, text: string) {
    setCJustifications((prev) => ({ ...prev, [dimId]: text }));
    if (containsIDontKnow(text)) {
      setCUnknowns((prev) => ({ ...prev, [dimId]: true }));
      setCScores((prev) => ({ ...prev, [dimId]: null }));
    }
  }

  function handleRJustification(dimId: string, text: string) {
    setRJustifications((prev) => ({ ...prev, [dimId]: text }));
    if (containsIDontKnow(text)) {
      setRUnknowns((prev) => ({ ...prev, [dimId]: true }));
      setRScores((prev) => ({ ...prev, [dimId]: null }));
    }
  }

  function handleCIDontKnow(dimId: string) {
    setCUnknowns((prev) => ({ ...prev, [dimId]: true }));
    setCScores((prev) => ({ ...prev, [dimId]: null }));
  }

  function handleRIDontKnow(dimId: string) {
    setRUnknowns((prev) => ({ ...prev, [dimId]: true }));
    setRScores((prev) => ({ ...prev, [dimId]: null }));
  }

  function handleCClearUnknown(dimId: string) {
    setCUnknowns((prev) => ({ ...prev, [dimId]: false }));
  }

  function handleRClearUnknown(dimId: string) {
    setRUnknowns((prev) => ({ ...prev, [dimId]: false }));
  }

  const handleRunAssessment = useCallback(() => {
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
    const exportData = {
      ...assessment,
      justifications: { ...cJustifications, ...rJustifications },
      firedFlags,
      basicData,
      toolIntelligence: lookupResults,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
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
    {
      question: string;
      answer: boolean | undefined;
      onAnswer: (v: boolean) => void;
    }
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

  // ── Landing page ──
  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  // ── Wizard ──
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: NHS_COLOURS.white }}
    >
      {/* Header */}
      <header
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: NHS_COLOURS.white,
          borderColor: NHS_COLOURS.lightGrey,
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <img
            src="/ai-centre-logo.png"
            alt="AI Centre for Value Based Healthcare"
            className="h-12 w-auto"
          />
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: NHS_COLOURS.darkBlue }}
            >
              NHS AI Adoption Assessment Tool
            </h1>
            <p className="text-xs" style={{ color: NHS_COLOURS.grey }}>
              12×12 Paired Complexity–Readiness Framework
            </p>
          </div>
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
            lookupResults={lookupResults}
            lookupLoading={lookupLoading}
            lookupError={lookupError}
            onLookupFieldsChange={handleLookupFieldsChange}
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
            justifications={cJustifications}
            onJustificationChange={handleCJustification}
            flagsByDimension={flagsByDimension}
            unknowns={cUnknowns}
            onIDontKnow={handleCIDontKnow}
            onClearUnknown={handleCClearUnknown}
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
            side="readiness"
            subTriggers={readinessSubTriggers}
            justifications={rJustifications}
            onJustificationChange={handleRJustification}
            flagsByDimension={flagsByDimension}
            unknowns={rUnknowns}
            onIDontKnow={handleRIDontKnow}
            onClearUnknown={handleRClearUnknown}
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
