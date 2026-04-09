"use client";

import { useState } from "react";
import type { LookupResults, SmartLink } from "../lib/lookup";
import { NHS_COLOURS } from "../lib/constants";

interface ToolIntelligenceProps {
  results: LookupResults | null;
  loading: boolean;
  error?: string;
}

export default function ToolIntelligence({
  results,
  loading,
  error,
}: ToolIntelligenceProps) {
  const [expanded, setExpanded] = useState(true);

  if (!results && !loading && !error) return null;

  // Separate prominent links (NICE, EUDAMED) from standard smart links
  const prominentLinks = results?.smartLinks.filter((l) => l.prominent) ?? [];
  const standardLinks = results?.smartLinks.filter((l) => !l.prominent) ?? [];

  return (
    <div
      className="rounded-lg border mt-4 mb-6 overflow-hidden"
      style={{ borderColor: NHS_COLOURS.blue }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 text-left"
        style={{ backgroundColor: NHS_COLOURS.blue }}
      >
        <span className="text-sm font-semibold text-white">
          Tool Intelligence{results ? `: ${results.toolName}` : ""}
        </span>
        <span className="text-white text-xs">
          {loading ? "Searching..." : expanded ? "Collapse" : "Expand"}
        </span>
      </button>

      {expanded && (
        <div className="px-5 py-4 space-y-5" style={{ backgroundColor: "#F8FAFB" }}>
          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-3 py-4">
              <div
                className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{
                  borderColor: NHS_COLOURS.lightGrey,
                  borderTopColor: NHS_COLOURS.blue,
                }}
              />
              <p className="text-sm" style={{ color: NHS_COLOURS.secondaryText }}>
                Searching public databases (FDA, PubMed, ClinicalTrials.gov)...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <p className="text-sm" style={{ color: NHS_COLOURS.red }}>
              {error}
            </p>
          )}

          {/* Results */}
          {results && !loading && (
            <>
              {/* ── Regulatory Status ── */}
              <Section title="Regulatory Status">
                {/* FDA */}
                <StatusRow
                  label="FDA AI/ML Devices"
                  status={results.fda.status}
                  foundText={`${results.fda.matches.length} match${results.fda.matches.length !== 1 ? "es" : ""} found`}
                  notFoundText="Not found in FDA AI/ML device list"
                  errorText={results.fda.error}
                />
                {results.fda.matches.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {results.fda.matches.slice(0, 3).map((m) => (
                      <p
                        key={m.submissionNumber}
                        className="text-xs"
                        style={{ color: NHS_COLOURS.secondaryText }}
                      >
                        {m.deviceName} — {m.manufacturer} | {m.clearancePathway} |{" "}
                        {m.decisionDate} | {m.specialty}
                      </p>
                    ))}
                  </div>
                )}

                {/* EUDAMED prominent link */}
                {prominentLinks
                  .filter((l) => l.category === "regulatory")
                  .map((link) => (
                    <ProminentLink key={link.label} link={link} />
                  ))}
              </Section>

              {/* ── NICE Guidance ── */}
              {prominentLinks.filter((l) => l.category === "guidance").length > 0 && (
                <Section title="NICE Guidance">
                  {prominentLinks
                    .filter((l) => l.category === "guidance")
                    .map((link) => (
                      <ProminentLink key={link.label} link={link} />
                    ))}
                </Section>
              )}

              {/* ── Evidence Base ── */}
              <Section title="Evidence Base">
                {/* PubMed */}
                <StatusRow
                  label="PubMed"
                  status={results.pubmed.status}
                  foundText={`${results.pubmed.count} publication${results.pubmed.count !== 1 ? "s" : ""} found`}
                  notFoundText="No publications found"
                  errorText={results.pubmed.error}
                />
                {results.pubmed.results.length > 0 && (
                  <div className="ml-6 mt-1 space-y-2">
                    {results.pubmed.results.slice(0, 5).map((p) => (
                      <div key={p.pmid}>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{ color: NHS_COLOURS.blue }}
                        >
                          {p.title}
                        </a>
                        <p
                          className="text-xs"
                          style={{ color: NHS_COLOURS.grey }}
                        >
                          {p.authors} — {p.journal}, {p.date}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Clinical Trials */}
                <StatusRow
                  label="Clinical Trials"
                  status={results.trials.status}
                  foundText={`${results.trials.total} registered — ${results.trials.completed} completed, ${results.trials.recruiting} recruiting${results.trials.ukBased > 0 ? `, ${results.trials.ukBased} UK-based` : ""}`}
                  notFoundText="No registered trials found"
                  errorText={results.trials.error}
                />
                {results.trials.results.length > 0 && (
                  <div className="ml-6 mt-1 space-y-2">
                    {results.trials.results.slice(0, 5).map((t) => (
                      <div key={t.nctId}>
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          style={{ color: NHS_COLOURS.blue }}
                        >
                          {t.title}
                        </a>
                        <p
                          className="text-xs"
                          style={{ color: NHS_COLOURS.grey }}
                        >
                          {t.status} | {t.sponsor}
                          {t.hasUKSite && (
                            <span
                              className="ml-1 px-1.5 py-0.5 rounded text-white"
                              style={{ backgroundColor: NHS_COLOURS.blue, fontSize: "10px" }}
                            >
                              UK
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* ── Web Search ── */}
              <Section title="Web Mentions">
                {results.web.status === "no_api_key" ? (
                  <p className="text-xs" style={{ color: NHS_COLOURS.grey }}>
                    Web search not configured. Add a Brave Search API key to
                    enable. Free tier available at{" "}
                    <a
                      href="https://brave.com/search/api/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: NHS_COLOURS.blue }}
                    >
                      brave.com/search/api
                    </a>
                  </p>
                ) : (
                  <>
                    <StatusRow
                      label="Web search"
                      status={results.web.status}
                      foundText={`${results.web.results.length} result${results.web.results.length !== 1 ? "s" : ""}`}
                      notFoundText="No web results found"
                      errorText={results.web.error}
                    />
                    {results.web.results.length > 0 && (
                      <div className="ml-6 mt-1 space-y-2">
                        {results.web.results.slice(0, 10).map((w, i) => (
                          <div key={i}>
                            <div className="flex items-center gap-1.5">
                              {(w.isNHS || w.isGovUK) && (
                                <span
                                  className="px-1.5 py-0.5 rounded text-white font-semibold"
                                  style={{
                                    backgroundColor: w.isNHS
                                      ? NHS_COLOURS.blue
                                      : NHS_COLOURS.darkBlue,
                                    fontSize: "9px",
                                  }}
                                >
                                  {w.isNHS ? "NHS" : "GOV.UK"}
                                </span>
                              )}
                              <a
                                href={w.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline"
                                style={{ color: NHS_COLOURS.blue }}
                              >
                                {w.title}
                              </a>
                            </div>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: NHS_COLOURS.grey }}
                            >
                              {w.snippet.slice(0, 150)}
                              {w.snippet.length > 150 ? "..." : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </Section>

              {/* ── Other Quick Links ── */}
              <Section title="Verify Directly">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {standardLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded px-3 py-2 text-xs"
                      style={{
                        backgroundColor: NHS_COLOURS.white,
                        border: `1px solid ${NHS_COLOURS.lightGrey}`,
                        color: NHS_COLOURS.blue,
                      }}
                    >
                      <span className="font-medium underline">{link.label}</span>
                      <p
                        className="mt-0.5"
                        style={{ color: NHS_COLOURS.grey, textDecoration: "none" }}
                      >
                        {link.description}
                      </p>
                    </a>
                  ))}
                </div>
              </Section>

              {/* ── Disclaimer ── */}
              <div
                className="rounded px-4 py-3 text-xs"
                style={{
                  backgroundColor: NHS_COLOURS.amber + "15",
                  borderLeft: `3px solid ${NHS_COLOURS.amber}`,
                  color: NHS_COLOURS.darkText,
                }}
              >
                This is an automated search of public databases. It may not
                capture all relevant information. Absence of results does not
                confirm absence of evidence or regulatory approval. Always verify
                directly with the vendor and relevant regulators.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helper components ──

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4
        className="text-xs font-bold uppercase tracking-wide mb-2"
        style={{ color: NHS_COLOURS.darkBlue }}
      >
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function StatusRow({
  label,
  status,
  foundText,
  notFoundText,
  errorText,
}: {
  label: string;
  status: string;
  foundText: string;
  notFoundText: string;
  errorText?: string;
}) {
  const icon =
    status === "found" ? "✓" : status === "error" ? "⚠" : "—";
  const colour =
    status === "found"
      ? NHS_COLOURS.green
      : status === "error"
        ? NHS_COLOURS.amber
        : NHS_COLOURS.grey;

  return (
    <div className="flex items-start gap-2">
      <span className="font-bold text-sm" style={{ color: colour }}>
        {icon}
      </span>
      <div>
        <span className="text-sm font-medium" style={{ color: NHS_COLOURS.darkText }}>
          {label}:{" "}
        </span>
        <span className="text-sm" style={{ color: NHS_COLOURS.secondaryText }}>
          {status === "found"
            ? foundText
            : status === "error"
              ? errorText ?? "Unable to query"
              : notFoundText}
        </span>
      </div>
    </div>
  );
}

/**
 * A prominent search link displayed as a styled card within its parent
 * section. Used for NICE and EUDAMED where we can't automate the search
 * but want to guide the user to check manually.
 */
function ProminentLink({ link }: { link: SmartLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-md px-4 py-3 mt-2 transition-colors"
      style={{
        backgroundColor: NHS_COLOURS.blue + "08",
        border: `1px solid ${NHS_COLOURS.blue}30`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-semibold underline"
          style={{ color: NHS_COLOURS.blue }}
        >
          {link.label}
        </span>
        <span className="text-xs" style={{ color: NHS_COLOURS.blue }}>
          ↗
        </span>
      </div>
      <p
        className="text-xs mt-1 leading-relaxed"
        style={{ color: NHS_COLOURS.secondaryText, textDecoration: "none" }}
      >
        {link.description}
      </p>
    </a>
  );
}
