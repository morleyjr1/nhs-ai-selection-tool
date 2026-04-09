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

/** Tool category options (Q4) */
export const TOOL_CATEGORIES = [
  { value: 1, label: "Purely administrative" },
  { value: 2, label: "Administrative in clinical setting" },
  { value: 3, label: "Clinical decision support" },
  { value: 4, label: "Autonomous clinical function" },
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
