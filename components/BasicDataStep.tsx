"use client";

import { useState } from "react";
import { NHS_COLOURS } from "../lib/constants";
import type { BasicData } from "../lib/types";
import type { LookupResults } from "../lib/lookup";
import ToolIntelligence from "./ToolIntelligence";
import {
  AUTONOMY_TIERS,
  AGENTIC_OPTIONS,
  DEVICE_CLASSES,
  DETERMINISM_OPTIONS,
  USER_GROUPS,
  DEPLOYMENT_SCOPES,
  ADOPTION_STAGES,
  DEVELOPER_TYPES,
} from "../lib/constants";

interface BasicDataStepProps {
  initialData: BasicData;
  onNext: (data: BasicData) => void;
  onBack: () => void;
  lookupResults: LookupResults | null;
  lookupLoading: boolean;
  lookupError?: string;
  /** Called whenever the tool name or manufacturer name changes — drives real-time lookup */
  onLookupFieldsChange?: (toolName: string, manufacturerName?: string) => void;
}

const DETERMINISM_INFO: Record<number, string> = {
  1: "Given the same input, the tool always produces the same output. Rule-based systems, simple calculators, and look-up tools are typically deterministic.",
  2: "The tool may produce different outputs from the same input due to randomness in its model (e.g. large language models, neural networks with sampling). Stochastic tools raise minimum scoring floors on oversight, validation, and monitoring dimensions.",
  3: "You are not sure whether the tool is deterministic or stochastic.",
};

export default function BasicDataStep({
  initialData,
  onNext,
  onBack,
  lookupResults,
  lookupLoading,
  lookupError,
  onLookupFieldsChange,
}: BasicDataStepProps) {
  const [data, setData] = useState<BasicData>(initialData);
  const [otherUser, setOtherUser] = useState("");

  const determinismBlocked = data.determinism === 3;
  const regulatoryBlocked = data.regulatoryAwareness === "No";
  const deviceClassBlocked = data.deviceClass === 6;
  const canProceed =
    data.toolName.trim() !== "" &&
    data.autonomyTier > 0 &&
    data.agentic !== undefined &&
    data.deviceClass > 0 &&
    !deviceClassBlocked &&
    data.determinism > 0 &&
    !determinismBlocked &&
    data.regulatoryAwareness === "Yes" &&
    !regulatoryBlocked;

  function update<K extends keyof BasicData>(field: K, value: BasicData[K]) {
    setData((prev) => {
      const next = { ...prev, [field]: value };
      if (
        (field === "toolName" || field === "manufacturerName") &&
        onLookupFieldsChange
      ) {
        onLookupFieldsChange(
          field === "toolName" ? (value as string) : next.toolName,
          field === "manufacturerName"
            ? (value as string)
            : next.manufacturerName,
        );
      }
      return next;
    });
  }

  function toggleUser(user: string) {
    setData((prev) => ({
      ...prev,
      users: prev.users.includes(user)
        ? prev.users.filter((u) => u !== user)
        : [...prev.users, user],
    }));
  }

  // ── Shared styling ──
  const inputClass = "w-full px-3 py-2 rounded border text-sm";
  const inputStyle = { borderColor: NHS_COLOURS.grey, color: NHS_COLOURS.darkText };
  const labelClass = "block text-sm font-medium mb-1";
  const labelStyle = { color: NHS_COLOURS.darkText };
  const hintStyle = { color: NHS_COLOURS.secondaryText };
  const selectedTier = AUTONOMY_TIERS.find((t) => t.value === data.autonomyTier);
  const selectedAgentic = AGENTIC_OPTIONS.find((o) => o.value === data.agentic);

  return (
    <div className="max-w-3xl mx-auto">
      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: NHS_COLOURS.darkBlue }}
      >
        Basic Data
      </h2>
      <p className="mb-6" style={hintStyle}>
        Provide information about the AI tool and its deployment context. Fields
        marked with * are required.
      </p>

      {/* ── Section: Tool identification ── */}
      <Section title="Tool identification">
        <div>
          <label className={labelClass} style={labelStyle}>
            Organisation name
          </label>
          <input
            type="text"
            value={data.orgName ?? ""}
            onChange={(e) => update("orgName", e.target.value)}
            className={inputClass}
            style={inputStyle}
            placeholder="e.g. Guy's and St Thomas' NHS Foundation Trust"
          />
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Q1. Tool name *
          </label>
          <input
            type="text"
            value={data.toolName}
            onChange={(e) => update("toolName", e.target.value)}
            className={inputClass}
            style={inputStyle}
            placeholder="e.g. the product name"
          />
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Q1b. Manufacturer or developer name
          </label>
          <input
            type="text"
            value={data.manufacturerName ?? ""}
            onChange={(e) => update("manufacturerName", e.target.value)}
            className={inputClass}
            style={inputStyle}
            placeholder="e.g. Microsoft / Nuance"
          />
          <Blurb>
            Adding the manufacturer name helps narrow down search results,
            particularly for tools with generic names.
          </Blurb>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Q1c. Product URL
          </label>
          <input
            type="url"
            value={data.productUrl ?? ""}
            onChange={(e) => update("productUrl", e.target.value)}
            className={inputClass}
            style={inputStyle}
            placeholder="e.g. https://…"
          />
        </div>

        <div>
          <p className="text-xs mb-2" style={hintStyle}>
            We will automatically search public databases (FDA, PubMed,
            ClinicalTrials.gov) for this tool. This may take a moment.
          </p>
          <ToolIntelligence
            results={lookupResults}
            loading={lookupLoading}
            error={lookupError}
          />
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Q2. Tool purpose
          </label>
          <textarea
            value={data.toolPurpose ?? ""}
            onChange={(e) => update("toolPurpose", e.target.value)}
            rows={2}
            className={inputClass}
            style={inputStyle}
            placeholder="What does this tool do?"
          />
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Q3. Problem addressed
          </label>
          <textarea
            value={data.toolProblem ?? ""}
            onChange={(e) => update("toolProblem", e.target.value)}
            rows={2}
            className={inputClass}
            style={inputStyle}
            placeholder="What problem does this tool solve?"
          />
        </div>
      </Section>

      {/* ── Section: Function and behaviour ── */}
      <Section title="Function and behaviour">
        <div>
          <label className={labelClass} style={labelStyle}>
            Q4a. What function is the tool being used for? *
          </label>
          <select
            value={data.autonomyTier || ""}
            onChange={(e) =>
              update(
                "autonomyTier",
                Number(e.target.value) as BasicData["autonomyTier"],
              )
            }
            className={inputClass}
            style={{ ...inputStyle, backgroundColor: NHS_COLOURS.white }}
          >
            <option value="" disabled>
              Select a function…
            </option>
            {AUTONOMY_TIERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value}. {opt.label}
              </option>
            ))}
          </select>
          {selectedTier && <Blurb>{selectedTier.examples}</Blurb>}
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Q4b. Is the tool agentic? *
          </label>
          <p className="text-xs mb-1.5" style={hintStyle}>
            An agentic tool plans and carries out a multi-step sequence of
            actions towards a goal — choosing what to do next and adapting as it
            goes — rather than producing a single output.
          </p>
          <select
            value={data.agentic === undefined ? "" : String(data.agentic)}
            onChange={(e) => update("agentic", e.target.value === "true")}
            className={inputClass}
            style={{ ...inputStyle, backgroundColor: NHS_COLOURS.white }}
          >
            <option value="" disabled>
              Select…
            </option>
            {AGENTIC_OPTIONS.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
          {selectedAgentic && <Blurb>{selectedAgentic.description}</Blurb>}
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Q4c. Is the tool stochastic or deterministic? *
          </label>
          <select
            value={data.determinism || ""}
            onChange={(e) =>
              update(
                "determinism",
                Number(e.target.value) as BasicData["determinism"],
              )
            }
            className={inputClass}
            style={{ ...inputStyle, backgroundColor: NHS_COLOURS.white }}
          >
            <option value="" disabled>
              Select…
            </option>
            {DETERMINISM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {data.determinism > 0 && <Blurb>{DETERMINISM_INFO[data.determinism]}</Blurb>}
          {determinismBlocked && (
            <Blocked title="Assessment cannot proceed without this information">
              Whether a tool is deterministic or stochastic affects the minimum
              complexity scores applied to several dimensions (human oversight,
              validation, and monitoring). Without this information, the
              framework cannot calculate accurate scoring floors and the
              assessment would be unreliable. Please consult the tool&apos;s
              technical documentation or development team before proceeding.
            </Blocked>
          )}
        </div>
      </Section>

      {/* ── Section: Deployment context ── */}
      <Section title="Deployment context">
        <fieldset>
          <legend className={labelClass} style={labelStyle}>
            Q5. Intended users
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {USER_GROUPS.map((group) => (
              <label key={group} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.users.includes(group)}
                  onChange={() => toggleUser(group)}
                />
                <span style={{ color: NHS_COLOURS.darkText }}>{group}</span>
              </label>
            ))}
          </div>
          {data.users.includes("Other") && (
            <input
              type="text"
              value={otherUser}
              onChange={(e) => setOtherUser(e.target.value)}
              className={`mt-2 ${inputClass}`}
              style={inputStyle}
              placeholder="Please specify"
            />
          )}
        </fieldset>

        <div>
          <label className={labelClass} style={labelStyle}>
            Q6. Deployment scope
          </label>
          <select
            value={data.scope ?? ""}
            onChange={(e) => update("scope", e.target.value)}
            className={inputClass}
            style={{ ...inputStyle, backgroundColor: NHS_COLOURS.white }}
          >
            <option value="" disabled>
              Select…
            </option>
            {DEPLOYMENT_SCOPES.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Q7. Adoption stage
          </label>
          <select
            value={data.adoptionStage ?? ""}
            onChange={(e) => update("adoptionStage", e.target.value)}
            className={inputClass}
            style={{ ...inputStyle, backgroundColor: NHS_COLOURS.white }}
          >
            <option value="" disabled>
              Select…
            </option>
            {ADOPTION_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Q10. Developer type
          </label>
          <select
            value={data.developer ?? ""}
            onChange={(e) => update("developer", e.target.value)}
            className={inputClass}
            style={{ ...inputStyle, backgroundColor: NHS_COLOURS.white }}
          >
            <option value="" disabled>
              Select…
            </option>
            {DEVELOPER_TYPES.map((dt) => (
              <option key={dt} value={dt}>
                {dt}
              </option>
            ))}
          </select>
        </div>
      </Section>

      {/* ── Section: Regulatory and safety ── */}
      <Section title="Regulatory and safety">
        <div>
          <label className={labelClass} style={labelStyle}>
            Q8. Device classification *
          </label>
          <select
            value={data.deviceClass || ""}
            onChange={(e) =>
              update(
                "deviceClass",
                Number(e.target.value) as BasicData["deviceClass"],
              )
            }
            className={inputClass}
            style={{ ...inputStyle, backgroundColor: NHS_COLOURS.white }}
          >
            <option value="" disabled>
              Select…
            </option>
            {DEVICE_CLASSES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Blurb>
            Unsure how this tool is classified? See the MHRA guidance on{" "}
            <a
              href="https://www.gov.uk/government/publications/medical-devices-software-applications-apps"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: NHS_COLOURS.blue }}
            >
              medical devices: software applications (apps)
            </a>
            , and Question 2 of the{" "}
            <a
              href="https://digital.nhs.uk/services/ai-knowledge-repository/develop-ai/a-buyers-guide-to-ai-in-health-and-care"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: NHS_COLOURS.blue }}
            >
              NHS Buyer&apos;s Guide to AI in Health and Care
            </a>
            .
          </Blurb>
          {deviceClassBlocked && (
            <Blocked title="Assessment cannot proceed without this information">
              The device classification determines the minimum safety and
              monitoring floors applied to the assessment. Without knowing
              whether this tool is a medical device — and if so, its risk class —
              the framework cannot calculate accurate scoring floors. Please
              consult the MHRA guidance on software and AI as a medical device,
              or check with the vendor.
            </Blocked>
          )}
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Q9. Is the development team aware of relevant regulatory
            requirements? *
          </label>
          <select
            value={data.regulatoryAwareness ?? ""}
            onChange={(e) => update("regulatoryAwareness", e.target.value)}
            className={inputClass}
            style={{ ...inputStyle, backgroundColor: NHS_COLOURS.white }}
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <Blurb>
            Not sure what applies? The{" "}
            <a
              href="https://www.digitalregulations.innovation.nhs.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: NHS_COLOURS.blue }}
            >
              AI and Digital Regulations Service
            </a>{" "}
            sets out which regulations, approvals, and governance steps apply
            before an AI tool is deployed in the NHS.
          </Blurb>
          {regulatoryBlocked && (
            <Blocked title="Assessment cannot proceed without regulatory awareness">
              If the development team is not aware of the relevant regulatory
              requirements for this tool, the assessment cannot reliably score
              safety, validation, or monitoring dimensions. The development team
              should be directed to the MHRA guidance on software and AI as a
              medical device before this assessment is completed.
            </Blocked>
          )}
        </div>
      </Section>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
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
          onClick={() => onNext(data)}
          disabled={!canProceed}
          className="px-8 py-3 rounded font-medium text-sm transition-opacity"
          style={{
            backgroundColor: canProceed ? NHS_COLOURS.blue : NHS_COLOURS.grey,
            color: NHS_COLOURS.white,
            opacity: canProceed ? 1 : 0.5,
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          Continue to Complexity Assessment →
        </button>
      </div>
    </div>
  );
}

/** A titled card grouping related fields. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-lg border p-5 mb-5"
      style={{
        borderColor: NHS_COLOURS.lightGrey,
        backgroundColor: NHS_COLOURS.white,
      }}
    >
      <h3
        className="text-xs font-bold uppercase tracking-wide mb-4"
        style={{ color: NHS_COLOURS.darkBlue }}
      >
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Small muted hint / guidance text shown beneath a field. */
function Blurb({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs mt-1.5 leading-snug"
      style={{ color: NHS_COLOURS.secondaryText }}
    >
      {children}
    </p>
  );
}

/** Red "assessment cannot proceed" banner. */
function Blocked({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-4 mt-3 border-l-4"
      style={{ backgroundColor: "#FEF3F2", borderLeftColor: NHS_COLOURS.red }}
    >
      <p className="font-semibold text-sm" style={{ color: NHS_COLOURS.red }}>
        {title}
      </p>
      <p className="text-sm mt-1" style={{ color: NHS_COLOURS.darkText }}>
        {children}
      </p>
    </div>
  );
}
