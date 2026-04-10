"use client";

import { useState, useEffect } from "react";
import { NHS_COLOURS } from "../lib/constants";
import { getSavedSummary, clearSavedState } from "../lib/save";

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
              This tool helps NHS organisations assess whether a specific AI tool
              is appropriate for their specific context. It pairs 12 complexity
              dimensions (properties of the tool) with 12 readiness dimensions
              (capabilities of the deploying organisation) to produce a
              context-sensitive deployment recommendation.
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
              Clinical safety officers, digital transformation leads, AI
              programme managers, procurement teams, and anyone involved in
              decisions about adopting AI tools in NHS settings. The assessment
              is designed to be completed collaboratively — it works best when
              clinical, technical, and operational perspectives are all
              represented.
            </p>

            <h2
              className="text-base font-semibold mb-3"
              style={{ color: NHS_COLOURS.darkBlue }}
            >
              How it works
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: NHS_COLOURS.darkText }}
            >
              The tool guides you through five steps: (1) a framing check to
              confirm the assessment is proportionate and needs-led, (2) basic
              data about the tool and your organisation, (3) complexity scoring
              across 12 dimensions, (4) readiness scoring across 12 paired
              dimensions, and (5) a classification result with prioritised
              actions. Hard gates enforce non-negotiable safety requirements, and
              scoring floors ensure minimum complexity thresholds are met for
              higher-risk tools.
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
              This assessment is designed to evaluate one AI tool at a time.
              Organisations considering the adoption of multiple AI tools
              should be aware that readiness scores are not independent
              across tools: the aggregate burden on governance capacity,
              clinical workforce, IT infrastructure, and monitoring resources
              should be assessed cumulatively. A trust that comfortably
              meets the readiness threshold for a single tool may find that
              deploying three or four simultaneously exceeds its capacity.
              Where multiple tools are being considered, run a separate
              assessment for each and then review the readiness scores
              side by side, paying particular attention to dimensions where
              cumulative demand is highest.
            </p>

            <h2
              className="text-base font-semibold mb-3"
              style={{ color: NHS_COLOURS.darkBlue }}
            >
              Sources and evidence base
            </h2>
            <p
              className="text-sm mb-3"
              style={{ color: NHS_COLOURS.darkText }}
            >
              The framework draws on:
            </p>
            <ul
              className="text-xs space-y-2 mb-3 pl-4"
              style={{ color: NHS_COLOURS.darkText, listStyleType: "disc" }}
            >
              <li>Morley, J. (2023). On designing an algorithmically enhanced NHS: towards a conceptual model for the successful implementation of algorithmic clinical decision support software in the National Health Service [PhD Thesis]. University of Oxford.</li>
              <li>Greenhalgh, T., Wherton, J., Papoutsi, C., Lynch, J., Hughes, G., A&apos;Court, C., Hinder, S., Fahy, N., Procter, R., &amp; Shaw, S. (2017). Beyond Adoption: A New Framework for Theorizing and Evaluating Nonadoption, Abandonment, and Challenges to the Scale-Up, Spread, and Sustainability of Health and Care Technologies. <em>Journal of Medical Internet Research</em>, 19(11), e367. <a href="https://doi.org/10.2196/jmir.8775" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.2196/jmir.8775</a></li>
              <li>Morley, J., &amp; Floridi, L. (2025). The Ethics of AI in Healthcare: An Updated Mapping Review. In M. C. Altman &amp; D. Schwan (Eds), <em>Ethics and Medical Technology</em> (Vol. 113, pp. 29–57). Springer Nature Switzerland. <a href="https://doi.org/10.1007/978-3-031-94690-5_2" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.1007/978-3-031-94690-5_2</a></li>
              <li>Gama, F., Tyskbo, D., Nygren, J., Barlow, J., Reed, J., &amp; Svedberg, P. (2022). Implementation Frameworks for Artificial Intelligence Translation Into Health Care Practice: Scoping Review. <em>Journal of Medical Internet Research</em>, 24(1), e32215. <a href="https://doi.org/10.2196/32215" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.2196/32215</a></li>
              <li>Roppelt, J. S., Kanbach, D. K., &amp; Kraus, S. (2024). Artificial intelligence in healthcare institutions: A systematic literature review on influencing factors. <em>Technology in Society</em>, 76, 102443. <a href="https://doi.org/10.1016/j.techsoc.2023.102443" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.1016/j.techsoc.2023.102443</a></li>
              <li>Sriharan, A., Sekercioglu, N., Mitchell, C., Senkaiahliyan, S., Hertelendy, A., Porter, T., &amp; Banaszak-Holl, J. (2024). Leadership for AI Transformation in Health Care Organization: Scoping Review. <em>Journal of Medical Internet Research</em>, 26, e54556. <a href="https://doi.org/10.2196/54556" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.2196/54556</a></li>
              <li>Esmaeilzadeh, P. (2024). Challenges and strategies for wide-scale artificial intelligence (AI) deployment in healthcare practices: A perspective for healthcare organizations. <em>Artificial Intelligence in Medicine</em>, 151, 102861. <a href="https://doi.org/10.1016/j.artmed.2024.102861" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.1016/j.artmed.2024.102861</a></li>
              <li>Kim, J. Y., Hasan, A., Balu, S., &amp; Sendak, M. (2026). People process technology and operations framework for establishing AI governance in healthcare organizations. <em>Npj Digital Medicine</em>. <a href="https://doi.org/10.1038/s41746-026-02419-6" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.1038/s41746-026-02419-6</a></li>
              <li>Hussein, R., Zink, A., Ramadan, B., Howard, F. M., Hightower, M., Shah, S., &amp; Beaulieu-Jones, B. K. (2026). Advancing healthcare AI governance through a comprehensive maturity model based on systematic review. <em>Npj Digital Medicine</em>. <a href="https://doi.org/10.1038/s41746-026-02418-7" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.1038/s41746-026-02418-7</a></li>
              <li>Saria, S. (2022). Not All AI Is Created Equal: Strategies for Safe and Effective Adoption. <em>NEJM Catalyst</em>, 3(2). <a href="https://doi.org/10.1056/CAT.22.0075" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.1056/CAT.22.0075</a></li>
              <li>Farah, L., Murris, J. M., Borget, I., Guilloux, A., Martelli, N. M., &amp; Katsahian, S. I. M. (2023). Assessment of Performance, Interpretability, and Explainability in Artificial Intelligence–Based Health Technologies: What Healthcare Stakeholders Need to Know. <em>Mayo Clinic Proceedings: Digital Health</em>, 1(2), 120–138. <a href="https://doi.org/10.1016/j.mcpdig.2023.02.004" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.1016/j.mcpdig.2023.02.004</a></li>
              <li>Azad, T. D., Krumholz, H. M., &amp; Saria, S. (2026). Principles to guide clinical AI readiness and move from benchmarks to real-world evaluation. <em>Nature Medicine</em>. <a href="https://doi.org/10.1038/s41591-025-04198-1" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.1038/s41591-025-04198-1</a></li>
              <li>Dagan, N., Devons-Sberro, S., Paz, Z., Zoller, L., Sommer, A., Shaham, G., Shahar, N., Ohana, R., Weinstein, O., Netzer, D., Kotler, A., &amp; Balicer, R. D. (2024). Evaluation of AI Solutions in Health Care Organizations—The OPTICA Tool. <em>NEJM AI</em>, 1(9), AIcs2300269. <a href="https://doi.org/10.1056/AIcs2300269" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.1056/AIcs2300269</a></li>
              <li>Scott, I., Carter, S., &amp; Coiera, E. (2021). Clinician checklist for assessing suitability of machine learning applications in healthcare. <em>BMJ Health &amp; Care Informatics</em>, 28(1), e100251. <a href="https://doi.org/10.1136/bmjhci-2020-100251" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>doi:10.1136/bmjhci-2020-100251</a></li>
              <li>Coalition for Health AI (2024). CHAI Responsible AI Checkpoint Checklists 1–3.</li>
              <li>WHO. (2023). <em>Regulatory Considerations on Artificial Intelligence for Health</em>. <a href="https://iris.who.int/bitstream/handle/10665/373421/9789240078871-eng.pdf" target="_blank" rel="noopener noreferrer" style={{ color: NHS_COLOURS.blue, textDecoration: "underline" }}>WHO/HGF/EHL/2023.1</a></li>
            </ul>
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
              className="px-10 py-4 rounded-lg font-semibold text-base transition-opacity hover:opacity-90"
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
              className="px-10 py-4 rounded-lg font-semibold text-base transition-opacity hover:opacity-90"
              style={{
                backgroundColor: NHS_COLOURS.blue,
                color: NHS_COLOURS.white,
              }}
            >
              Begin New Assessment →
            </button>
          )}

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
