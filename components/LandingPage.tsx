"use client";

import { useState, useEffect } from "react";
import { NHS_COLOURS } from "../lib/constants";
import { getSavedSummary, clearSavedState } from "../lib/save";
import { anchors } from "../lib/anchors";

const STEP_NAMES = ["Framing", "Basic Data", "Complexity", "Readiness", "Results"];

interface LandingPageProps {
  onStart: () => void;
  onResume: () => void;
}

export default function LandingPage({ onStart, onResume }: LandingPageProps) {
  const [savedSummary, setSavedSummary] = useState<{
    toolName: string;
    savedAt: string;
    step: number;
  } | null>(null);

  useEffect(() => {
    setSavedSummary(getSavedSummary());
  }, []);

  function handleDiscard() {
    clearSavedState();
    setSavedSummary(null);
  }

  function formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString("en-GB")} at ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return iso;
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: NHS_COLOURS.white }}
    >
      {/* Main content — vertically centred */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Logo */}
          <img
            src="/ai-centre-logo.png"
            alt="AI Centre for Value Based Healthcare"
            className="h-40 w-auto mx-auto mb-8"
          />

          {/* Title */}
          <h1
            className="text-4xl font-bold mb-3"
            style={{ color: NHS_COLOURS.darkBlue }}
          >
            NHS AI Adoption Assessment Tool
          </h1>
          <p
            className="text-lg mb-10"
            style={{ color: NHS_COLOURS.secondaryText }}
          >
            12×12 Paired Complexity–Readiness Framework
          </p>

          {/* Resume prompt — shown if saved state exists */}
          {savedSummary && (
            <div
              className="rounded-lg p-5 mb-8 text-left border"
              style={{
                borderColor: NHS_COLOURS.blue,
                backgroundColor: NHS_COLOURS.blue + "08",
              }}
            >
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: NHS_COLOURS.darkBlue }}
              >
                You have an assessment in progress
              </h3>
              <p
                className="text-sm mb-3"
                style={{ color: NHS_COLOURS.darkText }}
              >
                <span className="font-medium">{savedSummary.toolName || "Untitled assessment"}</span>
                {" — "}
                saved {formatDate(savedSummary.savedAt)}
                {savedSummary.step > 0 && (
                  <span style={{ color: NHS_COLOURS.secondaryText }}>
                    {" "}(Step {savedSummary.step + 1}: {STEP_NAMES[savedSummary.step] ?? "Unknown"})
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onResume}
                  className="px-6 py-2.5 rounded font-medium text-sm transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: NHS_COLOURS.blue,
                    color: NHS_COLOURS.white,
                  }}
                >
                  Resume Assessment →
                </button>
                <button
                  onClick={handleDiscard}
                  className="px-6 py-2.5 rounded font-medium text-sm"
                  style={{
                    color: NHS_COLOURS.secondaryText,
                    border: `1px solid ${NHS_COLOURS.grey}`,
                    backgroundColor: NHS_COLOURS.white,
                  }}
                >
                  Discard and Start Fresh
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div
            className="text-left rounded-lg p-6 mb-8"
            style={{ backgroundColor: NHS_COLOURS.lightGrey }}
          >
            <h2
              className="text-base font-semibold mb-3"
              style={{ color: NHS_COLOURS.darkBlue }}
            >
              What this tool does
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: NHS_COLOURS.darkText }}
            >
              Adopting an AI tool is rarely a simple yes or no. The same tool can
              be a sensible choice for one organisation and a serious risk for
              another, because what matters is the fit between the demands a tool
              places on its environment and the capabilities of the organisation
              deploying it. This tool makes that fit explicit. It pairs twelve{" "}
              <em>complexity</em> dimensions (properties of the tool, such as how
              hard its task is, how its data behaves, and how much it must
              integrate with existing systems) with twelve <em>readiness</em>{" "}
              dimensions (capabilities of your organisation, such as its
              governance, data infrastructure, and capacity for clinical
              oversight). Where a tool&apos;s complexity outruns your readiness,
              you have a gap. The tool identifies those gaps, prioritises them,
              and returns one of four recommendations: quick win, deploy and
              monitor, build readiness first, or avoid.
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: NHS_COLOURS.darkText }}
            >
              It is a diagnostic instrument, not a prescriptive one. It tells you{" "}
              <em>where</em> to focus; it does not tell you exactly <em>what</em>{" "}
              to do, because that depends on knowledge of your organisation that
              no standardised tool can hold.
            </p>

            <h2
              className="text-base font-semibold mb-3"
              style={{ color: NHS_COLOURS.darkBlue }}
            >
              Where it fits in your adoption process
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: NHS_COLOURS.darkText }}
            >
              Use this assessment early — while horizon scanning, building a
              business case, preparing for procurement, or planning a pilot. It
              is most useful before you have committed, when its findings can
              still shape the decision rather than justify one already made.
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: NHS_COLOURS.darkText }}
            >
              It complements, and does not replace, the formal processes that
              govern AI in the NHS. It is not a substitute for the clinical
              safety work required under DCB0129 and DCB0160, a Data Protection
              Impact Assessment, the Digital Technology Assessment Criteria
              (DTAC), or regulatory approval of the tool as a medical device.
              Think of it as the structured conversation to have{" "}
              <em>before and alongside</em> those processes: a single place to
              surface whether a tool is the right fit for your organisation, and
              where your effort should go if you decide to proceed.
            </p>

            <h2
              className="text-base font-semibold mb-3"
              style={{ color: NHS_COLOURS.darkBlue }}
            >
              Who it is for
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: NHS_COLOURS.darkText }}
            >
              It is for anyone involved in deciding whether to adopt an AI tool
              in an NHS setting: clinical safety officers, digital transformation
              leads, AI programme managers, information governance teams, and
              procurement. It is most usefully completed by a multidisciplinary
              team rather than one person, because the questions span clinical,
              technical, governance, and operational ground that no single role
              sees in full. Where you do not know an answer, the tool signposts
              who to speak to — your clinical safety officer, cybersecurity team,
              information governance lead, or supplier — so that a gap in
              knowledge becomes a prompt to consult the right person rather than
              a guess.
            </p>

            <h2
              className="text-base font-semibold mb-3"
              style={{ color: NHS_COLOURS.darkBlue }}
            >
              Assessing multiple tools
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: NHS_COLOURS.darkText }}
            >
              This assessment evaluates one tool at a time, but readiness is not
              independent across tools. The burden on governance, clinical
              workforce, IT infrastructure, and monitoring accumulates: an
              organisation that comfortably meets the threshold for a single tool
              may find that deploying three or four at once exceeds its capacity.
              Where several tools are in view, run a separate assessment for each
              and review the readiness scores side by side, paying particular
              attention to the dimensions where cumulative demand is highest.
            </p>

            <h2
              className="text-base font-semibold mb-3"
              style={{ color: NHS_COLOURS.darkBlue }}
            >
              The worked examples
            </h2>
            <p
              className="text-sm mb-3"
              style={{ color: NHS_COLOURS.darkText }}
            >
              Throughout the tool you will see illustrative example answers drawn
              from eight archetypal tools, spanning the range from administrative
              to fully autonomous and agentic. They are composites used to show
              how different kinds of tool tend to score, and to make the
              reasoning concrete — they are <em>for illustration only</em> and
              are not assessments of real products.
            </p>
            <ul className="mb-4 space-y-2">
              {anchors.map((a) => (
                <li key={a.id} className="text-sm" style={{ color: NHS_COLOURS.darkText }}>
                  <span className="font-semibold">{a.displayName}</span>
                  <span style={{ color: NHS_COLOURS.grey }}> — {a.autonomyTierLabel}{a.agentic ? ", agentic" : ""}</span>
                  <span style={{ color: NHS_COLOURS.secondaryText }}>. {a.description}</span>
                </li>
              ))}
            </ul>

            <div
              className="rounded-md px-4 py-3 mb-4"
              style={{
                backgroundColor: NHS_COLOURS.blue + "0D",
                border: `1px solid ${NHS_COLOURS.blue}33`,
              }}
            >
              <p className="text-sm" style={{ color: NHS_COLOURS.darkText }}>
                <strong>Companion tool:</strong> the{" "}
                <a
                  href="https://www.cersi-ai.org/the-ai-readiness-checklist/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                  style={{ color: NHS_COLOURS.blue }}
                >
                  AI Readiness Checklist
                </a>{" "}
                (CERSI-AI / University of Birmingham) approaches the same question
                from a harms-and-controls angle. We recommend using it alongside
                this framework.
              </p>
            </div>
                        <p
              className="text-sm"
              style={{ color: NHS_COLOURS.darkText }}
            >
              The tool automatically searches FDA AI/ML device clearances,
              PubMed, ClinicalTrials.gov, and web sources to provide
              contextual intelligence for each tool assessed. Please do
              independently verify all information regarding the tool you
              are assessing.
            </p>
          </div>

          {/* CTA — only show if no resume prompt, otherwise it's redundant */}
          {!savedSummary && (
            <button
              onClick={onStart}
              className="px-14 py-6 rounded-xl font-bold text-2xl shadow-md transition-opacity hover:opacity-90"
              style={{
                backgroundColor: NHS_COLOURS.blue,
                color: NHS_COLOURS.white,
              }}
            >
              Begin Assessment →
            </button>
          )}

          {/* Show "Begin new" as secondary when resume is showing */}
          {savedSummary && (
            <button
              onClick={() => {
                handleDiscard();
                onStart();
              }}
              className="px-14 py-6 rounded-xl font-bold text-2xl shadow-md transition-opacity hover:opacity-90"
              style={{
                backgroundColor: NHS_COLOURS.blue,
                color: NHS_COLOURS.white,
              }}
            >
              Begin New Assessment →
            </button>
          )}

          {/* User guide link */}
          <p className="text-sm mt-5">
            New to the framework?{" "}
            <a
              href="/guide"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
              style={{ color: NHS_COLOURS.blue }}
            >
              Read the user guide ↗
            </a>
            {" · "}
            <a
              href="/guide#sources"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
              style={{ color: NHS_COLOURS.blue }}
            >
              References ↗
            </a>
          </p>

          {/* Footer note */}
          <p
            className="text-xs mt-8"
            style={{ color: NHS_COLOURS.grey }}
          >
            Developed by Jessica Morley, Digital Ethics Center, Yale University
            in collaboration with AI Centre for Value Based Healthcare. This is
            a prototype decision tool, designed to help NHS organisations make
            informed decisions about whether to adopt specific AI technologies;
            it is being iterated and improved, and does not constitute official
            policy or regulatory guidance.
          </p>
        </div>
      </main>
    </div>
  );
}
