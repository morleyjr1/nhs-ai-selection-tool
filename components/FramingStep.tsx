"use client";

import { useState } from "react";
import { NHS_COLOURS } from "../lib/constants";

interface FramingStepProps {
  onNext: () => void;
}

interface FramingAnswers {
  proportionality: boolean | null;
  needsLed: boolean | null;
}

export default function FramingStep({ onNext }: FramingStepProps) {
  const [answers, setAnswers] = useState<FramingAnswers>({
    proportionality: null,
    needsLed: null,
  });

  const blocked =
    answers.proportionality === false || answers.needsLed === false;
  const canProceed =
    answers.proportionality === true && answers.needsLed === true;

  function handleAnswer(field: keyof FramingAnswers, value: boolean) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: NHS_COLOURS.darkBlue }}
      >
        Framing Questions
      </h2>
      <p className="mb-8" style={{ color: NHS_COLOURS.secondaryText }}>
        Before assessing complexity and readiness, two threshold questions must
        be satisfied. Both must be answered &ldquo;Yes&rdquo; to proceed.
      </p>

      {/* FQ1 — Proportionality */}
      <div
        className="rounded-lg p-6 mb-6"
        style={{ backgroundColor: NHS_COLOURS.lightGrey }}
      >
        <h3
          className="text-lg font-semibold mb-3"
          style={{ color: NHS_COLOURS.darkText }}
        >
          FQ1 — Proportionality
        </h3>
        <p className="mb-4" style={{ color: NHS_COLOURS.secondaryText }}>
          Is the use of AI proportionate to the problem? Could the problem be
          addressed adequately through non-AI means — such as process redesign,
          better use of existing data, improved clinical pathways, or simpler
          digital tools — with comparable effectiveness and lower risk?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleAnswer("proportionality", true)}
            className="px-6 py-2 rounded font-medium text-sm transition-colors"
            style={{
              backgroundColor:
                answers.proportionality === true
                  ? NHS_COLOURS.blue
                  : NHS_COLOURS.white,
              color:
                answers.proportionality === true
                  ? NHS_COLOURS.white
                  : NHS_COLOURS.darkText,
              border: `1px solid ${NHS_COLOURS.blue}`,
            }}
          >
            Yes — AI is proportionate
          </button>
          <button
            onClick={() => handleAnswer("proportionality", false)}
            className="px-6 py-2 rounded font-medium text-sm transition-colors"
            style={{
              backgroundColor:
                answers.proportionality === false
                  ? NHS_COLOURS.red
                  : NHS_COLOURS.white,
              color:
                answers.proportionality === false
                  ? NHS_COLOURS.white
                  : NHS_COLOURS.darkText,
              border: `1px solid ${answers.proportionality === false ? NHS_COLOURS.red : NHS_COLOURS.grey}`,
            }}
          >
            No — non-AI alternatives are sufficient
          </button>
        </div>
      </div>

      {/* FQ2 — Needs-Led Adoption */}
      <div
        className="rounded-lg p-6 mb-6"
        style={{ backgroundColor: NHS_COLOURS.lightGrey }}
      >
        <h3
          className="text-lg font-semibold mb-3"
          style={{ color: NHS_COLOURS.darkText }}
        >
          FQ2 — Needs-Led Adoption
        </h3>
        <p className="mb-4" style={{ color: NHS_COLOURS.secondaryText }}>
          Does this tool address a clearly identified clinical or operational
          need that would not be met (or not met as well) without AI? Or is
          adoption being driven by innovation enthusiasm, vendor marketing, or
          organisational pressure?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleAnswer("needsLed", true)}
            className="px-6 py-2 rounded font-medium text-sm transition-colors"
            style={{
              backgroundColor:
                answers.needsLed === true
                  ? NHS_COLOURS.blue
                  : NHS_COLOURS.white,
              color:
                answers.needsLed === true
                  ? NHS_COLOURS.white
                  : NHS_COLOURS.darkText,
              border: `1px solid ${NHS_COLOURS.blue}`,
            }}
          >
            Yes — this addresses a real need
          </button>
          <button
            onClick={() => handleAnswer("needsLed", false)}
            className="px-6 py-2 rounded font-medium text-sm transition-colors"
            style={{
              backgroundColor:
                answers.needsLed === false
                  ? NHS_COLOURS.red
                  : NHS_COLOURS.white,
              color:
                answers.needsLed === false
                  ? NHS_COLOURS.white
                  : NHS_COLOURS.darkText,
              border: `1px solid ${answers.needsLed === false ? NHS_COLOURS.red : NHS_COLOURS.grey}`,
            }}
          >
            No — adoption is not needs-led
          </button>
        </div>
      </div>

      {/* Blocked warning */}
      {blocked && (
        <div
          className="rounded-lg p-4 mb-6 border-l-4"
          style={{
            backgroundColor: "#FEF3F2",
            borderLeftColor: NHS_COLOURS.red,
          }}
        >
          <p className="font-semibold" style={{ color: NHS_COLOURS.red }}>
            Assessment cannot proceed
          </p>
          <p className="text-sm mt-1" style={{ color: NHS_COLOURS.darkText }}>
            Both framing questions must be answered &ldquo;Yes&rdquo; before
            moving to the full assessment. If AI is not proportionate to the
            problem, or if adoption is not needs-led, the framework recommends
            reconsidering whether to proceed with this tool at this time.
          </p>
        </div>
      )}

      {/* Next button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-8 py-3 rounded font-medium text-sm transition-opacity"
          style={{
            backgroundColor: canProceed ? NHS_COLOURS.blue : NHS_COLOURS.grey,
            color: NHS_COLOURS.white,
            opacity: canProceed ? 1 : 0.5,
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          Continue to Basic Data →
        </button>
      </div>
    </div>
  );
}
