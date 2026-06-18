# Best-practice exemplars — for review

These are the "what strong readiness looks like" texts now showing in each
readiness dimension's card toggle and at the top of each results gap. Mark up
anything you'd change and send it back — I'll update `lib/dimensions.ts`.

---

**R1 — Domain Expertise & Decision Governance**
A standing AI governance group with clinical, technical, information-governance, and ethical membership owns the decision, working from a documented process for judging whether AI is the right intervention at all — not just whether this product is good. Conflicts of interest are declared and managed, the people involved have protected time rather than doing this around the edges of other roles, and there is a clear route to escalate contested cases to an ethics committee or equivalent.

**R2 — Data Infrastructure**
The organisation has checked, variable by variable, that the data the tool needs are actually collected, accessible, and in a compatible form — not assumed it. Data quality in the relevant fields is managed as an ongoing function (for example against the Provider Data Quality Assurance Framework), coding is standardised (SNOMED CT, FHIR UK Core), and any feeds run at the frequency the tool requires rather than as a one-off extract.

**R3 — Information Governance Readiness**
A substantive DPIA — a genuine risk assessment, not a tick-box exercise — has been completed with both clinical and technical input, the lawful basis is settled, and the data flows are mapped end to end. The organisation holds a current DSPT 'Standards Met', treats information governance as a continuing function rather than a one-time sign-off, and can evidence the cyber security of the underlying infrastructure (for example Cyber Essentials or the NCSC Cyber Assessment Framework).

**R4 — Human Oversight Capacity**
Responsibility for reviewing the tool's outputs is named and understood, and the people doing it have been trained specifically on automation bias — the tendency to defer to a confident-looking output even when it is wrong. There is a tested route to question, override, or escalate when something feels wrong, and oversight is maintained as staff turn over rather than residing in one or two individuals.

**R5 — Validation & Evidence Assessment**
The organisation can appraise the vendor's evidence critically and against its own population — its demographics, disease prevalence, and coding practices — rather than taking headline performance figures at face value. It has a minimum standard for what counts as sufficient evidence, access to biostatistics or informatics expertise, the ability to run a local pilot before committing, and an eye on subgroup performance (reporting standards such as TRIPOD+AI and DECIDE-AI are useful reference points).

**R6 — Technical Infrastructure**
The tool integrates with existing clinical systems using established standards (FHIR UK Core, recognised APIs) rather than bespoke connections that become single points of failure. There is named technical support with a clear escalation path, defined processes for handling failure, degradation, or unavailability, and a budget that accounts for the full lifecycle — monitoring, updates, and decommissioning — not just go-live.

**R7 — Operational & Change Management**
The affected workflow has been mapped end to end (for example using the QSIR tools), and the people whose work changes have been engaged early enough to shape the rollout rather than have it done to them. There is a named change lead with protected time, a phased rollout with explicit success criteria and a withdrawal trigger, and — where the tool displaces or reshapes roles — workforce implications planned with HR and staff-side representatives.

**R8 — Evaluation Readiness**
Before go-live, the organisation has defined what success looks like in measurable terms and established a baseline to compare against. It can measure the tool's real-world effect — not just whether it is used, but whether it changes the outcome it is meant to change — through methods proportionate to the risk (a simple administrative tool need only confirm the time it claims to save; HM Treasury's Magenta Book AI guidance is a reference for more consequential cases).

**R9 — Clinical Safety & Risk Management**
A clinical safety case has been produced under DCB0160, with a hazard log and a named Clinical Safety Officer, and it considers AI-specific failure modes — silent performance drift, context-dependent errors, automation bias — not just conventional IT hazards. AI-related safety events can be reported and acted on through a corrective-and-preventive-action process, and the organisation can pause or withdraw the tool quickly if a signal demands it.

**R10 — Ethics & Public Engagement**
Patients and the public have been involved early enough to shape the decision to adopt, not merely informed after the fact (the UK Standards for Public Involvement set the bar). There is publicly accessible information about what the tool does and how it affects care — an Algorithmic Transparency Recording Standard entry, for instance — and the organisation monitors equity and bias on an ongoing basis (the STANDING Together recommendations are a useful guide) and is willing to revisit the decision if concerns emerge.

**R11 — Monitoring & Lifecycle Management**
There is a monitoring plan proportionate to the tool's complexity that names who checks what, how often, and against which thresholds — including whether performance differs across patient subgroups before that becomes visible in the aggregate. Model updates are governed through a defined change process, automated detection is used where possible, and what is learned from monitoring, incidents, and feedback flows back into governance rather than sitting in a report.

**R12 — Vendor & Supply Chain Management**
Vendor due diligence is AI-specific rather than generic procurement (the NHS Buyer's Guide to AI in Health and Care and the DSIT Guidelines for AI Procurement set out what to ask), and the contract secures the protections that matter for dependency: data portability, audit rights, performance guarantees, clear IP and liability, and genuine exit provisions. Above all, the depth of dependency on this vendor is a conscious, risk-managed choice rather than something discovered later.
