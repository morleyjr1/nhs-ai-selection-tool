"use client";

import { useState } from "react";
import { NHS_COLOURS } from "../lib/constants";
import { readinessDimensions } from "../lib/dimensions";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function ResourceSubmitWidget() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [dimensions, setDimensions] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [submitter, setSubmitter] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setUrl("");
    setDimensions([]);
    setDescription("");
    setSubmitter("");
    setHoneypot("");
    setState("idle");
    setError(null);
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 200);
  }

  function toggleDim(id: string) {
    setDimensions((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  }

  const canSubmit =
    title.trim() !== "" &&
    /^https?:\/\/.+/i.test(url.trim()) &&
    dimensions.length > 0 &&
    state !== "submitting";

  async function submit() {
    if (!canSubmit) return;
    setState("submitting");
    setError(null);
    try {
      const res = await fetch("/api/resource-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          dimensions,
          description: description.trim(),
          submitter: submitter.trim(),
          website: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Submission failed (${res.status})`);
      }
      setState("success");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium underline"
        style={{ color: NHS_COLOURS.blue, cursor: "pointer" }}
      >
        Know a readiness-building tool we&apos;re missing? Suggest it
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={close}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Suggest a readiness-building tool"
            className="w-full max-w-lg rounded-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: NHS_COLOURS.white }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h2
                className="text-lg font-semibold"
                style={{ color: NHS_COLOURS.darkText }}
              >
                Suggest a readiness-building tool
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="text-xl leading-none"
                style={{ color: NHS_COLOURS.grey, cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            {state === "success" ? (
              <div>
                <p className="text-sm mb-4" style={{ color: NHS_COLOURS.darkText }}>
                  Thank you — your suggestion has been recorded and will be
                  reviewed before being added to the tool.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{
                    backgroundColor: NHS_COLOURS.blue,
                    color: NHS_COLOURS.white,
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <p
                  className="text-sm mb-4"
                  style={{ color: NHS_COLOURS.secondaryText }}
                >
                  Suggestions are reviewed before being added. Please link to a
                  public, authoritative resource (not vendor marketing).
                </p>

                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: NHS_COLOURS.darkText }}
                >
                  Tool / resource name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm mb-4"
                  style={{ borderColor: NHS_COLOURS.lightGrey, color: NHS_COLOURS.darkText }}
                />

                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: NHS_COLOURS.darkText }}
                >
                  Link (URL)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full px-3 py-2 rounded border text-sm mb-4"
                  style={{ borderColor: NHS_COLOURS.lightGrey, color: NHS_COLOURS.darkText }}
                />

                <fieldset className="mb-4">
                  <legend
                    className="block text-sm font-medium mb-2"
                    style={{ color: NHS_COLOURS.darkText }}
                  >
                    Which readiness dimension(s) does it help with?
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {readinessDimensions.map((d) => (
                      <label
                        key={d.id}
                        className="flex items-start gap-2 text-xs cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 shrink-0"
                          checked={dimensions.includes(d.id)}
                          onChange={() => toggleDim(d.id)}
                        />
                        <span style={{ color: NHS_COLOURS.darkText }}>
                          {d.id} — {d.shortLabel}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: NHS_COLOURS.darkText }}
                >
                  Why is it useful? (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={3000}
                  className="w-full px-3 py-2 rounded border text-sm mb-4"
                  style={{ borderColor: NHS_COLOURS.lightGrey, color: NHS_COLOURS.darkText }}
                />

                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: NHS_COLOURS.darkText }}
                >
                  Your email (optional, for follow-up)
                </label>
                <input
                  type="email"
                  value={submitter}
                  onChange={(e) => setSubmitter(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{ borderColor: NHS_COLOURS.lightGrey, color: NHS_COLOURS.darkText }}
                />

                {/* Honeypot */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
                  <label>
                    Website
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </div>

                {state === "error" && error && (
                  <p className="text-sm mt-3" style={{ color: NHS_COLOURS.red }}>
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 mt-5">
                  <button
                    type="button"
                    onClick={close}
                    className="px-4 py-2 rounded text-sm font-medium"
                    style={{
                      backgroundColor: NHS_COLOURS.white,
                      color: NHS_COLOURS.darkText,
                      border: `1px solid ${NHS_COLOURS.lightGrey}`,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!canSubmit}
                    className="px-4 py-2 rounded text-sm font-medium"
                    style={{
                      backgroundColor: canSubmit ? NHS_COLOURS.blue : NHS_COLOURS.lightGrey,
                      color: canSubmit ? NHS_COLOURS.white : NHS_COLOURS.grey,
                      cursor: canSubmit ? "pointer" : "not-allowed",
                    }}
                  >
                    {state === "submitting" ? "Sending…" : "Submit suggestion"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
