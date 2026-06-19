// ---------------------------------------------------------------------------
// Worked examples: illustrative example answers for the complexity domains.
//
// For each complexity domain (C1-C12), an illustrative score + factual
// justification for four anchor archetypes (see lib/anchors.ts). FOR
// ILLUSTRATIVE PURPOSES ONLY — not assessments of real products.
// See docs/decisions/0006-worked-examples.md.
// ---------------------------------------------------------------------------

import type { Score } from "./types";

export interface WorkedExample {
  /** References an anchor in lib/anchors.ts. */
  anchorId: string;
  score: Score;
  text: string;
}

export const workedExamplesByDimension: Record<string, WorkedExample[]> = {
  C1: [
    { anchorId: "flowcast", score: 2, text: "Forecasts attendances and admissions from historical activity, seasonal trends, and weather. The objective is agreed and checkable against actual activity, but the output is probabilistic and varies with local circumstances. A well-defined but inherently uncertain task is moderate." },
    { anchorId: "scanread", score: 2, text: "Classifies a mammogram as recall or no-recall. The objective is clearly defined, but the judgement is probabilistic and confirmed only later by biopsy or follow-up. A well-defined task with an uncertain answer is moderate." },
    { anchorId: "doseguide", score: 2, text: "Recommends insulin dose adjustments toward a glucose target — a protocolised decision with a defined direction, personalised to the individual's glucose patterns. A well-defined task requiring individual adaptation is moderate." },
    { anchorId: "careagent", score: 3, text: "Conducts open-ended patient conversations spanning history-taking, advice, and follow-up. There is no single definition of a correct interaction, each is personalised, and the scope is set by the patient. An ill-defined, unbounded task is high." },
  ],
  C2: [
    { anchorId: "flowcast", score: 2, text: "Uses several structured operational feeds — attendances, admissions, seasonal signals, weather — supplied on a schedule, with no patient-identifiable record required. Multiple sources at modest timeliness and low quality-sensitivity is moderate." },
    { anchorId: "scanread", score: 2, text: "Uses a single modality: standard FFDM mammograms in DICOM, four views per case. Few sources, but the output is highly sensitive to image quality and positioning. Low variety with high quality-sensitivity is moderate." },
    { anchorId: "doseguide", score: 2, text: "Uses near-real-time blood-glucose readings and the insulin regimen, entered by the patient or pulled from a connected meter. A small input set, but timeliness- and quality-sensitive because the recommendation acts on it. A small, live, quality-dependent feed is moderate." },
    { anchorId: "careagent", score: 3, text: "Uses live data from several systems in different formats within one conversation, and must reconcile recorded data with what the patient reports in the moment. Multiple real-time sources of differing quality is high." },
  ],
  C3: [
    { anchorId: "flowcast", score: 1, text: "Uses operational activity data — counts and flows, not identifiable patient records — processed within the organisation for direct planning under existing arrangements. Data held and used in-house is low." },
    { anchorId: "scanread", score: 2, text: "Processes identifiable mammograms, in most deployments through vendor cloud infrastructure, requiring a DPIA and a data-sharing agreement. Identifiable data shared with a vendor under new arrangements is moderate." },
    { anchorId: "doseguide", score: 2, text: "Processes identifiable glucose and insulin data through a vendor-run cloud service under new sharing arrangements, returning data to the patient. Identifiable data processed by a vendor is moderate." },
    { anchorId: "careagent", score: 3, text: "Generates new data from live patient conversations, processed via vendor cloud, with records that may re-enter care, and an unsettled lawful basis for processing clinical dialogue at scale. Novel, contested data flows are high." },
  ],
  C4: [
    { anchorId: "flowcast", score: 1, text: "Outputs an interpretable, low-dimensional forecast a manager can check against recent activity and override by planning differently. Output that is easy to verify and override is low." },
    { anchorId: "scanread", score: 2, text: "Outputs a recall / no-recall flag a radiologist can verify against the image, though verification requires expertise. Verifiable with expertise is moderate." },
    { anchorId: "doseguide", score: 2, text: "Issues dose recommendations to the patient with no clinician reviewing each one; an individual recommendation is checkable but is acted on without routine review. Acted-upon output without per-decision review is moderate." },
    { anchorId: "careagent", score: 3, text: "Produces outputs through multiple non-transparent steps in a live conversation, with no clinician reviewing each output and no practical means to verify or intervene in real time. Output that cannot be verified or challenged in use is high." },
  ],
  C5: [
    { anchorId: "flowcast", score: 2, text: "Can be checked against actual activity — a clear if noisy reference standard — and can only be wrong by missing the forecast. A single, noisy error mode is moderate." },
    { anchorId: "scanread", score: 2, text: "Has a reference standard in biopsy and follow-up, but it is delayed, subject to reader disagreement, and varies by breast density and site. A delayed, variable reference standard is moderate." },
    { anchorId: "doseguide", score: 2, text: "Correctness shows in glycaemic outcomes, a usable reference standard; the main task is confirming performance for the local population and regimens. A usable standard requiring local confirmation is moderate." },
    { anchorId: "careagent", score: 3, text: "Produces generative, multi-part conversational output that can be wrong factually, clinically, in tone, or by omission, with no clean reference standard for an open conversation. Many simultaneous error modes without a reference standard is high." },
  ],
  C6: [
    { anchorId: "flowcast", score: 2, text: "Connects to admissions, e-rostering, and dashboards through an established data platform, running on a schedule. Several connections via standard interfaces is moderate." },
    { anchorId: "scanread", score: 2, text: "Integrates with PACS and RIS using established DICOM standards within the reading workflow. Established imaging integration is moderate." },
    { anchorId: "doseguide", score: 2, text: "App-based, taking data from connected glucose meters and delivering to the patient's phone. Contained, app-based integration is moderate." },
    { anchorId: "careagent", score: 3, text: "Requires real-time, bidirectional integration with telephony and clinical systems, significant compute for conversational models, and coordination across multiple suppliers. Real-time, multi-system integration is high." },
  ],
  C7: [
    { anchorId: "flowcast", score: 2, text: "Changes planning and rostering routines for a contained group of managers, within existing processes. Contained process change is moderate." },
    { anchorId: "scanread", score: 2, text: "Changes the double-reading workflow, altering the second read and how discordance is handled, without restructuring roles. Contained workflow change is moderate." },
    { anchorId: "doseguide", score: 2, text: "Shifts work toward patient self-management, adds steps for clinicians and patients, and requires a clinical support function. New steps across roles is moderate." },
    { anchorId: "careagent", score: 3, text: "Changes how patient contact is delivered, requires new roles to monitor it, and may displace work across multiple professions. New roles and restructured pathways is high." },
  ],
  C8: [
    { anchorId: "flowcast", score: 2, text: "Accuracy is measurable, but benefit to staffing and flow depends on how managers act on the forecast. A measurable but indirect effect is moderate." },
    { anchorId: "scanread", score: 2, text: "Effect on detection and recall rates is measurable but sits within a long screening pathway, so attribution requires care. A measurable but pathway-embedded effect is moderate." },
    { anchorId: "doseguide", score: 2, text: "Has direct, measurable outcomes — HbA1c and hypoglycaemia rates — comparable before and after. Direct, measurable outcomes is moderate." },
    { anchorId: "careagent", score: 3, text: "Effect on patient outcomes is separated from its conversations by a long, indirect chain of subsequent care, requiring complex study designs to isolate. A long, indirect causal chain is high." },
  ],
  C9: [
    { anchorId: "flowcast", score: 1, text: "Administrative; an error yields a worse staffing plan with no direct route to patient harm. No plausible patient harm is low." },
    { anchorId: "scanread", score: 2, text: "A missed finding is serious, but the output informs a decision a radiologist reviews, and time-to-harm is long. Serious harm that is reviewed and slow to materialise is moderate." },
    { anchorId: "doseguide", score: 3, text: "Acts on insulin dosing, where an error can cause acute harm such as hypoglycaemia on a short timescale with limited opportunity to intervene. Direct action with severe, rapid potential harm is high." },
    { anchorId: "careagent", score: 3, text: "Determines clinical action in a live interaction with no per-output review and a short time-to-harm. Action determined directly with severe potential harm is high." },
  ],
  C10: [
    { anchorId: "flowcast", score: 1, text: "Operates on operational planning with no direct bearing on individual patients and no consent requirement. Accepted operational use is low." },
    { anchorId: "scanread", score: 2, text: "Performance can vary by breast density and demographic group, and AI involvement in screening raises acceptability questions. Recognised equity and acceptability questions is moderate." },
    { anchorId: "doseguide", score: 2, text: "Affects patient self-management and may work less well for those with less access to the app and meters. A recognised risk of differential impact is moderate." },
    { anchorId: "careagent", score: 3, text: "Autonomous AI in direct patient contact, with contested acceptability, material risk of unequal impact, and consent that is hard to obtain where its role is hard to explain and opting out is impractical. Contested acceptability, equity risk, and difficult consent is high." },
  ],
  C11: [
    { anchorId: "flowcast", score: 2, text: "Largely static; drift shows against actual demand, but patterns change and require proactive monitoring. Detectable drift requiring monitoring is moderate." },
    { anchorId: "scanread", score: 2, text: "Requires monitoring for drift, particularly subgroup degradation that can precede changes in headline figures. Subgroup drift requiring monitoring is moderate." },
    { anchorId: "doseguide", score: 2, text: "Requires ongoing monitoring of glycaemic outcomes and meter data; change is detectable with active monitoring. Detectable change requiring monitoring is moderate." },
    { anchorId: "careagent", score: 3, text: "Generative and frequently updated, so performance can change subtly and affect subgroups before showing in aggregate, and conversational output is hard to audit. Subtle, hard-to-audit drift is high." },
  ],
  C12: [
    { anchorId: "flowcast", score: 2, text: "Delivered through a large national data platform; the supplier is established but switching would carry cost and disruption. Established supplier with real switching cost is moderate." },
    { anchorId: "scanread", score: 2, text: "A commercial product with a published evidence base and emerging alternatives. Commercial vendor with alternatives is moderate." },
    { anchorId: "doseguide", score: 2, text: "Depends on a single specialist vendor and a proprietary cloud service with an in-house clinical team. Single-vendor dependency with switching cost is moderate." },
    { anchorId: "careagent", score: 3, text: "From a young vendor in an immature market, with high dependency, uncertain longevity, and few alternatives. High dependency with limited exit is high." },
  ],
};

/** Illustrative worked examples for a complexity domain id (e.g. "C9"). */
export function getWorkedExamples(dimensionId: string): WorkedExample[] {
  return workedExamplesByDimension[dimensionId] ?? [];
}
