"use client";

import { useState } from "react";
import type { Dimension } from "../lib/dimensions";
import type { Score, BasicData } from "../lib/types";
import {
  NHS_COLOURS,
  SCORE_COLOURS,
  READINESS_SCORE_COLOURS,
} from "../lib/constants";
import type { FiredFlag } from "../lib/flags";
import { getFloorExplanation } from "../lib/floors";

interface MismatchResult {
  mismatch: boolean;
  confidence: "low" | "medium" | "high";
  explanation: string;
  suggestedFlagText: string;
}

interface DimensionCardProps {
  dimension: Dimension;
  score: Score | null;
  floor?: number;
  /** BasicData used to compute dynamic floor explanations */
  basicData?: BasicData;
  onScore: (score: Score) => void;
  /** Which side of the framework — controls colour direction */
  side?: "complexity" | "readiness";
  /** Optional sub-trigger question (rendered below the score buttons) */
  subTrigger?: {
    question: string;
    answer: boolean | undefined;
    onAnswer: (value: boolean) => void;
  };
  /** Free-text justification for this score */
  justification?: string;
  onJustificationChange?: (text: string) => void;
  /** Consistency flags firing on this dimension */
  flags?: FiredFlag[];
  /** Whether the "I don't know" state is active */
  isUnknown?: boolean;
  onIDontKnow?: () => void;
  /** Callback to clear the "I don't know" state (when user scores) */
  onClearUnknown?: () => void;
}

export default function DimensionCard({
  dimension,
  score,
  floor = 0,
  basicData,
  onScore,
  side = "complexity",
  subTrigger,
  justification = "",
  onJustificationChange,
  flags = [],
  isUnknown = false,
  onIDontKnow,
  onClearUnknown,
}: DimensionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const scores: Score[] = [1, 2, 3];
  const colourMap =
    side === "readiness" ? READINESS_SCORE_COLOURS : SCORE_COLOURS;

  // ── Mismatch checker state ──
  const [mismatchResult, setMismatchResult] = useState<MismatchResult | null>(null);
  const [mismatchLoading, setMismatchLoading] = useState(false);
  const [mismatchError, setMismatchError] = useState<string | null>(null);

  // Reset mismatch result when score or justification changes
  // (user has changed something, so the old check is stale)
  function handleScore(s: Score) {
    if (isUnknown && onClearUnknown) {
      onClearUnknown();
    }
    setMismatchResult(null);
    setMismatchError(null);
    onScore(s);
  }

  function handleJustificationChange(text: string) {
    setMismatchResult(null);
    setMismatchError(null);
    onJustificationChange?.(text);
  }

  // Whether the "Check for mismatch" button should be available
  const canCheckMismatch =
    score !== null &&
    !isUnknown &&
    justification.trim().length >= 15 &&
    !mismatchLoading;

  async function runMismatchCheck() {
    if (!canCheckMismatch || score === null) return;

    setMismatchLoading(true);
    setMismatchError(null);
    setMismatchResult(null);

    try {
      const response = await fetch("/api/lookup/mismatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dimensionId: dimension.id,
          dimensionName: dimension.longLabel,
          side,
          score,
          scoreDescriptors: dimension.scoreDescriptors,
          justification,
          guidingQuestions: dimension.guidingQuestions,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      const result: MismatchResult = await response.json();
      setMismatchResult(result);
    } catch (e) {
      setMismatchError(
        e instanceof Error ? e.message : "Mismatch check failed",
      );
    } finally {
      setMismatchLoading(false);
    }
  }

  return (
    <div
      className="rounded-lg p-5 mb-4 border"
      style={{
        borderColor: isUnknown
          ? NHS_COLOURS.grey
          : score
            ? colourMap[score]
            : NHS_COLOURS.lightGrey,
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
          {dimension.whatThisDimensionAssesses && (
            <p
              className="text-sm mt-1"
              style={{ color: NHS_COLOURS.secondaryText }}
            >
              {dimension.whatThisDimensionAssesses}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {floor > 0 && (
            <span
              className="px-2 py-1 rounded text-xs font-semibold"
              style={{
                backgroundColor: NHS_COLOURS.amber + "20",
                color: NHS_COLOURS.amber,
                border: `1px solid ${NHS_COLOURS.amber}`,
              }}
            >
              Floor: ≥{floor}
            </span>
          )}
          {isUnknown && (
            <span
              className="px-2 py-1 rounded text-xs font-semibold"
              style={{
                backgroundColor: NHS_COLOURS.lightGrey,
                color: NHS_COLOURS.grey,
                border: `1px solid ${NHS_COLOURS.grey}`,
              }}
            >
              ?
            </span>
          )}
        </div>
      </div>

      {/* Guiding questions */}
      <div className="mb-4">
        {dimension.guidingQuestions.map((q, i) => (
          <p
            key={i}
            className="text-sm mb-1 italic"
            style={{ color: NHS_COLOURS.secondaryText }}
          >
            {q}
          </p>
        ))}
      </div>

      {/* Scoring note */}
      {dimension.scoringNote && (
        <p
          className="text-xs mb-3 px-3 py-2 rounded"
          style={{
            backgroundColor: NHS_COLOURS.lightGrey,
            color: NHS_COLOURS.secondaryText,
          }}
        >
          {dimension.scoringNote}
        </p>
      )}

      {/* Floor explanation note — dynamic, based on tool properties */}
      {floor > 0 && basicData && (() => {
        const explanation = getFloorExplanation(basicData, dimension.id, floor);
        if (!explanation) return null;
        return (
          <div
            className="rounded px-4 py-3 mb-3 border-l-4"
            style={{
              backgroundColor: NHS_COLOURS.amber + "10",
              borderLeftColor: NHS_COLOURS.amber,
            }}
          >
            <p
              className="text-sm mb-1"
              style={{ color: NHS_COLOURS.darkText }}
            >
              {explanation.summary}
            </p>
            {explanation.reasons.map((reason, i) => (
              <p
                key={i}
                className="text-xs mt-1"
                style={{ color: NHS_COLOURS.secondaryText }}
              >
                {reason}
              </p>
            ))}
          </div>
        );
      })()}

      {/* "I don't know" hard stop banner */}
      {isUnknown && (
        <div
          className="rounded-lg p-4 mb-3 border-l-4"
          style={{
            backgroundColor: NHS_COLOURS.lightGrey,
            borderLeftColor: NHS_COLOURS.grey,
          }}
        >
          <p
            className="font-semibold text-sm mb-1"
            style={{ color: NHS_COLOURS.darkText }}
          >
            This assessment isn&apos;t ready to be made yet
          </p>
          <p className="text-sm" style={{ color: NHS_COLOURS.secondaryText }}>
            Before scoring this dimension, go and find out the answer — speak to
            the vendor, check the technical documentation, or consult the
            relevant person in your organisation. You can come back to this
            dimension at any time. The assessment can&apos;t be finalised until
            every dimension is scored.
          </p>
        </div>
      )}

      {/* Score buttons + "I don't know" */}
      <div className="flex gap-2 mb-3">
        {scores.map((s) => {
          const isDisabled = s < floor;
          const isSelected = score === s && !isUnknown;
          const colour = colourMap[s];

          return (
            <button
              key={s}
              onClick={() => !isDisabled && handleScore(s)}
              disabled={isDisabled}
              className="flex-1 py-2 rounded text-sm font-medium transition-all"
              style={{
                backgroundColor: isSelected ? colour : NHS_COLOURS.white,
                color: isSelected ? NHS_COLOURS.white : colour,
                border: `2px solid ${isDisabled ? NHS_COLOURS.lightGrey : colour}`,
                opacity: isDisabled ? 0.3 : isUnknown ? 0.5 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              {s}
            </button>
          );
        })}
        {onIDontKnow && (
          <button
            onClick={onIDontKnow}
            className="px-3 py-2 rounded text-sm font-medium transition-all"
            style={{
              backgroundColor: isUnknown ? NHS_COLOURS.grey : NHS_COLOURS.white,
              color: isUnknown ? NHS_COLOURS.white : NHS_COLOURS.grey,
              border: `2px solid ${NHS_COLOURS.grey}`,
            }}
          >
            I don&apos;t know
          </button>
        )}
      </div>

      {/* Selected score descriptor */}
      {score && !isUnknown && (
        <div
          className="rounded px-3 py-2 mb-3 text-sm"
          style={{
            backgroundColor: colourMap[score] + "10",
            borderLeft: `3px solid ${colourMap[score]}`,
            color: NHS_COLOURS.darkText,
          }}
        >
          <span className="font-medium">Score {score}:</span>{" "}
          {dimension.scoreDescriptors[score - 1]?.description}
        </div>
      )}

      {/* Free-text justification */}
      {onJustificationChange && (
        <div className="mb-3">
          <textarea
            value={justification}
            onChange={(e) => handleJustificationChange(e.target.value)}
            rows={2}
            placeholder="Brief reasoning for this score (optional but recommended for mismatch checking)"
            className="w-full px-3 py-2 rounded border text-sm"
            style={{
              borderColor: NHS_COLOURS.lightGrey,
              color: NHS_COLOURS.darkText,
            }}
          />

          {/* Check for mismatch button */}
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={runMismatchCheck}
              disabled={!canCheckMismatch}
              className="text-xs underline transition-opacity"
              style={{
                color: canCheckMismatch ? NHS_COLOURS.blue : NHS_COLOURS.grey,
                opacity: canCheckMismatch ? 1 : 0.5,
                cursor: canCheckMismatch ? "pointer" : "default",
              }}
            >
              {mismatchLoading ? "Checking..." : "Check for mismatch"}
            </button>
            {mismatchLoading && (
              <span
                className="inline-block w-3 h-3 border-2 rounded-full animate-spin"
                style={{
                  borderColor: NHS_COLOURS.lightGrey,
                  borderTopColor: NHS_COLOURS.blue,
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Mismatch check result */}
      {mismatchResult && (
        <div
          className="rounded px-4 py-3 mb-2 border-l-4"
          style={{
            backgroundColor: mismatchResult.mismatch
              ? NHS_COLOURS.amber + "15"
              : NHS_COLOURS.green + "10",
            borderLeftColor: mismatchResult.mismatch
              ? NHS_COLOURS.amber
              : NHS_COLOURS.green,
          }}
        >
          {mismatchResult.mismatch ? (
            <>
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">⚠</span>
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: NHS_COLOURS.darkText }}
                  >
                    Potential mismatch detected{" "}
                    <span
                      className="font-normal text-xs px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: NHS_COLOURS.lightGrey,
                        color: NHS_COLOURS.secondaryText,
                      }}
                    >
                      {mismatchResult.confidence} confidence
                    </span>
                  </p>
                  <p
                    className="text-sm mb-2"
                    style={{ color: NHS_COLOURS.darkText }}
                  >
                    {mismatchResult.explanation}
                  </p>
                  {mismatchResult.suggestedFlagText && (
                    <div
                      className="rounded px-3 py-2 text-xs"
                      style={{
                        backgroundColor: NHS_COLOURS.white,
                        border: `1px solid ${NHS_COLOURS.lightGrey}`,
                        color: NHS_COLOURS.secondaryText,
                      }}
                    >
                      <span className="font-medium" style={{ color: NHS_COLOURS.darkText }}>
                        Suggested flag text:
                      </span>{" "}
                      {mismatchResult.suggestedFlagText}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <p className="text-sm" style={{ color: NHS_COLOURS.darkText }}>
                Score and justification appear consistent.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mismatch check error */}
      {mismatchError && (
        <div
          className="rounded px-4 py-3 mb-2 text-sm"
          style={{
            backgroundColor: NHS_COLOURS.lightGrey,
            color: NHS_COLOURS.secondaryText,
          }}
        >
          Could not check for mismatch: {mismatchError}
        </div>
      )}

      {/* Rule-based consistency flag banners */}
      {flags.length > 0 &&
        flags.map((flag) => (
          <div
            key={flag.flagId}
            className="rounded px-4 py-3 mb-2 border-l-4 flex items-start gap-2"
            style={{
              backgroundColor: NHS_COLOURS.amber + "15",
              borderLeftColor: NHS_COLOURS.amber,
            }}
          >
            <span className="text-base mt-0.5">⚠</span>
            <p className="text-sm" style={{ color: NHS_COLOURS.darkText }}>
              {flag.message}
            </p>
          </div>
        ))}

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
          {dimension.dimensionNote && (
            <p
              className="text-xs mt-2 italic"
              style={{ color: NHS_COLOURS.grey }}
            >
              Note: {dimension.dimensionNote}
            </p>
          )}
          {dimension.routingNote && (
            <p
              className="text-xs mt-1 italic"
              style={{ color: NHS_COLOURS.grey }}
            >
              {dimension.routingNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
