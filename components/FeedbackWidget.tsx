"use client";

import { useState } from "react";
import { NHS_COLOURS } from "../lib/constants";

const FEEDBACK_TYPE_OPTIONS = [
  { value: "bug", label: "Something's broken (bug)" },
  { value: "suggestion", label: "Suggestion / improvement" },
  { value: "content_correction", label: "Content correction" },
  { value: "general", label: "General comment" },
] as const;

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bots fill this; humans don't
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setType("");
    setMessage("");
    setHoneypot("");
    setState("idle");
    setError(null);
  }

  function close() {
    setOpen(false);
    // Reset shortly after closing so the modal doesn't flash old state if reopened
    setTimeout(reset, 200);
  }

  const canSubmit = type !== "" && message.trim().length > 0 && state !== "submitting";

  async function submit() {
    if (!canSubmit) return;
    setState("submitting");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          page: typeof window !== "undefined" ? window.location.pathname : undefined,
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
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 px-4 py-2 rounded-full text-sm font-medium shadow-lg"
        style={{
          backgroundColor: NHS_COLOURS.blue,
          color: NHS_COLOURS.white,
          cursor: "pointer",
        }}
      >
        Feedback
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
            aria-label="Send feedback"
            className="w-full max-w-md rounded-lg p-6 shadow-xl"
            style={{ backgroundColor: NHS_COLOURS.white }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h2
                className="text-lg font-semibold"
                style={{ color: NHS_COLOURS.darkText }}
              >
                Send feedback
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
                  Thank you — your feedback has been recorded and will be
                  reviewed by the team maintaining the tool.
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
                  Spotted a problem, or have a suggestion? Let us know. Please
                  don&apos;t include patient-identifiable information.
                </p>

                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: NHS_COLOURS.darkText }}
                >
                  Type of feedback
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm mb-4"
                  style={{
                    borderColor: NHS_COLOURS.lightGrey,
                    color: NHS_COLOURS.darkText,
                    backgroundColor: NHS_COLOURS.white,
                  }}
                >
                  <option value="" disabled>
                    Choose one…
                  </option>
                  {FEEDBACK_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: NHS_COLOURS.darkText }}
                >
                  Your feedback
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  placeholder="Describe the issue, suggestion, or comment…"
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    borderColor: NHS_COLOURS.lightGrey,
                    color: NHS_COLOURS.darkText,
                  }}
                />

                {/* Honeypot — visually hidden, off-screen; real users never see it */}
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
                      backgroundColor: canSubmit
                        ? NHS_COLOURS.blue
                        : NHS_COLOURS.lightGrey,
                      color: canSubmit ? NHS_COLOURS.white : NHS_COLOURS.grey,
                      cursor: canSubmit ? "pointer" : "not-allowed",
                    }}
                  >
                    {state === "submitting" ? "Sending…" : "Send feedback"}
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
