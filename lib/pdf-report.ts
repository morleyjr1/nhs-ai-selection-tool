// ---------------------------------------------------------------------------
// PDF report generation for the NHS AI Adoption Assessment Tool.
// Uses jsPDF + jspdf-autotable (client-side, no server required).
//
// Install: npm install jspdf jspdf-autotable
// Types:   npm install -D @types/jspdf
// ---------------------------------------------------------------------------

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AssessmentResult } from "./classify";
import type { BasicData } from "./types";
import type { LookupResults } from "./lookup";
import type { FiredFlag } from "./flags";
import { complexityDimensions, readinessDimensions } from "./dimensions";
import { generateRecommendation } from "./recommendation";

// NHS colour palette (RGB)
const NHS_BLUE: [number, number, number] = [0, 94, 184];
const NHS_DARK_BLUE: [number, number, number] = [0, 48, 135];
const NHS_GREEN: [number, number, number] = [0, 112, 60];
const NHS_AMBER: [number, number, number] = [255, 184, 28];
const NHS_RED: [number, number, number] = [218, 41, 28];
const NHS_GREY: [number, number, number] = [118, 134, 146];
const DARK_TEXT: [number, number, number] = [33, 43, 50];
const LIGHT_BG: [number, number, number] = [232, 237, 238];

const CLASSIFICATION_COLOURS: Record<string, [number, number, number]> = {
  "Quick win": NHS_GREEN,
  "Deploy and monitor": NHS_AMBER,
  "Build readiness first": [229, 114, 0], // NHS orange
  Avoid: NHS_RED,
};

const GAP_COLOURS: Record<number, [number, number, number]> = {
  0: NHS_GREEN,
  1: NHS_AMBER,
  2: NHS_RED,
};

interface ReportData {
  assessment: AssessmentResult;
  basicData: BasicData;
  justifications: Record<string, string>;
  firedFlags: FiredFlag[];
  lookupResults?: LookupResults | null;
}

export function generatePDFReport(data: ReportData): void {
  const { assessment, basicData, justifications, firedFlags, lookupResults } =
    data;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Helpers ──

  function checkPage(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
    }
  }

  function heading(text: string, size: number = 14) {
    checkPage(12);
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NHS_DARK_BLUE);
    doc.text(text, margin, y);
    y += size * 0.5 + 2;
  }

  function body(text: string, indent: number = 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK_TEXT);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    checkPage(lines.length * 4 + 2);
    doc.text(lines, margin + indent, y);
    y += lines.length * 4 + 2;
  }

  function spacer(h: number = 4) {
    y += h;
  }

  // ── Page 1: Title & Classification ──

  // Title bar
  doc.setFillColor(...NHS_BLUE);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("NHS AI Adoption Assessment Tool", margin, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("12x12 Paired Complexity-Readiness Framework", margin, 23);
  doc.setFontSize(8);
  doc.text(
    `Report generated: ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    margin,
    30,
  );

  y = 45;

  // Classification badge
  const classColour =
    CLASSIFICATION_COLOURS[assessment.classification] ?? NHS_GREY;
  doc.setFillColor(...classColour);
  const badgeWidth = 80;
  const badgeX = (pageWidth - badgeWidth) / 2;
  doc.roundedRect(badgeX, y, badgeWidth, 14, 3, 3, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(assessment.classification, pageWidth / 2, y + 9.5, {
    align: "center",
  });
  y += 22;

  // Summary stats
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK_TEXT);
  const statsText = `Major gaps: ${assessment.majorGaps}  |  Minor gaps: ${assessment.minorGaps}  |  Average complexity: ${assessment.avgComplexity.toFixed(1)}`;
  doc.text(statsText, pageWidth / 2, y, { align: "center" });
  y += 10;

  // ── Recommendation Summary ──

  const recommendation = generateRecommendation(assessment, basicData);

  // Light background box for the recommendation
  const recStartY = y;
  // Estimate height needed
  const headlineLines = doc.splitTextToSize(recommendation.headline, contentWidth - 10);
  const rationaleLines = doc.splitTextToSize(recommendation.rationale, contentWidth - 10);
  const actionLines = recommendation.priorityActions.flatMap((a, i) =>
    doc.splitTextToSize(`${i + 1}. ${a}`, contentWidth - 14),
  );
  const closingLines = doc.splitTextToSize(recommendation.closing, contentWidth - 10);
  const totalRecLines =
    headlineLines.length + rationaleLines.length + actionLines.length + closingLines.length;
  const recHeight = totalRecLines * 4 + 20; // padding

  checkPage(recHeight);

  // Draw background
  doc.setFillColor(
    ...classColour.map((c) => Math.min(255, c + 200)) as [number, number, number],
  );
  doc.setDrawColor(...classColour);
  doc.roundedRect(margin, y, contentWidth, recHeight, 2, 2, "FD");
  y += 5;

  // Heading
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NHS_DARK_BLUE);
  doc.text("Recommendation Summary", margin + 5, y);
  y += 6;

  // Headline
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_TEXT);
  doc.text(headlineLines, margin + 5, y);
  y += headlineLines.length * 4 + 2;

  // Rationale
  doc.setFont("helvetica", "normal");
  doc.text(rationaleLines, margin + 5, y);
  y += rationaleLines.length * 4 + 2;

  // Priority actions
  if (recommendation.priorityActions.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Priority actions:", margin + 5, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    recommendation.priorityActions.forEach((action, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${action}`, contentWidth - 14);
      doc.text(lines, margin + 7, y);
      y += lines.length * 4 + 1;
    });
    y += 1;
  }

  // Closing
  doc.setFont("helvetica", "italic");
  doc.text(closingLines, margin + 5, y);
  y += closingLines.length * 4 + 5;

  // Ensure y is past the box
  y = Math.max(y, recStartY + recHeight + 4);
  spacer(4);

  // ── Basic Data ──

  heading("Basic Data");
  spacer(2);

  const basicRows: string[][] = [
    ["Tool name", basicData.toolName],
    ["Manufacturer", basicData.manufacturerName ?? "—"],
    ["Organisation", basicData.orgName ?? "—"],
    ["Purpose", basicData.toolPurpose ?? "—"],
    ["Problem addressed", basicData.toolProblem ?? "—"],
    ["Category", `${basicData.category}`],
    ["Device classification", `${basicData.deviceClass}`],
    ["Determinism", `${basicData.determinism}`],
    ["Deployment scope", basicData.scope ?? "—"],
    ["Adoption stage", basicData.adoptionStage ?? "—"],
    ["Developer type", basicData.developer ?? "—"],
    ["Product URL", basicData.productUrl ?? "—"],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: basicRows,
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 2, textColor: DARK_TEXT },
    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 40,
        textColor: NHS_DARK_BLUE,
      },
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Hard Gates ──

  if (assessment.triggeredGates.length > 0) {
    heading("Hard Gates Triggered");
    spacer(2);

    const gateRows = assessment.triggeredGates.map((g) => [
      g.gate,
      g.firedOnPrimary && g.firedOnSubTrigger
        ? "Primary + sub-trigger"
        : g.firedOnSubTrigger
          ? "Sub-trigger"
          : "Primary",
      g.explanation,
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Gate", "Trigger", "Explanation"]],
      body: gateRows,
      theme: "grid",
      headStyles: {
        fillColor: NHS_RED,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
      },
      styles: { fontSize: 7.5, cellPadding: 2, textColor: DARK_TEXT },
      columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 25 } },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Gap Map ──

  heading("Gap Map");
  spacer(2);

  const gapHead = [
    ["Dim", "Complexity", "C Score", "Readiness", "R Score", "Gap"],
  ];
  const gapRows = assessment.gaps.map((g) => {
    const cDim = complexityDimensions.find((d) => d.id === g.complexityId);
    const rDim = readinessDimensions.find((d) => d.id === g.readinessId);
    return [
      `${g.dimensionIndex}`,
      cDim?.shortLabel ?? g.complexityId,
      `${g.complexityScore}`,
      rDim?.shortLabel ?? g.readinessId,
      `${g.readinessScore}`,
      g.gap === 0 ? "None" : g.gap === 1 ? "Minor" : "Major",
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: gapHead,
    body: gapRows,
    theme: "grid",
    headStyles: {
      fillColor: NHS_BLUE,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    styles: { fontSize: 7.5, cellPadding: 2, textColor: DARK_TEXT, halign: "center" },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { halign: "left", cellWidth: 35 },
      3: { halign: "left", cellWidth: 35 },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 5) {
        const gap = assessment.gaps[data.row.index]?.gap;
        if (gap !== undefined) {
          data.cell.styles.fillColor = [
            ...GAP_COLOURS[gap].map((c) => Math.min(255, c + 60)),
          ] as [number, number, number];
        }
      }
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Prioritised Gaps ──

  if (assessment.prioritisedGaps.length > 0) {
    heading("Prioritised Gaps");
    spacer(2);

    assessment.prioritisedGaps.forEach((gap, i) => {
      const cDim = complexityDimensions.find(
        (d) => d.id === gap.complexityId,
      );
      const rDim = readinessDimensions.find((d) => d.id === gap.readinessId);
      const label = `${i + 1}. Dimension ${gap.dimensionIndex}: ${cDim?.shortLabel ?? gap.complexityId} / ${rDim?.shortLabel ?? gap.readinessId}`;
      const detail = `${gap.gap === 2 ? "Major" : "Minor"} gap (C:${gap.complexityScore}, R:${gap.readinessScore})`;
      body(`${label} — ${detail}`);
    });
    spacer(4);
  }

  // ── Dimension Scores & Justifications ──

  doc.addPage();
  y = margin;
  heading("Complexity Scores (C1–C12)", 13);
  spacer(2);

  complexityDimensions.forEach((dim) => {
    const score =
      assessment.effectiveScores?.[dim.id] ??
      assessment.gaps.find((g) => g.complexityId === dim.id)?.complexityScore;
    const justification = justifications[dim.id] ?? "";
    const dimFlags = firedFlags.filter((f) => f.targetDimension === dim.id);

    checkPage(20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NHS_DARK_BLUE);
    doc.text(`${dim.id} — ${dim.longLabel}`, margin, y);

    if (score) {
      doc.setFont("helvetica", "normal");
      doc.text(`Score: ${score}`, pageWidth - margin, y, { align: "right" });
    }
    y += 5;

    if (justification) {
      body(justification, 4);
    }

    dimFlags.forEach((flag) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...NHS_AMBER);
      const flagLines = doc.splitTextToSize(
        `Flag: ${flag.message}`,
        contentWidth - 8,
      );
      checkPage(flagLines.length * 3.5);
      doc.text(flagLines, margin + 4, y);
      y += flagLines.length * 3.5 + 1;
    });

    spacer(3);
  });

  doc.addPage();
  y = margin;
  heading("Readiness Scores (R1–R12)", 13);
  spacer(2);

  readinessDimensions.forEach((dim) => {
    const score = assessment.gaps.find(
      (g) => g.readinessId === dim.id,
    )?.readinessScore;
    const justification = justifications[dim.id] ?? "";
    const dimFlags = firedFlags.filter((f) => f.targetDimension === dim.id);

    checkPage(20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NHS_DARK_BLUE);
    doc.text(`${dim.id} — ${dim.longLabel}`, margin, y);

    if (score) {
      doc.setFont("helvetica", "normal");
      doc.text(`Score: ${score}`, pageWidth - margin, y, { align: "right" });
    }
    y += 5;

    if (justification) {
      body(justification, 4);
    }

    dimFlags.forEach((flag) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...NHS_AMBER);
      const flagLines = doc.splitTextToSize(
        `Flag: ${flag.message}`,
        contentWidth - 8,
      );
      checkPage(flagLines.length * 3.5);
      doc.text(flagLines, margin + 4, y);
      y += flagLines.length * 3.5 + 1;
    });

    spacer(3);
  });

  // ── Tool Intelligence Summary ──

  if (lookupResults) {
    doc.addPage();
    y = margin;
    heading("Tool Intelligence Summary", 13);
    spacer(2);

    body(
      `Search performed for: "${lookupResults.toolName}" on ${new Date(lookupResults.timestamp).toLocaleDateString("en-GB")}`,
    );
    spacer(2);

    // FDA
    body(
      `FDA AI/ML Devices: ${lookupResults.fda.status === "found" ? `${lookupResults.fda.matches.length} match(es) found` : "Not found in FDA AI/ML device list"}`,
    );

    // PubMed
    body(
      `PubMed: ${lookupResults.pubmed.status === "found" ? `${lookupResults.pubmed.count} publication(s) found` : "No publications found"}`,
    );

    // Trials
    if (lookupResults.trials.status === "found") {
      body(
        `Clinical Trials: ${lookupResults.trials.total} registered — ${lookupResults.trials.completed} completed, ${lookupResults.trials.recruiting} recruiting, ${lookupResults.trials.ukBased} UK-based`,
      );
    } else {
      body("Clinical Trials: No registered trials found");
    }

    // Web
    if (lookupResults.web.status === "found") {
      const nhsCount = lookupResults.web.results.filter((r) => r.isNHS).length;
      const govCount = lookupResults.web.results.filter(
        (r) => r.isGovUK,
      ).length;
      body(
        `Web mentions: ${lookupResults.web.results.length} result(s) — ${nhsCount} NHS, ${govCount} GOV.UK`,
      );
    }

    spacer(4);
  }

  // ── Scope and Limitations ──

  checkPage(30);
  heading("Scope and Limitations", 11);
  spacer(2);
  body(
    "The framework identifies and prioritises gaps between the complexity demands of a specific AI tool and the readiness of a specific deploying organisation. It does not generate specific readiness-building actions. Translating prioritised gaps into concrete action plans requires domain expertise, organisational knowledge, and professional judgement that sit outside the scope of a standardised assessment instrument. This is a deliberate design choice: the framework tells you where to focus; determining what to do is the work of the implementation team.",
  );

  spacer(6);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...NHS_GREY);
  doc.text(
    "Generated by the NHS AI Adoption Assessment Tool. AI Centre for Value Based Healthcare, Yale University.",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" },
  );

  // ── Save ──

  const filename = `nhs-ai-assessment-${basicData.toolName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
