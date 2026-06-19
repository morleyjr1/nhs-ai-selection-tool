# User guide — draft for review

This is the full content for the **User guide** tab. Read it through and mark up
anything — particularly the voice and the three worked examples. Once you're
happy I'll build the in-app page and a printable version. Nothing here names a
real product; the worked examples use the anonymised archetypes.

---

# How this tool works: a user guide

## 1. What this tool is, and what it is not

Adopting an AI tool is rarely a simple yes or no. The same tool can be a sensible choice for one organisation and a serious risk for another, because what matters is not the tool in the abstract but the fit between what the tool demands and what the deploying organisation can provide. This tool makes that fit explicit, and it does so in a structured, repeatable way.

It is a **diagnostic instrument, not a prescriptive one**. It will tell you *where* the risks and gaps lie, how serious they are, and which to address first. It will not tell you exactly *what* to do to close them, because that depends on knowledge of your organisation, your patients, and your local context that no standardised instrument can hold. Used well, it is the structured conversation to have before and alongside the formal processes that govern AI in the NHS — a Data Protection Impact Assessment, clinical safety work under DCB0129 and DCB0160, the Digital Technology Assessment Criteria, and medical-device regulation. It does not replace any of them.

It is most useful **early** — while horizon-scanning, building a business case, or preparing for procurement — when its findings can still shape the decision rather than justify one already made. And it is most usefully completed by a **multidisciplinary group** rather than one person, because the questions span clinical, technical, governance, and operational ground that no single role sees in full.

## 2. The core idea: complexity against readiness

The tool rests on a single, simple idea expressed as a paired framework. It assesses twelve **complexity** dimensions — properties of the tool, such as how hard its task is, how its data behaves, how much it must integrate with existing systems, and what happens if it is wrong — and pairs each with a matching **readiness** dimension — the corresponding capability of your organisation, such as its data infrastructure, its capacity for clinical oversight, or its information-governance expertise.

Each of the twelve pairs is scored on the same three-point scale. Where a tool's complexity on a dimension outruns your organisation's readiness on the same dimension, you have a **gap**. The size of that gap is simply the readiness shortfall: complexity minus readiness, never below zero.

- A gap of **2** (complexity 3, readiness 1) is a **major gap**.
- A gap of **1** is a **minor gap**.
- A gap of **0** means readiness meets or exceeds what the tool demands on that dimension.

The pattern of gaps across the twelve dimensions, together with a small number of non-negotiable safety checks, produces one of four recommendations: **Quick win**, **Deploy and monitor**, **Build readiness first**, or **Avoid**. The logic behind that translation is set out in section 7.

## 3. The framing questions

Before any scoring, two threshold questions must both be answered "Yes". They are deliberately blunt, because if either fails, the detailed assessment is moot.

1. **Proportionality.** Is the use of AI proportionate to the problem? Could the problem be addressed adequately by non-AI means — process redesign, better use of existing data, improved pathways, or a simpler digital tool — with comparable effect and lower risk?
2. **Needs-led adoption.** Does the tool address a clearly identified clinical or operational need that would not be met as well without AI? Or is adoption being driven by enthusiasm, vendor marketing, or organisational pressure?

If AI is not proportionate, or adoption is not needs-led, the framework asks you to reconsider before going further. Structured guiding questions for both — from the DTAC assessment form, the NICE Evidence Standards Framework, and the NHS Buyer's Guide — are linked on the page.

## 4. Basic data, and why it shapes the assessment

Before scoring, you describe the tool. Most of this is for the record and to drive the automated searches (FDA, PubMed, ClinicalTrials.gov, and the security and standards checks). Four inputs, however, change the assessment itself, because they set **scoring floors** — minimum complexity scores that certain properties force, regardless of the assessor's own view.

- **Function (autonomy tier).** From administrative, through administrative-in-a-clinical-setting and clinical decision support, to bounded-autonomous and fully-autonomous clinical function. Any autonomous tool (it acts without a clinician reviewing each output) forces human-oversight and safety-consequence to at least moderate.
- **Agentic.** Whether the tool plans and carries out multi-step sequences of actions towards a goal, rather than producing a single output. An agentic tool inherits the same floors as a stochastic one. A tool that is **both agentic and autonomous** has its oversight, validation, safety, and monitoring dimensions held at the maximum: this is the highest-scrutiny combination the framework recognises.
- **Stochastic or deterministic.** A stochastic tool — one that can give different outputs from the same input — forces oversight, validation, and monitoring to at least moderate.
- **Device classification.** A Class IIb device forces safety to at least moderate; a Class III device forces it to the maximum.

The floors are cumulative: where several apply, the highest wins. Their purpose is to stop an assessor from quietly under-scoring the dimensions where the stakes are highest.

A note on the four required inputs that can halt the assessment: if you do not know the device classification, whether the tool is agentic, or whether it is stochastic or deterministic, or you report that the development team is unaware of the relevant regulatory requirements, the tool stops and asks you to find out first. These are not obstacles for their own sake — without them, the floors cannot be calculated and the assessment would be unreliable.

## 5. How scoring works

Each of the twenty-four dimensions is scored **1 (low), 2 (moderate), or 3 (high)** against descriptors written for that dimension. A few features are worth understanding.

- **Justifications.** A short free-text reason can be recorded for each score. It is optional but recommended: it is what makes the assessment auditable and what a second reader will use to challenge a score.
- **"I don't know" is a valid answer — and a hard stop.** If you cannot score a dimension, say so. The assessment cannot be finalised until every dimension is scored, and the tool points you to who can usually answer — the vendor, the clinical safety officer, the information-governance lead, and so on. A gap in knowledge should send you to the right person, not to a guess.
- **Consistency flags.** The tool scans the free-text reasons you record for particular keywords — "real-time", "cloud", "autonomous", and the like — and where one appears against a dimension you have scored low, it raises an amber flag inviting you to reconsider. This is simple keyword matching, not a judgement about your reasoning, so it will only fire if you have written a justification containing the trigger wording. The flags are advisory, never blocking.
- **Sub-trigger questions.** A small number of yes/no questions appear only when the scores indicate the risk is live — for instance, whether you have a corrective-and-preventive-action process, which is asked only when the safety consequence is moderate or high. A "no" to one of these can fire a hard gate on its own.
- **Worked examples and "what good looks like".** Each complexity dimension carries illustrative example answers for several archetypal tools; each readiness dimension describes what strong readiness looks like and links to tools that help build it. Both are guidance, not scores to copy.

## 6. The twenty-four dimensions

**Complexity (the tool):**

1. **Task & Decision Complexity** — how well-defined and personalised the task is.
2. **Data Complexity** — the data the tool needs to run: sources, quality-sensitivity, timeliness.
3. **Information Governance** — data flows, sharing, lawful basis, and the IG work required.
4. **Human Oversight Complexity** — how readily a user can verify and challenge the output.
5. **Validation Complexity** — how hard it is to establish that the output is correct.
6. **Technical Integration** — what the tool must connect to, and how automated it is.
7. **Workflow & Organisational Change** — how much it changes work, roles, and pathways.
8. **Evaluation Complexity** — how hard it is to show real-world benefit.
9. **Safety Consequence** — the severity, reversibility, and speed of harm if it is wrong.
10. **Values, Trust & Equity** — acceptability, the risk of widening inequalities, and consent.
11. **Monitoring & Drift Detection** — how hard it is to detect and respond to performance change.
12. **Vendor & Supply Chain** — transparency, dependency, and the consequences of vendor failure.

**Readiness (the organisation)** mirrors each one: R1 domain expertise and decision governance; R2 data infrastructure; R3 information-governance capability; R4 human-oversight capacity; R5 validation and evidence assessment; R6 technical infrastructure; R7 operational and change management; R8 evaluation capacity; R9 clinical safety and risk management; R10 ethics and public engagement; R11 monitoring and lifecycle management; R12 vendor and supply-chain management.

## 7. From scores to a verdict

Two things turn the scores into a recommendation: the hard gates, and the classification rules.

### Hard gates

A hard gate is a non-negotiable pairing of high tool-complexity with absent organisational readiness. Any one of seven forces an **Avoid**, regardless of how good the rest of the picture looks:

| Gate | Fires when |
|---|---|
| Safety | Safety consequence is high (C9 = 3) and there is no systematic AI safety process (R9 = 1) |
| Human Oversight | Outputs are structurally hard to verify (C4 = 3) and there are no oversight policies (R4 = 1) |
| Information Governance | Complex cross-organisational data flows (C3 = 3) and only standard IG capability (R3 = 1) |
| Technical Integration | Bespoke multi-system integration (C6 = 3) and only basic IT (R6 = 1) |
| Monitoring | Bespoke drift detection needed (C11 = 3) and no monitoring process (R11 = 1) |
| Values, Trust & Equity | Contested ethical questions (C10 = 3) and no engagement or equity process (R10 = 1) |
| Vendor | High integration *and* high dependency (C6 = 3, C12 = 3) and no procurement or exit strategy (R12 = 1) |

Three of these gates can also fire on a sub-trigger answer alone — no CAPA process, no automation-bias mitigation, or no exit provision for a deeply integrated tool.

### Classification rules

With the gates checked, the verdict follows a decision tree; the first rule that matches wins.

1. **Avoid** — any hard gate has fired, *or* there are three or more major gaps.
2. **Build readiness first** — one or two major gaps, *or* six or more minor gaps.
3. **Deploy and monitor** — no major gaps, and either three to five minor gaps *or* an average complexity above 2.0.
4. **Quick win** — no major gaps, two or fewer minor gaps, and average complexity at or below 2.0.

The logic is deliberately weighted toward caution: a single major gap is enough to say "build readiness first", and a single hard gate is enough to say "avoid".

### How gaps are prioritised

Where gaps exist, the tool orders them for attention, not just by size. The sequence is: (1) any pairing at or near a hard gate; (2) safety and oversight gaps (dimensions 4 and 9); (3) the precondition dimensions — governance, data, and IG (1, 2, 3) — which tend to block progress on everything downstream; (4) major gaps before minor; (5) cross-cutting dimensions before single-issue ones of the same size.

## 8. Reading your results

The results page gives you: the **classification** and a plain-language recommendation; a **gap map** showing all twelve pairings at a glance; the **prioritised gaps**, each linking to external tools matched to that readiness dimension; and any **hard gates** that fired, with an explanation. You can export the full assessment as a **PDF report** or as **JSON** to re-import later. Remember the standing caveat: the tool tells you where to focus; deciding what to do is the work of your implementation team.

## 9. Three worked examples

These are fictional, illustrative walk-throughs using anonymised archetypes. The scores are plausible but invented; a real assessment would be done by the team that knows the tool and the organisation.

### Example A — FlowCast (operational demand forecasting) → Quick win

**The tool.** FlowCast forecasts A&E attendances and admissions from historical activity, seasonal trends, and weather, to help plan staffing and beds. It is administrative, not agentic, deterministic, and not a medical device. The development team is aware of the relevant (limited) regulatory requirements.

**Framing.** Proportionate? Yes — the alternative is unaided manual planning. Needs-led? Yes — winter pressures create a clear operational need.

**Floors.** None apply: an administrative, deterministic, non-agentic, non-device tool triggers no minimum scores.

**Complexity** is low to moderate throughout — most dimensions 1 or 2, none high (for example: data 2, integration 2, monitoring 2; safety 1, oversight 1, IG 1). Average complexity ≈ 1.7.

**Readiness.** The trust runs this kind of operational analytics already: its data infrastructure, technical capacity, and governance all meet or exceed what FlowCast needs. Readiness equals or exceeds complexity on every dimension.

**Result.** No gaps, no hard gates, average complexity below 2.0 → **Quick win**. The interpretation: adopt, with proportionate routine monitoring. The work here is operational, not a readiness-building programme.

### Example B — ScanRead (diagnostic image interpretation) → Build readiness first

**The tool.** ScanRead reads mammograms and flags recall / no-recall for a radiologist to confirm, used as an independent reader in double-reading. It is clinical decision support, not agentic, deterministic, and a Class IIa device. The team is regulatory-aware.

**Framing.** Proportionate and needs-led: both Yes.

**Floors.** None forced — decision support is not autonomous, the tool is deterministic, and Class IIa sits below the device floors.

**Complexity** is moderate across the board — essentially 2 on every dimension: a defined but uncertain task, identifiable imaging data through a vendor, a delayed and variable reference standard, real subgroup-equity questions, and a need for ongoing drift monitoring. Average complexity ≈ 2.0.

**Readiness.** This trust is newer to clinical AI. It has solid IT and clinical leadership (readiness 2 on most dimensions), but its **validation capacity, evaluation capacity, clinical-safety processes for AI, public engagement, and monitoring** are not yet in place — readiness 1 on R5, R8, R9, R10, and R11, and on R3. That produces six minor gaps and no major gaps; because no complexity dimension reaches 3, no hard gate can fire.

**Result.** Six minor gaps → **Build readiness first**. The prioritised list puts the safety gap (dimension 9) and the precondition IG gap (dimension 3) first, then validation, monitoring, evaluation, and equity — each linked to concrete tools such as a DCB0160 clinical safety case, local validation guidance, and the STANDING Together equity recommendations. The tool is sound; the organisation needs to build the scaffolding around it before going live.

### Example C — CareAgent (autonomous, agentic patient-facing care agent) → Avoid

**The tool.** CareAgent holds open-ended conversations with patients — post-discharge check-ins, chronic-care follow-up — taking histories, giving advice, and acting across several tasks in a single call. It is fully autonomous, agentic, stochastic, and (in this scenario) a Class III device. The team is regulatory-aware.

**Framing.** Both Yes — there is a genuine capacity problem it could address.

**Floors.** Because it is **both agentic and autonomous**, human oversight, validation, safety, and monitoring are held at the maximum (3). Class III independently fixes safety at 3. Stochastic behaviour reinforces the oversight, validation, and monitoring floors. In practice every complexity dimension here is high.

**Complexity** is 3 across all twelve dimensions: an unbounded conversational task, live multi-system data, novel and contested data flows, output that cannot be verified in real time, many simultaneous error modes, and direct determination of clinical action with a short time-to-harm.

**Readiness.** This is a capable, large trust — but it has not built the specific capabilities an autonomous, agentic, patient-facing tool demands. Several readiness dimensions sit at 1: no AI-specific safety process (R9), no oversight policy for unverifiable output (R4), no AI-IG experience (R3), no monitoring for generative drift (R11), and no engagement or equity process for autonomous patient contact (R10).

**Result.** Multiple hard gates fire at once — Safety, Human Oversight, Information Governance, Monitoring, and Values — and there are well over three major gaps. Either condition alone forces **Avoid**. The interpretation is not "never", but "not this tool, in this organisation, as things stand": the gap between what the tool demands and what the organisation can currently provide is too wide to close inside a deployment timetable, and the consequences of getting it wrong are severe and fall directly on patients.

## 10. The eight worked-example archetypes

The tool uses eight archetypal tools — composites, not real products — as running illustrations, spanning the range from administrative to fully autonomous and agentic: an operational forecaster, an ambient scribe, a risk-prediction tool, a diagnostic image reader, a patient-facing triage chatbot, an agentic-but-supervised clinical copilot, a bounded-autonomous treatment tool, and a fully autonomous agentic care agent. They are introduced on the landing page and used in the per-dimension example answers.

## 11. Scope, limitations, and feedback

The framework assesses one tool at a time, but readiness is not independent across tools: the burden on governance, workforce, infrastructure, and monitoring accumulates, so an organisation comfortable with one tool may be overstretched by four. Where several tools are in view, assess each and read the readiness scores side by side. The tool is a structured aid to judgement, not a substitute for it, and its outputs are only as good as the honesty of the inputs. Feedback — and suggestions of readiness-building tools we have missed — is welcome through the links provided in the tool.
