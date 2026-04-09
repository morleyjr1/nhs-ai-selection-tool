"use client";

import { STEP_LABELS, NHS_COLOURS } from "../lib/constants";

interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <nav aria-label="Assessment progress" className="w-full mb-8">
      <ol className="flex items-center gap-0">
        {STEP_LABELS.map((label, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={label} className="flex-1 flex flex-col items-center">
              {/* Step connector + circle */}
              <div className="flex items-center w-full">
                {/* Left connector line */}
                {index > 0 && (
                  <div
                    className="flex-1 h-0.5"
                    style={{
                      backgroundColor: isComplete
                        ? NHS_COLOURS.blue
                        : NHS_COLOURS.lightGrey,
                    }}
                  />
                )}
                {index === 0 && <div className="flex-1" />}

                {/* Circle */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{
                    backgroundColor: isComplete
                      ? NHS_COLOURS.blue
                      : isCurrent
                        ? NHS_COLOURS.white
                        : NHS_COLOURS.lightGrey,
                    color: isComplete
                      ? NHS_COLOURS.white
                      : isCurrent
                        ? NHS_COLOURS.blue
                        : NHS_COLOURS.grey,
                    border: isCurrent
                      ? `2px solid ${NHS_COLOURS.blue}`
                      : "2px solid transparent",
                  }}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? "✓" : index + 1}
                </div>

                {/* Right connector line */}
                {index < STEP_LABELS.length - 1 && (
                  <div
                    className="flex-1 h-0.5"
                    style={{
                      backgroundColor: isComplete
                        ? NHS_COLOURS.blue
                        : NHS_COLOURS.lightGrey,
                    }}
                  />
                )}
                {index === STEP_LABELS.length - 1 && <div className="flex-1" />}
              </div>

              {/* Label */}
              <span
                className="mt-2 text-xs font-medium text-center"
                style={{
                  color: isComplete || isCurrent ? NHS_COLOURS.blue : NHS_COLOURS.grey,
                }}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
