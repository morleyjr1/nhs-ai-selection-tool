// ---------------------------------------------------------------------------
// NHS colour palette and shared constants
// ---------------------------------------------------------------------------

export const NHS_COLOURS = {
  blue: "#005EB8",
  darkBlue: "#003087",
  lightGrey: "#E8EDEE",
  green: "#00703C",
  amber: "#FFB81C",
  red: "#DA291C",
  grey: "#768692",
  white: "#FFFFFF",
  darkText: "#212B32",
  secondaryText: "#4C6272",
  orange: "#E57200",
} as const;

/** Classification → colour mapping */
export const CLASSIFICATION_COLOURS = {
  "Quick win": NHS_COLOURS.green,
  "Deploy and monitor": NHS_COLOURS.amber,
  "Build readiness first": NHS_COLOURS.orange,
  Avoid: NHS_COLOURS.red,
} as const;

/** Complexity score → colour mapping (1 = green, 2 = amber, 3 = red) */
export const SCORE_COLOURS = {
  1: NHS_COLOURS.green,
  2: NHS_COLOURS.amber,
  3: NHS_COLOURS.red,
} as const;

/** Readiness score → colour mapping (reversed: 1 = red, 2 = amber, 3 = green) */
export const READINESS_SCORE_COLOURS = {
  1: NHS_COLOURS.red,
  2: NHS_COLOURS.amber,
  3: NHS_COLOURS.green,
} as const;

/** Gap → colour mapping (0 = green, 1 = amber, 2 = red) */
export const GAP_COLOURS = {
  0: NHS_COLOURS.green,
  1: NHS_COLOURS.amber,
  2: NHS_COLOURS.red,
} as const;

/**
 * Autonomy tier options (Q4). Five levels: the former "autonomous" category is
 * split into bounded (4) and fully autonomous (5). Agency is captured separately
 * (see AGENTIC_OPTIONS). See docs/decisions/0001-autonomy-tier-and-agentic-flag.md.
 */
export const AUTONOMY_TIERS = [
  {
    value: 1,
    label: "Administrative",
    examples:
      "No patient-level clinical data, not embedded in the clinical workflow, and no influence on clinical decisions. For example: A&E demand and capacity forecasting for staffing and bed planning, e-rostering, supply-chain or inventory forecasting, finance and invoice processing.",
  },
  {
    value: 2,
    label: "Administrative in a clinical setting",
    examples:
      "Handles patient data or sits inside the clinical workflow, but documents rather than recommends — it does not influence the clinical decision itself. For example: ambient documentation tools that record and transcribe a consultation (such as Dragon Copilot), automated clinical coding, or summarising notes for the record.",
  },
  {
    value: 3,
    label: "Clinical decision support",
    examples:
      "Produces outputs that inform a clinician's decision, with a human making the final call. For example: risk prediction and early warning (Cera), imaging detection and interpretation (Mia, Annalise CXR, HeartFlow FFRCT), mental-health referral triage and patient-facing interaction (Limbic Access), early-warning and escalation scores (a digital NEWS2 calculator), and AI-drafted discharge summaries that a clinician reviews and signs off.",
  },
  {
    value: 4,
    label: "Bounded autonomous clinical function",
    examples:
      "Acts on a clinical decision without a clinician reviewing that individual output, but only on a single, narrow, well-defined decision within a fixed protocol. For example: insulin-dose titration (d-Nav), autonomous diabetic-retinopathy grading that replaces a human grader (EyeArt), or autonomous discharge of clearly benign lesions from a pathway (Skin Analytics DERM).",
  },
  {
    value: 5,
    label: "Fully autonomous clinical function",
    examples:
      "Acts without a clinician gate across an open-ended or multi-step scope, rather than on one narrow decision. The broadest, highest-scrutiny tier — especially when combined with agentic behaviour (e.g. an autonomous patient-facing care agent such as Hippocratic AI). Rare in the NHS.",
  },
] as const;

/**
 * Agency flag options (Q4b). Orthogonal to autonomy tier: a tool can be agentic
 * at any tier. Drives additional scoring floors.
 */
export const AGENTIC_OPTIONS = [
  {
    value: true,
    label: "Yes — agentic",
    description:
      "The tool plans and carries out multi-step sequences of actions towards a goal — choosing what to do next, often using tools, and adapting as it goes. For example: a copilot that reads records, drafts a summary, and places orders (Tortus/OSLER), or an autonomous patient-facing care agent (Hippocratic AI).",
  },
  {
    value: false,
    label: "No — single-output",
    description:
      "The tool produces a single, bounded output — a score, a classification, a transcript, a recommendation — rather than planning and executing a sequence of actions.",
  },
] as const;

/** Device classification options (Q8) */
export const DEVICE_CLASSES = [
  { value: 1, label: "Not a medical device / no classification required" },
  { value: 2, label: "Class I (low risk)" },
  { value: 3, label: "Class IIa (medium risk)" },
  { value: 4, label: "Class IIb (medium risk)" },
  { value: 5, label: "Class III (high risk)" },
  { value: 6, label: "Unknown" },
] as const;

/** Determinism options (Q10) */
export const DETERMINISM_OPTIONS = [
  { value: 1, label: "Deterministic" },
  { value: 2, label: "Stochastic" },
  { value: 3, label: "Unknown" },
] as const;

/** Intended user groups (Q5) */
export const USER_GROUPS = [
  "Clinicians",
  "Nursing staff",
  "Allied health professionals",
  "Administrative staff",
  "Managers and operational leads",
  "Patients or carers",
  "Technical or data teams",
  "Other",
] as const;

/** Deployment scope options (Q6) */
export const DEPLOYMENT_SCOPES = [
  "Single team or service",
  "Department-wide",
  "Trust-wide",
  "Multiple trusts or ICS-wide",
  "National",
] as const;

/** Adoption stage options (Q7) */
export const ADOPTION_STAGES = [
  "Exploring or horizon scanning",
  "Formal evaluation of business case",
  "Procurement",
  "Implementation or pilot",
  "Live routine use",
] as const;

/** Developer type options (Q11) */
export const DEVELOPER_TYPES = [
  "Internal",
  "Commercial vendor",
  "Academic partnership",
  "Mixed arrangement",
  "Open source",
] as const;

/** Wizard step labels */
export const STEP_LABELS = [
  "Framing",
  "Basic Data",
  "Complexity",
  "Readiness",
  "Results",
] as const;
