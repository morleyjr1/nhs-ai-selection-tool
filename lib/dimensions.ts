export type DimensionSide = "complexity" | "readiness";

export interface ScoreDescriptor {
  level: 1 | 2 | 3;
  label: string;
  description: string;
}

export interface Dimension {
  id: string;
  side: DimensionSide;
  shortLabel: string;
  longLabel: string;
  whatThisDimensionAssesses: string;
  routingNote?: string;
  guidingQuestions: string[];
  scoringNote?: string;
  scoreDescriptors: [ScoreDescriptor, ScoreDescriptor, ScoreDescriptor];
  whyItMatters: string;
  dimensionNote?: string;
}

const C_LABELS = ["Low", "Moderate", "High"] as const;
const R_LABELS = ["Low", "Moderate", "High"] as const;

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

// ---------------------------------------------------------------------------
// All 24 dimensions transcribed verbatim from the authoritative PDF:
// "NHS AI Selection Tool — The 12×12 Paired Framework for Context-Sensitive
//  AI Adoption Decisions" (Jessica Morley, Yale University, March 2026).
// Pages 6–17 of the PDF.
// ---------------------------------------------------------------------------

export const dimensions: Dimension[] = [
  // =========================================================================
  // COMPLEXITY DIMENSIONS (C1–C12)  —  PDF pages 6–11
  // =========================================================================
  {
    id: "C1",
    side: "complexity",
    shortLabel: "Task & Decision Complexity",
    longLabel: "Task and Decision Complexity",
    whatThisDimensionAssesses:
      "How complex is the task or decision the tool contributes to? This concerns the nature of the task itself, not the technical sophistication of the tool.",
    routingNote:
      "If the tool is purely administrative with no influence on clinical decisions (Q4 = 1), score C1 as 1 and proceed to C2.",
    guidingQuestions: [
      "How well defined is the problem the tool addresses? Is there a clear, agreed definition of what a correct or successful outcome looks like, or is the problem itself contested?",
      "Does the task require personalisation to the individual — their clinical history, circumstances, preferences — or can it be reasonably standardised?",
      "How much does the decision involve weighing competing considerations, trade-offs, or value judgements?",
    ],
    scoreDescriptors: c(
      "The task is well defined with a clear correct answer. A standardised approach works. Primarily factual or procedural — scheduling, coding, flagging missing data, or detecting a clearly defined abnormality.",
      "The task has a broadly agreed definition of success, but there is some uncertainty — the right answer may be probabilistic, depend on context, or only be confirmable after the fact. Some adaptation to the individual is needed.",
      "The problem is not clearly defined, or reasonable people disagree about what a good outcome looks like. Significant personalisation required. Competing considerations where there may be no single right answer."
    ),
    whyItMatters:
      "Tools deployed against poorly defined problems are more likely to produce outputs that clinicians cannot act on with confidence. If the task itself is contested — as in multimorbidity management or goals-of-care decisions — even a technically accurate output may not be clinically useful.",
  },
  {
    id: "C2",
    side: "complexity",
    shortLabel: "Data Complexity",
    longLabel: "Data Complexity",
    whatThisDimensionAssesses:
      "How complex are the data the tool needs to function in deployment? This is about the data required for the tool to operate — not about training data (addressed under C5).",
    guidingQuestions: [
      "Quantity: How much data does the tool need, from how many different sources, and in how many different formats or modalities? [Ask vendor for data specification.]",
      "Quality: How sensitive is the tool to data quality — completeness, accuracy, consistency? Would a missing value cause a wrong output, or would the tool degrade gracefully? [Ask vendor.]",
      "Timeliness: How fresh do the data need to be? Can the tool work with a daily extract, or does it need continuous live data feeds? [Ask vendor.]",
    ],
    scoringNote:
      "If the tool scores differently across the three sub-dimensions, score based on the most demanding — the one that creates the greatest data infrastructure challenge.",
    scoreDescriptors: c(
      "Small number of structured fields from 1\u20132 systems, single modality. Timeliness not critical — a snapshot or periodic extract is sufficient. Low sensitivity to data quality.",
      "Data from several sources, possibly different formats or modalities. Moderate sensitivity to timeliness or quality. Data may be used for purposes related to but not identical to their original collection.",
      "Near-real-time data from multiple systems, in different formats or modalities. Highly sensitive to data quality, and there may be a meaningful gap between what the data capture and what the tool is trying to predict or detect."
    ),
    whyItMatters:
      "Data integration failures are among the most common causes of AI deployment delays or failure and performance degradation. Underestimating data complexity leads to tools that work in demo environments but fail when exposed to the inconsistencies and gaps of real clinical data systems.",
  },
  {
    id: "C3",
    side: "complexity",
    shortLabel: "Information Governance",
    longLabel: "Information Governance Complexity",
    whatThisDimensionAssesses:
      "How complex is this tool to govern from an information governance and data protection perspective? This is about data flows, sharing arrangements, and legal requirements — not data quality (C2).",
    guidingQuestions: [
      "Where are the data coming from? Single organisation, or multiple organisations, external databases, or across jurisdictions? [Ask vendor; assess internally.]",
      "Where are the data going? On-premises, vendor cloud, or third-party infrastructure? Does the tool generate new data that become part of the clinical record? [Ask vendor.]",
      "Who are the data being shared with? Is it clear who is responsible at each stage? Does the vendor have access to identifiable patient data? [Ask vendor.]",
      "How are the data being processed? Direct care, or secondary use requiring additional legal authority? [Assess internally with IG support.]",
      "Taking the above together, how much IG work is needed — can existing arrangements cover this tool, or does it require new DSAs, DPIAs, legal opinions, or specialist advice?",
    ],
    scoreDescriptors: c(
      "Data stay within a single organisation, processed on-premises or in established NHS infrastructure, used for direct care. Standard IG arrangements apply. Minimal external sharing.",
      "Data cross organisational boundaries or involve external sharing (e.g. vendor cloud). New data sharing agreements or a substantive DPIA needed, but IG questions are identifiable and resolvable.",
      "Complex data flows — multiple organisations, cross-jurisdictional processing, or novel arrangements where lawful basis is uncertain or contested. Significant IG work required, potentially including specialist legal advice."
    ),
    whyItMatters:
      "Underestimating IG complexity risks both legal non-compliance and loss of public trust.",
  },
  {
    id: "C4",
    side: "complexity",
    shortLabel: "Human Oversight Complexity",
    longLabel: "Human Oversight Complexity",
    whatThisDimensionAssesses:
      "How easy or hard is it for a busy clinician (or other user) to verify the tool\u2019s output and question it if something feels wrong? This is about the nature of the outputs — not the operational context (addressed in C6).",
    guidingQuestions: [
      "Can the user understand why the tool produced a particular output? Does the tool explain its reasoning, express uncertainty, or present outputs in a way that supports independent evaluation? [Ask vendor.]",
      "Can the user meaningfully check whether the output is correct — or is the output too complex, high-dimensional, or opaque for independent verification?",
      "Does the tool support the user in questioning or overriding its output — including flagging its own uncertainty and deferring to human judgement? [Ask vendor.]",
    ],
    scoreDescriptors: c(
      "The tool provides information that the user can easily verify independently. Interpretable, low-dimensional, checkable against existing knowledge. Override is straightforward.",
      "Outputs require some effort to verify — the user needs training, context, or additional information. Some explanation offered but not enough for full independent evaluation. Override possible but requires deliberate action.",
      "Outputs are structurally difficult for the user to verify independently — synthesis too complex, output too high-dimensional, reasoning too opaque. A deferral mechanism is essential but may be technically difficult to implement reliably."
    ),
    whyItMatters:
      "If clinicians cannot meaningfully verify or override a tool\u2019s output, they become dependent on it rather than supported by it. This is the automation bias problem: users defer to the tool even when it is wrong, because they lack the means or confidence to challenge it.",
  },
  {
    id: "C5",
    side: "complexity",
    shortLabel: "Validation Complexity",
    longLabel: "Validation Complexity",
    whatThisDimensionAssesses:
      "How difficult is it to determine whether the tool\u2019s outputs are correct? This concerns the availability and reliability of reference standards, the verifiability of what the tool is predicting or producing, and the quality of the existing evidence.",
    guidingQuestions: [
      "Is there a clear way to check whether the tool\u2019s output is correct — a reliable reference standard? Is that check available immediately, or only after a delay? Is the target stable over time? [Ask vendor for validation evidence.]",
      "Can the output be wrong in only one way, or in several ways at once? (A drug interaction alert is either right or wrong; a generated clinical letter can be factually accurate but clinically misleading.)",
      "Where does the tool\u2019s evidence base sit on the maturity scale (retrospective only / pilot / prospective real-world), and does it include evidence of the tool working in practice? [Ask vendor.]",
    ],
    scoreDescriptors: c(
      "Clear, objective, immediately verifiable reference standard. Stable target. Output can only really be wrong in one way. Evidence base proportionate to risk.",
      "Reasonable reference standard with some noise — moderate inter-rater variability, composite endpoints, or conventional thresholds. Output may need checking on more than one dimension. Evidence may need local strengthening.",
      "Reference standard is noisy, contested, or expensive to obtain. Output may be wrong in several different ways at once. Generating sufficient local evidence requires substantial effort."
    ),
    whyItMatters:
      "A tool can have impressive headline performance metrics and still fail in a specific local population. Validation must be context-specific: performance in one setting does not guarantee performance in another, and a tool\u2019s headline figures often obscure significant variation across subgroups, sites, and patient populations.",
  },
  {
    id: "C6",
    side: "complexity",
    shortLabel: "Technical Integration",
    longLabel: "Technical Integration Complexity",
    whatThisDimensionAssesses:
      "How difficult is it to deploy the tool into its intended real-world environment and make it function as part of existing clinical, operational, and technical infrastructure?",
    guidingQuestions: [
      "What does this tool need to connect to — standalone, or integration with EHRs, scheduling platforms, databases? How many systems? [Ask vendor.]",
      "Where does the tool run, and what compute and hosting infrastructure does it require? [Ask vendor.]",
      "How automated is the tool\u2019s operation — user-invoked, event-triggered, or continuously running? [Ask vendor.]",
    ],
    scoreDescriptors: c(
      "Standalone or connects to a small number of systems using established standards. Modest compute. One-directional, not real-time.",
      "Integrates with several systems using a mix of established and custom interfaces. Some near-real-time exchange. May require dedicated compute beyond what is currently in place.",
      "Integrates with multiple systems across clinical, administrative, or patient-facing infrastructure with bespoke technical work. Substantial compute. Real-time bidirectional. Multi-vendor coordination ongoing."
    ),
    whyItMatters:
      "Integration is where many AI deployments stall. A tool that requires bespoke connections to multiple clinical systems creates ongoing maintenance burden and single points of failure. Underestimating this leads to delayed go-live, cost overruns, and clinical workflow disruption which can result in patient safety issues.",
  },
  {
    id: "C7",
    side: "complexity",
    shortLabel: "Workflow & Organisational Change",
    longLabel: "Workflow and Organisational Change Complexity",
    whatThisDimensionAssesses:
      "How much does the tool change existing workflows, roles, and organisational processes, and how difficult are those changes to manage? Distinct from technical integration (C6).",
    guidingQuestions: [
      "How much does the tool change existing workflows, care pathways, or operational processes — does it fit within current ways of working, or require fundamentally different approaches?",
      "Does the tool require new roles, restructured teams, or changed professional relationships? How many different user groups are affected?",
      "Does the tool create new cognitive or operational demands on users — additional time, new documentation, alerts that need attention?",
      "Does the tool displace or substantially reduce the need for work currently done by staff? If so, how many staff are affected?",
    ],
    scoreDescriptors: c(
      "Fits existing processes with limited adjustment. No new roles. One or two user types affected minimally. No significant workload change or staff displacement.",
      "Meaningful but contained changes — new steps within existing pathways, some documentation changes, role adjustments. Manageable operational demands. May automate discrete tasks within existing roles.",
      "Substantial changes — new roles, restructured pathways, multiple professional groups affected. Significant new operational demands. May displace core function of existing roles. Deep cultural barriers."
    ),
    whyItMatters:
      "Technology adoption fails when the specific technology is seen as separate from its surrounding context as if it is just a simple case of replacing one blood-pressure cuff with another. In reality, tools that require significant workflow changes need staff engagement, training, and phased rollout. Neglecting this dimension is a common cause of low adoption and workarounds that undermine the tool\u2019s value.",
  },
  {
    id: "C8",
    side: "complexity",
    shortLabel: "Evaluation Complexity",
    longLabel: "Evaluation Complexity",
    whatThisDimensionAssesses:
      "How difficult is it to determine whether the tool is delivering meaningful impact on the problem it is designed to solve, when used by real people in real settings? Distinct from validation (C5) and monitoring (C11).",
    guidingQuestions: [
      "Is there evidence that the tool delivers real-world benefit — not just model performance, but difference when used by real people in real workflows? [Ask vendor for evaluation evidence.]",
      "How feasible is it to measure whether the tool is making a difference? Are outcomes concrete and immediately measurable, or delayed, diffuse, or only meaningful in aggregate?",
      "Can the impact of the tool be confidently isolated, or is it embedded in a complex pathway where identifying what caused what is difficult?",
    ],
    scoreDescriptors: c(
      "Technical performance closely corresponds to real-world impact. Direct causal link. Outcomes concrete and immediately measurable.",
      "Technical performance alone does not guarantee meaningful impact — the effect depends on how it is used. Evidence of real-world effect can be generated through feasible methods.",
      "Substantial and uncertain gap between technical performance and real-world impact. Long, indirect, or mediated causal chain. May need large populations, long follow-up, or novel study designs."
    ),
    whyItMatters:
      "If an organisation cannot determine whether a tool is delivering real-world value, it cannot justify continued investment or identify when the tool should be withdrawn. Tools with long, indirect causal chains between technical output and patient outcome require more sophisticated evaluation designs.",
  },
  {
    id: "C9",
    side: "complexity",
    shortLabel: "Safety Consequence",
    longLabel: "Safety Consequence Complexity",
    whatThisDimensionAssesses:
      "What is the potential for harm if the tool produces incorrect, misleading, or inappropriate outputs, and how much opportunity exists to catch and correct errors before harm occurs?",
    guidingQuestions: [
      "What is the potential severity and reversibility of harm if the tool is wrong?",
      "Who bears the risk? Is harm evenly distributed, or are vulnerable populations or those with protected characteristics disproportionately affected?",
      "How quickly could harm materialise from an incorrect output? Time-to-harm determines the opportunity for error detection.",
      "How much influence does the tool have over clinical decisions — does it inform, recommend, or effectively determine action?",
    ],
    scoreDescriptors: c(
      "Informational or administrative tool with no direct clinical impact. Errors would result in inefficiency or inconvenience but no plausible pathway to patient harm.",
      "Informs clinical decisions but does not make them autonomously. Errors could lead to delayed diagnosis or suboptimal treatment. Time-to-harm: days to weeks.",
      "Strongly influences or effectively determines clinical action where errors could result in serious harm, death, or irreversible consequences. Time-to-harm: minutes to hours. Vulnerable population."
    ),
    whyItMatters:
      "This is the dimension where errors have the most direct and serious consequences. A tool that influences urgent clinical decisions carries fundamentally different risk from one that supports administrative scheduling. The safety consequence determines the stringency required across multiple other dimensions.",
  },
  {
    id: "C10",
    side: "complexity",
    shortLabel: "Values, Trust & Equity",
    longLabel: "Values, Trust, and Equity Complexity",
    whatThisDimensionAssesses:
      "How significant are the ethical risks raised by the tool — specifically around public acceptability, equity, and patient agency? Focuses on territory not already captured by safety (C9), human oversight (C4), or IG (C3).",
    guidingQuestions: [
      "How were patients, users, and the public involved in the tool\u2019s development? Is there clear support for its intended use, or does reasonable disagreement exist about whether this type of application is appropriate? [Ask vendor.]",
      "To what extent could the tool worsen health inequalities — and what assessments have been conducted to identify and mitigate this risk? [Ask vendor.]",
      "Is meaningful consent achievable — can patients understand what they are agreeing to, and is it possible to opt out without penalty? [Ask vendor for opt-out design.]",
    ],
    scoreDescriptors: c(
      "Widely accepted use case with clear evidence of support. Minimal risk of worsening inequalities. Consent straightforward or not required.",
      "Broadly acceptable but some questions remain about public support or development process. Recognised risk of differential impact requiring assessment. Consent achievable but may need adaptation.",
      "Reasonable disagreement about whether this type of application is appropriate. Material risk of worsening health inequalities. Meaningful consent difficult to achieve — tool\u2019s role hard for patients to understand, or opting out not practically feasible."
    ),
    whyItMatters:
      "The NHS is a values-based institution grounded in equity, solidarity, patient-centricity, and care excellence. AI tools can threaten all of these: they can entrench or amplify existing health inequalities, erode the solidaristic basis of pooled risk, displace the relational core of patient-centred care, and compromise clinical excellence where performance varies across populations. Ethics is not reducible to algorithmic bias — it extends to the values the NHS exists to uphold, and tools deployed without attending to those values risk eroding the institution itself.",
  },
  {
    id: "C11",
    side: "complexity",
    shortLabel: "Monitoring & Drift Detection",
    longLabel: "Monitoring and Drift Detection Complexity",
    whatThisDimensionAssesses:
      "How difficult is it to detect changes in the tool\u2019s performance over time, and how difficult is it to respond when performance degrades? This concerns not only changes to the algorithm but changes in data, population, clinical context, and infrastructure.",
    guidingQuestions: [
      "How stable is the tool itself — static, periodically retrained, or continuously learning? How are updates communicated? [Ask vendor.]",
      "How detectable are changes in performance? Can degradation be distinguished from genuine clinical or operational variation?",
      "How auditable is the tool? Does it produce logs, flag uncertainty, or surface indicators of drift? [Ask vendor.]",
    ],
    scoreDescriptors: c(
      "Static algorithm. Performance degradation relatively apparent through routine use. Good auditability.",
      "Periodically updated algorithm. Performance changes detectable with proactive monitoring. Moderate auditability.",
      "Continuously learning or frequently updated. Performance degradation may be subtle or affect subgroups before becoming visible in aggregate. Limited auditability; bespoke drift detection may be needed."
    ),
    whyItMatters:
      "AI models can degrade silently. A tool that performed well at deployment may drift as patient populations change, clinical practices evolve, or data pipelines shift. Without proactive monitoring, degradation may only become apparent when harm has already occurred.",
  },
  {
    id: "C12",
    side: "complexity",
    shortLabel: "Vendor & Supply Chain",
    longLabel: "Vendor and Supply Chain Complexity",
    whatThisDimensionAssesses:
      "How complex is the relationship between the organisation and the tool\u2019s vendor or developer, and what risks does this relationship create?",
    guidingQuestions: [
      "Across the questions marked [Ask vendor] throughout this framework, how transparent and forthcoming was the vendor? (Assessor judgement based on overall experience.)",
      "Does the vendor have a track record of responsible deployment and constructive engagement with deploying organisations?",
      "How dependent would the organisation be on this vendor? Could it switch to an alternative if needed, or would this be prohibitively costly or disruptive?",
      "What happens if the vendor discontinues the tool or ceases to support it? [Ask vendor.]",
    ],
    scoreDescriptors: c(
      "Internally developed or fully transparent vendor with strong track record. Low dependency — alternatives exist. Clear sunsetting plan.",
      "Commercial vendor with reasonable transparency. Moderate dependency — switching possible but would involve cost and disruption. Vendor has addressed sunsetting but arrangements may not cover all scenarios.",
      "Vendor has been opaque or uncooperative. High dependency — switching prohibitively costly or disruptive. Limited or concerning track record. No clear sunsetting plan."
    ),
    whyItMatters:
      "Vendor dependency creates institutional risk. If a vendor becomes uncooperative, raises prices, discontinues a product, or is acquired, the deploying organisation may be left without alternatives. Vendor dependency in NHS digital infrastructure can become politically and operationally fraught, and the absence of exit options narrows the organisation\u2019s room for manoeuvre throughout the lifetime of the contract.",
  },

  // =========================================================================
  // READINESS DIMENSIONS (R1–R12)  —  PDF pages 12–17
  // =========================================================================
  {
    id: "R1",
    side: "readiness",
    shortLabel: "Domain Expertise & Decision Governance",
    longLabel: "Domain Expertise and Decision Governance Readiness",
    whatThisDimensionAssesses:
      "Does the organisation have the domain expertise and decision-making structures to operate responsibly in the task or decision space this tool occupies?",
    guidingQuestions: [
      "Does the organisation have a structured process for identifying problems suitable for AI and assessing whether AI is the most appropriate intervention?",
      "Does the organisation have specific expertise in the domain the tool operates in — not just general staff, but people who understand the task, its uncertainties, and its professional context?",
      "Does the governance body include the range of expertise needed — clinical, technical, ethical, and operational?",
      "Has the governance process addressed conflicts of interest?",
    ],
    scoreDescriptors: r(
      "No structured process for AI decisions. General staff only, no domain-specific AI expertise. Adoption decisions ad hoc.",
      "Relevant domain expertise available. Some governance process but may not be formalised or consistently applied. Relevant staff involved but may not have dedicated time.",
      "Identified domain expertise, formal governance structure, explicit criteria for matching task complexity to oversight level. Protected staff time. Escalation process to ethics committee or equivalent."
    ),
    whyItMatters:
      "Without structured governance, AI adoption decisions are driven by enthusiasm, vendor persuasion, or senior pressure rather than systematic assessment. This leads to tools being adopted that do not meet genuine needs and rejected when they do.",
  },
  {
    id: "R2",
    side: "readiness",
    shortLabel: "Data Infrastructure",
    longLabel: "Data Infrastructure Readiness",
    whatThisDimensionAssesses:
      "Does the organisation have the data infrastructure, quality, and governance to support this tool\u2019s data requirements?",
    guidingQuestions: [
      "Quantity match: Has the organisation checked, variable by variable, whether the data this tool requires are available and accessible?",
      "Quality match: Is data quality in the relevant domains good enough for this tool? Are there known issues — missing fields, inconsistent coding, outdated records?",
      "Timeliness match: Can the organisation provide data at the frequency the tool requires? Does infrastructure support real-time feeds if needed?",
    ],
    scoreDescriptors: r(
      "Does not systematically collect or cannot access some required data inputs. Non-standardised formats. Significant preparatory work needed.",
      "Can access required data but adaptation needed — mapping local coding, filling gaps, establishing feeds. Quality managed in some but not all domains.",
      "All required data inputs confirmed available and compatible. Systematic quality management. Necessary feeds in place or trivially established."
    ),
    whyItMatters:
      "An organisation\u2019s data infrastructure determines what is actually deployable, not just what is theoretically possible. Tools that require data feeds the organisation cannot reliably provide will fail regardless of how good the algorithm is.",
  },
  {
    id: "R3",
    side: "readiness",
    shortLabel: "Information Governance",
    longLabel: "Information Governance Readiness",
    whatThisDimensionAssesses:
      "Given the IG complexity identified in C3, does the organisation have the capacity and capability to do the governance work required — and to keep doing it on an ongoing basis?",
    guidingQuestions: [
      "Does the organisation have IG expertise proportionate to this tool\u2019s complexity? For a complex tool (C3 = 3), does it have access to specialist IG advice with AI experience?",
      "Can the organisation conduct substantive DPIAs — not as tick-box exercises, but as genuine risk assessments?",
      "Does the organisation have capacity for ongoing IG management — monitoring data flows, updating agreements, responding to new regulatory requirements?",
    ],
    scoreDescriptors: r(
      "Standard IG capability, limited AI-specific experience. DPIAs may be tick-box. Struggles with novel data flows or contested legal basis.",
      "IG capability extends beyond basic compliance. Substantive DPIAs. Some AI familiarity. Knows when to seek specialist advice. Some ongoing capacity.",
      "Specific AI/analytics IG experience. Genuine risk assessments with technical and clinical input. Can navigate novel challenges. IG treated as ongoing function."
    ),
    whyItMatters:
      "IG capacity determines whether an organisation can navigate the legal complexities of AI-mediated data processing. Organisations with only tick-box IG processes are poorly equipped for the novel scenarios that AI tools create.",
    dimensionNote:
      "IG readiness includes cybersecurity of the data infrastructure. If a tool introduces new data flows, cloud processing, or third-party access, the organisation\u2019s ability to manage associated cybersecurity risks is part of this dimension.",
  },
  {
    id: "R4",
    side: "readiness",
    shortLabel: "Human Oversight Capacity",
    longLabel: "Human Oversight Capacity",
    whatThisDimensionAssesses:
      "Does the organisation have the policies, training, and structures to help its staff verify this tool\u2019s outputs and question them when something feels wrong?",
    guidingQuestions: [
      "Does the organisation have clear policies on who is responsible for reviewing this tool\u2019s outputs and what is expected of them?",
      "Has the organisation provided training to help users maintain independent judgement — including awareness of automation bias?",
      "Are there escalation routes and protocols for when a user disagrees with or is uncertain about the tool\u2019s output?",
    ],
    scoreDescriptors: r(
      "No policies or guidance on oversight. No clarity on responsibilities, no training, no escalation route.",
      "Identified responsible parties. Some guidance/training. Users know they should exercise independent judgement. Escalation route exists but may not be formalised.",
      "Clear, formalised policies. Training specifically addresses evaluating this type of tool\u2019s outputs and automation bias. Well-defined escalation routes. Staff turnover planning."
    ),
    whyItMatters:
      "Oversight is not just about having the right policies on paper — it requires trained staff who understand automation bias, know when and how to override, and have clear escalation routes. Without this, oversight exists in theory but not in practice.",
    dimensionNote:
      "For a C4 = 1 tool (outputs straightforward and verifiable), R4 = 1 may be adequate. For C4 = 3, even R4 = 3 may require additional safeguards, because the problem is partly structural.",
  },
  {
    id: "R5",
    side: "readiness",
    shortLabel: "Validation & Evidence Assessment",
    longLabel: "Validation and Evidence Assessment Readiness",
    whatThisDimensionAssesses:
      "Does the organisation have the capacity to critically evaluate the evidence supporting this tool\u2019s safety, effectiveness, and suitability for the local context?",
    guidingQuestions: [
      "Does the organisation know its own context well enough — local demographics, disease prevalence, coding practices, patient mix — to judge whether evidence generated elsewhere applies here?",
      "Does the organisation have a minimum standard for what constitutes sufficient validation evidence?",
      "Can the organisation critically and independently evaluate the evidence — rather than relying solely on what the vendor presents?",
      "Does the organisation have capacity to pilot tools before procurement?",
    ],
    scoreDescriptors: r(
      "Relies on vendor evidence without capacity for independent assessment. Cannot assess local relevance.",
      "Can critically appraise vendor evidence and assess local relevance. Can run basic local evaluation. May lack capacity for stratified analysis.",
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
    whatThisDimensionAssesses:
      "Does the organisation have the technical infrastructure to support this tool\u2019s deployment, operation, and ongoing maintenance?",
    guidingQuestions: [
      "Does the organisation have sufficient digital maturity — compute, storage, networking, integration capability — to support deployment?",
      "Are there processes for handling AI system failure, degradation, or unavailability?",
      "Is there defined technical support and maintenance capability with clear escalation pathways?",
      "Has the organisation budgeted for ongoing costs — not just deployment, but monitoring, updates, governance, and decommissioning?",
    ],
    scoreDescriptors: r(
      "Basic IT infrastructure. No in-house integration or informatics engineering resource. Can deploy standalone tools only.",
      "IT resource for moderate integration work — APIs, data feeds, cloud provisioning. Capacity limited and competing. Bespoke work feasible with planning.",
      "Dedicated technical capacity for integration and deployment. Experience connecting external tools to clinical systems. Infrastructure meets compute requirements. Ongoing maintenance capacity."
    ),
    whyItMatters:
      "Limited technical capacity constrains not only deployment but also ongoing maintenance, updates, and incident response. An organisation that can deploy a tool but cannot support it operationally is storing up risk.",
  },
  {
    id: "R7",
    side: "readiness",
    shortLabel: "Operational & Change Management",
    longLabel: "Operational and Change Management Readiness",
    whatThisDimensionAssesses:
      "Does the organisation have the change management capacity and leadership to manage this tool\u2019s implementation and ongoing operation?",
    guidingQuestions: [
      "Does the organisation have a structured change management process — workflow mapping, impact assessment on affected roles, end-to-end testing?",
      "Is there an implementation plan covering phased rollout, resource requirements, milestones, success criteria, ongoing costs, and contingency including withdrawal criteria?",
      "Is leadership readiness adequate — named lead, clinical champions, technical support?",
      "Have intended users been involved in the decision and are they willing to use the tool? Have their concerns been addressed?",
      "If the tool displaces staff work, has the organisation planned for workforce implications?",
    ],
    scoreDescriptors: r(
      "No workflow assessment, no identified lead, no change plan. Staff not consulted. Poor history with technology change.",
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
    whatThisDimensionAssesses:
      "Does the organisation have the capacity to evaluate this tool\u2019s real-world impact — not just technical performance, but effect on the problem it is designed to solve?",
    guidingQuestions: [
      "Does the organisation know what success looks like — defined metrics and established baseline?",
      "Can the organisation measure outcomes reliably — not just usage, but intended effect?",
      "Does the organisation have the expertise for proportionate evaluation — in-house, academic partners, or commissioned?",
      "How different is the local population from the validation population? Can the organisation assess variation across patient groups?",
      "Can users feed back on performance, and is there a process for acting on that feedback?",
    ],
    scoreDescriptors: r(
      "No evaluation plan. No success metric, no baseline, no impact assessment process.",
      "Defined success metrics and baseline. Before-and-after comparison feasible. May lack capacity for complex causal analysis.",
      "Expertise or partnerships for proportionate impact evaluation. Can design approaches, establish baselines, account for confounders."
    ),
    whyItMatters:
      "Without evaluation capacity, an organisation cannot learn from its AI deployments. It cannot determine what worked, what did not, and what should be done differently next time. This perpetuates a cycle of adoption without evidence.",
    dimensionNote:
      "A simple administrative tool freeing up two hours per week does not need a health services research evaluation. Checking that two hours are actually freed is sufficient.",
  },
  {
    id: "R9",
    side: "readiness",
    shortLabel: "Clinical Safety & Risk Management",
    longLabel: "Clinical Safety and Risk Management Readiness",
    whatThisDimensionAssesses:
      "Does the organisation have the safety infrastructure to identify, manage, and respond to safety risks from this tool?",
    guidingQuestions: [
      "Has a clinical safety assessment been conducted — identifying hazards, harms, and AI-specific failure modes (e.g. performance degradation, context-dependent errors)?",
      "Are clinical fallback processes defined, documented, communicated, and tested?",
      "Is AI integrated into existing clinical risk management and patient safety systems — including incident reporting?",
      "Does the organisation have a corrective and preventive action (CAPA) process for AI-related safety incidents?",
      "Has the organisation defined what an acceptable error rate looks like, including categories of errors that should never occur?",
    ],
    scoreDescriptors: r(
      "No systematic AI safety process. Ad hoc hazard identification. No AI-specific incident reporting.",
      "Clinical safety processes in place, can produce AI safety assessments. Limited AI-specific failure experience. Can manage well-defined failure modes.",
      "Safety processes adapted to AI challenges. Can respond to monitoring signals. Can escalate and withdraw rapidly. AI-specific incident reporting."
    ),
    whyItMatters:
      "AI-specific safety challenges — silent failure, distributional shift, automation bias — require safety processes that go beyond traditional clinical risk management. Organisations with only generic safety infrastructure may not detect AI-specific failure modes until harm occurs.",
    dimensionNote:
      "A purely administrative tool with no plausible pathway to patient harm may not require formal clinical safety assessment. Level of safety infrastructure should be proportionate to C9.",
  },
  {
    id: "R10",
    side: "readiness",
    shortLabel: "Ethics & Public Engagement",
    longLabel: "Ethics and Public Engagement Readiness",
    whatThisDimensionAssesses:
      "Has the organisation engaged patients and the public in the decision to adopt this tool, and is the deployment transparent?",
    guidingQuestions: [
      "Were patients and the public involved in the decision to procure and deploy — genuinely sought, not just communicated after the fact?",
      "Have patients and the public been told the tool is deployed? Is information about what it does and how it affects care in the public domain?",
      "Does the organisation have the capacity to assess and monitor bias and equity impacts on an ongoing basis?",
    ],
    scoreDescriptors: r(
      "No patient/public involvement. No public-facing information. No equity impact process.",
      "Some engagement (may not be early or substantive). Information available but may lack accessibility. Can assess equity concerns but may lack ongoing capacity.",
      "Early patient/public involvement that shaped the approach. Publicly accessible information. Ongoing equity monitoring. Can revisit deployment decision if concerns emerge."
    ),
    whyItMatters:
      "Public trust in NHS use of AI is conditional, not guaranteed. Organisations that deploy AI tools without patient and public engagement risk eroding trust — not only in the specific tool, but in the broader digital health agenda. Just as importantly, readiness here means the capacity to anticipate ethical harm and proactively mitigate it, rather than waiting to respond once harm has occurred.",
  },
  {
    id: "R11",
    side: "readiness",
    shortLabel: "Monitoring & Lifecycle Management",
    longLabel: "Monitoring and Lifecycle Management Readiness",
    whatThisDimensionAssesses:
      "Does the organisation have the capability to monitor this tool\u2019s performance over time and manage its full lifecycle? Monitoring should include whether the tool performs differently across patient subgroups.",
    guidingQuestions: [
      "Does the organisation have an ongoing monitoring plan — who checks, how often, against what metrics, and what happens when performance drops? Does the plan account for environmental changes?",
      "Is there a defined process for managing model updates — assessing risk, revalidating, and rolling back if needed?",
      "Is vendor support sufficient for monitoring — with clear mechanisms for reporting issues and receiving transparent responses?",
      "Does the organisation learn from experience — feeding insights from monitoring, incidents, and feedback back into governance?",
      "Is there monitoring for unintended use patterns or workarounds?",
    ],
    scoreDescriptors: r(
      "No post-deployment monitoring process. Tool would run unmonitored until someone noticed a problem.",
      "Identified what to monitor, assigned responsibility. Basic metrics tracked. Reactive rather than proactive. Escalation process exists but may not be formalised.",
      "Monitoring framework proportionate to complexity. Defined metrics, thresholds, review schedules. Automated detection where possible. Clear escalation pathway including pause/withdrawal."
    ),
    whyItMatters:
      "Post-deployment monitoring is what prevents a successful go-live from becoming a slow-motion failure. Tools that run unmonitored will degrade, and degradation that goes undetected eventually causes harm.",
  },
  {
    id: "R12",
    side: "readiness",
    shortLabel: "Vendor & Supply Chain Management",
    longLabel: "Vendor and Supply Chain Management Readiness",
    whatThisDimensionAssesses:
      "Does the organisation have the capacity to manage its relationship with this tool\u2019s vendor or developer effectively, including procurement, commercial, and financial dimensions?",
    guidingQuestions: [
      "Does the organisation have procurement processes that address AI-specific risks — vendor transparency, data rights, ongoing vendor management?",
      "Has the organisation secured contractual protections proportionate to vendor dependency — data portability, audit rights, performance guarantees, liability, exit provisions?",
      "Has the organisation assessed the depth of vendor dependency — and is that dependency a conscious, risk-managed decision?",
    ],
    scoreDescriptors: r(
      "No AI-specific procurement process. Standard NHS procurement without AI due diligence. No exit strategy for this tool.",
      "Considered vendor risks. Contract covers data portability. Some understanding of vendor position and withdrawal implications.",
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
