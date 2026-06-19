# Worked examples + explanation levelling — for review (v3, descriptive + in-voice)

Each entry now leads with the concrete information about the product an assessor
would gather — modality, data feeds, output type, deployment mode, regulatory and
evidence facts — and shows how that information maps to the score. Non-comparative,
in your voice, grounded in the real anchors. Floor-driven scores are flagged.
All illustrative only.

---

# Part 1 — Levelling the domain explanations

## C3 — Information Governance: "why it matters" (the main fix)

> **Before:** "Underestimating IG complexity risks both legal non-compliance and loss of public trust."

> **After:** "Information governance is where AI adoption most often runs aground, in ways that are slow to surface and costly to undo. Underestimating it risks not only legal non-compliance — an inadequate lawful basis, a DPIA that does not withstand scrutiny, data flows that were never properly agreed — but the erosion of the public trust the NHS depends on to use data at all, as the collapse of care.data showed. Complex flows across organisations, jurisdictions, or into commercial cloud infrastructure compound both risks, and resolving them is rarely as quick as a deployment timetable assumes."

## Optional
- Guiding-question counts range 3–5; I can level the 3-question domains (R2, R10, R12) up to 4 if wanted.
- R8/R9 score-descriptors are slightly terser than the complexity side; I can expand to match on request.

---

# Part 2 — Worked examples (illustrative only)

Anchors: **FlowCast** (operational demand forecasting), **ScanRead** (mammography reader), **DoseGuide** (insulin titration), **CareAgent** (autonomous patient-facing care agent).

## C1 — Task & Decision Complexity
*What drives the score:* how hard the task itself is — definition, personalisation, competing considerations. Autonomy is scored in C4 and the tier, not here.

- **FlowCast — 2.** FlowCast forecasts A&E attendances and admissions days to weeks ahead from historical activity, seasonal illness trends, and Met Office weather, to inform staffing and bed plans. The task is a bounded prediction with an agreed measure of success that can be checked against what actually happened, but the answer is irreducibly probabilistic and moves with local events. A well-defined task carrying real uncertainty is moderate.
- **ScanRead — 2.** ScanRead reads standard mammograms — four full-field digital views per case, as DICOM — and returns a binary recall / no-recall suggestion, used as an independent reader in double-reading. The decision has a clear target, but the interpretation is probabilistic, leans on radiological expertise, and is only confirmed later by biopsy or follow-up. A clearly specified question with an inherently uncertain answer is moderate.
- **DoseGuide — 2.** DoseGuide takes a patient's blood-glucose readings and recommends insulin dose adjustments toward target, across all insulin regimens, delivered to the patient through an app. Set the autonomy aside and the underlying task is a long-established, protocolised titration decision with an unambiguous goal, personalised to the individual's glucose patterns. The autonomy is real, but C4 and C9 are where it counts; on the difficulty of the task itself this is moderate.
- **CareAgent — 3.** CareAgent makes generative, conversational contact with patients — post-discharge check-ins, chronic-care follow-up — taking histories, giving advice, and acting across several tasks in a single call. There is no agreed definition of a good open-ended clinical conversation, every exchange is personalised, and the patient rather than a protocol sets where it goes. A contested, unbounded task is high.

## C2 — Data Complexity
*What drives the score:* the data the tool needs in deployment — sources and formats, quality-sensitivity, timeliness. Score on the most demanding. (Deployment data, not training data.)

- **FlowCast — 2.** The data FlowCast needs are several structured operational feeds — historical attendances and admissions, seasonal illness signals, weather — supplied on a schedule rather than live, with no patient-identifiable clinical record required to run it. A missing value weakens a forecast rather than causing a harmful error. Several sources at modest timeliness and low quality-sensitivity is moderate.
- **ScanRead — 2.** The data ScanRead needs are a single modality — standard FFDM mammograms in DICOM, four views per case — from the imaging system. The number of sources and formats is low, but the output is acutely sensitive to image quality and positioning: a poor acquisition can change the recall suggestion. Low variety but high quality-sensitivity is moderate.
- **DoseGuide — 2.** DoseGuide relies on near-real-time blood-glucose readings, entered by the patient or pulled from a connected meter, together with the insulin regimen. The input set is small and well-defined, but it is timeliness- and quality-sensitive because the recommendation acts on it — a missed or mistaken reading matters. A small, live, quality-dependent feed is moderate.
- **CareAgent — 3.** To hold a useful conversation, CareAgent needs live data from several systems at once — the record, the reason for contact, prior interactions — in different formats, and must cope with the gap between what those records hold and what the patient says in the moment. Multiple real-time sources plus that representational gap is high.

## C3 — Information Governance
*What drives the score:* where data come from and go to, who they are shared with, the lawful basis, and how much IG work is required. Not data quality (C2).

- **FlowCast — 1.** FlowCast runs on operational activity data — counts and flows rather than identifiable patient records — and where it is used within the organisation for direct planning, existing IG arrangements cover it. The thing to establish is where the data actually sit and move: a deployment that routes them through a commercial data platform or shares them across organisations would not be low. On the in-organisation, operational footing described here, it is low.
- **ScanRead — 2.** ScanRead processes identifiable mammograms, and in most deployments those images are handled by the vendor's cloud infrastructure, which means a substantive DPIA and a data-sharing agreement. The IG questions are real but identifiable and answerable, which is moderate.
- **DoseGuide — 2.** DoseGuide processes identifiable glucose and insulin data through a cloud service run by the vendor, typically under new sharing arrangements, and returns data to the patient. Genuine IG work of a familiar, tractable kind — moderate.
- **CareAgent — 3.** CareAgent generates extensive and novel data flows out of live patient conversations, usually through vendor cloud, and may create new records that re-enter care. Where the lawful basis for processing free-text clinical dialogue at scale is uncertain or contested and needs specialist advice, the governance is highly complex.

## C4 — Human Oversight Complexity
*What drives the score:* how readily a user can verify and challenge the output. A property of the outputs, not the policies (R4). Autonomy and agency set minimum scores.

- **FlowCast — 1.** FlowCast's output is a forecast — interpretable, low-dimensional, easy for a manager to sense-check against recent experience and current figures, and to override by planning differently. Output that is straightforward to verify and act against is low.
- **ScanRead — 2.** ScanRead returns a recall / no-recall suggestion a radiologist can check against the image, so it is verifiable — but doing so takes expertise, and as an independent reader within double-reading there is a human gate in its use. Verifiable with effort, with a built-in gate, is moderate.
- **DoseGuide — 2.** DoseGuide issues dose recommendations directly to the patient without a clinician reviewing each one, which triggers the autonomous floor of 2. A single recommendation is checkable, but the routine absence of a human gate is what raises the oversight burden; the score is set by how it acts, not by how legible any one output is.
- **CareAgent — 3.** CareAgent is autonomous and agentic — it works through multiple opaque steps in a live conversation with no clinician reviewing each output, and a reliable deferral mechanism is hard to build into open dialogue. The model holds C4 at the maximum for this combination; it is a floor, not a judgement.

## C5 — Validation Complexity
*What drives the score:* whether there is a reliable reference standard, how many ways the output can be wrong, and how mature the evidence is.

- **FlowCast — 2.** FlowCast can be validated against what actually happened — a clear if noisy reference standard — and can essentially only be wrong in one way: the forecast misses. Because demand is noisy and local, showing it holds for a given site is moderate validation work.
- **ScanRead — 2.** ScanRead's evidence base is unusually strong — large multi-vendor retrospective studies and a prospective screening evaluation — but its reference standard (biopsy and follow-up) is delayed, readers disagree, and performance can vary by breast density and across sites. A good but noisy standard with real subgroup caveats is moderate.
- **DoseGuide — 2.** DoseGuide's effect shows up in glycaemic control, which gives a usable reference standard; the main task is demonstrating that titration performs for the local population and the regimens in use. That is moderate validation work.
- **CareAgent — 3.** A generative, multi-step conversational output can be wrong in many ways at once — factually, clinically, in tone, in what it omits — and there is rarely a clean reference standard for an open conversation. With its autonomy, the floor holds C5 at the maximum.

## C6 — Technical Integration
*What drives the score:* what the tool must connect to, the compute and hosting it needs, and how automated its operation is.

- **FlowCast — 2.** FlowCast connects to admissions, e-rostering, and site dashboards, but through an established data platform rather than bespoke interfaces, and runs to a schedule rather than in real time. Several connections on standard plumbing is moderate.
- **ScanRead — 2.** ScanRead integrates with the imaging stack — PACS and RIS — using established DICOM-based standards, and slots into the reading workflow. Real but well-understood integration is moderate.
- **DoseGuide — 2.** DoseGuide is largely app-based, taking in data from connected glucose meters and delivering to the patient's phone; the integration is contained. Moderate.
- **CareAgent — 3.** CareAgent needs real-time, two-way integration with telephony and clinical systems, meaningful compute to run conversational models, and ongoing coordination across more than one supplier. Real-time, bidirectional, multi-system integration is high.

## C7 — Workflow & Organisational Change
*What drives the score:* how much the tool changes workflows, roles, and processes, and how hard those changes are to manage. Separate from technical integration (C6).

- **FlowCast — 2.** FlowCast changes how planning and rostering decisions are made and what managers look at each morning, but it fits within existing routines and touches a contained group. Meaningful but contained change is moderate.
- **ScanRead — 2.** As an independent reader, ScanRead changes the double-reading workflow — what the second read is, how discordance is resolved — without rewriting roles wholesale. Moderate organisational change.
- **DoseGuide — 2.** DoseGuide moves work toward patient self-management and changes the diabetes pathway, with new steps for patients and clinicians and a clinical support team around it. Moderate, tipping higher wherever it displaces an existing review.
- **CareAgent — 3.** CareAgent changes how patient contact happens, creates new roles to monitor what it says and does, and may take over work currently done by staff across more than one profession. New roles and restructured pathways are high.

## C8 — Evaluation Complexity
*What drives the score:* how hard it is to show real-world benefit (not just model performance) and how cleanly the effect can be isolated.

- **FlowCast — 2.** FlowCast's forecast accuracy is measurable, but whether it improves staffing and flow depends on how managers act on it, so its real benefit is a step removed from the model output. A measurable but mediated effect is moderate.
- **ScanRead — 2.** ScanRead's effect on cancer detection and recall rates is measurable — and has been measured prospectively — but it sits within a long screening pathway, so attributing a change to the tool takes care. Moderate.
- **DoseGuide — 2.** DoseGuide has reasonably direct outcomes — HbA1c, hypoglycaemia rates — that can be compared before and after for the patients using it. That keeps evaluation at moderate.
- **CareAgent — 3.** Between an open-ended conversation and a patient outcome sits a long, indirect chain of everything else in that person's care. Isolating CareAgent's contribution needs careful, often novel study designs — high.

## C9 — Safety Consequence
*What drives the score:* severity and reversibility of harm if the tool is wrong, time before it lands, and how far the tool determines rather than informs the action. Autonomy sets a minimum.

- **FlowCast — 1.** FlowCast is administrative: a poor forecast yields a worse staffing plan and wasted effort, with no plausible direct route to patient harm. Low.
- **ScanRead — 2.** A missed cancer is serious, but ScanRead informs the decision rather than making it, a radiologist reviews the case within double-reading, and the time before harm could follow is long. Serious consequences with a human gate and time to intervene is moderate.
- **DoseGuide — 3.** DoseGuide acts on insulin dosing, where an error can cause acute harm — hypoglycaemia — on a short timescale and with limited chance to intervene before it reaches the patient. Its autonomy sets a floor of 2, but the severity and speed of the potential harm put it at high.
- **CareAgent — 3.** CareAgent effectively determines clinical action in a live patient interaction, without a clinician reviewing each output and on a short timescale. The agentic-and-autonomous floor holds C9 at the maximum — the corner where errors carry the most direct and serious consequences.

## C10 — Values, Trust & Equity
*What drives the score:* public acceptability, the risk of widening inequalities, and whether meaningful consent is achievable. Territory not covered by C9, C4, or C3.

- **FlowCast — 1.** FlowCast works at the level of operational planning, with little direct bearing on any individual patient and no consent question to engage. Widely accepted operational use is low.
- **ScanRead — 2.** ScanRead raises real questions about whether it performs as well across every group screened — breast density and demographic variation are known issues — and about public comfort with AI involved in reading mammograms. Both need assessment, which is moderate.
- **DoseGuide — 2.** DoseGuide touches a patient's agency in managing their own condition and could work less well for those with less access to or confidence with the app and meters. A recognised risk of differential impact that needs assessing is moderate.
- **CareAgent — 3.** CareAgent is autonomous AI speaking directly to patients. Reasonable people disagree about whether that is appropriate, the risk of unequal impact is real, and meaningful consent is hard when the tool's role is difficult to explain and opting out may not be practical. Highly complex ethical territory.

## C11 — Monitoring & Drift Detection
*What drives the score:* how hard it is to detect performance change over time and respond — shifts in the model, the data, the population, and the context.

- **FlowCast — 2.** FlowCast is fairly static, and drift in its accuracy shows up against actual demand, but it still needs proactive monitoring as attendance patterns change — after a service reconfiguration, say. Moderate.
- **ScanRead — 2.** ScanRead needs proactive monitoring for drift, and particularly for degradation within subgroups that can hide before it shows in headline detection and recall figures. Moderate.
- **DoseGuide — 2.** DoseGuide calls for ongoing monitoring of glycaemic outcomes and the data coming from meters; change is detectable if someone is watching for it. Moderate.
- **CareAgent — 3.** CareAgent is generative and frequently updated, so its behaviour can drift quietly and affect some groups before it is visible in aggregate, and conversation is hard to audit. The floor holds it at the maximum.

## C12 — Vendor & Supply Chain
*What drives the score:* transparency of the supplier, how dependent the organisation would become, and what happens if the vendor changes course or withdraws.

- **FlowCast — 2.** FlowCast is usually delivered through a large national data platform; the supplier is established, but the dependency is real and moving away would carry cost and disruption. Moderate.
- **ScanRead — 2.** ScanRead is a commercial product with a substantial published evidence base and alternatives emerging in the market, so dependency is moderate.
- **DoseGuide — 2.** DoseGuide rests on a single specialist vendor and a proprietary cloud service with an in-house clinical team — a moderate dependency with a real switching cost.
- **CareAgent — 3.** CareAgent is a new offering from a young company in an immature market: high dependency, uncertain longevity, and few credible alternatives if it falters. An opaque or fragile supply relationship with no clear exit is high.
