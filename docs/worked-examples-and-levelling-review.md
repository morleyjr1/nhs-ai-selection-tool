# Levelling (optional passes) + worked examples v4 — for review

C3's "why it matters" is done and committed. This covers the two optional
levelling passes (for your approval before I apply them) and the worked examples
rewritten to be **purely factual** — no cross-references to other questions, no
rhetorical flourishes, no meta-narrative about scoring floors. Each entry states
the factual product information relevant to that domain and the resulting grade.
All illustrative only.

---

# Part 1 — Optional levelling (for approval)

## 1a. A fourth guiding question for R2, R10, R12

**R2 — Data Infrastructure** (current Qs: quantity match, quality match, timeliness match). Proposed 4th:
> *Capability:* Does the organisation have the data-engineering capacity to build and maintain the required extracts, mappings, and feeds on an ongoing basis, not only at go-live?

**R10 — Ethics & Public Engagement** (current Qs: involvement in the decision; public information; capacity to assess/monitor bias and equity). Proposed 4th:
> Is there an accessible route for patients and the public to raise concerns about the tool once it is in use, and a process to act on what they raise?

**R12 — Vendor & Supply Chain Management** (current Qs: AI-specific procurement; contractual protections; depth of dependency). Proposed 4th:
> Is there a contingency plan if the vendor fails, is acquired, or withdraws the product — including how continuity of care would be maintained if the tool became unavailable?

## 1b. Expanded R8 and R9 score-descriptors

**R8 — Evaluation Readiness**
| | Before | After (proposed) |
|---|---|---|
| Low | No evaluation plan. No success metric, no baseline, no impact assessment process. | No evaluation plan: no defined success metric, no baseline, and no process for assessing whether the tool makes a difference in practice. |
| Moderate | Defined success metrics and baseline. Before-and-after comparison feasible. May lack capacity for complex causal analysis. | Defined success metrics and an established baseline, with before-and-after comparison feasible. May lack the capacity for more complex causal analysis where the tool's effect is mediated or delayed. |
| High | Expertise or partnerships for proportionate impact evaluation. Can design approaches, establish baselines, account for confounders. | Expertise or partnerships for impact evaluation proportionate to the tool's risk. Can design appropriate approaches, establish baselines, account for confounders, and assess variation across patient groups. |

**R9 — Clinical Safety & Risk Management**
| | Before | After (proposed) |
|---|---|---|
| Low | No systematic AI safety process. Ad hoc hazard identification. No AI-specific incident reporting. | No systematic AI safety process. Hazard identification is ad hoc, and there is no AI-specific incident reporting or clinical safety case. |
| Moderate | Clinical safety processes in place, can produce AI safety assessments. Limited AI-specific failure experience. Can manage well-defined failure modes. | Established clinical safety processes that can produce AI safety assessments, but limited experience of AI-specific failure modes. Can manage well-defined hazards but may not anticipate silent degradation or context-dependent error. |
| High | Safety processes adapted to AI challenges. Can respond to monitoring signals. Can escalate and withdraw rapidly. AI-specific incident reporting. | Safety processes adapted to AI-specific challenges. Can respond to monitoring signals, escalate and withdraw the tool rapidly, and capture AI-related events through dedicated incident reporting feeding corrective action. |

---

# Part 2 — Worked examples v4 (purely factual, illustrative only)

Anchors: **FlowCast** (operational demand forecasting), **ScanRead** (mammography reader), **DoseGuide** (insulin titration), **CareAgent** (autonomous patient-facing care agent).

## C1 — Task & Decision Complexity
*Assesses how well-defined the task is, how much it must be personalised, and how far it involves weighing competing considerations.*
- **FlowCast — 2.** Forecasts attendances and admissions from historical activity, seasonal trends, and weather. The objective is agreed and checkable against actual activity, but the output is probabilistic and varies with local circumstances. A well-defined but inherently uncertain task is moderate.
- **ScanRead — 2.** Classifies a mammogram as recall or no-recall. The objective is clearly defined, but the judgement is probabilistic and confirmed only later by biopsy or follow-up. A well-defined task with an uncertain answer is moderate.
- **DoseGuide — 2.** Recommends insulin dose adjustments toward a glucose target — a protocolised decision with a defined direction, personalised to the individual's glucose patterns. A well-defined task requiring individual adaptation is moderate.
- **CareAgent — 3.** Conducts open-ended patient conversations spanning history-taking, advice, and follow-up. There is no single definition of a correct interaction, each is personalised, and the scope is set by the patient. An ill-defined, unbounded task is high.

## C2 — Data Complexity
*Assesses the data needed in deployment: number of sources and formats, sensitivity to data quality, and required timeliness.*
- **FlowCast — 2.** Uses several structured operational feeds — attendances, admissions, seasonal signals, weather — supplied on a schedule, with no patient-identifiable record required. Multiple sources at modest timeliness and low quality-sensitivity is moderate.
- **ScanRead — 2.** Uses a single modality: standard FFDM mammograms in DICOM, four views per case. Few sources, but the output is highly sensitive to image quality and positioning. Low variety with high quality-sensitivity is moderate.
- **DoseGuide — 2.** Uses near-real-time blood-glucose readings and the insulin regimen, entered by the patient or pulled from a connected meter. A small input set, but timeliness- and quality-sensitive because the recommendation acts on it. A small, live, quality-dependent feed is moderate.
- **CareAgent — 3.** Uses live data from several systems in different formats within one conversation, and must reconcile recorded data with what the patient reports in the moment. Multiple real-time sources of differing quality is high.

## C3 — Information Governance
*Assesses the data flows: sources and destinations, sharing arrangements, lawful basis, and the IG work required.*
- **FlowCast — 1.** Uses operational activity data — counts and flows, not identifiable patient records — processed within the organisation for direct planning under existing arrangements. Data held and used in-house is low.
- **ScanRead — 2.** Processes identifiable mammograms, in most deployments through vendor cloud infrastructure, requiring a DPIA and a data-sharing agreement. Identifiable data shared with a vendor under new arrangements is moderate.
- **DoseGuide — 2.** Processes identifiable glucose and insulin data through a vendor-run cloud service under new sharing arrangements, returning data to the patient. Identifiable data processed by a vendor is moderate.
- **CareAgent — 3.** Generates new data from live patient conversations, processed via vendor cloud, with records that may re-enter care, and an unsettled lawful basis for processing clinical dialogue at scale. Novel, contested data flows are high.

## C4 — Human Oversight Complexity
*Assesses how readily a user can verify the tool's output and challenge it.*
- **FlowCast — 1.** Outputs an interpretable, low-dimensional forecast a manager can check against recent activity and override by planning differently. Output that is easy to verify and override is low.
- **ScanRead — 2.** Outputs a recall / no-recall flag a radiologist can verify against the image, though verification requires expertise. Verifiable with expertise is moderate.
- **DoseGuide — 2.** Issues dose recommendations to the patient with no clinician reviewing each one; an individual recommendation is checkable but is acted on without routine review. Acted-upon output without per-decision review is moderate.
- **CareAgent — 3.** Produces outputs through multiple non-transparent steps in a live conversation, with no clinician reviewing each output and no practical means to verify or intervene in real time. Output that cannot be verified or challenged in use is high.

## C5 — Validation Complexity
*Assesses how reliably the output's correctness can be established: the reference standard, the ways the output can be wrong, and the maturity of the evidence.*
- **FlowCast — 2.** Can be checked against actual activity — a clear if noisy reference standard — and can only be wrong by missing the forecast. A single, noisy error mode is moderate.
- **ScanRead — 2.** Has a reference standard in biopsy and follow-up, but it is delayed, subject to reader disagreement, and varies by breast density and site. A delayed, variable reference standard is moderate.
- **DoseGuide — 2.** Correctness shows in glycaemic outcomes, a usable reference standard; the main task is confirming performance for the local population and regimens. A usable standard requiring local confirmation is moderate.
- **CareAgent — 3.** Produces generative, multi-part conversational output that can be wrong factually, clinically, in tone, or by omission, with no clean reference standard for an open conversation. Many simultaneous error modes without a reference standard is high.

## C6 — Technical Integration
*Assesses what the tool must connect to, the compute and hosting it needs, and how automated its operation is.*
- **FlowCast — 2.** Connects to admissions, e-rostering, and dashboards through an established data platform, running on a schedule. Several connections via standard interfaces is moderate.
- **ScanRead — 2.** Integrates with PACS and RIS using established DICOM standards within the reading workflow. Established imaging integration is moderate.
- **DoseGuide — 2.** App-based, taking data from connected glucose meters and delivering to the patient's phone. Contained, app-based integration is moderate.
- **CareAgent — 3.** Requires real-time, bidirectional integration with telephony and clinical systems, significant compute for conversational models, and coordination across multiple suppliers. Real-time, multi-system integration is high.

## C7 — Workflow & Organisational Change
*Assesses how much the tool changes workflows, roles, and processes, and how hard those changes are to manage.*
- **FlowCast — 2.** Changes planning and rostering routines for a contained group of managers, within existing processes. Contained process change is moderate.
- **ScanRead — 2.** Changes the double-reading workflow, altering the second read and how discordance is handled, without restructuring roles. Contained workflow change is moderate.
- **DoseGuide — 2.** Shifts work toward patient self-management, adds steps for clinicians and patients, and requires a clinical support function. New steps across roles is moderate.
- **CareAgent — 3.** Changes how patient contact is delivered, requires new roles to monitor it, and may displace work across multiple professions. New roles and restructured pathways is high.

## C8 — Evaluation Complexity
*Assesses how hard it is to show real-world benefit and to isolate the tool's effect.*
- **FlowCast — 2.** Accuracy is measurable, but benefit to staffing and flow depends on how managers act on the forecast. A measurable but indirect effect is moderate.
- **ScanRead — 2.** Effect on detection and recall rates is measurable but sits within a long screening pathway, so attribution requires care. A measurable but pathway-embedded effect is moderate.
- **DoseGuide — 2.** Has direct, measurable outcomes — HbA1c and hypoglycaemia rates — comparable before and after. Direct, measurable outcomes is moderate.
- **CareAgent — 3.** Effect on patient outcomes is separated from its conversations by a long, indirect chain of subsequent care, requiring complex study designs to isolate. A long, indirect causal chain is high.

## C9 — Safety Consequence
*Assesses the severity and reversibility of harm if the tool is wrong, the time before harm occurs, and how far the tool determines rather than informs the action.*
- **FlowCast — 1.** Administrative; an error yields a worse staffing plan with no direct route to patient harm. No plausible patient harm is low.
- **ScanRead — 2.** A missed finding is serious, but the output informs a decision a radiologist reviews, and time-to-harm is long. Serious harm that is reviewed and slow to materialise is moderate.
- **DoseGuide — 3.** Acts on insulin dosing, where an error can cause acute harm such as hypoglycaemia on a short timescale with limited opportunity to intervene. Direct action with severe, rapid potential harm is high.
- **CareAgent — 3.** Determines clinical action in a live interaction with no per-output review and a short time-to-harm. Action determined directly with severe potential harm is high.

## C10 — Values, Trust & Equity
*Assesses public acceptability, the risk of widening inequalities, and whether meaningful consent is achievable.*
- **FlowCast — 1.** Operates on operational planning with no direct bearing on individual patients and no consent requirement. Accepted operational use is low.
- **ScanRead — 2.** Performance can vary by breast density and demographic group, and AI involvement in screening raises acceptability questions. Recognised equity and acceptability questions is moderate.
- **DoseGuide — 2.** Affects patient self-management and may work less well for those with less access to the app and meters. A recognised risk of differential impact is moderate.
- **CareAgent — 3.** Autonomous AI in direct patient contact, with contested acceptability, material risk of unequal impact, and consent that is hard to obtain where its role is hard to explain and opting out is impractical. Contested acceptability, equity risk, and difficult consent is high.

## C11 — Monitoring & Drift Detection
*Assesses how hard it is to detect performance change over time and respond, across the model, data, population, and context.*
- **FlowCast — 2.** Largely static; drift shows against actual demand, but patterns change and require proactive monitoring. Detectable drift requiring monitoring is moderate.
- **ScanRead — 2.** Requires monitoring for drift, particularly subgroup degradation that can precede changes in headline figures. Subgroup drift requiring monitoring is moderate.
- **DoseGuide — 2.** Requires ongoing monitoring of glycaemic outcomes and meter data; change is detectable with active monitoring. Detectable change requiring monitoring is moderate.
- **CareAgent — 3.** Generative and frequently updated, so performance can change subtly and affect subgroups before showing in aggregate, and conversational output is hard to audit. Subtle, hard-to-audit drift is high.

## C12 — Vendor & Supply Chain
*Assesses the supplier relationship: transparency, dependency, and the consequences of the vendor changing course or withdrawing.*
- **FlowCast — 2.** Delivered through a large national data platform; the supplier is established but switching would carry cost and disruption. Established supplier with real switching cost is moderate.
- **ScanRead — 2.** A commercial product with a published evidence base and emerging alternatives. Commercial vendor with alternatives is moderate.
- **DoseGuide — 2.** Depends on a single specialist vendor and a proprietary cloud service with an in-house clinical team. Single-vendor dependency with switching cost is moderate.
- **CareAgent — 3.** From a young vendor in an immature market, with high dependency, uncertain longevity, and few alternatives. High dependency with limited exit is high.
