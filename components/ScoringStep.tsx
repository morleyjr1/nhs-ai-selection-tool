"use client";

import type { Dimension, DimensionSide } from "../lib/dimensions";
import type { Score } from "../lib/types";
import { NHS_COLOURS } from "../lib/constants";
import DimensionCard from "./DimensionCard";

interface ScoringStepProps {
  title: string;
  description: string;
  dimensions: Dimension[];
  scores: Record<string, Score | null>;
  floors?: Record<string, number>;
  onScore: (dimensionId: string, score: Score) => void;
  onNext: () => void;
  onBack: () => void;
  nextLabel: string;
  side?: DimensionSide;
  /** Sub-trigger configuration: map of dimension ID → sub-trigger props */
  subTriggers?: Record<
    string,
    {
      question: string;
      answer: boolean | undefined;
      onAnswer: (value: boolean) => void;
    }
  >;
}

export default function ScoringStep({
  title,
  description,
  dimensions,
  scores,
  floors = {},
  onScore,
  onNext,
  onBack,
  nextLabel,
  side = "complexity",
  subTriggers = {},
}: ScoringStepProps) {
  const allScored = dimensions.every((d) => scores[d.id] !== null && scores[d.id] !== undefined);
  const scoredCount = dimensions.filter(
    (d) => scores[d.id] !== null && scores[d.id] !== undefined,
  ).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold" style={{ color: NHS_COLOURS.darkBlue }}>
          {title}
        </h2>
        <span
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{
            backgroundColor: allScored
              ? NHS_COLOURS.green + "20"
              : NHS_COLOURS.lightGrey,
            color: allScored ? NHS_COLOURS.green : NHS_COLOURS.grey,
          }}
        >
          {scoredCount} / {dimensions.length} scored
        </span>
      </div>
      <p className="mb-8" style={{ color: NHS_COLOURS.secondaryText }}>
        {description}
      </p>

      {/* Dimension cards */}
      {dimensions.map((dim) => (
        <DimensionCard
          key={dim.id}
          dimension={dim}
          score={scores[dim.id] ?? null}
          floor={floors[dim.id] ?? 0}
          side={side}
          onScore={(s) => onScore(dim.id, s)}
          subTrigger={subTriggers[dim.id]}
        />
      ))}

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded font-medium text-sm"
          style={{
            color: NHS_COLOURS.blue,
            border: `1px solid ${NHS_COLOURS.blue}`,
            backgroundColor: NHS_COLOURS.white,
          }}
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!allScored}
          className="px-8 py-3 rounded font-medium text-sm transition-opacity"
          style={{
            backgroundColor: allScored ? NHS_COLOURS.blue : NHS_COLOURS.grey,
            color: NHS_COLOURS.white,
            opacity: allScored ? 1 : 0.5,
            cursor: allScored ? "pointer" : "not-allowed",
          }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
