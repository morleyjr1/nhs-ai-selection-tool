"use client";

import { useState } from "react";
import { NHS_COLOURS } from "../lib/constants";
import type { BasicData } from "../lib/types";
import {
  TOOL_CATEGORIES,
  DEVICE_CLASSES,
  USER_GROUPS,
  DEPLOYMENT_SCOPES,
  ADOPTION_STAGES,
  DEVELOPER_TYPES,
} from "../lib/constants";

interface BasicDataStepProps {
  initialData: BasicData;
  onNext: (data: BasicData) => void;
  onBack: () => void;
}

export default function BasicDataStep({
  initialData,
  onNext,
  onBack,
}: BasicDataStepProps) {
  const [data, setData] = useState<BasicData>(initialData);
  const [otherUser, setOtherUser] = useState("");

  const determinismBlocked = data.determinism === 3; // "Unknown" blocks progression
  const canProceed =
    data.toolName.trim() !== "" &&
    data.category > 0 &&
    data.deviceClass > 0 &&
    data.determinism > 0 &&
    !determinismBlocked;

  function update<K extends keyof BasicData>(field: K, value: BasicData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleUser(user: string) {
    setData((prev) => ({
      ...prev,
      users: prev.users.includes(user)
        ? prev.users.filter((u) => u !== user)
        : [...prev.users, user],
    }));
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: NHS_COLOURS.darkBlue }}
      >
        Basic Data
      </h2>
      <p className="mb-8" style={{ color: NHS_COLOURS.secondaryText }}>
        Provide information about the AI tool and its deployment context. Fields
        marked with * are required.
      </p>

      <div className="space-y-6">
        {/* Organisation name */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Organisation name
          </label>
          <input
            type="text"
            value={data.orgName ?? ""}
            onChange={(e) => update("orgName", e.target.value)}
            className="w-full px-3 py-2 rounded border text-sm"
            style={{ borderColor: NHS_COLOURS.grey }}
            placeholder="e.g. Guy's and St Thomas' NHS Foundation Trust"
          />
        </div>

        {/* Q1: Tool name * */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Q1. Tool name *
          </label>
          <input
            type="text"
            value={data.toolName}
            onChange={(e) => update("toolName", e.target.value)}
            className="w-full px-3 py-2 rounded border text-sm"
            style={{ borderColor: NHS_COLOURS.grey }}
            placeholder="e.g. Dragon Copilot"
          />
        </div>

        {/* Q2: Tool purpose */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Q2. Tool purpose
          </label>
          <textarea
            value={data.toolPurpose ?? ""}
            onChange={(e) => update("toolPurpose", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded border text-sm"
            style={{ borderColor: NHS_COLOURS.grey }}
            placeholder="What does this tool do?"
          />
        </div>

        {/* Q3: Problem addressed */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Q3. Problem addressed
          </label>
          <textarea
            value={data.toolProblem ?? ""}
            onChange={(e) => update("toolProblem", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded border text-sm"
            style={{ borderColor: NHS_COLOURS.grey }}
            placeholder="What problem does this tool solve?"
          />
        </div>

        {/* Q4: Tool category * */}
        <fieldset>
          <legend
            className="block text-sm font-medium mb-2"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Q4. Tool category *
          </legend>
          <div className="space-y-2">
            {TOOL_CATEGORIES.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="category"
                  checked={data.category === opt.value}
                  onChange={() =>
                    update("category", opt.value as BasicData["category"])
                  }
                />
                <span style={{ color: NHS_COLOURS.darkText }}>
                  {opt.value}. {opt.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Q5: Intended users */}
        <fieldset>
          <legend
            className="block text-sm font-medium mb-2"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Q5. Intended users
          </legend>
          <div className="grid grid-cols-2 gap-2">
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
              className="mt-2 w-full px-3 py-2 rounded border text-sm"
              style={{ borderColor: NHS_COLOURS.grey }}
              placeholder="Please specify"
            />
          )}
        </fieldset>

        {/* Q6: Deployment scope */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Q6. Deployment scope
          </label>
          <select
            value={data.scope ?? ""}
            onChange={(e) => update("scope", e.target.value || undefined)}
            className="w-full px-3 py-2 rounded border text-sm"
            style={{ borderColor: NHS_COLOURS.grey }}
          >
            <option value="">Select...</option>
            {DEPLOYMENT_SCOPES.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </select>
        </div>

        {/* Q7: Adoption stage */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Q7. Adoption stage
          </label>
          <select
            value={data.adoptionStage ?? ""}
            onChange={(e) => update("adoptionStage", e.target.value || undefined)}
            className="w-full px-3 py-2 rounded border text-sm"
            style={{ borderColor: NHS_COLOURS.grey }}
          >
            <option value="">Select...</option>
            {ADOPTION_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        {/* Q8: Device classification * */}
        <fieldset>
          <legend
            className="block text-sm font-medium mb-2"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Q8. Device classification *
          </legend>
          <div className="space-y-2">
            {DEVICE_CLASSES.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="deviceClass"
                  checked={data.deviceClass === opt.value}
                  onChange={() =>
                    update(
                      "deviceClass",
                      opt.value as BasicData["deviceClass"],
                    )
                  }
                />
                <span style={{ color: NHS_COLOURS.darkText }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Q9: Regulatory awareness */}
        <fieldset>
          <legend
            className="block text-sm font-medium mb-2"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Q9. Is the development team aware of relevant regulatory
            requirements?
          </legend>
          <div className="flex gap-4">
            {(["Yes", "No", "Unknown"] as const).map((val) => (
              <label key={val} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="regulatoryAwareness"
                  checked={data.regulatoryAwareness === val}
                  onChange={() => update("regulatoryAwareness", val)}
                />
                <span style={{ color: NHS_COLOURS.darkText }}>{val}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Q10: Determinism * */}
        <fieldset>
          <legend
            className="block text-sm font-medium mb-2"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Q10. Determinism *
          </legend>
          <div className="space-y-3">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="determinism"
                className="mt-1"
                checked={data.determinism === 1}
                onChange={() =>
                  update("determinism", 1 as BasicData["determinism"])
                }
              />
              <div>
                <span
                  className="font-medium"
                  style={{ color: NHS_COLOURS.darkText }}
                >
                  Deterministic
                </span>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: NHS_COLOURS.secondaryText }}
                >
                  Given the same input, the tool always produces the same output.
                  Rule-based systems, simple calculators, and look-up tools are
                  typically deterministic.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="determinism"
                className="mt-1"
                checked={data.determinism === 2}
                onChange={() =>
                  update("determinism", 2 as BasicData["determinism"])
                }
              />
              <div>
                <span
                  className="font-medium"
                  style={{ color: NHS_COLOURS.darkText }}
                >
                  Stochastic
                </span>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: NHS_COLOURS.secondaryText }}
                >
                  The tool may produce different outputs from the same input due
                  to randomness in its model (e.g. large language models, neural
                  networks with sampling). Stochastic tools raise minimum scoring
                  floors on oversight, validation, and monitoring dimensions.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="determinism"
                className="mt-1"
                checked={data.determinism === 3}
                onChange={() =>
                  update("determinism", 3 as BasicData["determinism"])
                }
              />
              <div>
                <span
                  className="font-medium"
                  style={{ color: NHS_COLOURS.darkText }}
                >
                  Unknown
                </span>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: NHS_COLOURS.secondaryText }}
                >
                  You are not sure whether the tool is deterministic or
                  stochastic.
                </p>
              </div>
            </label>
          </div>

          {/* Unknown determinism warning */}
          {determinismBlocked && (
            <div
              className="rounded-lg p-4 mt-3 border-l-4"
              style={{
                backgroundColor: "#FEF3F2",
                borderLeftColor: NHS_COLOURS.red,
              }}
            >
              <p
                className="font-semibold text-sm"
                style={{ color: NHS_COLOURS.red }}
              >
                Assessment cannot proceed without this information
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: NHS_COLOURS.darkText }}
              >
                Whether a tool is deterministic or stochastic affects the minimum
                complexity scores applied to several dimensions (human oversight,
                validation, and monitoring). Without this information, the
                framework cannot calculate accurate scoring floors and the
                assessment would be unreliable. Please consult the tool&apos;s
                technical documentation or development team before proceeding.
              </p>
            </div>
          )}
        </fieldset>

        {/* Q11: Developer type */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: NHS_COLOURS.darkText }}
          >
            Q11. Developer type
          </label>
          <select
            value={data.developer ?? ""}
            onChange={(e) => update("developer", e.target.value || undefined)}
            className="w-full px-3 py-2 rounded border text-sm"
            style={{ borderColor: NHS_COLOURS.grey }}
          >
            <option value="">Select...</option>
            {DEVELOPER_TYPES.map((dt) => (
              <option key={dt} value={dt}>
                {dt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-10">
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
