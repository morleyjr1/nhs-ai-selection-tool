"use client";

import { useState } from "react";
import type { Dimension } from "../lib/dimensions";
import type { Score } from "../lib/types";
import { NHS_COLOURS, SCORE_COLOURS } from "../lib/constants";

interface DimensionCardProps {
  dimension: Dimension;
  score: Score | null;
  floor?: number;
  onScore: (score: Score) => void;
  /** Optional sub-trigger question (rendered below the score buttons) */
  subTrigger?: {
    question: string;
    answer: boolean | undefined;
    onAnswer: (value: boolean) => void;
  };
}

export default function DimensionCard({
  dimension,
  score,
  floor = 0,
  onScore,
  subTrigger,
}: DimensionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const scores: Score[] = [1, 2, 3];

  return (
    <div
      className="rounded-lg p-5 mb-4 border"
      style={{
        borderColor: score ? SCORE_COLOURS[score] : NHS_COLOURS.lightGrey,
        backgroundColor: NHS_COLOURS.white,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3
            className="text-base font-semibold"
            style={{ color: NHS_COLOURS.darkText }}
          >
            {dimension.id} — {dimension.longLabel}
          </h3>
        </div>
        {floor > 0 && (
          <span
            className="ml-3 px-2 py-1 rounded text-xs font-semibold shrink-0"
            style={{
              backgroundColor: NHS_COLOURS.amber + "20",
              color: NHS_COLOURS.amber,
              border: `1px solid ${NHS_COLOURS.amber}`,
            }}
          >
            Floor: ≥{floor}
          </span>
        )}
      </div>

      {/* Guiding question */}
      <div className="mb-4">
        <p
          className="text-sm mb-1 italic"
          style={{ color: NHS_COLOURS.secondaryText }}
        >
          {dimension.guidingQuestion}
        </p>
      </div>

      {/* Score buttons */}
      <div className="flex gap-2 mb-3">
        {scores.map((s) => {
          const isDisabled = s < floor;
          const isSelected = score === s;
          const colour = SCORE_COLOURS[s];

          return (
            <button
              key={s}
              onClick={() => !isDisabled && onScore(s)}
              disabled={isDisabled}
              className="flex-1 py-2 rounded text-sm font-medium transition-all"
              style={{
                backgroundColor: isSelected ? colour : NHS_COLOURS.white,
                color: isSelected ? NHS_COLOURS.white : colour,
                border: `2px solid ${isDisabled ? NHS_COLOURS.lightGrey : colour}`,
                opacity: isDisabled ? 0.3 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Selected score descriptor */}
      {score && (
        <div
          className="rounded px-3 py-2 mb-3 text-sm"
          style={{
            backgroundColor: SCORE_COLOURS[score] + "10",
            borderLeft: `3px solid ${SCORE_COLOURS[score]}`,
            color: NHS_COLOURS.darkText,
          }}
        >
          <span className="font-medium">Score {score}:</span>{" "}
          {dimension.scoreDescriptors[score - 1]?.description}
        </div>
      )}

      {/* Sub-trigger question (conditional) */}
      {subTrigger && (
        <div
          className="rounded px-4 py-3 mt-3 border-l-4"
          style={{
            backgroundColor: "#FEF3F2",
            borderLeftColor: NHS_COLOURS.red,
          }}
        >
          <p
            className="text-sm font-medium mb-2"
            style={{ color: NHS_COLOURS.darkText }}
          >
            {subTrigger.question}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => subTrigger.onAnswer(true)}
              className="px-4 py-1.5 rounded text-sm font-medium"
              style={{
                backgroundColor:
                  subTrigger.answer === true
                    ? NHS_COLOURS.green
                    : NHS_COLOURS.white,
                color:
                  subTrigger.answer === true
                    ? NHS_COLOURS.white
                    : NHS_COLOURS.darkText,
                border: `1px solid ${NHS_COLOURS.green}`,
              }}
            >
              Yes
            </button>
            <button
              onClick={() => subTrigger.onAnswer(false)}
              className="px-4 py-1.5 rounded text-sm font-medium"
              style={{
                backgroundColor:
                  subTrigger.answer === false
                    ? NHS_COLOURS.red
                    : NHS_COLOURS.white,
                color:
                  subTrigger.answer === false
                    ? NHS_COLOURS.white
                    : NHS_COLOURS.darkText,
                border: `1px solid ${NHS_COLOURS.red}`,
              }}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Expand/collapse: Why It Matters */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs mt-2 underline"
        style={{ color: NHS_COLOURS.blue }}
      >
        {expanded ? "Hide context" : "Why does this matter?"}
      </button>
      {expanded && (
        <div className="mt-2">
          <p className="text-sm" style={{ color: NHS_COLOURS.secondaryText }}>
            {dimension.whyItMatters}
          </p>
          {dimension.conditionalNote && (
            <p
              className="text-xs mt-2 italic"
              style={{ color: NHS_COLOURS.grey }}
            >
              Note: {dimension.conditionalNote.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
