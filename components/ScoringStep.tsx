"use client";

import type { Dimension } from "../lib/dimensions";
import type { Score } from "../lib/types";
import { NHS_COLOURS } from "../lib/constants";
import type { FiredFlag } from "../lib/flags";
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
  /** Which side of the framework — controls score colour direction */
  side?: "complexity" | "readiness";
  /** Sub-trigger configuration: map of dimension ID → sub-trigger props */
  subTriggers?: Record<
    string,
    {
      question: string;
      answer: boolean | undefined;
      onAnswer: (value: boolean) => void;
    }
  >;
  /** Free-text justifications keyed by dimension ID */
  justifications?: Record<string, string>;
  onJustificationChange?: (dimensionId: string, text: string) => void;
  /** Consistency flags keyed by dimension ID */
  flagsByDimension?: Record<string, FiredFlag[]>;
  /** "I don't know" state keyed by dimension ID */
  unknowns?: Record<string, boolean>;
  onIDontKnow?: (dimensionId: string) => void;
  onClearUnknown?: (dimensionId: string) => void;
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
  justifications = {},
  onJustificationChange,
  flagsByDimension = {},
  unknowns = {},
  onIDontKnow,
  onClearUnknown,
}: ScoringStepProps) {
  const allScored = dimensions.every(
    (d) =>
      (scores[d.id] !== null && scores[d.id] !== undefined) ||
      unknowns[d.id],
  );
  const scoredCount = dimensions.filter(
    (d) => scores[d.id] !== null && scores[d.id] !== undefined,
  ).length;
  const unknownCount = dimensions.filter((d) => unknowns[d.id]).length;

  // Can only proceed if all dimensions are scored (not unknown)
  const hasUnknowns = unknownCount > 0;
  const canProceed = scoredCount === dimensions.length && !hasUnknowns;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2
          className="text-2xl font-bold"
          style={{ color: NHS_COLOURS.darkBlue }}
        >
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {unknownCount > 0 && (
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{
                backgroundColor: NHS_COLOURS.grey + "20",
                color: NHS_COLOURS.grey,
              }}
            >
              {unknownCount} unknown
            </span>
          )}
          <span
            className="text-sm font-medium px-3 py-1 rounded-full"
            style={{
              backgroundColor: canProceed
                ? NHS_COLOURS.green + "20"
                : NHS_COLOURS.lightGrey,
              color: canProceed ? NHS_COLOURS.green : NHS_COLOURS.grey,
            }}
          >
            {scoredCount} / {dimensions.length} scored
          </span>
        </div>
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
          onScore={(s) => onScore(dim.id, s)}
          side={side}
          subTrigger={subTriggers[dim.id]}
          justification={justifications[dim.id] ?? ""}
          onJustificationChange={
            onJustificationChange
              ? (text) => onJustificationChange(dim.id, text)
              : undefined
          }
          flags={flagsByDimension[dim.id] ?? []}
          isUnknown={unknowns[dim.id] ?? false}
          onIDontKnow={onIDontKnow ? () => onIDontKnow(dim.id) : undefined}
          onClearUnknown={
            onClearUnknown ? () => onClearUnknown(dim.id) : undefined
          }
        />
      ))}

      {/* Warning if unknowns exist */}
      {hasUnknowns && (
        <div
          className="rounded-lg p-4 mb-4 border-l-4"
          style={{
            backgroundColor: NHS_COLOURS.lightGrey,
            borderLeftColor: NHS_COLOURS.grey,
          }}
        >
          <p className="text-sm" style={{ color: NHS_COLOURS.darkText }}>
            <span className="font-semibold">{unknownCount} dimension{unknownCount > 1 ? "s" : ""} marked as &ldquo;I don&apos;t know&rdquo;.</span>{" "}
            The assessment cannot be finalised until every dimension is scored.
            Go back to the unscored dimensions and gather the information needed.
          </p>
        </div>
      )}

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
          disabled={!canProceed}
          className="px-8 py-3 rounded font-medium text-sm transition-opacity"
          style={{
            backgroundColor: canProceed ? NHS_COLOURS.blue : NHS_COLOURS.grey,
            color: NHS_COLOURS.white,
            opacity: canProceed ? 1 : 0.5,
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
