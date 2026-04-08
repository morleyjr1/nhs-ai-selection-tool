export type DimensionSide = "complexity" | "readiness";

export interface ScoreDescriptor {
  level: 1 | 2 | 3;
  label: string;
  description: string;
}

export interface ConditionalNote {
  text: string;
  appliesTo: string;
}

export interface Dimension {
  id: string;
  side: DimensionSide;
  shortLabel: string;
  longLabel: string;
  guidingQuestion: string;
  scoreDescriptors: [ScoreDescriptor, ScoreDescriptor, ScoreDescriptor];
  whyItMatters: string;
  conditionalNote?: ConditionalNote;
}

const C_LABELS = ["Low", "Moderate", "High"] as const;
const R_LABELS = ["Low", "Developing", "Established"] as const;

function c(
  d1: string,
  d2: string,
  d3: string
): [ScoreDescriptor, ScoreDescriptor, ScoreDescriptor] {
  return [
    { level: 1, label: C_LABELS[0], description: d1 },
    { level: 2, label: C_LABELS[1], description: d2 },
    { level: 3, label: C_LABELS[2], description: d3 },
  ];
}

function r(
  d1: string,
  d2: string,
  d3: string
): [ScoreDescriptor, ScoreDescriptor, ScoreDescriptor] {
  return [
    { level: 1, label: R_LABELS[0], description: d1 },
    { level: 2, label: R_LABELS[1], description: d2 },
    { level: 3, label: R_LABELS[2], description: d3 },
  ];
}

export const dimensions: Dimension[] = [
  {
    id: "C1",
    side: "complexity",
    shortLabel: "Task & Decision Complexity",
    longLabel: "Task and Decision Complexity",
    guidingQuestion:
      "How complex is the task or decision the tool contributes to?",
    scoreDescriptors: c(
      "Well-defined task, clear correct answer, standardised approach, primarily factual or procedural.",
      "Broadly agreed definition of success but some uncertainty; probabilistic or context-dependent answers; some individual adaptation needed.",
      "Problem not clearly defined or contested; significant personalisation required; competing considerations with no single right answer."
    ),
    whyItMatters:
      "Tools deployed against poorly defined problems are more likely to produce outputs that clinicians cannot act on with confidence. If the task itself is contested — as in multimorbidity management or goals-of-care decisions — even a technically accurate output may not be clinically useful.",
  },
  {
    id: "C2",
    side: "complexity",
    shortLabel: "Data Complexity",
    longLabel: "Data Complexity",
    guidingQuestion:
      "How complex are the data the tool needs to function in deployment?",
    scoreDescriptors: c(
      "Small number of structured fields from 1–2 systems, single modality. Timeliness not critical. Low sensitivity to quality.",
      "Data from several sources, possibly different formats/modalities. Moderate sensitivity to timeliness or quality.",
      "Near-real-time data from multiple systems in different modalities. Highly sensitive to quality; meaningful gap between data and target."
    ),
    whyItMatters:
      "Data integration failures are among the most common causes of AI deployment delays or failure and performance degradation. Underestimating data complexity leads to tools that work in demo environments but fail when exposed to the inconsistencies and gaps of real clinical data systems.",
  },
  {
    id: "C3",
    side: "complexity",
    shortLabel: "Information Governance",
    longLabel: "Information Governance Complexity",
    guidingQuestion:
      "How complex is the tool to govern from an IG and data protection perspective?",
    scoreDescriptors: c(
      "Data within single org, on-premises or NHS infrastructure, direct care. Standard IG arrangements apply.",
      "Data cross organisational boundaries or involve external sharing (e.g. vendor cloud). New DSAs or substantive DPIA needed.",
      "Complex data flows — multiple orgs, cross-jurisdictional, uncertain lawful basis. Significant specialist IG work required."
    ),
    whyItMatters:
      "Underestimating IG complexity risks both legal non-compliance and loss of public trust.",
  },
  {
    id: "C4",
    side: "complexity",
    shortLabel: "Human Oversight Complexity",
    longLabel: "Human Oversight Complexity",
    guidingQuestion:
      "How easy or hard is it to verify and question the tool's output?",
    scoreDescriptors: c(
      "User can easily verify output independently. Interpretable, low-dimensional, checkable against references.",
      "Some effort to verify; training or context needed. Some explanation offered but not full transparency. Override possible.",
      "Structurally difficult to verify — too complex, high-dimensional, or opaque. User may not detect errors without external reference."
    ),
    whyItMatters:
      "If clinicians cannot meaningfully verify or override a tool's output, they become dependent on it rather than supported by it. This is the automation bias problem: users defer to the tool even when it is wrong, because they lack the means or confidence to challenge it.",
  },
  {
    id: "C5",
    side: "complexity",
    shortLabel: "Validation Complexity",
    longLabel: "Validation Complexity",
    guidingQuestion:
      "How difficult is it to determine whether the tool's outputs are correct?",
    scoreDescriptors: c(
      "Clear, objective, immediately verifiable reference standard. Stable target. Evidence proportionate to risk.",
      "Reasonable reference standard with some noise. Output may need checking on multiple dimensions. Evidence may need local strengthening.",
      "Reference standard noisy, contested, or expensive. Output can be wrong in several ways. Substantial local evidence effort needed."
    ),
    whyItMatters:
      "A tool can have impressive headline performance metrics and still fail in a specific local population. Validation must be context-specific: performance in one setting does not guarantee performance in another, and a tool's headline figures often obscure significant variation across subgroups, sites, and patient populations.",
  },
  {
    id: "C6",
    side: "complexity",
    shortLabel: "Technical Integration",
    longLabel: "Technical Integration Complexity",
    guidingQuestion:
      "How difficult is it to deploy the tool into existing infrastructure?",
    scoreDescriptors: c(
      "Standalone or connects via established standards. Modest compute. One-directional, not real-time.",
      "Integrates with several systems, mix of standard and custom interfaces. Some near-real-time exchange. May need dedicated compute.",
      "Multiple systems, bespoke technical work. Substantial compute. Real-time bidirectional. Multi-vendor coordination ongoing."
    ),
    whyItMatters:
      "Integration is where many AI deployments stall. A tool that requires bespoke connections to multiple clinical systems creates ongoing maintenance burden and single points of failure. Underestimating this leads to delayed go-live, cost overruns, and clinical workflow disruption which can result in patient safety issues.",
  },
  {
    id: "C7",
    side: "complexity",
    shortLabel: "Workflow & Organisational Change",
    longLabel: "Workflow and Organisational Change Complexity",
    guidingQuestion:
      "How much does the tool change existing workflows, roles, and processes?",
    scoreDescriptors: c(
      "Fits existing processes. No new roles. Minimal user groups affected. No significant workload change.",
      "Meaningful but contained changes. Some new steps, documentation, role adjustments. Manageable operational demands.",
      "Substantial changes — new roles, restructured pathways, multiple professional groups. Significant new demands or staff displacement."
    ),
    whyItMatters:
      "Technology adoption fails when the specific technology is seen as separate from its surrounding context as if it is just a simple case of replacing one blood-pressure cuff with another. In reality, tools that require significant workflow changes need staff engagement, training, and phased rollout. Neglecting this dimension is a common cause of low adoption and workarounds that undermine the tool's value.",
  },
  {
    id: "C8",
    side: "complexity",
    shortLabel: "Evaluation Complexity",
    longLabel: "Evaluation Complexity",
    guidingQuestion:
      "How difficult is it to determine whether the tool delivers meaningful real-world impact?",
    scoreDescriptors: c(
      "Technical performance closely corresponds to real-world impact. Direct causal link. Immediate, concrete outcomes.",
      "Effect depends on how tool is used. Feasible methods can generate evidence. Tool's contribution distinguishable with moderate effort.",
      "Substantial gap between technical performance and impact. Long, indirect causal chain. Large populations, long follow-up, or novel designs needed."
    ),
    whyItMatters:
      "If an organisation cannot determine whether a tool is delivering real-world value, it cannot justify continued investment or identify when the tool should be withdrawn. Tools with long, indirect causal chains between technical output and patient outcome require more sophisticated evaluation designs.",
  },
  {
    id: "C9",
    side: "complexity",
    shortLabel: "Safety Consequence",
    longLabel: "Safety Consequence Complexity",
    guidingQuestion:
      "What is the potential for harm if the tool produces incorrect outputs?",
    scoreDescriptors: c(
      "Informational/administrative. No direct clinical impact. Errors cause inefficiency, not harm.",
      "Informs clinical decisions. Errors could lead to delayed diagnosis or suboptimal treatment. Time-to-harm: days to weeks.",
      "Strongly influences or determines clinical action where errors could cause serious harm, death, or irreversible consequences. Time-to-harm: minutes to hours."
    ),
    whyItMatters:
      "This is the dimension where errors have the most direct and serious consequences. A tool that influences urgent clinical decisions carries fundamentally different risk from one that supports administrative scheduling. The safety consequence determines the stringency required across multiple other dimensions.",
  },
  {
    id: "C10",
    side: "complexity",
    shortLabel: "Values, Trust & Equity",
    longLabel: "Values, Trust, and Equity Complexity",
    guidingQuestion:
      "How significant are the ethical risks around acceptability, equity, and patient agency?",
    scoreDescriptors: c(
      "Widely accepted use case. Minimal inequality risk. Consent straightforward or not required.",
      "Broadly acceptable but questions remain. Recognised differential impact risk. Consent achievable with adaptation.",
      "Contested appropriateness. Material inequality risk. Meaningful consent difficult to achieve."
    ),
    whyItMatters:
      "The NHS is a values-based institution grounded in equity, solidarity, patient-centricity, and care excellence. AI tools can threaten all of these: they can entrench or amplify existing health inequalities, erode the solidaristic basis of pooled risk, displace the relational core of patient-centred care, and compromise clinical excellence where performance varies across populations. Ethics is not reducible to algorithmic bias — it extends to the values the NHS exists to uphold, and tools deployed without attending to those values risk eroding the institution itself.",
  },
  {
    id: "C11",
    side: "complexity",
    shortLabel: "Monitoring & Drift Detection",
    longLabel: "Monitoring and Drift Detection Complexity",
    guidingQuestion:
      "How difficult is it to detect and respond to performance changes over time?",
    scoreDescriptors: c(
      "Static algorithm. Degradation apparent through routine use. Good auditability.",
      "Periodically updated. Changes detectable with proactive monitoring. Moderate auditability.",
      "Continuously learning or frequently updated. Subtle drift, subgroup effects. Limited auditability; bespoke detection needed."
    ),
    whyItMatters:
      "AI models can degrade silently. A tool that performed well at deployment may drift as patient populations change, clinical practices evolve, or data pipelines shift. Without proactive monitoring, degradation may only become apparent when harm has already occurred.",
  },
  {
    id: "C12",
    side: "complexity",
    shortLabel: "Vendor & Supply Chain",
    longLabel: "Vendor and Supply Chain Complexity",
    guidingQuestion:
      "How complex is the vendor relationship and what risks does it create?",
    scoreDescriptors: c(
      "Internal or fully transparent vendor. Low dependency, alternatives exist. Clear sunsetting plan.",
      "Commercial vendor, reasonable transparency. Moderate dependency. Switching possible but costly.",
      "Opaque or uncooperative vendor. High dependency, switching prohibitive. Limited track record, no sunsetting plan."
    ),
    whyItMatters:
      "Vendor dependency creates institutional risk. If a vendor becomes uncooperative, raises prices, discontinues a product, or is acquired, the deploying organisation may be left without alternatives. Vendor dependency in NHS digital infrastructure can become politically and operationally fraught, and the absence of exit options narrows the organisation's room for manoeuvre throughout the lifetime of the contract.",
  },
  {
    id: "R1",
    side: "readiness",
    shortLabel: "Domain Expertise & Decision Governance",
    longLabel: "Domain Expertise and Decision Governance Readiness",
    guidingQuestion:
      "Does the organisation have the domain expertise and governance structures?",
    scoreDescriptors: r(
      "No structured process for AI decisions. General staff only. Ad hoc adoption driven by enthusiasm.",
      "Relevant expertise available. Some governance process but may not be formalised. Relevant staff involved but without dedicated time.",
      "Identified domain expertise, formal governance, explicit criteria, protected staff time, escalation processes."
    ),
    whyItMatters:
      "Without structured governance, AI adoption decisions are driven by enthusiasm, vendor persuasion, or senior pressure rather than systematic assessment. This leads to tools being adopted that do not meet genuine needs and rejected when they do.",
  },
  {
    id: "R2",
    side: "readiness",
    shortLabel: "Data Infrastructure",
    longLabel: "Data Infrastructure Readiness",
    guidingQuestion:
      "Does the organisation have the data infrastructure to support this tool?",
    scoreDescriptors: r(
      "Cannot access some required data inputs. Non-standardised formats, inconsistent coding. Significant preparatory work needed.",
      "Can access required data but adaptation needed — mapping, filling gaps, establishing feeds. Quality managed in some domains.",
      "All data inputs confirmed available and compatible. Systematic quality management. Feeds in place or trivially established."
    ),
    whyItMatters:
      "An organisation's data infrastructure determines what is actually deployable, not just what is theoretically possible. Tools that require data feeds the organisation cannot reliably provide will fail regardless of how good the algorithm is.",
  },
  {
    id: "R3",
    side: "readiness",
    shortLabel: "Information Governance",
    longLabel: "Information Governance Readiness",
    guidingQuestion:
      "Does the organisation have the IG capacity for this tool's complexity?",
    scoreDescriptors: r(
      "Standard IG capability. Limited AI-specific experience. DPIAs may be tick-box. Struggles with novel scenarios.",
      "IG extends beyond basic compliance. Substantive DPIAs. Some AI familiarity. Knows when to seek specialist advice. Some ongoing capacity.",
      "Specific AI/analytics IG experience. Genuine risk assessments with technical input. Can navigate novel challenges. Ongoing IG function."
    ),
    whyItMatters:
      "IG capacity determines whether an organisation can navigate the legal complexities of AI-mediated data processing. Organisations with only tick-box IG processes are poorly equipped for the novel scenarios that AI tools create.",
  },
  {
    id: "R4",
    side: "readiness",
    shortLabel: "Human Oversight Capacity",
    longLabel: "Human Oversight Capacity",
    guidingQuestion:
      "Does the organisation have policies, training, and structures for oversight?",
    scoreDescriptors: r(
      "No policies or guidance on oversight. No clarity on responsibilities. No training. No escalation route.",
      "Identified responsible parties. Some guidance/training. Escalation route exists but may not be formalised.",
      "Clear formalised policies. Training on evaluating outputs and automation bias. Well-defined escalation. Staff turnover planning."
    ),
    whyItMatters:
      "Oversight is not just about having the right policies on paper — it requires trained staff who understand automation bias, know when and how to override, and have clear escalation routes. Without this, oversight exists in theory but not in practice.",
    conditionalNote: {
      appliesTo: "C4",
      text: "Readiness on R4 should be read against C4. For a C4 = 1 tool (outputs straightforward and independently verifiable), R4 = 1 may be adequate — the structural demands on oversight are low. For a C4 = 3 tool (outputs structurally difficult to verify), even R4 = 3 may not be sufficient on its own, because the problem is partly structural rather than organisational.",
    },
  },
  {
    id: "R5",
    side: "readiness",
    shortLabel: "Validation & Evidence Assessment",
    longLabel: "Validation and Evidence Assessment Readiness",
    guidingQuestion:
      "Can the organisation critically evaluate the evidence supporting this tool?",
    scoreDescriptors: r(
      "Relies on vendor evidence without capacity for independent assessment. Cannot assess local relevance.",
      "Can critically appraise vendor evidence and assess local relevance. Can run basic local evaluation. May lack stratified analysis capacity.",
      "Expertise or partnerships for meaningful local validation. Can design evaluation approaches. Can assess subgroup performance. Access to biostatistics/informatics."
    ),
    whyItMatters:
      "Organisations that rely solely on vendor-provided evidence cannot independently assess whether a tool is safe and effective for their specific population. This creates an information asymmetry that the vendor, rather than the deploying organisation, controls.",
  },
  {
    id: "R6",
    side: "readiness",
    shortLabel: "Technical Infrastructure",
    longLabel: "Technical Infrastructure Readiness",
    guidingQuestion:
      "Does the organisation have the technical infrastructure for deployment?",
    scoreDescriptors: r(
      "Basic IT only. No integration/informatics engineering resource. Can deploy standalone tools only.",
      "IT resource for moderate integration (APIs, data feeds, cloud). Capacity limited and competing. Bespoke work feasible with planning.",
      "Dedicated technical capacity. Experience connecting external tools. Infrastructure meets compute requirements. Ongoing maintenance capacity."
    ),
    whyItMatters:
      "Limited technical capacity constrains not only deployment but also ongoing maintenance, updates, and incident response. An organisation that can deploy a tool but cannot support it operationally is storing up risk.",
  },
  {
    id: "R7",
    side: "readiness",
    shortLabel: "Operational & Change Management",
    longLabel: "Operational and Change Management Readiness",
    guidingQuestion:
      "Does the organisation have the change management capacity?",
    scoreDescriptors: r(
      "No workflow assessment. No identified lead. No change plan. Staff not consulted. Poor history with technology change.",
      "Identified changes and responsible lead. Staff consulted. Training plan in development. May depend on single champion. Limited withdrawal planning.",
      "Structured change process. Identified lead with protected time. Early staff engagement. Phased rollout. User feedback mechanisms. Withdrawal contingency."
    ),
    whyItMatters:
      "Change management capacity determines whether a tool is adopted successfully or generates resistance, workarounds, and low utilisation. This is the dimension most likely to determine whether a technically sound deployment actually delivers value.",
  },
  {
    id: "R8",
    side: "readiness",
    shortLabel: "Evaluation Readiness",
    longLabel: "Evaluation Readiness",
    guidingQuestion:
      "Can the organisation evaluate the tool's real-world impact?",
    scoreDescriptors: r(
      "No evaluation plan. No success metric. No baseline. No impact assessment process.",
      "Defined success metrics and baseline. Before-and-after comparison feasible. May lack capacity for complex causal analysis.",
      "Expertise/partnerships for proportionate impact evaluation. Can design approaches, establish baselines, account for confounders."
    ),
    whyItMatters:
      "Without evaluation capacity, an organisation cannot learn from its AI deployments. It cannot determine what worked, what did not, and what should be done differently next time. This perpetuates a cycle of adoption without evidence.",
  },
  {
    id: "R9",
    side: "readiness",
    shortLabel: "Clinical Safety & Risk Management",
    longLabel: "Clinical Safety and Risk Management Readiness",
    guidingQuestion:
      "Does the organisation have the safety infrastructure for this tool?",
    scoreDescriptors: r(
      "No systematic AI safety process. Ad hoc hazard identification. No AI-specific incident reporting.",
      "Clinical safety processes, can produce AI safety assessments. Limited AI-specific failure experience. Can manage well-defined failure modes.",
      "Safety processes adapted to AI challenges. Can respond to monitoring signals. Can escalate/withdraw rapidly. AI-specific incident reporting."
    ),
    whyItMatters:
      "AI-specific safety challenges — silent failure, distributional shift, automation bias — require safety processes that go beyond traditional clinical risk management. Organisations with only generic safety infrastructure may not detect AI-specific failure modes until harm occurs.",
    conditionalNote: {
      appliesTo: "C9",
      text: "Level of safety infrastructure should be proportionate to C9. A purely administrative tool with no plausible pathway to patient harm (C9 = 1) may not require formal clinical safety assessment, and a lower R9 score in that pairing is not in itself a red flag. For C9 = 2 or C9 = 3, the full weight of AI-specific safety infrastructure applies.",
    },
  },
  {
    id: "R10",
    side: "readiness",
    shortLabel: "Ethics & Public Engagement",
    longLabel: "Ethics and Public Engagement Readiness",
    guidingQuestion: "Has the organisation engaged patients and the public?",
    scoreDescriptors: r(
      "No patient/public involvement. No public-facing information. No equity impact process.",
      "Some engagement (may not be early/substantive). Information available but may lack accessibility. Can assess equity concerns.",
      "Early patient/public involvement that shaped approach. Publicly accessible information. Ongoing equity monitoring. Can revisit decisions."
    ),
    whyItMatters:
      "Public trust in NHS use of AI is conditional, not guaranteed. Organisations that deploy AI tools without patient and public engagement risk eroding trust — not only in the specific tool, but in the broader digital health agenda. Just as importantly, readiness here means the capacity to anticipate ethical harm and proactively mitigate it, rather than waiting to respond once harm has occurred.",
  },
  {
    id: "R11",
    side: "readiness",
    shortLabel: "Monitoring & Lifecycle Management",
    longLabel: "Monitoring and Lifecycle Management Readiness",
    guidingQuestion:
      "Can the organisation monitor performance over time and manage the full lifecycle?",
    scoreDescriptors: r(
      "No post-deployment monitoring process. Tool would run unmonitored until problems surface.",
      "Identified what to monitor, assigned responsibility. Basic metrics tracked. Reactive rather than proactive. Escalation process exists.",
      "Monitoring framework proportionate to complexity. Defined metrics, thresholds, review schedules. Automated detection where possible. Clear escalation pathway."
    ),
    whyItMatters:
      "Post-deployment monitoring is what prevents a successful go-live from becoming a slow-motion failure. Tools that run unmonitored will degrade, and degradation that goes undetected eventually causes harm.",
  },
  {
    id: "R12",
    side: "readiness",
    shortLabel: "Vendor & Supply Chain Management",
    longLabel: "Vendor and Supply Chain Management Readiness",
    guidingQuestion:
      "Can the organisation manage the vendor relationship effectively?",
    scoreDescriptors: r(
      "No AI-specific procurement process. Standard NHS procurement without AI due diligence. No exit strategy.",
      "Considered vendor risks. Contract covers data portability. Some understanding of vendor position. Awareness of withdrawal implications.",
      "Thorough vendor due diligence. Proportionate contractual protections. IP clarity. Exit provisions. Contingency plan. Conscious dependency management."
    ),
    whyItMatters:
      "Organisations that enter vendor relationships without AI-specific due diligence, exit provisions, and contingency planning expose themselves to risks they cannot subsequently mitigate. Contract renegotiation from a position of dependency is rarely favourable.",
  },
];

export const complexityDimensions: Dimension[] = dimensions.filter(
  (d) => d.side === "complexity"
);

export const readinessDimensions: Dimension[] = dimensions.filter(
  (d) => d.side === "readiness"
);

export function getDimension(id: string): Dimension | undefined {
  return dimensions.find((d) => d.id === id);
}
