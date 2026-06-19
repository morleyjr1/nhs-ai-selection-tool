// ---------------------------------------------------------------------------
// Canonical worked-example anchors.
//
// Eight archetypal tools used as illustrative examples throughout the tool.
// Each is based on a real product (realName — BACKEND ONLY, never rendered in
// the UI) but shown under an invented displayName, because the tool attaches
// illustrative scores to these archetypes and must not imply that a named real
// product scores a particular way. See docs/decisions/0006-worked-examples.md.
// ---------------------------------------------------------------------------

export interface Anchor {
  id: string;
  /** Real product this archetype is based on. Backend only — do NOT render. */
  realName: string;
  /** Invented archetype name shown in the frontend. */
  displayName: string;
  autonomyTierLabel: string;
  agentic: boolean;
  /** Short archetype descriptor. */
  archetype: string;
  /** Explanation for the landing "worked examples" section. */
  description: string;
}

export const anchors: Anchor[] = [
  {
    id: "flowcast",
    realName: "A&E demand & capacity forecasting (NHS FDP / Faculty)",
    displayName: "FlowCast",
    autonomyTierLabel: "Administrative",
    agentic: false,
    archetype: "Operational demand & capacity forecasting",
    description:
      "An operational forecasting tool that predicts demand and capacity — A&E attendances, say — to help plan staffing and beds. It uses no patient-identifiable clinical data and sits outside the clinical decision, anchoring the low-complexity, low-autonomy end of the scale.",
  },
  {
    id: "scribemate",
    realName: "Dragon Copilot (ambient scribe)",
    displayName: "ScribeMate",
    autonomyTierLabel: "Administrative in a clinical setting",
    agentic: false,
    archetype: "Ambient documentation / scribe",
    description:
      "An ambient documentation assistant that listens to a consultation and drafts the note. It handles patient data and sits inside the clinical workflow, but it records rather than recommends — it does not influence the clinical decision itself.",
  },
  {
    id: "risksense",
    realName: "Cera (deterioration / risk prediction)",
    displayName: "RiskSense",
    autonomyTierLabel: "Clinical decision support",
    agentic: false,
    archetype: "Risk prediction & early warning",
    description:
      "A risk-prediction and early-warning tool that flags patients at rising risk — of deterioration, a fall, or admission — so staff can intervene. It informs a human decision rather than making one.",
  },
  {
    id: "scanread",
    realName: "Mia (Kheiron, mammography)",
    displayName: "ScanRead",
    autonomyTierLabel: "Clinical decision support",
    agentic: false,
    archetype: "Diagnostic image interpretation",
    description:
      "A diagnostic tool that interprets medical images and flags suspicious findings for a clinician to confirm. A clear example of decision support: it shapes the decision, but a human makes the call.",
  },
  {
    id: "symptomchat",
    realName: "Limbic Access (triage / self-referral)",
    displayName: "SymptomChat",
    autonomyTierLabel: "Clinical decision support",
    agentic: false,
    archetype: "Patient-facing triage / self-referral chatbot",
    description:
      "A patient-facing chatbot that gathers symptoms and routes people to the right service or referral. It interacts directly with patients and its language-model behaviour makes it stochastic, but a clinician remains responsible for the clinical decision.",
  },
  {
    id: "clinpilot",
    realName: "Tortus / OSLER (agentic copilot)",
    displayName: "ClinPilot",
    autonomyTierLabel: "Clinical decision support (agentic)",
    agentic: true,
    archetype: "Agentic clinical copilot, supervised EHR actions",
    description:
      "An agentic clinical copilot that not only drafts notes but takes actions in the record — ordering tests, coding — under clinician supervision. It is the key example of agency without autonomy: it plans and acts across multiple steps, but a clinician signs off each time.",
  },
  {
    id: "doseguide",
    realName: "d-Nav (insulin titration)",
    displayName: "DoseGuide",
    autonomyTierLabel: "Bounded autonomous",
    agentic: false,
    archetype: "Autonomous insulin titration",
    description:
      "A bounded-autonomous tool that adjusts a single, well-defined treatment — insulin dose — within a fixed protocol, without a clinician reviewing each adjustment. Autonomous, but on one narrow decision.",
  },
  {
    id: "careagent",
    realName: "Hippocratic AI (patient-facing care agent)",
    displayName: "CareAgent",
    autonomyTierLabel: "Fully autonomous + agentic",
    agentic: true,
    archetype: "Autonomous, agentic patient-facing care agent",
    description:
      "An autonomous, agentic patient-facing care agent that holds open-ended conversations and acts across many tasks without a clinician reviewing each output. It anchors the highest-scrutiny corner of the framework, where the strictest scoring floors apply.",
  },
];

export function getAnchor(id: string): Anchor | undefined {
  return anchors.find((a) => a.id === id);
}
