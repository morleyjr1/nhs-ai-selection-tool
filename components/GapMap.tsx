"use client";

import type { DimensionGap } from "../lib/types";
import { NHS_COLOURS, GAP_COLOURS } from "../lib/constants";
import { complexityDimensions, readinessDimensions } from "../lib/dimensions";

interface GapMapProps {
  gaps: DimensionGap[];
}

export default function GapMap({ gaps }: GapMapProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ backgroundColor: NHS_COLOURS.darkBlue }}>
            <th className="px-3 py-2 text-left text-white font-medium">
              Dimension
            </th>
            <th className="px-3 py-2 text-center text-white font-medium">
              Complexity
            </th>
            <th className="px-3 py-2 text-center text-white font-medium">
              Readiness
            </th>
            <th className="px-3 py-2 text-center text-white font-medium">
              Gap
            </th>
          </tr>
        </thead>
        <tbody>
          {gaps.map((gap) => {
            const cDim = complexityDimensions.find(
              (d) => d.id === `C${gap.dimensionIndex}`,
            );
            const rDim = readinessDimensions.find(
              (d) => d.id === `R${gap.dimensionIndex}`,
            );
            const gapColour = GAP_COLOURS[gap.gap as 0 | 1 | 2] ?? NHS_COLOURS.grey;
            const label = cDim?.shortLabel ?? rDim?.shortLabel ?? `Dimension ${gap.dimensionIndex}`;

            return (
              <tr
                key={gap.dimensionIndex}
                className="border-b"
                style={{ borderColor: NHS_COLOURS.lightGrey }}
              >
                <td
                  className="px-3 py-2 font-medium"
                  style={{ color: NHS_COLOURS.darkText }}
                >
                  {gap.dimensionIndex}. {label}
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className="inline-block w-8 h-8 rounded-full leading-8 text-white font-semibold text-xs"
                    style={{
                      backgroundColor:
                        gap.complexityScore > 0
                          ? GAP_COLOURS[
                              Math.min(gap.complexityScore, 3) as 1 | 2
                            ] ?? NHS_COLOURS.grey
                          : NHS_COLOURS.lightGrey,
                    }}
                  >
                    {gap.complexityScore}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className="inline-block w-8 h-8 rounded-full leading-8 text-white font-semibold text-xs"
                    style={{
                      backgroundColor:
                        gap.readinessScore > 0
                          ? GAP_COLOURS[
                              Math.min(gap.readinessScore, 3) as 1 | 2
                            ] ?? NHS_COLOURS.grey
                          : NHS_COLOURS.lightGrey,
                    }}
                  >
                    {gap.readinessScore}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-white font-semibold text-xs"
                    style={{ backgroundColor: gapColour }}
                  >
                    {gap.gap === 0 ? "None" : gap.gap === 1 ? "Minor" : "Major"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
