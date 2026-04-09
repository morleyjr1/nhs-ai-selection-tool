"use client";

import { NHS_COLOURS } from "../lib/constants";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
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
            className="h-24 w-auto mx-auto mb-8"
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
              Sources and evidence base
            </h2>
            <p
              className="text-sm"
              style={{ color: NHS_COLOURS.darkText }}
            >
              The framework draws on MHRA regulatory guidance on software and AI
              as a medical device, the NICE Evidence Standards Framework for
              digital health technologies, NHS England&apos;s AI governance
              principles, and the academic literature on health AI ethics and
              safety. The tool automatically searches FDA AI/ML device
              clearances, PubMed, ClinicalTrials.gov, and web sources to provide
              contextual intelligence for each tool assessed.
            </p>
          </div>

          {/* CTA */}
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

          {/* Footer note */}
          <p
            className="text-xs mt-8"
            style={{ color: NHS_COLOURS.grey }}
          >
            Developed by Jessica Morley, AI Centre for Value Based Healthcare,
            Yale University. This tool is for guidance purposes only and does not
            constitute regulatory advice.
          </p>
        </div>
      </main>
    </div>
  );
}
